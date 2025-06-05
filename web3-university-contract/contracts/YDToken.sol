// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract YDToken is ERC20, Ownable, ReentrancyGuard {
    // 兑换比率: 1 ETH = 2500 YDT
    uint256 public constant EXCHANGE_RATE = 2500;
    
    // 卖出手续费百分比 (2%)
    uint256 public sellFeePercentage = 2;
    
    event TokensPurchased(address indexed buyer, uint256 ethAmount, uint256 tokenAmount);
    event TokensSold(address indexed seller, uint256 tokenAmount, uint256 ethAmount, uint256 fee);
    event SellFeeUpdated(uint256 oldFee, uint256 newFee);
    
    constructor() ERC20("YD Token", "YDT") Ownable(msg.sender) {
        // 铸造初始供应量给合约部署者
        _mint(msg.sender, 1000000 * 10**decimals());
    }
    
    // 购买代币函数 - 1 ETH = 2500 YDT
    function buyTokens() public payable nonReentrant {
        require(msg.value > 0, "Must send ETH to buy tokens");
        
        uint256 tokenAmount = msg.value * EXCHANGE_RATE;
        require(balanceOf(owner()) >= tokenAmount, "Not enough tokens available");
        
        // 从owner转移代币给购买者
        _transfer(owner(), msg.sender, tokenAmount);
        emit TokensPurchased(msg.sender, msg.value, tokenAmount);
    }
    
    // 卖出代币函数 - 将YDT换回ETH
    function sellTokens(uint256 tokenAmount) public nonReentrant {
        require(tokenAmount > 0, "Token amount must be greater than 0");
        require(balanceOf(msg.sender) >= tokenAmount, "Insufficient token balance");
        
        // 计算能换回的ETH数量
        uint256 ethAmount = tokenAmount / EXCHANGE_RATE;
        require(ethAmount > 0, "Token amount too small");
        
        // 计算手续费
        uint256 fee = (ethAmount * sellFeePercentage) / 100;
        uint256 netEthAmount = ethAmount - fee;
        
        // 检查合约ETH余额是否足够
        require(address(this).balance >= ethAmount, "Contract ETH balance insufficient");
        
        // 销毁用户的代币
        _burn(msg.sender, tokenAmount);
        
        // 发送ETH给用户（扣除手续费后）
        payable(msg.sender).transfer(netEthAmount);
        
        // 手续费留在合约中
        emit TokensSold(msg.sender, tokenAmount, netEthAmount, fee);
    }
    
    // 获取卖出报价
    function getSellQuote(uint256 tokenAmount) public view returns (uint256 ethAmount, uint256 fee) {
        if (tokenAmount == 0) {
            return (0, 0);
        }
        
        uint256 grossEthAmount = tokenAmount / EXCHANGE_RATE;
        uint256 feeAmount = (grossEthAmount * sellFeePercentage) / 100;
        uint256 netEthAmount = grossEthAmount - feeAmount;
        
        return (netEthAmount, feeAmount);
    }
    
    // 接收ETH的fallback函数
    receive() external payable {
        buyTokens();
    }
    
    // 提取合约中的ETH (仅owner)
    function withdrawETH() public onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No ETH to withdraw");
        payable(owner()).transfer(balance);
    }
    
    // 查看合约ETH余额
    function getContractETHBalance() public view returns (uint256) {
        return address(this).balance;
    }
    
    // 设置卖出手续费比例 (仅owner)
    function setSellFeePercentage(uint256 _feePercentage) public onlyOwner {
        require(_feePercentage <= 10, "Fee cannot exceed 10%");
        uint256 oldFee = sellFeePercentage;
        sellFeePercentage = _feePercentage;
        emit SellFeeUpdated(oldFee, _feePercentage);
    }
    
    // Owner可以铸造更多代币 (可选功能)
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
    
    // 向合约存入ETH以支持卖出功能 (仅owner)
    function depositETH() public payable onlyOwner {
        require(msg.value > 0, "Must send ETH");
    }
}