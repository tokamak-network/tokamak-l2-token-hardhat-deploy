import { Signer, Contract } from "ethers";
export declare class Erc20Deployer {
    deployer: Signer;
    hre: any;
    constructor(deployer: Signer);
    static deployERC20(hh: any, actor: Signer, l1TokenAddress: string, l2TokenName: string, l2TokenSymbol: string, l2TokenDecimals?: number): Promise<{
        [name: string]: Contract;
    }>;
}
//# sourceMappingURL=Erc20Deployer.d.ts.map