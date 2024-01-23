# @tokamak-network/tokamak-usdc-deploy

Deploy the USDC and USDC bridge contracts for L2

## Installation

```sh
$ npm install @tokamak-network/tokamak-usdc-deploy
```

Import the plugin in your `hardhat.config.js`:

```js
require("@tokamak-network/tokamak-usdc-deploy");
```

Or if you are using TypeScript, in your `hardhat.config.ts`:

```ts
import "@tokamak-network/tokamak-usdc-deploy";
```

Now, run `npm run hardhat` and you should see:

```
AVAILABLE TASKS:

  check      	        Check whatever you need
  ...
  l1-usdc-bridge-deploy	Deploy the usdc bridge of L1
  ...
  test          	    Runs mocha tests
```

To deploy the L1 usdc bridge contracts:

```sh
$ npm run hardhat l1-usdc-bridge-deploy
```

And you're done. Time to build something great.

## Plugin Development

TODO
