// const SimpleDeposit = artifacts.require("SimpleDeposit");
const RedEnvelope = artifacts.require("RedEnvelope");

module.exports = function (deployer) {
    deployer.deploy(RedEnvelope);

    // deployer.deploy(SimpleDeposit);
}