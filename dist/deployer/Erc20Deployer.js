"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Erc20Deployer = void 0;
const artifacts = {
    OptimismMintableERC20Factory: require("../../artifacts-deploy/optimism/contracts/OptimismMintableERC20Factory.json"),
    // OptimismMintableERC721Factory: require("../../artifacts-deploy/optimism/contracts/OptimismMintableERC721Factory.json"),
    OptimismMintableERC20: require("../../artifacts-deploy/optimism/contracts/OptimismMintableERC20.json"),
    // OptimismMintableERC721: require("../../artifacts-deploy/optimism/contracts/OptimismMintableERC721.json")
};
class Erc20Deployer {
    constructor(deployer) {
        this.deployer = deployer;
    }
    static async deployERC20(hh, actor, l1TokenAddress, l2TokenName, l2TokenSymbol, l2TokenDecimals) {
        console.log('actor', actor.address);
        const OptimismMintableERC20Factory = "0x4200000000000000000000000000000000000012";
        const optimismMintableERC20Factory = await hh.ethers.getContractAt(artifacts.OptimismMintableERC20Factory.abi, OptimismMintableERC20Factory, actor);
        // const receipt = await (await optimismMintableERC20Factory.connect(actor).createOptimismMintableERC20(
        //   l1TokenAddress, l2TokenName, l2TokenSymbol
        // )).wait();
        const receipt = await (await optimismMintableERC20Factory.connect(actor).createOptimismMintableERC20WithDecimals(l1TokenAddress, l2TokenName, l2TokenSymbol, l2TokenDecimals)).wait();
        const topic = optimismMintableERC20Factory.interface.getEventTopic('StandardL2TokenCreated');
        const log = receipt.logs.find(x => x.topics.indexOf(topic) >= 0);
        const deployedEvent = optimismMintableERC20Factory.interface.parseLog(log);
        const L1Token = deployedEvent.args.remoteToken;
        const L2Token = deployedEvent.args.localToken;
        return {
            L1Token,
            L2Token
        };
    }
}
exports.Erc20Deployer = Erc20Deployer;
//# sourceMappingURL=Erc20Deployer.js.map