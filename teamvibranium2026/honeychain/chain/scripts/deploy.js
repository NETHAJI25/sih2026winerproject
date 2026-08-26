const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(`Deploying HoneyChain with account: ${deployer.address}`);

  const HoneyChain = await ethers.getContractFactory("HoneyChain");
  const honeychain = await HoneyChain.deploy();
  await honeychain.waitForDeployment();

  const address = await honeychain.getAddress();
  console.log(`HoneyChain deployed to: ${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
