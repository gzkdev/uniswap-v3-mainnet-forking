import { ethers } from "hardhat";
import { Contract } from "ethers";
import { abi as IUniswapV3PoolABI } from "@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json";
import { abi as INonfungiblePositionManagerABI } from "@uniswap/v3-periphery/artifacts/contracts/interfaces/INonfungiblePositionManager.sol/INonfungiblePositionManager.json";
import dotenv from "dotenv";

dotenv.config();

const NONFUNGIBLE_POSITION_MANAGER =
  "0xC36442b4a4522E871399CD717aBDD847Ab11FE88";
const UNISWAP_POOL_ADDRESS = "0x8ad599c3a0ff1de082011efddc58f1908eb6e6d8"; // Example: USDC/ETH pool

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log(`Using account: ${deployer.address}`);

  const pool = new Contract(UNISWAP_POOL_ADDRESS, IUniswapV3PoolABI, deployer);
  const positionManager = new Contract(
    NONFUNGIBLE_POSITION_MANAGER,
    INonfungiblePositionManagerABI,
    deployer
  );

  // Token addresses for USDC and WETH
  const token0 = await pool.token0();
  const token1 = await pool.token1();
  const fee = await pool.fee();

  console.log(`Adding liquidity to pool: ${token0} - ${token1}`);

  // Approve tokens for spending
  const token0Contract = await ethers.getContractAt("IERC20", token0, deployer);
  const token1Contract = await ethers.getContractAt("IERC20", token1, deployer);

  await token0Contract.approve(
    NONFUNGIBLE_POSITION_MANAGER,
    ethers.parseUnits("1000", 6)
  ); // Approve USDC
  await token1Contract.approve(
    NONFUNGIBLE_POSITION_MANAGER,
    ethers.parseEther("1")
  ); // Approve WETH

  // Define price range
  const tickLower = -887220;
  const tickUpper = 887220;

  // Add liquidity
  const tx = await positionManager.mint({
    token0,
    token1,
    fee,
    tickLower,
    tickUpper,
    amount0Desired: ethers.parseUnits("1000", 6),
    amount1Desired: ethers.parseEther("1"),
    amount0Min: 0,
    amount1Min: 0,
    recipient: deployer.address,
    deadline: Math.floor(Date.now() / 1000) + 60 * 10,
  });

  await tx.wait();

  console.log("Liquidity added successfully!");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
