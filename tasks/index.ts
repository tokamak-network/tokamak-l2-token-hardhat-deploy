import { task } from "hardhat/config";
import "@nomiclabs/hardhat-ethers";
import "./type-extensions";

import Table from "cli-table3";

import { UsdcBridgeDeployer } from "./deployer/UsdcBridgeDeployer";

task("l1-usdc-bridge-deploy", "Deploy the usdc bridge of L1")
    .addOptionalParam("adminAddress", "Admin Address")
    .addOptionalParam("outputType", "Output type")
    .setAction(async (args, hre) => {

        const [actor] = await hre.ethers.getSigners();
        const contracts = await UsdcBridgeDeployer.deployL1Bridge(actor);

        if (args.adminAddress != null && args.adminAddress != undefined && args.adminAddress.length == 42
            && args.adminAddress.toLocaleLowerCase() != actor.address.toLocaleLowerCase()) {
                await (await contracts.L1UsdcBridgeProxy.connect(actor).proxyChangeOwner(args.adminAddress)).wait()
        }

        // if (hre.network.name != "hardhat" && hre.network.name != "localhost") {
        //     await hre.run("etherscan-verify", {
        //         network: hre.network.name
        //     });
        // }

        if(args.outputType == "json") {
            const table = {}
            for (const item of Object.keys(contracts)) {
                Object.assign(table, {item: contracts[item].address})
            }
            console.info(table);
        } else {
            const table = new Table({
                head: ["Contract", "Address"],
                style: { border: [] },
            });
            for (const item of Object.keys(contracts)) {
            table.push([item, contracts[item].address]);
            }
            console.info(table.toString());
        }
});



