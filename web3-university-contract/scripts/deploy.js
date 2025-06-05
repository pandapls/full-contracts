// scripts/deploy-simple.js
const DeploymentUtils = require("./utils/deploymentUtils");

async function main() {
    console.log("🚀 开始部署 YD 教育平台...\n");

    // 获取部署者信息
    const deployerInfo = await DeploymentUtils.getDeployerInfo();
    console.log("📋 部署者:", deployerInfo.address);
    console.log("💰 余额:", deployerInfo.balance, "ETH");
    console.log("🌐 网络:", deployerInfo.network);
    console.log();

    const contracts = {};

    // 1. 部署 YDToken
    const { contract: ydToken, address: ydTokenAddress } = await DeploymentUtils.deployContract("YDToken");
    contracts.YDToken = { address: ydTokenAddress, contract: ydToken };

    // 2. 部署 YDCourseManager
    const { contract: courseManager, address: courseManagerAddress } = await DeploymentUtils.deployContract(
        "YDCourseManager",
        [ydTokenAddress]
    );
    contracts.YDCourseManager = { address: courseManagerAddress, contract: courseManager };

    // 3. 验证部署
    console.log("\n🔍 验证合约...");
    const ydTokenValid = await DeploymentUtils.verifyContract(ydToken, deployerInfo.address);
    const courseManagerValid = await DeploymentUtils.verifyContract(courseManager, deployerInfo.address);

    if (ydTokenValid && courseManagerValid) {
        console.log("✅ 所有合约验证通过");
    } else {
        throw new Error("合约验证失败");
    }

    // 4. 创建测试数据（仅本地网络）
    if (["ganache", "localhost", "hardhat"].includes(deployerInfo.network)) {
        console.log("\n🧪 创建测试数据...");
        await DeploymentUtils.createTestCourse(courseManager);
    }

    // 5. 保存部署信息
    const deploymentData = {
        network: deployerInfo.network,
        timestamp: new Date().toISOString(),
        deployer: deployerInfo.address,
        contracts: {
            YDToken: {
                address: ydTokenAddress,
                name: await ydToken.name(),
                symbol: await ydToken.symbol(),
                totalSupply: (await ydToken.totalSupply()).toString(),
                exchangeRate: (await ydToken.EXCHANGE_RATE()).toString()
            },
            YDCourseManager: {
                address: courseManagerAddress,
                ydTokenAddress: ydTokenAddress,
                platformFeePercentage: (await courseManager.platformFeePercentage()).toString(),
                owner: await courseManager.owner()
            }
        }
    };

    DeploymentUtils.saveDeployment(deploymentData);

    // 6. 显示结果
    DeploymentUtils.formatDeploymentSummary(contracts);
    DeploymentUtils.showNetworkInfo(ydTokenAddress);

    console.log("🎉 部署完成！");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ 部署失败:", error.message);
        process.exit(1);
    });