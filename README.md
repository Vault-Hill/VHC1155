# VHC1155 Contract

This project contains a contract that follows the ERC1155 token standard. It also
includes contracts that are inherited by the VHC1155.sol contract which allow for
token royalties to be set (see https://eips.ethereum.org/EIPS/eip-2981). The EIP
has been extended to allow for royalties to be set on a per token basis, allowing
different minted tokens to have unique royalties associated with them.

# Testing

To test the contract, a local hardhat node should be spun up, and the contract should
then be deployed to this local node. This will generate the relevant typechain folder
required to run the unit tests.

To run the tests, use the following commands:

```
npx hardhat node
npm run deploy:local
npm run test
```

# Etherscan verification

To try out Etherscan verification, you first need to deploy a contract to an Ethereum network that's supported by Etherscan, such as Ropsten.

In this project, copy the .env.example file to a file named .env, and then edit it to fill in the details. Enter your Etherscan API key, your Ropsten node URL (eg from Alchemy), and the private key of the account which will send the deployment transaction. With a valid .env file in place, first deploy your contract:

```shell
hardhat run --network ropsten scripts/deploy.ts
```

Then, copy the deployment address and paste it in to replace `DEPLOYED_CONTRACT_ADDRESS` in this command:

```shell
npx hardhat verify --network ropsten DEPLOYED_CONTRACT_ADDRESS "Hello, Hardhat!"
```

# Performance optimizations

For faster runs of your tests and scripts, consider skipping ts-node's type checking by setting the environment variable `TS_NODE_TRANSPILE_ONLY` to `1` in hardhat's environment. For more details see [the documentation](https://hardhat.org/guides/typescript.html#performance-optimizations).
