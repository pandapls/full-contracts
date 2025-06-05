const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("YDToken", function () {
    let YDToken;
    let ydToken;
    let owner;
    let addr1;
    let addr2;
    let addrs;

    const EXCHANGE_RATE = 2500;
    const INITIAL_SUPPLY = ethers.parseEther("1000000"); // 1,000,000 tokens

    beforeEach(async function () {
        // 获取测试账户
        [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

        // 部署合约
        YDToken = await ethers.getContractFactory("YDToken");
        ydToken = await YDToken.deploy();
    });

    describe("部署", function () {
        it("应该设置正确的代币名称和符号", async function () {
            expect(await ydToken.name()).to.equal("YD Token");
            expect(await ydToken.symbol()).to.equal("YDT");
        });

        it("应该设置正确的小数位数", async function () {
            expect(await ydToken.decimals()).to.equal(18);
        });

        it("应该将初始供应量分配给owner", async function () {
            const ownerBalance = await ydToken.balanceOf(owner.address);
            expect(await ydToken.totalSupply()).to.equal(ownerBalance);
            expect(ownerBalance).to.equal(INITIAL_SUPPLY);
        });

        it("应该设置正确的兑换比率", async function () {
            expect(await ydToken.EXCHANGE_RATE()).to.equal(EXCHANGE_RATE);
        });

        it("应该设置正确的owner", async function () {
            expect(await ydToken.owner()).to.equal(owner.address);
        });
    });

    describe("代币购买", function () {
        it("应该允许用户购买代币", async function () {
            const ethAmount = ethers.parseEther("1"); // 1 ETH
            const expectedTokens = ethers.parseEther("2500"); // 2500 YDT

            // 用户购买代币
            await expect(
                ydToken.connect(addr1).buyTokens({ value: ethAmount })
            ).to.emit(ydToken, "TokensPurchased")
                .withArgs(addr1.address, ethAmount, expectedTokens);

            // 检查代币余额
            expect(await ydToken.balanceOf(addr1.address)).to.equal(expectedTokens);

            // 检查owner余额减少
            expect(await ydToken.balanceOf(owner.address)).to.equal(
                INITIAL_SUPPLY - expectedTokens
            );
        });

        it("应该正确计算不同ETH数量的代币", async function () {
            const ethAmount = ethers.parseEther("0.5"); // 0.5 ETH
            const expectedTokens = ethers.parseEther("1250"); // 1250 YDT

            await ydToken.connect(addr1).buyTokens({ value: ethAmount });
            expect(await ydToken.balanceOf(addr1.address)).to.equal(expectedTokens);
        });

        it("应该拒绝0 ETH的购买", async function () {
            await expect(
                ydToken.connect(addr1).buyTokens({ value: 0 })
            ).to.be.revertedWith("Must send ETH to buy tokens");
        });

        it("应该在代币不足时拒绝购买", async function () {
            // 先转移大部分代币
            const largeAmount = ethers.parseEther("900000");
            await ydToken.transfer(addr2.address, largeAmount);

            // 尝试购买超过剩余代币的数量
            const ethAmount = ethers.parseEther("100"); // 需要 250,000 代币
            await expect(
                ydToken.connect(addr1).buyTokens({ value: ethAmount })
            ).to.be.revertedWith("Not enough tokens available");
        });

        it("应该通过receive函数支持直接ETH转账", async function () {
            const ethAmount = ethers.parseEther("1");
            const expectedTokens = ethers.parseEther("2500");

            // 直接发送ETH到合约
            await expect(
                addr1.sendTransaction({
                    to: await ydToken.getAddress(),
                    value: ethAmount
                })
            ).to.emit(ydToken, "TokensPurchased")
                .withArgs(addr1.address, ethAmount, expectedTokens);

            expect(await ydToken.balanceOf(addr1.address)).to.equal(expectedTokens);
        });
    });

    describe("ETH管理", function () {
        beforeEach(async function () {
            // 用户购买一些代币，向合约发送ETH
            await ydToken.connect(addr1).buyTokens({
                value: ethers.parseEther("2")
            });
        });

        it("应该正确显示合约ETH余额", async function () {
            const balance = await ydToken.getContractETHBalance();
            expect(balance).to.equal(ethers.parseEther("2"));
        });

        it("应该允许owner提取ETH", async function () {
            const initialOwnerBalance = await ethers.provider.getBalance(owner.address);

            const tx = await ydToken.withdrawETH();
            const receipt = await tx.wait();
            const gasUsed = receipt.gasUsed * receipt.gasPrice;

            const finalOwnerBalance = await ethers.provider.getBalance(owner.address);

            // Owner余额应该增加2 ETH减去gas费用
            expect(finalOwnerBalance).to.equal(
                initialOwnerBalance + ethers.parseEther("2") - gasUsed
            );

            // 合约余额应该为0
            expect(await ydToken.getContractETHBalance()).to.equal(0);
        });

        it("应该拒绝非owner提取ETH", async function () {
            await expect(
                ydToken.connect(addr1).withdrawETH()
            ).to.be.revertedWithCustomError(ydToken, "OwnableUnauthorizedAccount");
        });

        it("应该在没有ETH时拒绝提取", async function () {
            // 先提取一次
            await ydToken.withdrawETH();

            // 再次尝试提取
            await expect(
                ydToken.withdrawETH()
            ).to.be.revertedWith("No ETH to withdraw");
        });
    });

    describe("铸币功能", function () {
        it("应该允许owner铸造代币", async function () {
            const mintAmount = ethers.parseEther("1000");

            await expect(
                ydToken.mint(addr1.address, mintAmount)
            ).to.emit(ydToken, "Transfer")
                .withArgs(ethers.ZeroAddress, addr1.address, mintAmount);

            expect(await ydToken.balanceOf(addr1.address)).to.equal(mintAmount);
            expect(await ydToken.totalSupply()).to.equal(INITIAL_SUPPLY + mintAmount);
        });

        it("应该拒绝非owner铸造代币", async function () {
            await expect(
                ydToken.connect(addr1).mint(addr1.address, ethers.parseEther("1000"))
            ).to.be.revertedWithCustomError(ydToken, "OwnableUnauthorizedAccount");
        });
    });

    describe("ERC20功能", function () {
        beforeEach(async function () {
            // 给addr1一些代币用于测试
            await ydToken.connect(addr1).buyTokens({
                value: ethers.parseEther("1")
            });
        });

        it("应该支持代币转账", async function () {
            const transferAmount = ethers.parseEther("100");

            await expect(
                ydToken.connect(addr1).transfer(addr2.address, transferAmount)
            ).to.emit(ydToken, "Transfer")
                .withArgs(addr1.address, addr2.address, transferAmount);

            expect(await ydToken.balanceOf(addr2.address)).to.equal(transferAmount);
        });

        it("应该支持授权和transferFrom", async function () {
            const approveAmount = ethers.parseEther("100");

            // 授权
            await ydToken.connect(addr1).approve(addr2.address, approveAmount);
            expect(await ydToken.allowance(addr1.address, addr2.address))
                .to.equal(approveAmount);

            // 代理转账
            const transferAmount = ethers.parseEther("50");
            await ydToken.connect(addr2).transferFrom(
                addr1.address,
                addr2.address,
                transferAmount
            );

            expect(await ydToken.balanceOf(addr2.address)).to.equal(transferAmount);
            expect(await ydToken.allowance(addr1.address, addr2.address))
                .to.equal(approveAmount - transferAmount);
        });
    });
});