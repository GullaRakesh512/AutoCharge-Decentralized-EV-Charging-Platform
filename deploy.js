// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that,
// Hardhat will compile your contracts, add the Hardhat Runtime Environment's
// members to the global scope, and execute the script.
const hre = require("hardhat");

async function main() {
  // This line gets the contract factory for "AutoCharge".
  // A ContractFactory in ethers.js is an abstraction used to deploy new smart contracts.
  const autoCharge = await hre.ethers.getContractFactory("AutoCharge");

  // This line deploys the contract. It sends a transaction to the network.
  const deployedContract = await autoCharge.deploy();

  // We wait for the deployment to be fully confirmed on the blockchain.
  await deployedContract.waitForDeployment();

  // Print the address of the newly deployed contract.
  console.log(
    `AutoCharge contract deployed to: ${deployedContract.target}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});