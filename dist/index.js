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
const Erc20Deployer_1 = require("./deployer/Erc20Deployer");
(0, config_1.task)("l2-erc20-deploy", "Deploy ERC20 on L2")
    .addParam("l1TokenAddress", "L1 Token Address")
    .addParam("tokenName", "Token Name")
    .addParam("tokenSymbol", "Token Symbol")
    .addParam("tokenDecimals", "Token Decimals")
    .addOptionalParam("outputType", "Output type")
    .setAction(async (args, hre) => {
    const [actor] = await hre.ethers.getSigners();
    const tokens = await Erc20Deployer_1.Erc20Deployer.deployERC20(hre, actor, args.l1TokenAddress, args.tokenName, args.tokenSymbol, args.tokenDecimals);
    const table = new cli_table3_1.default({
        head: ["Contract", "Address"],
        style: { border: [] },
    });
    if (args.outputType == "json") {
        console.info(tokens);
    }
    else {
        for (const item of Object.keys(tokens)) {
            table.push([item, tokens[item]]);
        }
        console.info(table.toString());
    }
});
(0, config_1.task)("l2-usdt-deploy", "Deploy USDT on L2")
    .addParam("l1TokenAddress", "L1 Token Address")
    .addOptionalParam("outputType", "Output type")
    .setAction(async (args, hre) => {
    const [actor] = await hre.ethers.getSigners();
    const tokens = await Erc20Deployer_1.Erc20Deployer.deployUSDT(actor, args.l1TokenAddress);
    const table = new cli_table3_1.default({
        head: ["Contract", "Address"],
        style: { border: [] },
    });
    if (args.outputType == "json") {
        const table = {};
        for (const item of Object.keys(tokens)) {
            table[item] = tokens[item].address;
        }
        console.info(table);
    }
    else {
        for (const item of Object.keys(tokens)) {
            table.push([item, tokens[item].address]);
        }
        console.info(table.toString());
    }
});
(0, config_1.task)("l1-usdc-bridge-deploy", "Deploy the usdc bridge on L1")
    .addOptionalParam("adminAddress", "Admin Address")
    .addOptionalParam("outputType", "Output type")
    .setAction(async (args, hre) => {
    const [actor] = await hre.ethers.getSigners();
    const contracts = await UsdcBridgeDeployer_1.UsdcBridgeDeployer.deployL1Bridge(actor);
    if (args.adminAddress != null && args.adminAddress != undefined && args.adminAddress.length == 42
        && args.adminAddress.toLocaleLowerCase() != actor.address.toLocaleLowerCase()) {
        await (await contracts.L1UsdcBridgeProxy.connect(actor).proxyChangeOwner(args.adminAddress)).wait();
    }
    if (hre.network.name != "hardhat" && hre.network.name != "localhost") {
        await hre.run("etherscan-verify", {
            network: hre.network.name
        });
    }
    if (args.outputType == "json") {
        const table = {};
        for (const item of Object.keys(contracts)) {
            table[item] = contracts[item].address;
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
(0, config_1.task)("l2-usdc-bridge-deploy", "Deploy the usdc bridge on L2").setAction(async (args, hre) => {
    const [actor] = await hre.ethers.getSigners();
    const contracts = await UsdcBridgeDeployer_1.UsdcBridgeDeployer.deployL2Bridge(actor);
    const table = new cli_table3_1.default({
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
(0, config_1.task)("usdc-deploy", "Deploy the bridged usdc")
    .addParam("adminAddress", "Admin Address")
    .setAction(async (args, hre) => {
    const [actor] = await hre.ethers.getSigners();
    const contracts = await UsdcBridgeDeployer_1.UsdcBridgeDeployer.deployBridgedUsdc(hre, actor, args.adminAddress);
    const table = new cli_table3_1.default({
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
(0, config_1.task)("l2-usdc-and-bridge-deploy", "Deploy USDC and the usdc bridge on L2")
    .addParam("serviceName", "Service Address")
    .addParam("l1UsdcAddress", "L1 Usdc Address")
    .addParam("l1UsdcBridgeAddress", "L1 Usdc Bridge Address")
    .addParam("l2UsdcAdmin", "L2 USDC ADMIN Address")
    .addParam("l2UsdcMinterAdmin", "L2 MASTER MINTER ADMIN Address")
    .addParam("l2UsdcProxyAdmin", "L2 USDC PROXY ADMIN Address")
    .addOptionalParam("outputType", "Output type")
    .setAction(async (args, hre) => {
    const [actor] = await hre.ethers.getSigners();
    if (args.l2UsdcAdmin == actor.address) {
        console.log('l2UsdcAdmin must be different from deployer.');
        return;
    }
    if (args.l2UsdcAdmin == args.l2UsdcProxyAdmin) {
        console.log('l2UsdcAdmin must be different from l2UsdcProxyAdmin.');
        return;
    }
    console.log("deploy L2 Bridge ..");
    const bridgeContracts = await UsdcBridgeDeployer_1.UsdcBridgeDeployer.deployL2Bridge(actor);
    console.log("deploy Bridged USDC ..");
    const usdcContracts = await UsdcBridgeDeployer_1.UsdcBridgeDeployer.deployBridgedUsdc(hre, actor, args.l2UsdcAdmin, args.serviceName, actor.address);
    console.log("set L2 Bridge ..");
    const L2CrossDomainMessenger = "0x4200000000000000000000000000000000000007";
    await (await bridgeContracts.L2UsdcBridgeProxy.connect(actor).setAddress(L2CrossDomainMessenger, args.l1UsdcBridgeAddress, args.l1UsdcAddress, usdcContracts.FiatTokenProxy.address, usdcContracts.MasterMinter.address)).wait();
    console.log("MasterMinter configureController ..");
    await (await usdcContracts.MasterMinter.connect(actor).configureController(bridgeContracts.L2UsdcBridgeProxy.address, bridgeContracts.L2UsdcBridgeProxy.address)).wait();
    // let proxyAdmin = await usdcContracts.FiatTokenProxy.admin()
    // console.log("FiatTokenProxy.admin ", proxyAdmin)
    // console.log("program.opts().l2UsdcProxyAdmin ", program.opts().l2UsdcProxyAdmin)
    // if (program.opts().l2UsdcProxyAdmin !=null
    //     && program.opts().l2UsdcProxyAdmin != '0x0000000000000000000000000000000000000000'
    //     && program.opts().l2UsdcProxyAdmin.length == 42
    //     && proxyAdmin.toLocaleLowerCase() != program.opts().l2UsdcProxyAdmin.toLocaleLowerCase()
    // ){
    //     console.log("FiatTokenProxy(USDC) Proxy changeAdmin ..")
    //     await (await usdcContracts.FiatTokenProxy.changeAdmin(program.opts().l2UsdcProxyAdmin)).wait()
    // }
    let masterMinterOwner = await usdcContracts.MasterMinter.owner();
    if (args.l2UsdcMinterAdmin != null
        && args.l2UsdcMinterAdmin != '0x0000000000000000000000000000000000000000'
        && args.l2UsdcMinterAdmin.length == 42
        && masterMinterOwner.toLocaleLowerCase() != args.l2UsdcMinterAdmin.toLocaleLowerCase()) {
        console.log("MasterMinter transferOwnership ..");
        await (await usdcContracts.MasterMinter.connect(actor).transferOwnership(args.l2UsdcMinterAdmin)).wait();
    }
    if (hre.network.name != "hardhat" && hre.network.name != "localhost") {
        await hre.run("etherscan-verify", {
            network: hre.network.name
        });
    }
    if (args.outputType == "json") {
        const table = {};
        for (const item of Object.keys(usdcContracts)) {
            table[item] = usdcContracts[item].address;
        }
        for (const item of Object.keys(bridgeContracts)) {
            table[item] = bridgeContracts[item].address;
        }
        console.info(table);
    }
    else {
        const table = new cli_table3_1.default({
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
(0, config_1.task)("l1-usdc-bridge-set", "Set addresses at L1 USDC Bridge")
    .addParam("l1CrossDomainMessenger", "L1 CrossDomainMessenger Address")
    .addParam("l1UsdcAddress", "L1 Usdc Address")
    .addParam("l2UsdcAddress", "L2 Usdc Address")
    .addParam("l1UsdcBridgeAddress", "L1 Usdc Bridge Address")
    .addParam("l2UsdcBridgeAddress", "L2 Usdc Bridge Address")
    .setAction(async (args, hre) => {
    const [actor] = await hre.ethers.getSigners();
    // const L2CrossDomainMessenger = "0x4200000000000000000000000000000000000007"
    const contract = await UsdcBridgeDeployer_1.UsdcBridgeDeployer.setL1Bridge(hre, actor, args.l1CrossDomainMessenger, args.l1UsdcAddress, args.l2UsdcAddress, args.l1UsdcBridgeAddress, args.l2UsdcBridgeAddress);
    console.info('l1-usdc-bridge-set  done');
});
//# sourceMappingURL=index.js.map