// scripts/utils/deploymentUtils.js
const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * 部署工具类 - 提供可复用的部署方法
 */
class DeploymentUtils {

    /**
     * 部署单个合约
     * @param {string} contractName 合约名称
     * @param {Array} constructorArgs 构造函数参数
     * @param {Object} options 部署选项
     */
    static async deployContract(contractName, constructorArgs = [], options = {}) {
        const { silent = false, gasLimit } = options;

        if (!silent) {
            console.log(`📦 部署 ${contractName} 合约...`);
            if (constructorArgs.length > 0) {
                console.log(`   构造函数参数:`, constructorArgs);
            }
        }

        try {
            const ContractFactory = await ethers.getContractFactory(contractName);

            // 估算部署 Gas
            const deployData = ContractFactory.interface.encodeDeploy(constructorArgs);
            const gasEstimate = await ethers.provider.estimateGas({
                data: deployData
            });

            if (!silent) {
                console.log(`   估算 Gas: ${gasEstimate.toLocaleString()}`);
            }

            const deployOptions = gasLimit ? { gasLimit } : {};
            const contract = await ContractFactory.deploy(...constructorArgs, deployOptions);

            if (!silent) {
                console.log(`   交易哈希: ${contract.deploymentTransaction()?.hash}`);
                console.log(`   ⏳ 等待部署确认...`);
            }

            await contract.waitForDeployment();
            const address = await contract.getAddress();

            // 获取部署交易的 Gas 使用量
            const deployTx = contract.deploymentTransaction();
            const receipt = deployTx ? await deployTx.wait() : null;
            const gasUsed = receipt?.gasUsed || gasEstimate;

            if (!silent) {
                console.log(`✅ ${contractName} 部署成功: ${address}`);
                console.log(`   实际 Gas 使用: ${gasUsed.toLocaleString()}`);
            }

            return {
                contract,
                address,
                gasUsed,
                txHash: receipt?.hash
            };
        } catch (error) {
            console.error(`❌ ${contractName} 部署失败:`, error.message);
            throw error;
        }
    }

    /**
     * 获取部署者信息
     */
    static async getDeployerInfo() {
        const [deployer] = await ethers.getSigners();
        const balance = await ethers.provider.getBalance(deployer.address);
        const feeData = await ethers.provider.getFeeData();

        return {
            address: deployer.address,
            balance: ethers.formatEther(balance),
            network: hre.network.name,
            chainId: (await ethers.provider.getNetwork()).chainId,
            gasPrice: feeData.gasPrice ? ethers.formatUnits(feeData.gasPrice, 'gwei') : null,
            maxFeePerGas: feeData.maxFeePerGas ? ethers.formatUnits(feeData.maxFeePerGas, 'gwei') : null
        };
    }

    /**
     * 验证合约部署
     * @param {Object} contract 合约实例
     * @param {string} expectedOwner 预期的owner地址
     */
    static async verifyContract(contract, expectedOwner = null) {
        try {
            const address = await contract.getAddress();
            console.log(`🔍 验证合约: ${address}`);

            // 检查合约代码是否存在
            const code = await ethers.provider.getCode(address);
            if (code === '0x') {
                throw new Error('合约代码不存在');
            }

            // 检查合约是否有owner函数
            if (typeof contract.owner === 'function') {
                const owner = await contract.owner();
                console.log(`   Owner: ${owner}`);
                if (expectedOwner && owner !== expectedOwner) {
                    throw new Error(`Owner不匹配: 期望 ${expectedOwner}, 实际 ${owner}`);
                }
            }

            // 检查ERC20代币信息
            if (typeof contract.name === 'function') {
                try {
                    const name = await contract.name();
                    const symbol = await contract.symbol();
                    const decimals = await contract.decimals();
                    const totalSupply = await contract.totalSupply();

                    console.log(`   代币名称: ${name}`);
                    console.log(`   代币符号: ${symbol}`);
                    console.log(`   小数位数: ${decimals}`);
                    console.log(`   总供应量: ${ethers.formatEther(totalSupply)}`);
                } catch (e) {
                    // 不是ERC20代币，忽略错误
                }
            }

            // 检查课程管理合约信息
            if (typeof contract.nextCourseId === 'function') {
                try {
                    const nextId = await contract.nextCourseId();
                    const feePercentage = await contract.platformFeePercentage();

                    console.log(`   下一个课程ID: ${nextId}`);
                    console.log(`   平台费用比例: ${feePercentage}%`);
                } catch (e) {
                    console.log(`   课程管理合约信息获取失败: ${e.message}`);
                }
            }

            console.log(`✅ 合约验证成功`);
            return true;
        } catch (error) {
            console.error(`❌ 合约验证失败: ${error.message}`);
            return false;
        }
    }

    /**
     * 保存部署信息到文件
     * @param {Object} deploymentData 部署数据
     * @param {string} network 网络名称
     */
    static saveDeployment(deploymentData, network = hre.network.name) {
        const deploymentsDir = path.join(process.cwd(), 'deployments');

        if (!fs.existsSync(deploymentsDir)) {
            fs.mkdirSync(deploymentsDir, { recursive: true });
        }

        // 添加时间戳和网络信息
        const enhancedData = {
            ...deploymentData,
            deploymentInfo: {
                network,
                chainId: deploymentData.chainId || null,
                timestamp: new Date().toISOString(),
                deployer: deploymentData.deployer,
                blockNumber: deploymentData.blockNumber || null
            }
        };

        const filePath = path.join(deploymentsDir, `${network}.json`);
        fs.writeFileSync(filePath, JSON.stringify(enhancedData, null, 2));

        console.log(`💾 部署信息已保存: ${filePath}`);
        return filePath;
    }

    /**
     * 读取已保存的部署信息
     * @param {string} network 网络名称
     */
    static loadDeployment(network = hre.network.name) {
        const filePath = path.join(process.cwd(), 'deployments', `${network}.json`);

        if (!fs.existsSync(filePath)) {
            throw new Error(`部署文件不存在: ${filePath}`);
        }

        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }

    /**
     * 等待交易确认
     * @param {Object} tx 交易对象
     * @param {number} confirmations 确认数
     */
    static async waitForConfirmations(tx, confirmations = 1) {
        console.log(`⏳ 等待 ${confirmations} 个确认...`);
        console.log(`   交易哈希: ${tx.hash}`);

        const receipt = await tx.wait(confirmations);
        console.log(`✅ 交易已确认: ${receipt.hash}`);
        console.log(`   Gas 使用: ${receipt.gasUsed.toLocaleString()}`);
        console.log(`   区块号: ${receipt.blockNumber}`);

        return receipt;
    }

    /**
     * 估算Gas费用
     * @param {Object} contract 合约实例
     * @param {string} method 方法名
     * @param {Array} args 参数
     */
    static async estimateGas(contract, method, args = []) {
        try {
            const gasEstimate = await contract[method].estimateGas(...args);
            const feeData = await ethers.provider.getFeeData();

            const result = {
                gasLimit: gasEstimate,
                gasPrice: feeData.gasPrice,
                maxFeePerGas: feeData.maxFeePerGas,
                maxPriorityFeePerGas: feeData.maxPriorityFeePerGas
            };

            if (feeData.gasPrice) {
                result.estimatedCost = ethers.formatEther(gasEstimate * feeData.gasPrice);
            }

            console.log(`📊 ${method} 方法 Gas 估算:`);
            console.log(`   Gas Limit: ${gasEstimate.toLocaleString()}`);
            if (result.estimatedCost) {
                console.log(`   预估费用: ${result.estimatedCost} ETH`);
            }

            return result;
        } catch (error) {
            console.error(`❌ Gas估算失败: ${error.message}`);
            return null;
        }
    }

    /**
     * 创建测试课程 (适配IPFS模式)
     * @param {Object} courseManager 课程管理合约
     * @param {string} testIpfsCid 测试用的IPFS CID
     */
    static async createTestCourse(courseManager, testIpfsCid = null) {
        console.log("📚 创建测试课程...");

        // 如果没有提供IPFS CID，使用模拟的CID
        const ipfsCid = testIpfsCid || "QmTestCourseMetadata123456789abcdef";
        const price = ethers.parseEther("100"); // 100 YDT

        console.log(`   IPFS CID: ${ipfsCid}`);
        console.log(`   价格: ${ethers.formatEther(price)} YDT`);

        try {
            // 估算Gas
            await this.estimateGas(courseManager, 'createCourse', [ipfsCid, price]);

            // 创建课程
            const tx = await courseManager.createCourse(ipfsCid, price);
            const receipt = await this.waitForConfirmations(tx);

            // 获取创建的课程ID
            const nextId = await courseManager.nextCourseId();
            const courseId = nextId - 1n; // 当前创建的课程ID

            console.log(`✅ 测试课程创建成功`);
            console.log(`   课程ID: ${courseId}`);

            // 验证课程信息
            const course = await courseManager.getCourse(courseId);
            console.log(`   验证 - IPFS CID: ${course.ipfsCid}`);
            console.log(`   验证 - 价格: ${ethers.formatEther(course.price)} YDT`);
            console.log(`   验证 - 讲师: ${course.instructor}`);

            return {
                courseId,
                ipfsCid,
                price,
                txHash: receipt.hash
            };
        } catch (error) {
            console.error(`❌ 测试课程创建失败: ${error.message}`);
            throw error;
        }
    }

    /**
     * 设置代币授权
     * @param {Object} token 代币合约
     * @param {string} spender 被授权地址
     * @param {string} amount 授权金额
     */
    static async approveToken(token, spender, amount) {
        console.log(`🔓 设置代币授权...`);
        console.log(`   被授权地址: ${spender}`);
        console.log(`   授权金额: ${amount}`);

        try {
            const amountWei = ethers.parseEther(amount);
            const tx = await token.approve(spender, amountWei);
            const receipt = await this.waitForConfirmations(tx);

            console.log(`✅ 代币授权成功`);
            return receipt;
        } catch (error) {
            console.error(`❌ 代币授权失败: ${error.message}`);
            throw error;
        }
    }

    /**
     * 购买代币 (用于测试)
     * @param {Object} token 代币合约
     * @param {string} ethAmount ETH数量
     */
    static async buyTokens(token, ethAmount = "0.1") {
        console.log(`💰 购买代币...`);
        console.log(`   ETH 数量: ${ethAmount}`);

        try {
            const value = ethers.parseEther(ethAmount);
            const exchangeRate = await token.EXCHANGE_RATE();
            const expectedTokens = value * exchangeRate;

            console.log(`   预期获得代币: ${ethers.formatEther(expectedTokens)}`);

            const tx = await token.buyTokens({ value });
            const receipt = await this.waitForConfirmations(tx);

            console.log(`✅ 代币购买成功`);
            return receipt;
        } catch (error) {
            console.error(`❌ 代币购买失败: ${error.message}`);
            throw error;
        }
    }

    /**
     * 显示网络信息
     * @param {string} contractAddress 合约地址
     */
    static showNetworkInfo(contractAddress) {
        const network = hre.network.name;
        console.log(`\n🌐 网络信息 (${network})`);

        const explorerUrls = {
            sepolia: "https://sepolia.etherscan.io/address/",
            goerli: "https://goerli.etherscan.io/address/",
            mainnet: "https://etherscan.io/address/",
            polygon: "https://polygonscan.com/address/",
            mumbai: "https://mumbai.polygonscan.com/address/",
            bsc: "https://bscscan.com/address/",
            "bsc-testnet": "https://testnet.bscscan.com/address/",
            localhost: null,
            hardhat: null
        };

        if (explorerUrls[network]) {
            console.log(`🔍 区块链浏览器: ${explorerUrls[network]}${contractAddress}`);
        }

        const faucets = {
            sepolia: [
                "https://sepoliafaucet.com/",
                "https://www.alchemy.com/faucets/ethereum-sepolia"
            ],
            goerli: [
                "https://goerlifaucet.com/",
                "https://www.alchemy.com/faucets/ethereum-goerli"
            ],
            mumbai: [
                "https://faucet.polygon.technology/"
            ]
        };

        if (faucets[network]) {
            console.log(`💧 测试代币水龙头:`);
            faucets[network].forEach(url => console.log(`   - ${url}`));
        }

        // Web3 开发工具推荐
        if (network !== 'mainnet') {
            console.log(`🛠  推荐工具:`);
            console.log(`   - MetaMask: 连接测试网络`);
            console.log(`   - Remix: 在线合约开发`);
            console.log(`   - Hardhat: 本地开发环境`);
        }
    }

    /**
     * 批量转账代币（用于测试）
     * @param {Object} token 代币合约
     * @param {Array} recipients 接收者地址数组
     * @param {string} amount 转账金额
     */
    static async batchTransfer(token, recipients, amount) {
        console.log(`📤 批量转账 ${amount} 代币给 ${recipients.length} 个地址...`);

        const amountWei = ethers.parseEther(amount);
        const results = [];

        for (let i = 0; i < recipients.length; i++) {
            const recipient = recipients[i];
            try {
                console.log(`   ${i + 1}/${recipients.length} 转账给 ${recipient}...`);
                const tx = await token.transfer(recipient, amountWei);
                await tx.wait();
                results.push({ recipient, success: true, txHash: tx.hash });
                console.log(`   ✅ 成功`);
            } catch (error) {
                results.push({ recipient, success: false, error: error.message });
                console.log(`   ❌ 失败: ${error.message}`);
            }
        }

        const successful = results.filter(r => r.success).length;
        console.log(`✅ 批量转账完成: ${successful}/${recipients.length} 成功`);

        return results;
    }

    /**
     * 检查合约是否已部署
     * @param {string} address 合约地址
     */
    static async isContractDeployed(address) {
        try {
            const code = await ethers.provider.getCode(address);
            return code !== '0x';
        } catch (error) {
            console.error(`检查合约部署状态失败: ${error.message}`);
            return false;
        }
    }

    /**
     * 格式化部署摘要
     * @param {Object} contracts 合约信息
     * @param {Object} deployerInfo 部署者信息
     */
    static formatDeploymentSummary(contracts, deployerInfo = null) {
        console.log("\n🎉 部署摘要");
        console.log("=".repeat(60));

        if (deployerInfo) {
            console.log(`👤 部署者: ${deployerInfo.address}`);
            console.log(`🌐 网络: ${deployerInfo.network} (Chain ID: ${deployerInfo.chainId})`);
            console.log(`💰 余额: ${deployerInfo.balance} ETH`);
            console.log();
        }

        let totalGasUsed = 0n;
        Object.entries(contracts).forEach(([name, info]) => {
            console.log(`📄 ${name}:`);
            console.log(`   地址: ${info.address}`);
            if (info.gasUsed) {
                console.log(`   Gas使用: ${info.gasUsed.toLocaleString()}`);
                totalGasUsed += BigInt(info.gasUsed);
            }
            if (info.txHash) {
                console.log(`   交易哈希: ${info.txHash}`);
            }
            console.log();
        });

        if (totalGasUsed > 0n) {
            console.log(`⛽ 总 Gas 使用: ${totalGasUsed.toLocaleString()}`);
        }

        console.log("=".repeat(60));
        console.log("✅ 所有合约部署完成！");
    }

    /**
     * 生成前端配置文件
     * @param {Object} contracts 合约信息
     * @param {string} network 网络名称
     */
    static generateFrontendConfig(contracts, network = hre.network.name) {
        const config = {
            network,
            chainId: contracts.chainId || null,
            contracts: {}
        };

        Object.entries(contracts).forEach(([name, info]) => {
            if (name !== 'chainId' && name !== 'deployer' && name !== 'blockNumber') {
                config.contracts[name] = {
                    address: info.address,
                    deployedAt: info.blockNumber || null
                };
            }
        });

        const configDir = path.join(process.cwd(), 'frontend-config');
        if (!fs.existsSync(configDir)) {
            fs.mkdirSync(configDir, { recursive: true });
        }

        const configPath = path.join(configDir, `${network}.json`);
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

        console.log(`📋 前端配置文件已生成: ${configPath}`);
        return configPath;
    }
}

module.exports = DeploymentUtils;