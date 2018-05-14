var CardinalToken = artifacts.require("CardinalToken");
module.exports = function(deployer) {
    deployer.deploy(CardinalToken);
};
