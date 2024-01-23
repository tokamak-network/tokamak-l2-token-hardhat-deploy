import { Signer, Contract } from "ethers";
export declare class UsdcBridgeDeployer {
    deployer: Signer;
    hre: any;
    constructor(deployer: Signer);
    static setL1Bridge(actor: Signer, l1CrossDomainMessenger: string, l1UsdcAddress: string, l2UsdcAddress: string, l1UsdcBridgeAddress: string, l2UsdcBridgeAddress: string, hh: any): Promise<{
        [name: string]: Contract;
    }>;
    static deployL1Bridge(actor: Signer): Promise<{
        [name: string]: Contract;
    }>;
    static deployL2Bridge(actor: Signer): Promise<{
        [name: string]: Contract;
    }>;
    static deployBridgedUsdc(hh: any, actor: Signer, ownerAddress: string, serviceName?: string, masterMinterAddress?: string, proxyAdminAddress?: string, pauserAddress?: string, blacklisterAddress?: string, lostAndFoundAddress?: string): Promise<{
        [name: string]: Contract;
    }>;
    static checkValidValue(originalStr: string | any, replaceStr: string): string;
    deploySignatureChecker(): Promise<Contract>;
    deployFiatTokenV2_2(SignatureCheckerAddress: string, THROWAWAY_ADDRESS: string): Promise<Contract>;
    deployFiatTokenProxy(FiatTokenV2_2Deployment: string): Promise<Contract>;
    deployMasterMinter(FiatTokenProxyDeployment: string, masterMinterOwnerAddress: string): Promise<Contract>;
    deployL1UsdcBridge(): Promise<Contract>;
    deployL1UsdcBridgeProxy(implementation: string): Promise<Contract>;
    deployL2UsdcBridge(): Promise<Contract>;
    deployL2UsdcBridgeProxy(implementation: string): Promise<Contract>;
    private deployContract;
}
//# sourceMappingURL=UsdcBridgeDeployer.d.ts.map