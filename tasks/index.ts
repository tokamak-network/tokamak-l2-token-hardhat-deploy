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

        if (hre.network.name != "hardhat" && hre.network.name != "localhost") {
            await hre.run("etherscan-verify", {
                network: hre.network.name
            });
        }

        if(args.outputType == "json") {
            const table = {}
            for (const item of Object.keys(contracts)) {
                table[item] = contracts[item].address;
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


task("l2-usdc-bridge-deploy", "Deploy the usdc bridge of L2").setAction(async (args, hre) => {
    const [actor] = await hre.ethers.getSigners();
    const contracts = await UsdcBridgeDeployer.deployL2Bridge(actor);

    const table = new Table({
        head: ["Contract", "Address"],
        style: { border: [] },
    });

    for (const item of Object.keys(contracts)) {
        table.push([item, contracts[item].address]);

    }
    console.info(table.toString());

    if (hre.network.name != "hardhat" && hre.network.name != "localhost") {
        await hre.run("etherscan-verify", {
            network: hre.network.name
        });
    }
});

task("usdc-deploy", "Deploy the bridged usdc")
    .addParam("adminAddress", "Admin Address")
    .setAction(async (args, hre) => {
        const [actor] = await hre.ethers.getSigners();
        const contracts = await UsdcBridgeDeployer.deployBridgedUsdc(hre, actor, args.adminAddress);

        const table = new Table({
            head: ["Contract", "Address"],
            style: { border: [] },
        });

        for (const item of Object.keys(contracts)) {
            table.push([item, contracts[item].address]);
        }
        console.info(table.toString());

        if (hre.network.name != "hardhat" && hre.network.name != "localhost") {
            await hre.run("etherscan-verify", {
                network: hre.network.name
            });
        }
});

task("l2-usdc-and-bridge-deploy", "Deploy USDC and the usdc bridge for L2")
    .addParam("adminAddress", "Admin Address")
    .addParam("serviceName", "Service Address")
    .addParam("l1UsdcAddress", "L1 Usdc Address")
    .addParam("l1UsdcBridgeAddress", "L1 Usdc Bridge Address")
    .addOptionalParam("outputType", "Output type")
    .setAction(async (args, hre) => {
        const [actor] = await hre.ethers.getSigners();

        const L2CrossDomainMessenger = "0x4200000000000000000000000000000000000007"

        const bridgeContracts = await UsdcBridgeDeployer.deployL2Bridge(actor);
        const usdcContracts = await UsdcBridgeDeployer.deployBridgedUsdc(
            hre,
            actor,
            args.adminAddress,
            args.serviceName,
            actor.address
        );

        if (hre.network.name != "hardhat" && hre.network.name != "localhost") {
            await hre.run("etherscan-verify", {
                network: hre.network.name
            });
        }

        // let masterMinterOwner = await usdcContracts.MasterMinter.owner()

        await (await usdcContracts.MasterMinter.connect(actor).configureController(
            bridgeContracts.L2UsdcBridgeProxy.address,
            bridgeContracts.L2UsdcBridgeProxy.address
          )).wait()

        // let worker = await usdcContracts.MasterMinter.getWorker(bridgeContracts.L2UsdcBridgeProxy.address)

        await (await bridgeContracts.L2UsdcBridgeProxy.connect(actor).setAddress(
            L2CrossDomainMessenger,
            args.l1UsdcBridgeAddress,
            args.l1UsdcAddress,
            usdcContracts.FiatTokenProxy.address,
            usdcContracts.MasterMinter.address
          )
        ).wait()

        await (await usdcContracts.MasterMinter.connect(actor).transferOwnership(args.adminAddress)).wait()

        // masterMinterOwner = await usdcContracts.MasterMinter.owner()

        if(args.outputType == "json") {
            const table = {}
            for (const item of Object.keys(usdcContracts)) {
                table[item] = usdcContracts[item].address;
            }
            for (const item of Object.keys(bridgeContracts)) {
                table[item] = bridgeContracts[item].address;
            }
            console.info(table);
        } else {
            const table = new Table({
                head: ["Contract", "Address"],
                style: { border: [] },
            });

            for (const item of Object.keys(usdcContracts)) {
                table.push([item, usdcContracts[item].address]);

            }
            for (const item of Object.keys(bridgeContracts)) {
                table.push([item, bridgeContracts[item].address]);

            }
            console.info(table.toString());
        }
});


task("set-l1-usdc-bridge", "Set L1 USDC Bridge")
    .addParam("l1CrossDomainMessenger", "L1 CrossDomainMessenger Address")
    .addParam("l1UsdcAddress", "L1 Usdc Address")
    .addParam("l2UsdcAddress", "L2 Usdc Address")
    .addParam("l1UsdcBridgeAddress", "L1 Usdc Bridge Address")
    .addParam("l2UsdcBridgeAddress", "L2 Usdc Bridge Address")
    .setAction(async (args, hre) => {
        const [actor] = await hre.ethers.getSigners();

        // const L2CrossDomainMessenger = "0x4200000000000000000000000000000000000007"

        const contract = await UsdcBridgeDeployer.setL1Bridge(
            hre,
            actor,
            args.l1CrossDomainMessenger,
            args.l1UsdcAddress,
            args.l2UsdcAddress,
            args.l1UsdcBridgeAddress,
            args.l2UsdcBridgeAddress
            );

        console.info('set-l1-usdc-bridge  done')
});


