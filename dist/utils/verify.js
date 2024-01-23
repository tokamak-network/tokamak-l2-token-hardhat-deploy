"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hardhat_1 = require("hardhat");
const verify = async (contractAddress, args, contract) => {
    console.log("Verifying contract...");
    try {
        await (0, hardhat_1.run)("verify:verify", {
            address: contractAddress,
            constructorArguments: args,
            contract: contract,
        });
    }
    catch (e) {
        if (e.message.toLowerCase().includes("already verified")) {
            console.log("Already verified!");
        }
        else {
            console.log(e);
        }
    }
};
exports.default = verify;
//# sourceMappingURL=verify.js.map