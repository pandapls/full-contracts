// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

contract SimpleDeposit {
    address payable public owner;
    uint256 public balance;
    string name;
    uint256 age;

    event Deposited(address indexed from, uint256 amount);
    event Withdrawn(address indexed to, uint256 amount);
    event InfoUpdate(string name, uint256 age);
    constructor() {
        owner = payable(msg.sender);
    }

    // 存款函数
    function deposit() public payable {
        balance += msg.value;
        emit Deposited(msg.sender, msg.value);
    }

    // 提款函数（仅限所有者）
    function withdraw(uint256 _num, address payable _to) public {
        require(msg.sender == owner, "you do not have right to withdraw");
        require(balance >= _num, "you do not have enough money");
        payable(_to).transfer(_num);
        emit Withdrawn(_to, _num);
    }

    // 查询合约余额
    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function setInfo(string memory _name, uint256 _age) public {
        name = _name;
        age = _age;
        emit InfoUpdate(_name, _age);
    }
    
    function sayHello() public pure returns (string memory) {
        return "Hello, World!";
    }

    // fallback 与 receive 函数支持直接转账
    receive() external payable {
        emit Deposited(msg.sender, msg.value);
    }

    fallback() external payable {
        emit Deposited(msg.sender, msg.value);
    }
}
