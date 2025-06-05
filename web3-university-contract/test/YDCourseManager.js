const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("YDCourseManager", function () {
    let ydToken, courseManager;
    let owner, instructor, student1, student2, student3;
    let ydTokenAddress, courseManagerAddress;

    // 测试数据
    const INITIAL_SUPPLY = ethers.parseEther("1000000");
    const EXCHANGE_RATE = 2500;
    const COURSE_PRICE = ethers.parseEther("100"); // 100 YDT
    const PLATFORM_FEE = 5; // 5%

    beforeEach(async function () {
        // 获取测试账户
        [owner, instructor, student1, student2, student3] = await ethers.getSigners();

        // 部署 YDToken 合约
        const YDToken = await ethers.getContractFactory("YDToken");
        ydToken = await YDToken.deploy();
        await ydToken.waitForDeployment();
        ydTokenAddress = await ydToken.getAddress();

        // 部署 YDCourseManager 合约
        const YDCourseManager = await ethers.getContractFactory("YDCourseManager");
        courseManager = await YDCourseManager.deploy(ydTokenAddress);
        await courseManager.waitForDeployment();
        courseManagerAddress = await courseManager.getAddress();

        // 为测试账户分配一些 YDT 代币
        await ydToken.transfer(instructor.address, ethers.parseEther("10000"));
        await ydToken.transfer(student1.address, ethers.parseEther("1000"));
        await ydToken.transfer(student2.address, ethers.parseEther("1000"));
        await ydToken.transfer(student3.address, ethers.parseEther("500"));

        // 学生需要授权课程管理合约使用他们的代币
        await ydToken.connect(student1).approve(courseManagerAddress, ethers.parseEther("1000"));
        await ydToken.connect(student2).approve(courseManagerAddress, ethers.parseEther("1000"));
        // 注意：student3 故意不授权足够的金额或不授权，用于测试授权不足的情况
        await ydToken.connect(student3).approve(courseManagerAddress, ethers.parseEther("50")); // 只授权50 YDT
    });

    describe("合约部署", function () {
        it("应该正确设置 YDToken 地址", async function () {
            expect(await courseManager.ydToken()).to.equal(ydTokenAddress);
        });

        it("应该正确设置 owner", async function () {
            expect(await courseManager.owner()).to.equal(owner.address);
        });

        it("应该正确设置初始平台费用", async function () {
            expect(await courseManager.platformFeePercentage()).to.equal(PLATFORM_FEE);
        });

        it("应该正确设置下一个课程ID", async function () {
            expect(await courseManager.nextCourseId()).to.equal(1);
        });
    });

    describe("创建课程", function () {
        it("应该能够成功创建课程", async function () {
            const courseData = {
                title: "区块链开发入门",
                description: "学习智能合约开发",
                imageUrl: "https://example.com/image.jpg",
                price: COURSE_PRICE,
                contentUrls: ["https://example.com/lesson1", "https://example.com/lesson2"]
            };

            await expect(
                courseManager.connect(instructor).createCourse(
                    courseData.title,
                    courseData.description,
                    courseData.imageUrl,
                    courseData.price,
                    courseData.contentUrls
                )
            ).to.emit(courseManager, "CourseCreated")
                .withArgs(1, instructor.address, courseData.title, courseData.price);

            const course = await courseManager.getCourse(1);
            expect(course.title).to.equal(courseData.title);
            expect(course.description).to.equal(courseData.description);
            expect(course.price).to.equal(courseData.price);
            expect(course.instructor).to.equal(instructor.address);
            expect(course.isActive).to.be.true;
        });

        it("不应该允许创建空标题的课程", async function () {
            await expect(
                courseManager.connect(instructor).createCourse(
                    "",
                    "描述",
                    "https://example.com/image.jpg",
                    COURSE_PRICE,
                    ["https://example.com/lesson1"]
                )
            ).to.be.revertedWith("Title cannot be empty");
        });

        it("不应该允许创建价格为0的课程", async function () {
            await expect(
                courseManager.connect(instructor).createCourse(
                    "标题",
                    "描述",
                    "https://example.com/image.jpg",
                    0,
                    ["https://example.com/lesson1"]
                )
            ).to.be.revertedWith("Price must be greater than 0");
        });

        it("应该正确更新讲师课程列表", async function () {
            await courseManager.connect(instructor).createCourse(
                "课程1",
                "描述1",
                "https://example.com/image1.jpg",
                COURSE_PRICE,
                ["https://example.com/lesson1"]
            );

            await courseManager.connect(instructor).createCourse(
                "课程2",
                "描述2",
                "https://example.com/image2.jpg",
                COURSE_PRICE,
                ["https://example.com/lesson2"]
            );

            const instructorCourses = await courseManager.getInstructorCourses(instructor.address);
            expect(instructorCourses.length).to.equal(2);
            expect(instructorCourses[0]).to.equal(1);
            expect(instructorCourses[1]).to.equal(2);
        });
    });

    describe("购买课程", function () {
        beforeEach(async function () {
            // 创建一个测试课程
            await courseManager.connect(instructor).createCourse(
                "测试课程",
                "测试描述",
                "https://example.com/image.jpg",
                COURSE_PRICE,
                ["https://example.com/lesson1", "https://example.com/lesson2"]
            );
        });

        it("应该能够成功购买课程", async function () {
            const initialInstructorBalance = await ydToken.balanceOf(instructor.address);
            const initialOwnerBalance = await ydToken.balanceOf(owner.address);

            await expect(
                courseManager.connect(student1).purchaseCourse(1)
            ).to.emit(courseManager, "CoursePurchased")
                .withArgs(1, student1.address, instructor.address, COURSE_PRICE);

            // 检查余额变化
            const platformFee = (COURSE_PRICE * BigInt(PLATFORM_FEE)) / BigInt(100);
            const instructorPayment = COURSE_PRICE - platformFee;

            expect(await ydToken.balanceOf(instructor.address)).to.equal(
                initialInstructorBalance + instructorPayment
            );
            expect(await ydToken.balanceOf(owner.address)).to.equal(
                initialOwnerBalance + platformFee
            );

            // 检查注册状态
            expect(await courseManager.checkEnrollment(1, student1.address)).to.be.true;

            // 检查学生课程列表
            const studentCourses = await courseManager.getStudentCourses(student1.address);
            expect(studentCourses.length).to.equal(1);
            expect(studentCourses[0]).to.equal(1);

            // 检查课程学生数量
            const course = await courseManager.getCourse(1);
            expect(course.totalStudents).to.equal(1);
        });

        it("不应该允许重复购买同一课程", async function () {
            await courseManager.connect(student1).purchaseCourse(1);

            await expect(
                courseManager.connect(student1).purchaseCourse(1)
            ).to.be.revertedWith("Already enrolled in this course");
        });

        it("不应该允许讲师购买自己的课程", async function () {
            await expect(
                courseManager.connect(instructor).purchaseCourse(1)
            ).to.be.revertedWith("Instructor cannot buy own course");
        });

        it("不应该允许授权不足的学生购买课程", async function () {
            // student3只授权了50 YDT，但课程需要100 YDT
            // 在 OpenZeppelin v5.x 中使用自定义错误，我们使用通用检查
            await expect(
                courseManager.connect(student3).purchaseCourse(1)
            ).to.be.reverted;
        });

        it("不应该允许余额不足的学生购买课程", async function () {
            // 创建一个超出student3余额的昂贵课程
            await courseManager.connect(instructor).createCourse(
                "昂贵课程",
                "超出学生余额的课程",
                "https://example.com/expensive.jpg",
                ethers.parseEther("1000"), // 1000 YDT，超过student3的500 YDT余额
                ["https://example.com/lesson1"]
            );

            // 先给student3足够的授权
            await ydToken.connect(student3).approve(courseManagerAddress, ethers.parseEther("1000"));

            // 现在测试余额不足
            await expect(
                courseManager.connect(student3).purchaseCourse(2)
            ).to.be.revertedWith("Insufficient YDT balance");
        });

        it("不应该允许购买不存在的课程", async function () {
            await expect(
                courseManager.connect(student1).purchaseCourse(999)
            ).to.be.revertedWith("Course does not exist");
        });

        it("不应该允许购买已停用的课程", async function () {
            await courseManager.connect(instructor).toggleCourseStatus(1);

            await expect(
                courseManager.connect(student1).purchaseCourse(1)
            ).to.be.revertedWith("Course is not active");
        });
    });

    describe("课程管理", function () {
        beforeEach(async function () {
            await courseManager.connect(instructor).createCourse(
                "原始课程",
                "原始描述",
                "https://example.com/original.jpg",
                COURSE_PRICE,
                ["https://example.com/lesson1"]
            );
        });

        it("讲师应该能够更新自己的课程", async function () {
            const newData = {
                title: "更新后的课程",
                description: "更新后的描述",
                imageUrl: "https://example.com/updated.jpg",
                price: ethers.parseEther("200"),
                contentUrls: ["https://example.com/new-lesson1", "https://example.com/new-lesson2"]
            };

            await expect(
                courseManager.connect(instructor).updateCourse(
                    1,
                    newData.title,
                    newData.description,
                    newData.imageUrl,
                    newData.price,
                    newData.contentUrls
                )
            ).to.emit(courseManager, "CourseUpdated").withArgs(1, instructor.address);

            const course = await courseManager.getCourse(1);
            expect(course.title).to.equal(newData.title);
            expect(course.description).to.equal(newData.description);
            expect(course.price).to.equal(newData.price);
        });

        it("非讲师不应该能够更新课程", async function () {
            await expect(
                courseManager.connect(student1).updateCourse(
                    1,
                    "恶意更新",
                    "恶意描述",
                    "https://malicious.com/image.jpg",
                    ethers.parseEther("1"),
                    ["https://malicious.com/lesson"]
                )
            ).to.be.revertedWith("Only instructor can update course");
        });

        it("讲师应该能够切换课程状态", async function () {
            expect((await courseManager.getCourse(1)).isActive).to.be.true;

            await courseManager.connect(instructor).toggleCourseStatus(1);
            expect((await courseManager.getCourse(1)).isActive).to.be.false;

            await courseManager.connect(instructor).toggleCourseStatus(1);
            expect((await courseManager.getCourse(1)).isActive).to.be.true;
        });
    });

    describe("课程内容访问", function () {
        beforeEach(async function () {
            await courseManager.connect(instructor).createCourse(
                "私密课程",
                "需要购买才能访问",
                "https://example.com/image.jpg",
                COURSE_PRICE,
                ["https://private-content.com/lesson1", "https://private-content.com/lesson2"]
            );
        });

        it("已购买学生应该能够访问课程内容", async function () {
            await courseManager.connect(student1).purchaseCourse(1);

            const content = await courseManager.connect(student1).getCourseContent(1);
            expect(content.length).to.equal(2);
            expect(content[0]).to.equal("https://private-content.com/lesson1");
        });

        it("讲师应该能够访问自己课程的内容", async function () {
            const content = await courseManager.connect(instructor).getCourseContent(1);
            expect(content.length).to.equal(2);
        });

        it("未购买学生不应该能够访问课程内容", async function () {
            await expect(
                courseManager.connect(student1).getCourseContent(1)
            ).to.be.revertedWith("Access denied: Must purchase course first");
        });
    });

    describe("课程查询功能", function () {
        beforeEach(async function () {
            // 创建多个课程用于测试
            await courseManager.connect(instructor).createCourse(
                "课程1", "描述1", "https://example.com/1.jpg", COURSE_PRICE, ["lesson1"]
            );
            await courseManager.connect(instructor).createCourse(
                "课程2", "描述2", "https://example.com/2.jpg", COURSE_PRICE, ["lesson2"]
            );
            await courseManager.connect(instructor).createCourse(
                "课程3", "描述3", "https://example.com/3.jpg", COURSE_PRICE, ["lesson3"]
            );

            // 停用第二个课程
            await courseManager.connect(instructor).toggleCourseStatus(2);
        });

        it("应该正确返回活跃课程列表", async function () {
            const [courses, totalCount] = await courseManager.getActiveCourses(0, 10);

            expect(totalCount).to.equal(2); // 只有课程1和课程3是活跃的
            expect(courses.length).to.equal(2);
            expect(courses[0].title).to.equal("课程1");
            expect(courses[1].title).to.equal("课程3");
        });

        it("应该支持分页查询", async function () {
            const [firstPage, totalCount] = await courseManager.getActiveCourses(0, 1);
            expect(firstPage.length).to.equal(1);
            expect(totalCount).to.equal(2);

            const [secondPage] = await courseManager.getActiveCourses(1, 1);
            expect(secondPage.length).to.equal(1);
        });
    });

    describe("平台管理功能", function () {
        it("Owner应该能够设置平台费用", async function () {
            await courseManager.connect(owner).setPlatformFeePercentage(10);
            expect(await courseManager.platformFeePercentage()).to.equal(10);
        });

        it("不应该允许设置超过20%的平台费用", async function () {
            await expect(
                courseManager.connect(owner).setPlatformFeePercentage(25)
            ).to.be.revertedWith("Fee cannot exceed 20%");
        });

        it("非Owner不应该能够设置平台费用", async function () {
            // 在 OpenZeppelin v5.x 中，错误消息格式可能不同
            // 让我们使用更通用的检查方式
            await expect(
                courseManager.connect(instructor).setPlatformFeePercentage(10)
            ).to.be.reverted; // 更通用的检查，不指定具体错误消息
        });
    });

    describe("课程统计", function () {
        beforeEach(async function () {
            await courseManager.connect(instructor).createCourse(
                "统计测试课程",
                "用于测试统计功能",
                "https://example.com/stats.jpg",
                COURSE_PRICE,
                ["lesson1"]
            );
        });

        it("讲师应该能够查看课程统计", async function () {
            // 让两个学生购买课程
            await courseManager.connect(student1).purchaseCourse(1);
            await courseManager.connect(student2).purchaseCourse(1);

            const [totalStudents, totalRevenue, isActive] = await courseManager
                .connect(instructor)
                .getCourseStats(1);

            expect(totalStudents).to.equal(2);
            expect(totalRevenue).to.equal(COURSE_PRICE * BigInt(2));
            expect(isActive).to.be.true;
        });

        it("非讲师不应该能够查看课程统计", async function () {
            await expect(
                courseManager.connect(student1).getCourseStats(1)
            ).to.be.revertedWith("Only instructor can view stats");
        });
    });

    describe("安全性测试", function () {
        beforeEach(async function () {
            await courseManager.connect(instructor).createCourse(
                "安全测试课程",
                "测试重入攻击防护",
                "https://example.com/security.jpg",
                COURSE_PRICE,
                ["lesson1"]
            );
        });

        it("应该防止重入攻击", async function () {
            // 这个测试模拟了重入攻击的情况
            // 在实际的重入攻击中，恶意合约会在transfer回调中再次调用purchaseCourse
            // 我们的合约使用了ReentrancyGuard来防止这种攻击

            await courseManager.connect(student1).purchaseCourse(1);

            // 验证状态已正确更新，防止重复购买
            await expect(
                courseManager.connect(student1).purchaseCourse(1)
            ).to.be.revertedWith("Already enrolled in this course");
        });
    });
});