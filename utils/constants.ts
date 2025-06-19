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
  "0xdc42AC5e79423242342B3cE83344cd81Ba43A51D";
export const PositionManagerAddress =
  "0x3F9e6Fe82D83A41712C855eFA18367412d1a6d52";
export const OracleInterfaceAddress =
  "0x27E7F27b7882C82dB396b5042f7E7665c1957054";
export const LENSAddress = "0x7fd72cce53eceb612683ee56059f6517d322e6dd";

export const USDCAddress = "0x0eb400A78954c2503961890a56B6A460D69e417d";
export const WETHAddress = "0x37B7e6F4c89846E30dF2D7ae9D51Fe22a79e3420";
export const WBTCAddress = "0xc24F57bF0FF87283e30634a2Ff7b44c6A5a67d13";

export const assetsImages: Record<string, string> = {
  CUSD: "/assets/cmUSD.svg",
  CBRL: "/assets/cmBRL.svg",
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