"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Erc20Deployer = void 0;
const ethers_1 = require("ethers");
const artifacts = {
    OptimismMintableERC20Factory: require("../../artifacts-deploy/optimism/contracts/OptimismMintableERC20Factory.json"),
    OptimismMintableERC20: require("../../artifacts-deploy/optimism/contracts/OptimismMintableERC20.json"),
    USDT: require("../../artifacts-deploy/usdt/contracts/USDT.json"),
};
class Erc20Deployer {
    constructor(deployer) {
        this.deployer = deployer;
    }
    static async deployERC20(hh, actor, l1TokenAddress, l2TokenName, l2TokenSymbol, l2TokenDecimals) {
        const OptimismMintableERC20Factory = "0x4200000000000000000000000000000000000012";
        const optimismMintableERC20Factory = await hh.ethers.getContractAt(artifacts.OptimismMintableERC20Factory.abi, OptimismMintableERC20Factory, actor);
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
    static async deployUSDT(actor, l1TokenAddress) {
        const deployer = new Erc20Deployer(actor);
        const L2USDT = await deployer.deployL2USDT(l1TokenAddress);
        return { L2USDT };
    }
    async deployL2USDT(l1TokenAddress) {
        const L2StandardBridge = "0x4200000000000000000000000000000000000010";
        const deployerAddress = await this.deployer.getAddress();
        return await this.deployContract(artifacts.USDT.abi, artifacts.USDT.bytecode, [l1TokenAddress, L2StandardBridge], this.deployer);
    }
    async deployContract(abi, bytecode, deployParams, actor) {
        const factory = new ethers_1.ContractFactory(abi, bytecode, actor);
        return await factory.deploy(...deployParams);
    }
}
exports.Erc20Deployer = Erc20Deployer;
//# sourceMappingURL=Erc20Deployer.js.map