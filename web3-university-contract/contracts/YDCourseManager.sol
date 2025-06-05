// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract YDCourseManager is Ownable, ReentrancyGuard {
    IERC20 public ydToken;
    
    struct Course {
        uint256 id;
        string ipfsCid; // 存储课程元数据的 IPFS CID
        uint256 price; // 课程价格（以 YDT 计算）
        address instructor;
        bool isActive;
        uint256 createdAt;
        uint256 totalStudents;
    }
    
    struct Enrollment {
        uint256 courseId;
        address student;
        uint256 enrolledAt;
        bool hasAccess;
    }
    
    // 存储
    mapping(uint256 => Course) public courses;
    mapping(address => uint256[]) public instructorCourses; // 讲师的课程列表
    mapping(address => uint256[]) public studentCourses; // 学生购买的课程
    mapping(uint256 => mapping(address => bool)) public hasEnrolled; // 课程ID -> 学生地址 -> 是否已购买
    mapping(uint256 => address[]) public courseStudents; // 课程的学生列表
    
    uint256 public nextCourseId = 1;
    uint256 public platformFeePercentage = 5; // 平台抽成5%
    
    // 事件
    event CourseCreated(
        uint256 indexed courseId,
        address indexed instructor,
        string ipfsCid,
        uint256 price
    );
    
    event CoursePurchased(
        uint256 indexed courseId,
        address indexed student,
        address indexed instructor,
        uint256 price
    );
    
    event CourseUpdated(
        uint256 indexed courseId, 
        address indexed instructor, 
        string newIpfsCid
    );
    
    event CourseStatusToggled(
        uint256 indexed courseId, 
        address indexed instructor, 
        bool isActive
    );
    
    constructor(address _ydTokenAddress) Ownable(msg.sender) {
        ydToken = IERC20(_ydTokenAddress);
    }
    
    // 创建课程
    function createCourse(
        string memory _ipfsCid,
        uint256 _price
    ) public returns (uint256) {
        require(bytes(_ipfsCid).length > 0, "IPFS CID cannot be empty");
        require(_price > 0, "Price must be greater than 0");
        
        uint256 courseId = nextCourseId++;
        
        courses[courseId] = Course({
            id: courseId,
            ipfsCid: _ipfsCid,
            price: _price,
            instructor: msg.sender,
            isActive: true,
            createdAt: block.timestamp,
            totalStudents: 0
        });
        
        instructorCourses[msg.sender].push(courseId);
        
        emit CourseCreated(courseId, msg.sender, _ipfsCid, _price);
        return courseId;
    }
    
    // 购买课程
    function purchaseCourse(uint256 _courseId) public nonReentrant {
        Course storage course = courses[_courseId];
        require(course.id != 0, "Course does not exist");
        require(course.isActive, "Course is not active");
        require(!hasEnrolled[_courseId][msg.sender], "Already enrolled in this course");
        require(msg.sender != course.instructor, "Instructor cannot buy own course");
        
        uint256 totalPrice = course.price;
        require(ydToken.balanceOf(msg.sender) >= totalPrice, "Insufficient YDT balance");
        
        // 计算平台费用和讲师收入
        uint256 platformFee = (totalPrice * platformFeePercentage) / 100;
        uint256 instructorPayment = totalPrice - platformFee;
        
        // 转账YDT
        require(ydToken.transferFrom(msg.sender, owner(), platformFee), "Platform fee transfer failed");
        require(ydToken.transferFrom(msg.sender, course.instructor, instructorPayment), "Instructor payment failed");
        
        // 更新数据
        hasEnrolled[_courseId][msg.sender] = true;
        studentCourses[msg.sender].push(_courseId);
        courseStudents[_courseId].push(msg.sender);
        courses[_courseId].totalStudents++;
        
        emit CoursePurchased(_courseId, msg.sender, course.instructor, totalPrice);
    }
    
    // 更新课程信息（仅讲师）- 只更新 IPFS CID 和价格
    function updateCourse(
        uint256 _courseId,
        string memory _newIpfsCid,
        uint256 _newPrice
    ) public {
        Course storage course = courses[_courseId];
        require(course.instructor == msg.sender, "Only instructor can update course");
        require(course.id != 0, "Course does not exist");
        require(bytes(_newIpfsCid).length > 0, "IPFS CID cannot be empty");
        require(_newPrice > 0, "Price must be greater than 0");
        
        course.ipfsCid = _newIpfsCid;
        course.price = _newPrice;
        
        emit CourseUpdated(_courseId, msg.sender, _newIpfsCid);
    }
    
    // 停用/激活课程（仅讲师）
    function toggleCourseStatus(uint256 _courseId) public {
        Course storage course = courses[_courseId];
        require(course.instructor == msg.sender, "Only instructor can toggle course status");
        require(course.id != 0, "Course does not exist");
        
        course.isActive = !course.isActive;
        
        emit CourseStatusToggled(_courseId, msg.sender, course.isActive);
    }
    
    // 获取课程详情
    function getCourse(uint256 _courseId) public view returns (Course memory) {
        require(courses[_courseId].id != 0, "Course does not exist");
        return courses[_courseId];
    }
    
    // 获取课程的 IPFS CID（仅已购买学生或讲师可以获取完整信息）
    function getCourseIPFS(uint256 _courseId) public view returns (string memory) {
        Course memory course = courses[_courseId];
        require(course.id != 0, "Course does not exist");
        require(
            hasEnrolled[_courseId][msg.sender] || course.instructor == msg.sender,
            "Access denied: Must purchase course first"
        );
        
        return course.ipfsCid;
    }
    
    // 获取课程基本信息（公开，用于课程列表展示）
    function getCourseBasicInfo(uint256 _courseId) public view returns (
        uint256 id,
        string memory ipfsCid,
        uint256 price,
        address instructor,
        bool isActive,
        uint256 createdAt,
        uint256 totalStudents
    ) {
        Course memory course = courses[_courseId];
        require(course.id != 0, "Course does not exist");
        
        return (
            course.id,
            course.ipfsCid,
            course.price,
            course.instructor,
            course.isActive,
            course.createdAt,
            course.totalStudents
        );
    }
    
    // 获取讲师的所有课程
    function getInstructorCourses(address _instructor) public view returns (uint256[] memory) {
        return instructorCourses[_instructor];
    }
    
    // 获取学生购买的所有课程
    function getStudentCourses(address _student) public view returns (uint256[] memory) {
        return studentCourses[_student];
    }
    
    // 获取课程的所有学生
    function getCourseStudents(uint256 _courseId) public view returns (address[] memory) {
        Course memory course = courses[_courseId];
        require(
            course.instructor == msg.sender || owner() == msg.sender,
            "Only instructor or owner can view student list"
        );
        return courseStudents[_courseId];
    }
    
    // 检查用户是否已购买课程
    function checkEnrollment(uint256 _courseId, address _student) public view returns (bool) {
        return hasEnrolled[_courseId][_student];
    }
    
    // 获取所有活跃课程（分页）
    function getActiveCourses(uint256 _offset, uint256 _limit) 
        public view returns (Course[] memory, uint256 totalCount) {
        
        // 先计算活跃课程总数
        uint256 activeCount = 0;
        for (uint256 i = 1; i < nextCourseId; i++) {
            if (courses[i].isActive) {
                activeCount++;
            }
        }
        
        if (_offset >= activeCount) {
            return (new Course[](0), activeCount);
        }
        
        uint256 resultSize = _limit;
        if (_offset + _limit > activeCount) {
            resultSize = activeCount - _offset;
        }
        
        Course[] memory result = new Course[](resultSize);
        uint256 currentIndex = 0;
        uint256 found = 0;
        
        for (uint256 i = 1; i < nextCourseId && found < resultSize; i++) {
            if (courses[i].isActive) {
                if (currentIndex >= _offset) {
                    result[found] = courses[i];
                    found++;
                }
                currentIndex++;
            }
        }
        
        return (result, activeCount);
    }
    
    // 设置平台费用比例（仅owner）
    function setPlatformFeePercentage(uint256 _feePercentage) public onlyOwner {
        require(_feePercentage <= 20, "Fee cannot exceed 20%");
        platformFeePercentage = _feePercentage;
    }
    
    // 获取课程统计信息
    function getCourseStats(uint256 _courseId) public view returns (
        uint256 totalStudents,
        uint256 totalRevenue,
        bool isActive
    ) {
        Course memory course = courses[_courseId];
        require(course.id != 0, "Course does not exist");
        require(course.instructor == msg.sender, "Only instructor can view stats");
        
        return (
            course.totalStudents,
            course.totalStudents * course.price,
            course.isActive
        );
    }
    
    // 紧急停止所有课程（仅owner）
    function emergencyPause() public onlyOwner {
        // 可以添加紧急停止逻辑
    }
}