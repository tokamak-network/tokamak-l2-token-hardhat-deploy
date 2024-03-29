
import { Signer, Contract, ContractFactory } from "ethers";

type ContractJson = { abi: any; bytecode: string, linkReferences?: any };
const artifacts: { [name: string]: ContractJson } = {
  OptimismMintableERC20Factory: require("../../artifacts-deploy/optimism/contracts/OptimismMintableERC20Factory.json"),
  OptimismMintableERC20: require("../../artifacts-deploy/optimism/contracts/OptimismMintableERC20.json"),
  USDT: require("../../artifacts-deploy/usdt/contracts/USDT.json"),
};


export class Erc20Deployer {
    deployer: Signer;
    hre: any;

    constructor(deployer: Signer) {
      this.deployer = deployer;
    }

    static async deployERC20(
      hh: any,
      actor: Signer,
      l1TokenAddress: string,
      l2TokenName: string,
      l2TokenSymbol: string,
      l2TokenDecimals?: number
    ): Promise<{ [name: string]: Contract }> {
      const OptimismMintableERC20Factory = "0x4200000000000000000000000000000000000012"
      const optimismMintableERC20Factory = await hh.ethers.getContractAt(
        artifacts.OptimismMintableERC20Factory.abi,
        OptimismMintableERC20Factory,
        actor)

      const receipt = await (await optimismMintableERC20Factory.connect(actor).createOptimismMintableERC20WithDecimals(
        l1TokenAddress, l2TokenName, l2TokenSymbol, l2TokenDecimals
      )).wait();

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

    static async deployUSDT(
      actor: Signer,
      l1TokenAddress: string
    ): Promise<{ [name: string]: Contract }> {
      const deployer = new Erc20Deployer(actor);
      const L2USDT = await deployer.deployL2USDT(l1TokenAddress);
      return {L2USDT}
    }

    async deployL2USDT(l1TokenAddress: string) {
      const L2StandardBridge = "0x4200000000000000000000000000000000000010"
      const deployerAddress = await this.deployer.getAddress()
      return await this.deployContract<Contract>(
      artifacts.USDT.abi,
      artifacts.USDT.bytecode,
      [l1TokenAddress, L2StandardBridge],
      this.deployer
      );
    }

    private async deployContract<T>(
      abi: any,
      bytecode: string,
      deployParams: Array<any>,
      actor: Signer
  ) {
      const factory = new ContractFactory(abi, bytecode, actor);
      return await factory.deploy(...deployParams);
  }
}
