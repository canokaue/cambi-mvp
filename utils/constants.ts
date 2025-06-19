// TODO make these wagmi contracts?
import { ERC20ABI } from "@/utils/abis/ERC20";
import { LeprechaunFactoryABI } from "@/utils/abis/LeprechaunFactory";
import { LeprechaunLensABI } from "@/utils/abis/LeprechaunLens";
import { OracleInterfaceABI } from "@/utils/abis/OracleInterface";
import { PositionManagerABI } from "@/utils/abis/PositionManager";
import { SyntheticAssetABI } from "@/utils/abis/SyntheticAsset";

export const rpcUrl =
  "https://base-mainnet.infura.io/v3/" + process.env.NEXT_PUBLIC_INFURA_KEY;


export const LeprechaunFactoryAddress =
  "0x59e41680eba8c90864D373efbAFD1d9dcC71DB2f";
export const PositionManagerAddress =
  "0x0aff82a808b2740FfaF37FaE5b16fd918fDb4405";
export const OracleInterfaceAddress =
  "0x2704347E129f4EDaE6E388217695a2c24fcB4441";
export const LENSAddress = "0xab3100F3FE310662Df9948444A87f1Dbb860e6d4";

export const USDCAddress = "0xe5331cf2438521D545Ba4184A490ddA0e5880fd4";
export const WETHAddress = "0xCb793Cd5f5e7a19e892478644209501C2959B68D";
export const WBTCAddress = "0x6BC47C35E5a9E96Bc1b4494212Dc2Eb669d2cD3d";

export const assetsImages: Record<string, string> = {
  cmUSD: "/assets/cmUSD.svg",
  cmBRL: "/assets/cmBRL.svg",
  sOIL: "/assets/oil.svg",
  WBTC: "https://s2.coinmarketcap.com/static/img/coins/64x64/1.png",
  WETH: "https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png",
  USDC: "https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png",
};

export {
  ERC20ABI,
  LeprechaunFactoryABI,
  LeprechaunLensABI,
  OracleInterfaceABI,
  PositionManagerABI,
  SyntheticAssetABI,
};

// export function getUniswapPoolHash(sAssetSymbol: string): string {
//   switch (sAssetSymbol) {
//     case "sDOW":
//       return "0x35fe68d317f15c3db528192cf0e71eff2265babaaaee23d7192b98703729bd89";

//     case "sXAU":
//       return "0x4a880171e7bfbee7a8f390ac3fe36245baecc1b7064e399ad042c5e85a010651";

//     case "sOIL":
//       return "0xfb6d04fbc133f88ee966239857c3b9f1c005a5aba87497dad853d175bc819451";

//     default:
//       return "";
//   }
// }

export const EXPLORER_URL = "https://basescan.org/"