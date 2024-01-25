
import { Signer, Contract, ContractFactory } from "ethers";

type ContractJson = { abi: any; bytecode: string, linkReferences?: any };
const artifacts: { [name: string]: ContractJson } = {
  OptimismMintableERC20Factory: require("../../artifacts-deploy/optimism/contracts/OptimismMintableERC20Factory.json"),
  // OptimismMintableERC721Factory: require("../../artifacts-deploy/optimism/contracts/OptimismMintableERC721Factory.json"),
  OptimismMintableERC20: require("../../artifacts-deploy/optimism/contracts/OptimismMintableERC20.json"),
  // OptimismMintableERC721: require("../../artifacts-deploy/optimism/contracts/OptimismMintableERC721.json")
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
      console.log('actor', actor.address)
      const OptimismMintableERC20Factory = "0x4200000000000000000000000000000000000012"
      const optimismMintableERC20Factory = await hh.ethers.getContractAt(
        artifacts.OptimismMintableERC20Factory.abi,
        OptimismMintableERC20Factory,
        actor)

      // const receipt = await (await optimismMintableERC20Factory.connect(actor).createOptimismMintableERC20(
      //   l1TokenAddress, l2TokenName, l2TokenSymbol
      // )).wait();

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


    // private async deployContract<T>(
    //     abi: any,
    //     bytecode: string,
    //     deployParams: Array<any>,
    //     actor: Signer
    // ) {
    //     const factory = new ContractFactory(abi, bytecode, actor);
    //     return await factory.deploy(...deployParams);
    // }

}
