
import { Signer, Contract, ContractFactory } from "ethers";
import { linkLibraries } from "../utils/linkLibraries";

type ContractJson = { abi: any; bytecode: string, linkReferences?: any };
const artifacts: { [name: string]: ContractJson } = {
  L1UsdcBridgeProxy: require("../../artifacts-deploy/usdc-bridge/contracts/L1/L1UsdcBridgeProxy.sol/L1UsdcBridgeProxy.json"),
  L1UsdcBridge: require("../../artifacts-deploy/usdc-bridge/contracts/L1/L1UsdcBridge.sol/L1UsdcBridge.json"),
  L2UsdcBridgeProxy: require("../../artifacts-deploy/usdc-bridge/contracts/L2/L2UsdcBridgeProxy.sol/L2UsdcBridgeProxy.json"),
  L2UsdcBridge: require("../../artifacts-deploy/usdc-bridge/contracts/L2/L2UsdcBridge.sol/L2UsdcBridge.json"),
  SignatureChecker: require("../../artifacts-deploy/usdc/contracts/util/SignatureChecker.sol/SignatureChecker.json"),
  FiatTokenV2_2: require("../../artifacts-deploy/usdc/contracts/v2/FiatTokenV2_2.sol/FiatTokenV2_2.json"),
  FiatTokenProxy: require("../../artifacts-deploy/usdc/contracts/v1/FiatTokenProxy.sol/FiatTokenProxy.json"),
  MasterMinter: require("../../artifacts-deploy/usdc/contracts/minting/MasterMinter.sol/MasterMinter.json")
};

const UsdcTokenInfo = {
  TOKEN_NAME: "Bridged USDC (Tokamak Network)",
  TOKEN_SYMBOL: "USDC.e",
  TOKEN_CURRENCY: "USD",
  TOKEN_DECIMALS: 6,
}

export class UsdcBridgeDeployer {
    deployer: Signer;
    hre: any;

    constructor(deployer: Signer) {
      this.deployer = deployer;
    }

    static async setL1Bridge(
      actor: Signer,
      l1CrossDomainMessenger: string,
      l1UsdcAddress: string,
      l2UsdcAddress: string,
      l1UsdcBridgeAddress: string,
      l2UsdcBridgeAddress: string,
      hh: any
    ): Promise<{ [name: string]: Contract }> {

      const L1UsdcBridgeProxy = await hh.ethers.getContractAt(artifacts.L1UsdcBridgeProxy.abi,l1UsdcBridgeAddress, actor)

      let l1Messenger = await L1UsdcBridgeProxy.messenger()
      let otherBridge = await L1UsdcBridgeProxy.otherBridge()
      let l1Usdc = await L1UsdcBridgeProxy.l1Usdc()
      let l2Usdc = await L1UsdcBridgeProxy.l2Usdc()

      if (l1Messenger.toLocaleLowerCase() != l1CrossDomainMessenger.toLocaleLowerCase()
          || otherBridge.toLocaleLowerCase() != l2UsdcBridgeAddress.toLocaleLowerCase()
          || l1Usdc.toLocaleLowerCase() != l1UsdcAddress.toLocaleLowerCase()
          || l2Usdc.toLocaleLowerCase() != l2UsdcAddress.toLocaleLowerCase()
        ) {
          await (await L1UsdcBridgeProxy.connect(actor).setAddress(
            l1CrossDomainMessenger,
            l2UsdcBridgeAddress,
            l1UsdcAddress,
            l2UsdcAddress
          )).wait()
        }

      return {
        L1UsdcBridgeProxy
      };
    }


    static async deployL1Bridge(
      actor: Signer
    ): Promise<{ [name: string]: Contract }> {
      const deployer = new UsdcBridgeDeployer(actor);

      const L1UsdcBridge = await deployer.deployL1UsdcBridge();
      const L1UsdcBridgeProxy = await deployer.deployL1UsdcBridgeProxy(L1UsdcBridge.address);
      let imp = await L1UsdcBridgeProxy.implementation()
      if (imp != L1UsdcBridge.address) {
          await (await L1UsdcBridgeProxy.connect(actor).upgradeTo(L1UsdcBridge.address)).wait()
      }
      return {
        L1UsdcBridge,
        L1UsdcBridgeProxy,
      };
    }

    static async deployL2Bridge(actor: Signer): Promise<{ [name: string]: Contract }> {
      const deployer = new UsdcBridgeDeployer(actor);
      const L2UsdcBridge = await deployer.deployL2UsdcBridge();
      const L2UsdcBridgeProxy = await deployer.deployL2UsdcBridgeProxy(L2UsdcBridge.address);

      let imp = await L2UsdcBridgeProxy.implementation()
      if (imp != L2UsdcBridge.address) {
          await (await L2UsdcBridgeProxy.connect(actor).upgradeTo(L2UsdcBridge.address)).wait()
      }
      return {
        L2UsdcBridge,
        L2UsdcBridgeProxy
      };
    }

    static async deployBridgedUsdc(
      hh:any,
      actor: Signer,
      ownerAddress: string,
      serviceName?: string,
      masterMinterAddress?: string,
      proxyAdminAddress?: string,
      pauserAddress?: string,
      blacklisterAddress?: string,
      lostAndFoundAddress?: string
      ): Promise<{ [name: string]: Contract }> {

      const deployer = new UsdcBridgeDeployer(actor);
      const THROWAWAY_ADDRESS = "0x0000000000000000000000000000000000000001"
      if (ownerAddress == null && ownerAddress == "0x0000000000000000000000000000000000000000") {
        console.error('ownerAddress can not set Zero Address.')
        return {};

      } else {
        masterMinterAddress = this.checkValidValue(masterMinterAddress, ownerAddress)
        proxyAdminAddress = this.checkValidValue(proxyAdminAddress, ownerAddress)
        pauserAddress = this.checkValidValue(pauserAddress, ownerAddress)
        blacklisterAddress = this.checkValidValue(blacklisterAddress, ownerAddress)
        lostAndFoundAddress = this.checkValidValue(lostAndFoundAddress, ownerAddress)

        const SignatureChecker = await deployer.deploySignatureChecker();
        const FiatTokenV2_2 = await deployer.deployFiatTokenV2_2(SignatureChecker.address, THROWAWAY_ADDRESS);
        const FiatTokenProxy = await deployer.deployFiatTokenProxy(FiatTokenV2_2.address);
        const MasterMinter = await deployer.deployMasterMinter(FiatTokenProxy.address, masterMinterAddress);

        let proxyAdmin = await FiatTokenProxy.admin()
        if (proxyAdminAddress != null && proxyAdminAddress.length == 42 && proxyAdmin != proxyAdminAddress) {
            await (await FiatTokenProxy.connect(actor).changeAdmin(proxyAdminAddress)).wait()
        }

        const fiatToken = await hh.ethers.getContractAt(artifacts.FiatTokenV2_2.abi, FiatTokenProxy.address, actor)

        let tokenName = UsdcTokenInfo.TOKEN_NAME;
        if (serviceName != null && serviceName.length > 0) {tokenName = tokenName.replace("Tokamak Network", serviceName)}
        await (await fiatToken.initialize(
            tokenName,
            UsdcTokenInfo.TOKEN_SYMBOL,
            UsdcTokenInfo.TOKEN_CURRENCY,
            UsdcTokenInfo.TOKEN_DECIMALS,
            MasterMinter.address,
            pauserAddress,
            blacklisterAddress,
            ownerAddress,
        )).wait()

        await (await fiatToken.initializeV2(tokenName)).wait()
        await (await fiatToken.initializeV2_1(lostAndFoundAddress)).wait()
        await (await fiatToken.initializeV2_2([], UsdcTokenInfo.TOKEN_SYMBOL)).wait()

        return {
          SignatureChecker,
          FiatTokenV2_2,
          FiatTokenProxy,
          MasterMinter
        }
      }
    }

    static checkValidValue (originalStr: string | any, replaceStr: string) : string {
      if(originalStr == null || originalStr == undefined || originalStr.length != 42) return replaceStr;
      else return originalStr
    }

    async deploySignatureChecker() {
      return await this.deployContract<Contract>(
        artifacts.SignatureChecker.abi,
        artifacts.SignatureChecker.bytecode,
        [],
        this.deployer
      );
    }

    async deployFiatTokenV2_2(SignatureCheckerAddress: string, THROWAWAY_ADDRESS: string) {
      const linkedBytecode = linkLibraries(
        {
          bytecode: artifacts.FiatTokenV2_2.bytecode,
          linkReferences: artifacts.FiatTokenV2_2.linkReferences
        },
        {
          SignatureChecker: SignatureCheckerAddress,
        }
      );

      const contract =  await this.deployContract<Contract>(
        artifacts.FiatTokenV2_2.abi,
        linkedBytecode,
        [],
        this.deployer
      );

      let masterMinter = await contract.masterMinter()
      if(masterMinter == '0x0000000000000000000000000000000000000000' ){
        await (await contract.initialize(
            "",
            "",
            "",
            0,
            THROWAWAY_ADDRESS,
            THROWAWAY_ADDRESS,
            THROWAWAY_ADDRESS,
            THROWAWAY_ADDRESS,
        )).wait()
        await (await contract.initializeV2("")).wait()
        await (await contract.initializeV2_1(THROWAWAY_ADDRESS)).wait()
        await (await contract.initializeV2_2([], "")).wait()
      }

      return contract;
    }

    async deployFiatTokenProxy(FiatTokenV2_2Deployment: string) {
      return await this.deployContract<Contract>(
        artifacts.FiatTokenProxy.abi,
        artifacts.FiatTokenProxy.bytecode,
        [FiatTokenV2_2Deployment],
        this.deployer
      );
    }

    async deployMasterMinter(FiatTokenProxyDeployment: string, masterMinterOwnerAddress: string) {
       const contract = await this.deployContract<Contract>(
        artifacts.MasterMinter.abi,
        artifacts.MasterMinter.bytecode,
        [FiatTokenProxyDeployment],
        this.deployer
      );

      let masterMinterOwner = await contract.owner()
      if (masterMinterOwnerAddress != '0x0000000000000000000000000000000000000000'
          && masterMinterOwner != masterMinterOwnerAddress){
          await (await contract.transferOwnership(masterMinterOwnerAddress)).wait()
      }

      return contract
    }

    async deployL1UsdcBridge() {
        return await this.deployContract<Contract>(
          artifacts.L1UsdcBridge.abi,
          artifacts.L1UsdcBridge.bytecode,
          [],
          this.deployer
        );
    }

    async deployL1UsdcBridgeProxy(implementation: string) {
      const deployerAddress = await this.deployer.getAddress()
      return await this.deployContract<Contract>(
        artifacts.L1UsdcBridgeProxy.abi,
        artifacts.L1UsdcBridgeProxy.bytecode,
        [implementation, deployerAddress, '0x'],
        this.deployer
      );
    }

    async deployL2UsdcBridge() {
      return await this.deployContract<Contract>(
      artifacts.L2UsdcBridge.abi,
      artifacts.L2UsdcBridge.bytecode,
      [],
      this.deployer
      );
    }

    async deployL2UsdcBridgeProxy(implementation: string) {
      const deployerAddress = await this.deployer.getAddress()
      return await this.deployContract<Contract>(
      artifacts.L2UsdcBridgeProxy.abi,
      artifacts.L2UsdcBridgeProxy.bytecode,
      [implementation, deployerAddress, '0x'],
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
