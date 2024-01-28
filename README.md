# @tokamak-network/tokamak-l2-token-hardhat-deploy

This is a hardhat-plugin that distributes L2 ERC20, USDT, USDC and USDC Bridge.

## Index

[Install](##Install)

[Deploy L2 ERC20](#deploy-l2-erc20)

[Deploy L2 USDT](#deploy-l2-usdt)

[Deploy L1 USDC Bridge](#deploy-l1-usdc-bridge)

[Deploy L2 USDC and L2 USDC Bridge](#deploy-l2-usdc-and-l2-usdc-bridge)

[Set L1 USDC Bridge with L2 USDC](#set-l1-usdc-bridge--with-l2-usdc)


## Install

> `npm install @tokamak-network/tokamak-l2-token-hardhat-deploy`
>

Import the plugin in your `hardhat.config.js`:

`require("@tokamak-network/tokamak-l2-token-hardhat-deploy");`

Now, run `npm run hardhat` and you should see:

```jsx

AVAILABLE TASKS:

check                    	Check whatever you need
clean                    	Clears the cache and deletes all artifacts
compile                  	Compiles the entire project, building all artifacts
console                  	Opens a hardhat console
flatten                  	Flattens and prints contracts and their dependencies. If no file is passed, all the contracts in the project will be flattened.
help                     	Prints this message
l1-usdc-bridge-deploy    	Deploy the usdc bridge on L1
l1-usdc-bridge-set       	Set addresses at L1 USDC Bridge
l2-usdt-deploy          	Deploy USDT on L2
l2-erc20-deploy          	Deploy ERC20 on L2
l2-usdc-and-bridge-deploy	Deploy USDC and the usdc bridge on L2
l2-usdc-bridge-deploy    	Deploy the usdc bridge on L2
node                     	Starts a JSON-RPC server on top of Hardhat Network
run                      	Runs a user-defined script after compiling the project
test                     	Runs mocha tests
usdc-deploy              	Deploy the bridged usdc
```

## Deploy L2 ERC20

Deploy using the  **l2-erc20-deploy** hardhat task.

> `npx hardhat --network localhost l2-erc20-deploy --l1-token-address {L1 token address} --token-name {token name}  --token-symbol {token symbol}  --token-decimals {token decimals}  --output-type json`
>
- Required parameters
    - l1-token-address : l1-token-address address
    - token-name : token name
    - token-symbol : token symbol
    - token-decimals : token decimals

- Option parameters
    - output-type  : If it’s value is “json” , display the deployed address with json type, otherwise it display addresses with table.


**example**

> `npx hardhat --network localhost l2-erc20-deploy --l1-token-address 0xff3ef745d9878afe5934ff0b130868afddbc58e8 --token-name TONStarter --token-symbol TOS --token-decimals 18 --output-type json`
>


## Deploy L2 USDT

Deploy using the  **l2-usdt-deploy** hardhat task.

> `npx hardhat --network localhost l2-usdt-deploy --l1-token-address {L1 token address} --output-type json`
>
- Required parameters
    - l1-token-address : l1-token-address address

- Option parameters
    - output-type  : If it’s value is “json” , display the deployed address with json type, otherwise it display addresses with table.


**example**

> `npx hardhat --network localhost l2-usdt-deploy --l1-token-address 0xff3ef745d9878afe5934ff0b130868afddbc58e8`
>
>
>

## Deploy L1 USDC Bridge

Deploy using the **l1-usdc-bridge-deploy** hardhat task.

`npx hardhat --network localhost l1-usdc-bridge-deploy --output-type json`

- Option parameters
    - admin-address : admin address
    - output-type  : If it’s value is “json” , display the deployed address with json type, otherwise it display addresses with table.
    -

**examples**

> `npx hardhat l1-usdc-bridge-deploy --admin-address {adminAddress}`
>

> `npx hardhat --network localhost l1-usdc-bridge-deploy --output-type json`
>

```jsx
{
  L1UsdcBridge: '0x0EeCE51312246715193CEAA4E693F4734e893F70',
  L1UsdcBridgeProxy: '0xc63C3EA966E0E6a1F8C45f638D0447da06A9F287'
}
```

## Deploy L2 USDC and L2 USDC Bridge

Deploy using the **l2-usdc-and-bridge-deploy** hardhat task.

> `npx hardhat l2-usdc-and-bridge-deploy --service-name {serviceName} --l1-usdc-address {L1 usdc address} --l1-usdc-bridge-address {L1 usdc bridge address} —l2-usdc-admin  {usdc admin} —l2-usdc-minter-admin {master minter admin} —l2-usdt-proxy-admin  {usdc proxy admin}`
>
- Required parameters
    - service-name : service name (ex) tokamak network
    - l1-usdc-address : L1 usdc address
    - l1-usdc-bridge-address : L1 usdc bridge address for this L2 usdc bridge
    - l2-usdc-admin : L2 USDC admin address
    - l2-usdc-minter-admin : L2 MasterMinter admin
    - l2-usdt-proxy-admin : L2 USDC Proxy admin
- Option parameters
    - output-type  : If it’s value is “json” , display the deployed address with json type, otherwise it display addresses with table.

<aside>
💡 ***notice :***

l2UsdcAdmin must be different from deployer.

l2UsdcAdmin must be different from l2UsdcProxyAdmin.

If you input the service name, TOKEN_NAME will be set with "Bridged USDC (Service Name)".

```jsx
TOKEN_NAME: "Bridged USDC (Tokamak Network)",
TOKEN_SYMBOL: "USDC.e",
TOKEN_CURRENCY: "USD",
TOKEN_DECIMALS: 6,
```

</aside>

<aside>
💡 ***additional task:***

 transfer admin of USDC proxy using FiatTokenProxy.changeAdmin (l2UsdcProxyAdmin )

</aside>

**example**

l2UsdcAdmin must be different from deployer.

> `npx hardhat --network localhost l2-usdc-and-bridge-deploy --service-name 'new titna' --l1-usdc-address 0x693a591A27750eED2A0e14BC73bB1F313116a1cb --l1-usdc-bridge-address 0xc63C3EA966E0E6a1F8C45f638D0447da06A9F287 --l2-usdc-admin  0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 --l2-usdc-minter-admin 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 --l2-usdc-proxy-admin 0x70997970C51812dc3A010C7d01b50e0d17dc79C8`
>
>


**example**

l2UsdcAdmin must be different from l2UsdcProxyAdmin.

> `npx hardhat --network localhost l2-usdc-and-bridge-deploy --service-name 'new titna' --l1-usdc-address 0x693a591A27750eED2A0e14BC73bB1F313116a1cb --l1-usdc-bridge-address 0xc63C3EA966E0E6a1F8C45f638D0447da06A9F287 --l2-usdc-admin  0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 --l2-usdc-minter-admin 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 --l2-usdc-proxy-admin 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`
>
>

**example**

> `npx hardhat --network localhost l2-usdc-and-bridge-deploy --service-name 'new titna' --l1-usdc-address 0x693a591A27750eED2A0e14BC73bB1F313116a1cb --l1-usdc-bridge-address 0xc63C3EA966E0E6a1F8C45f638D0447da06A9F287 --l2-usdc-admin  0x70997970C51812dc3A010C7d01b50e0d17dc79C8 --l2-usdc-minter-admin 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC --l2-usdc-proxy-admin 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC --output-type json`
>
>


**example**

> `npx hardhat --network localhost l2-usdc-and-bridge-deploy --service-name 'new titna' --l1-usdc-address 0x693a591A27750eED2A0e14BC73bB1F313116a1cb --l1-usdc-bridge-address 0xc63C3EA966E0E6a1F8C45f638D0447da06A9F287 --l2-usdc-admin  0x70997970C51812dc3A010C7d01b50e0d17dc79C8 --l2-usdc-minter-admin 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC --l2-usdc-proxy-admin 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC `
>
>
> ```jsx
> deploy L2 Bridge ..
> deploy Bridged USDC ..
> set L2 Bridge ..
> MasterMinter configureController ..
> MasterMinter transferOwnership ..
> ┌───────────────────┬────────────────────────────────────────────┐
> │ Contract          │ Address                                    │
> ├───────────────────┼────────────────────────────────────────────┤
> │ SignatureChecker  │ 0xc6e7DF5E7b4f2A278906862b61205850344D4e7d │
> ├───────────────────┼────────────────────────────────────────────┤
> │ FiatTokenV2_2     │ 0x59b670e9fA9D0A427751Af201D676719a970857b │
> ├───────────────────┼────────────────────────────────────────────┤
> │ FiatTokenProxy    │ 0x7a2088a1bFc9d81c55368AE168C2C02570cB814F │
> ├───────────────────┼────────────────────────────────────────────┤
> │ MasterMinter      │ 0x09635F643e140090A9A8Dcd712eD6285858ceBef │
> ├───────────────────┼────────────────────────────────────────────┤
> │ L2UsdcBridge      │ 0x68B1D87F95878fE05B998F19b66F4baba5De1aed │
> ├───────────────────┼────────────────────────────────────────────┤
> │ L2UsdcBridgeProxy │ 0x3Aa5ebB10DC797CAC828524e59A333d0A371443c │
> └───────────────────┴────────────────────────────────────────────┘
> ```
>

## Set L1 USDC Bridge  with L2 USDC

Deploy using the **l1-usdc-bridge-set** hardhat task.

> `npx hardhat l1-usdc-bridge-set --l1-cross-domain-messenger {l1-cross-domain-messenger Address}  --l1-usdc-address {L1 usdc address} --l2-usdc-address {L2 usdc address} --l1-usdc-bridge-address {L1 usdc bridge address} --l2-usdc-bridge-address {L2 usdc bridge address}`
>

- Required parameters
    - l1-cross-domain-messenger : admin address
    - l1-usdc-address : L1 usdc address
    - l2-usdc-address : L1 usdc address
    - l1-usdc-bridge-address : L1 usdc bridge address
    - l2-usdc-bridge-address : L1 usdc bridge address


**example**

> `npx hardhat --network localhost l1-usdc-bridge-set --l1-cross-domain-messenger 0xa94B847AAc9F00f10dA2F5c476408Fd5477D7d49 --l1-usdc-address 0x693a591A27750eED2A0e14BC73bB1F313116a1cb --l2-usdc-address 0x90B87CEa589C66E0A271BD5355C3585047724b97 --l1-usdc-bridge-address 0xc63C3EA966E0E6a1F8C45f638D0447da06A9F287 --l2-usdc-bridge-address 0xD1B6bc625487672a7AA04531c96fF1535c480d89`
>
>