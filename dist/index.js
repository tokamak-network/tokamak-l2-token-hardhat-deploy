"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("hardhat/config");
require("@nomiclabs/hardhat-ethers");
require("./type-extensions");
const cli_table3_1 = __importDefault(require("cli-table3"));
const UsdcBridgeDeployer_1 = require("./deployer/UsdcBridgeDeployer");
(0, config_1.task)("l1-usdc-bridge-deploy", "Deploy the usdc bridge of L1")
    .addOptionalParam("adminAddress", "Admin Address")
    .addOptionalParam("outputType", "Output type")
    .setAction(async (args, hre) => {
    const [actor] = await hre.ethers.getSigners();
    const contracts = await UsdcBridgeDeployer_1.UsdcBridgeDeployer.deployL1Bridge(actor);
    if (args.adminAddress != null && args.adminAddress != undefined && args.adminAddress.length == 42
        && args.adminAddress.toLocaleLowerCase() != actor.address.toLocaleLowerCase()) {
        await (await contracts.L1UsdcBridgeProxy.connect(actor).proxyChangeOwner(args.adminAddress)).wait();
    }
    // if (hre.network.name != "hardhat" && hre.network.name != "localhost") {
    //     await hre.run("etherscan-verify", {
    //         network: hre.network.name
    //     });
    // }
    if (args.outputType == "json") {
        const table = {};
        for (const item of Object.keys(contracts)) {
            Object.assign(table, { item: contracts[item].address });
        }
        console.info(table);
    }
    else {
        const table = new cli_table3_1.default({
            head: ["Contract", "Address"],
            style: { border: [] },
        });
        for (const item of Object.keys(contracts)) {
            table.push([item, contracts[item].address]);
        }
        console.info(table.toString());
    }
});
//# sourceMappingURL=index.js.map