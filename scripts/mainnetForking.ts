import { ethers } from "hardhat";

const uniswapRouter = "0x1f98407aaB862CdDeF78Ed252D6f557aA5b0f00d";
const _tokenA = "0x6f40d4A6237C257fff2dB00FA0510DeEECd303eb"; // FLUID
const _tokenB = "0x6123B0049F904d730dB3C36a31167D9d4121fA6B"; // Ribbon

const liquidityProvider = "0x1b5CaA1d3A1582a438e4cd93EE7A7e0e4d5624fB";
const _amount = ethers.parseUnits("1000", 6); // ✅ Fixed

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(`Deploying contracts with account: ${deployer.address}`);

  const LiquidityAdder = await ethers.getContractFactory("LiquidityAdder");
  const liquidityAdder = await LiquidityAdder.deploy(uniswapRouter);
  await liquidityAdder.waitForDeployment();
  console.log(`LiquidityAdder deployed at: ${liquidityAdder.target}`);

  await ethers.provider.send("hardhat_impersonateAccount", [liquidityProvider]);
  const whaleSigner = await ethers.getSigner(liquidityProvider);

  const tokenA = await ethers.getContractAt("IERC20", _tokenA);
  const tokenB = await ethers.getContractAt("IERC20", _tokenB);

  await tokenA.connect(whaleSigner).transfer(deployer.address, _amount);
  await tokenB.connect(whaleSigner).transfer(deployer.address, _amount);
  console.log("Test tokens transferred!");

  await tokenA.connect(deployer).approve(liquidityAdder.target, _amount);
  await tokenB.connect(deployer).approve(liquidityAdder.target, _amount);

  const tx = await liquidityAdder.addLiquidity(
    tokenA.target,
    tokenB.target,
    500,
    _amount,
    _amount,
    -887220,
    887220
  );
  await tx.wait();

  console.log("Liquidity added successfully!");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
