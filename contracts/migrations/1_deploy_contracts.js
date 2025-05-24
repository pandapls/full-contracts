const SimpleDeposit = artifacts.require("SimpleDeposit");
module.exports = function (deployer) {
    deployer.deploy(SimpleDeposit);
}