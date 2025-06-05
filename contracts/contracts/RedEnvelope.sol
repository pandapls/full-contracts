// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

contract RedEnvelope {
    address public owner;
    
    address payable public redOwner;
    // 红包总金额
    uint256 public totalAmount;
    // 红包个数
    uint256 public count;
    // 是否平均分配
    bool public isEqual;
    // 已抢红包个数
    uint256 public grabbedCount;
    // 红包是否已设置
    bool public isRedEnvelopeSet;
    
    struct GrabInfo {
        uint256 amount;        // 抢到的金额
        bool hasGrabbed;       // 是否已抢
        uint256 grabTime;      // 抢红包时间戳
        uint256 grabIndex;     // 抢红包的顺序
    }
    mapping(address => GrabInfo) public grabInfos;
    address[] public grabbers;  // 记录所有抢红包的地址，方便重置

    event RedEnvelopeSet(uint256 totalAmount, uint256 count, bool isEqual);
    event RedEnvelopeGrabbed(address grabber, uint256 amount, uint256 grabIndex);

    constructor() {
        owner = msg.sender;
    }
    function setRedEnvelope(uint256 _count, bool _isEqual) payable public {
        require(!isRedEnvelopeSet, "Red envelope already exists, use reset first");
        require(msg.value > 0, "You must send some ether to create a red envelope");
        require(_count > 0, "Count must be greater than 0");
        
        // 清空记录
        for (uint i = 0; i < grabbers.length; i++) {
            delete grabInfos[grabbers[i]];
        }
        delete grabbers;

        redOwner = payable(msg.sender);
        totalAmount = msg.value;
        count = _count;
        isEqual = _isEqual;
        grabbedCount = 0;
        isRedEnvelopeSet = true;
        
        emit RedEnvelopeSet(totalAmount, count, isEqual);
    }


    // 抢红包
    function grabRedEnvelope() public {
        require(isRedEnvelopeSet, "Red envelope is not set yet");
        require(!grabInfos[msg.sender].hasGrabbed, "You have already grabbed a red envelope");
        require(grabbedCount < count, "All red envelopes have been grabbed");
        
        uint256 amount;
        
        if (isEqual) {
            // 平均分配
            amount = totalAmount / count;
        } else {
            // 随机分配 (简化版本，实际应用中需要更好的随机数生成)
            if (grabbedCount == count - 1) {
                // 最后一个红包，剩余所有金额
                amount = address(this).balance;
            } else {
                // 随机金额，确保剩余红包不为0
                uint256 remainingCount = count - grabbedCount - 1;
                uint256 maxAmount = address(this).balance - remainingCount; // 为剩余红包预留最少1 wei
                amount = (uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender, grabbedCount))) % maxAmount) + 1;
            }
        }
        
        // 记录详细信息
        grabInfos[msg.sender] = GrabInfo({
            amount: amount,
            hasGrabbed: true,
            grabTime: block.timestamp,
            grabIndex: grabbedCount + 1
        });
        
        grabbers.push(msg.sender);

        grabbedCount++;
        if (grabbedCount == count) {
            isRedEnvelopeSet = false; // 所有红包已抢完，重置状态
        }
        
        payable(msg.sender).transfer(amount);
        
        emit RedEnvelopeGrabbed(msg.sender, amount, grabbedCount);
    }

    // 获取用户的详细抢红包信息
    function getUserGrabInfo(address user) public view returns (uint256 amount, bool hasGrabbed, uint256 grabTime, uint256 grabIndex) {
        GrabInfo memory info = grabInfos[user];
        return (info.amount, info.hasGrabbed, info.grabTime, info.grabIndex);
    }
    
    // 获取所有抢红包的地址
    function getAllGrabbers() public view returns (address[] memory) {
        return grabbers;
    }

    // 查看剩余红包个数
    function getRemainingCount() public view returns (uint256) {
        if (!isRedEnvelopeSet) return 0;
        return count - grabbedCount;
    }
    
    // 查看合约余额
    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }

}
