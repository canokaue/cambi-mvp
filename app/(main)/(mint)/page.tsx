"use client";
import { wagmiConfig } from "@/app/wagmiConfig";
import { DecimalInput } from "@/components/DecimalInput";
import { CustomConnectButton } from "@/components/layout/connect-button";
import { Header } from "@/components/layout/header";
import { TokenSelector } from "@/components/TokenSelector";
import { Button, ButtonProps } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import * as constants from "@/utils/constants";
import { cn } from "@/utils/css";
import { parseBigInt } from "@/utils/web3";
import { PositionDetails, SyntheticAssetInfo } from "@/utils/web3/interfaces";
import { readContract, waitForTransactionReceipt } from "@wagmi/core";
import useDebouncedCallback from "beautiful-react-hooks/useDebouncedCallback";
import {
  BanknoteArrowDown,
  BanknoteArrowUp,
  BanknoteX,
  ChevronDown,
  EllipsisVertical,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  useAccount,
  useReadContract,
  useReadContracts,
  useWriteContract,
} from "wagmi";
import { assetsImages } from "../../../utils/constants";
import { ClosePositionDialog } from "./dialogs/close-position";
import { DepositDialog } from "./dialogs/deposit";
import { sendTxSentToast, sendTxSuccessToast } from "./dialogs/toasts";
import { WithdrawalDialog } from "./dialogs/withdrawal";
import { BackgroundDecorations } from "@/components/BackgroundDecorations";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const TokenSelectorButton = ({
  selectedSymbol,
  className,
  ...props
}: {
  selectedSymbol?: string;
} & ButtonProps) => {
  return (
    <Button {...props} className={cn("h-full group w-32 relative", className)}>
      {!!selectedSymbol ? (
        <>
          <span className="group-hover:block group-focus-visible:block hidden">
            Change Token
          </span>
          <span className="group-hover:hidden group-focus-visible:hidden flex items-center gap-2">
            <Image
              src={assetsImages[selectedSymbol]}
              alt={`${selectedSymbol} Icon`}
              className="rounded-full border-2 border-neutral-700"
              width={16}
              height={16}
            />
            <span className="leading-none">{selectedSymbol}</span>
            <ChevronDown className="size-3" />
          </span>
        </>
      ) : (
        <span>Select Token</span>
      )}
    </Button>
  );
};

const collateralAssets: SyntheticAssetInfo[] = [
  {
    tokenAddress: constants.WBTCAddress,
    name: "Bitcoin",
    symbol: "WBTC",
    isActive: true,
    decimals: 8,
  },
  {
    tokenAddress: constants.WETHAddress,
    name: "Wrapped Ether",
    symbol: "WETH",
    decimals: 18,
    isActive: true,
  },
  {
    tokenAddress: constants.USDCAddress,
    name: "USDC",
    symbol: "USDC",
    isActive: true,
    decimals: 6,
  },
];

const USDCContract = {
  address: constants.USDCAddress,
  abi: constants.ERC20ABI,
} as const;
const WETHContract = {
  address: constants.WETHAddress,
  abi: constants.ERC20ABI,
} as const;
const WBTCContract = {
  address: constants.WBTCAddress,
  abi: constants.ERC20ABI,
} as const;
const lensContract = {
  address: constants.LENSAddress,
  abi: constants.LeprechaunLensABI,
} as const;
const factoryContract = {
  address: constants.LeprechaunFactoryAddress,
  abi: constants.LeprechaunFactoryABI,
} as const;

function getDecimalsPerCollateralSymbol(symbol: string): number {
  switch (symbol) {
    case "USDC":
      return 6;
    case "WETH":
      return 18;
    case "WBTC":
      return 8;
    default:
      return 0;
  }
}

function getInputDecimalsPerCollateralSymbol(
  symbol: string | undefined
): number {
  switch (symbol) {
    case "USDC":
      return 2;
    case "WETH":
      return 4;
    case "WBTC":
      return 8;
    default:
      return 2;
  }
}

export default function Home() {
  const form = useForm();
  const account = useAccount();
  const positionManagerAddress = constants.PositionManagerAddress;

  const syntheticAssetsContract = useReadContract({
    ...lensContract,
    functionName: "getAllSyntheticAssets",
  });

  const openPositionsContractCall = useReadContract({
    ...lensContract,
    functionName: "getUserPositions",
    args: [account.address],
    query: {
      enabled: !!account.address,
    },
  });

  const allowanceAndBalanceContract = useReadContracts({
    contracts: [
      {
        ...USDCContract,
        functionName: "balanceOf",
        args: [account.address],
      },
      {
        ...WETHContract,
        functionName: "balanceOf",
        args: [account.address],
      },
      {
        ...WBTCContract,
        functionName: "balanceOf",
        args: [account.address],
      },
      {
        ...USDCContract,
        functionName: "allowance",
        args: [account.address, positionManagerAddress],
      },
      {
        ...WETHContract,
        functionName: "allowance",
        args: [account.address, positionManagerAddress],
      },
      {
        ...WBTCContract,
        functionName: "allowance",
        args: [account.address, positionManagerAddress],
      },
    ],
    query: {
      enabled: !!account.address,
    },
  });
  const [
    USDCBalance,
    WETHBalance,
    WBTCBalance,
    USDCAllowance,
    WETHAllowance,
    WBTCAllowance,
  ] = allowanceAndBalanceContract.data || [];

  const formattedAssets = useMemo(() => {
    if (
      !syntheticAssetsContract.data ||
      (syntheticAssetsContract.data as SyntheticAssetInfo[]).length === 0
    )
      return [];

    return (syntheticAssetsContract.data as SyntheticAssetInfo[]).map(
      (item: SyntheticAssetInfo) => ({
        tokenAddress: item.tokenAddress,
        name: item.name,
        symbol: item.symbol,
        minCollateralRatio: item.minCollateralRatio,
        auctionDiscount: item.auctionDiscount,
        isActive: item.isActive,
      })
    );
  }, [syntheticAssetsContract.data]);

  const collateralAssetsWithBalance = useMemo(() => {
    if (
      USDCBalance?.status !== "success" ||
      WBTCBalance?.status !== "success" ||
      WETHBalance?.status !== "success"
    ) {
      return collateralAssets;
    }

    const tempArray = [WBTCBalance, WETHBalance, USDCBalance];
    return collateralAssets.map((col, i) => ({
      ...col,
      balance: tempArray[i].result as bigint,
    }));
  }, [USDCBalance, WBTCBalance, WETHBalance]);

  const [mintTokenSelectorOpen, setMintTokenSelectorOpen] = useState(false);
  const [collateralTokenSelectorOpen, setCollateralTokenSelectorOpen] =
    useState(false);

  const [openDialog, setOpenDialog] = useState<
    "deposit" | "withdrawal" | "close-position" | null
  >(null);

  const [selectedPosition, setSelectedPosition] = useState<
    PositionDetails | undefined
  >(undefined);
  const { writeContractAsync } = useWriteContract({
    mutation: {
      onError(error) {
        console.error("❌ Error on tx:", error);
        toast.error("Transaction failed! Please try again");
      },
    },
  });

  const [pricedPositions, setPricedPositions] = useState<
    PositionDetails[] | null
  >(null);

  useEffect(() => {
    if (openPositionsContractCall.status === "success") {
      const fetchPrices = async () => {
        const pPositions: PositionDetails[] = [];
        const positions = openPositionsContractCall.data as PositionDetails[];

        const pricePromises = positions.map((position) =>
          readContract(wagmiConfig, {
            abi: constants.OracleInterfaceABI,
            address: constants.OracleInterfaceAddress,
            functionName: "getNormalizedPrice",
            args: [position.syntheticAsset],
          })
        );

        const prices = await Promise.all(pricePromises);

        for (let i = 0; i < positions.length; i++) {
          pPositions.push({
            ...positions[i],
            mintedCurrentUsdValue: (prices[i] as bigint[])[0],
          });
        }

        setPricedPositions(pPositions);
      };

      fetchPrices();
    }
  }, [openPositionsContractCall.status, openPositionsContractCall.data]);

  const collateralWatched = form.watch("collateral") as SyntheticAssetInfo;
  const collateralAmountWatched = form.watch("collateralAmount") as number;
  const mintWatched = form.watch("mint") as SyntheticAssetInfo;
  const collateralRatioWatched = form.watch("collateralRatio") as number;

  const getMinCollateralRatioContract = useReadContract({
    ...factoryContract,
    functionName: "getEffectiveCollateralRatio",
    args: [mintWatched?.tokenAddress, collateralWatched?.tokenAddress],
    query: {
      enabled:
        !!account.address &&
        !!mintWatched?.tokenAddress &&
        !!collateralWatched?.tokenAddress,
    },
  });

  const minCollateralRatio = useMemo(() => {
    const result = getMinCollateralRatioContract.data as bigint;
    const minCollateralRatio = result ? Number(result) / 100 : 115;

    const currentCollateralRatio = form.getValues().collateralRatio;

    if (currentCollateralRatio < minCollateralRatio) {
      form.setValue("collateralRatio", minCollateralRatio);
    }

    return minCollateralRatio;
  }, [form, getMinCollateralRatioContract.data]);

  const cleanCollateralAmount = useMemo(() => {
    if (!collateralWatched || collateralAmountWatched == null) return null;

    const decimals = collateralWatched.decimals || 0;
    const value = BigInt(
      Math.floor(Number(collateralAmountWatched) * 10 ** decimals)
    );

    return value;
  }, [collateralWatched, collateralAmountWatched]);

  const allowance = useMemo<bigint | null>(() => {
    if (!collateralWatched) return null;

    let _allowance;

    switch (collateralWatched.symbol) {
      case "USDC":
        _allowance = USDCAllowance;
        break;
      case "WETH":
        _allowance = WETHAllowance;
        break;
      case "WBTC":
        _allowance = WBTCAllowance;
        break;

      default:
        break;
    }

    const result = _allowance?.result as number | undefined;
    if (!result) return null;

    return BigInt(result);
  }, [collateralWatched, USDCAllowance, WBTCAllowance, WETHAllowance]);

  const handleSubmitMint = form.handleSubmit(async (data) => {
    if ((allowance || 0) < cleanCollateralAmount!) {
      const abi = constants.ERC20ABI;
      // approveTokens
      const approvalTxHash = await writeContractAsync({
        abi,
        address: data.collateral.tokenAddress,
        functionName: "approve",
        args: [
          positionManagerAddress,
          BigInt(
            "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
          ),
        ],
      });

      sendTxSentToast(approvalTxHash);

      const approvalConfirmationTxHash = await waitForTransactionReceipt(
        wagmiConfig,
        {
          hash: approvalTxHash,
          confirmations: 3,
        }
      );

      sendTxSuccessToast(approvalConfirmationTxHash.transactionHash);
    } else {
      const abi = constants.PositionManagerABI;

      const createPositionTxHash = await writeContractAsync({
        abi,
        address: positionManagerAddress,
        functionName: "createPosition",
        args: [
          data.mint.tokenAddress,
          data.collateral.tokenAddress,
          BigInt(
            Math.floor(data.collateralAmount * 10 ** data.collateral.decimals)
          ),
          BigInt(Math.floor(data.mintAmount * 10 ** 18)),
        ],
      });

      sendTxSentToast(createPositionTxHash);

      await waitForTransactionReceipt(wagmiConfig, {
        hash: createPositionTxHash,
        confirmations: 3,
      });

      // const poolHash = constants.getUniswapPoolHash(data.mint.symbol)
      //
      toast.success("Transaction confirmed.");

      await openPositionsContractCall.refetch();
      form.reset();
    }

    await allowanceAndBalanceContract.refetch();
  });

  async function mintMockCollateral(mock: "USDC" | "WETH" | "WBTC") {
    const abi = constants.SyntheticAssetABI;

    let contractAddress: `0x${string}` | null = null;
    let amount = BigInt(0);

    switch (mock) {
      case "WBTC":
        contractAddress = constants.WBTCAddress;
        amount = BigInt(1) * BigInt(10 ** 8);
        break;
      case "WETH":
        contractAddress = constants.WETHAddress;
        amount = BigInt(50) * BigInt(10 ** 18);
        break;
      case "USDC":
        contractAddress = constants.USDCAddress;
        amount = BigInt(100_000) * BigInt(10 ** 6);
        break;

      default:
        break;
    }

    if (!contractAddress) return;

    const mintCollateralPromise = async () => {
      const txHash = await writeContractAsync({
        abi,
        address: contractAddress,
        functionName: "mint",
        args: [account.address, amount],
      });

      await waitForTransactionReceipt(wagmiConfig, {
        hash: txHash,
        confirmations: 3,
      });

      return allowanceAndBalanceContract.refetch();
    };

    toast.promise(mintCollateralPromise(), {
      loading: `Adding ${mock} to your wallet...`,
      success: () => `Added ${mock} to your wallet!`,
      error: `Failed to add ${mock} to your wallet.`,
    });
  }

  const handleUpdateMintedAmount = useDebouncedCallback(
    async ({
      collateral,
      collateralAmount,
      mint,
      collateralRatio,
    }: {
      collateral: SyntheticAssetInfo;
      collateralAmount: number;
      mint: SyntheticAssetInfo;
      collateralRatio: number;
    }) => {
      try {
        const abi = constants.LeprechaunLensABI;
        const address = constants.LENSAddress;
        const asset = collateralAssetsWithBalance.find(
          (collateralAsset) => collateralAsset.symbol === collateral?.symbol
        );

        const inputAmount = BigInt(
          Math.floor(
            Number(collateralAmount) * 10 ** (asset?.decimals as number)
          )
        );

        const res = await readContract(wagmiConfig, {
          abi,
          address: address,
          functionName: "calculateMintAmountForTargetRatio",
          args: [
            mint.tokenAddress,
            collateral.tokenAddress,
            inputAmount,
            collateralRatio * 100,
          ],
        });

        const [mintAmount] = res as bigint[];

        // we assuming the decimals here
        const newAmount = Number(mintAmount) / 10 ** 18;

        form.setValue("mintAmount", newAmount, {
          shouldValidate: true,
        });
      } finally {
        setLoadingMintedAmount(false);
      }
    },
    [],
    800
  );

  const [loadingMintedAmount, setLoadingMintedAmount] = useState(false);

  useEffect(() => {
    if (
      collateralWatched &&
      collateralAmountWatched &&
      mintWatched &&
      collateralRatioWatched
    ) {
      setLoadingMintedAmount(true);
      handleUpdateMintedAmount({
        collateral: collateralWatched,
        collateralAmount: collateralAmountWatched,
        mint: mintWatched,
        collateralRatio: collateralRatioWatched,
      });
    } else {
      form.setValue("mintAmount", undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    collateralWatched,
    collateralAmountWatched,
    mintWatched,
    collateralRatioWatched,
    handleUpdateMintedAmount,
  ]);

  const selectedPositionCollateral = useMemo(() => {
    return collateralAssetsWithBalance.find(
      (it) => it.symbol === selectedPosition?.collateralSymbol
    );
  }, [collateralAssetsWithBalance, selectedPosition]);

  const selectedPositionAllowance = useMemo(() => {
    if (!selectedPositionCollateral) return null;

    let _allowance;

    switch (selectedPositionCollateral.symbol) {
      case "USDC":
        _allowance = USDCAllowance;
        break;
      case "WETH":
        _allowance = WETHAllowance;
        break;
      case "WBTC":
        _allowance = WBTCAllowance;
        break;

      default:
        break;
    }

    const result = _allowance?.result as number | undefined;
    if (!result) return null;

    return BigInt(result);
  }, [selectedPosition, USDCAllowance, WETHAllowance, WBTCAllowance]);

  const lockPeriodWatched = form.watch("lockPeriod") as number;

  // Mock APY calculation based on lock period
  const targetAPY = useMemo(() => {
    switch (lockPeriodWatched) {
      case 3:
        return 8.0;
      case 6:
        return 10.0;
      case 12:
        return 11.0;
      case 18:
        return 12.0;
      default:
        return 8.0;
    }
  }, [lockPeriodWatched]);

  return (
    <div className="flex flex-col min-h-screen w-full relative z-10">
      <BackgroundDecorations />
      <TooltipProvider>
        <DepositDialog
          position={selectedPosition}
          collateral={selectedPositionCollateral}
          allowance={selectedPositionAllowance}
          onSuccess={() => {
            // Refresh user positions
            openPositionsContractCall.refetch();
            // Refresh allowances and balances
            allowanceAndBalanceContract.refetch();
          }}
          open={openDialog === "deposit"}
          onOpenChange={(v) =>
            v ? setOpenDialog("deposit") : setOpenDialog(null)
          }
        />
        <WithdrawalDialog
          position={selectedPosition}
          collateral={selectedPositionCollateral}
          allowance={selectedPositionAllowance}
          onSuccess={() => {
            // Refresh user positions
            openPositionsContractCall.refetch();
            // Refresh allowances and balances
            allowanceAndBalanceContract.refetch();
          }}
          open={openDialog === "withdrawal"}
          onOpenChange={(v) =>
            v ? setOpenDialog("withdrawal") : setOpenDialog(null)
          }
        />
        <ClosePositionDialog
          position={selectedPosition}
          collateral={selectedPositionCollateral}
          onSuccess={() => {
            // Refresh user positions
            openPositionsContractCall.refetch();
            // Refresh allowances and balances
            allowanceAndBalanceContract.refetch();
          }}
          open={openDialog === "close-position"}
          onOpenChange={(v) =>
            v ? setOpenDialog("close-position") : setOpenDialog(null)
          }
        />

        <Header activeRoute="mint" />
        <main className="flex flex-col gap-5 flex-1 items-center justify-center mb-8 sm:mb-[20vh] px-4 sm:px-6 py-4">
          <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Mint Mock Collateral</CardTitle>
              <CardDescription>
                Mint mock collateral to test the protocol.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant="default" // Change from "secondary" to "default"
                  disabled={account.status !== "connected"}
                  onClick={() => mintMockCollateral("USDC")}
                >
                  USDC
                </Button>

                <Button
                  variant="default" // Change from "secondary" to "default"
                  disabled={account.status !== "connected"}
                  onClick={() => mintMockCollateral("WETH")}
                >
                  WETH
                </Button>

                <Button
                  variant="default" // Change from "secondary" to "default"
                  disabled={account.status !== "connected"}
                  onClick={() => mintMockCollateral("WBTC")}
                >
                  WBTC
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="w-full max-w-2xl mx-auto">
            <Form {...form}>
              <CardHeader>
                <CardTitle>Mint</CardTitle>
                <CardDescription>
                  Enter the amount of collateral and minted tokens.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4 **:data-[slot=input]:text-lg">
                  <FormField
                    control={form.control}
                    name="collateralAmount"
                    rules={{
                      required: "Amount is required",
                      validate: {
                        isNumber: (value) => {
                          return (
                            typeof value === "number" ||
                            "Amount must be a number"
                          );
                        },
                        isPositive: (value) => {
                          return value > 0 || "Amount must be greater than 0";
                        },
                        withinBalance: (value) => {
                          const collateral = form.getValues().collateral;

                          const asset = collateralAssetsWithBalance.find(
                            (collateralAsset) =>
                              collateralAsset.symbol === collateral?.symbol
                          );

                          const inputAmount = BigInt(
                            Math.floor(
                              Number(value) * 10 ** (asset?.decimals as number)
                            )
                          );
                          const assetBalance = asset?.balance as bigint;

                          return (
                            inputAmount <= assetBalance ||
                            "Amount must be within balance"
                          );
                        },
                      },
                    }}
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel className="flex items-center gap-2">
                          Collateral
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <button type="button">
                                  <Info className="size-4 text-muted-foreground cursor-help" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>
                                  The asset you deposit to back your synthetic
                                  tokens. This secures your position and can be
                                  withdrawn later.
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </FormLabel>
                        <div className="flex items-end gap-2">
                          <FormControl>
                            <DecimalInput
                              key={collateralWatched?.symbol}
                              className="h-14"
                              placeholder={`0.${"0".repeat(
                                getInputDecimalsPerCollateralSymbol(
                                  collateralWatched?.symbol
                                )
                              )}`}
                              digits={getInputDecimalsPerCollateralSymbol(
                                collateralWatched?.symbol
                              )}
                              {...field}
                              disabled={!collateralWatched}
                            />
                          </FormControl>

                          <FormField
                            name="collateral"
                            control={form.control}
                            rules={{
                              required: true,
                            }}
                            render={({ field }) => (
                              <Dialog
                                open={collateralTokenSelectorOpen}
                                onOpenChange={setCollateralTokenSelectorOpen}
                              >
                                <DialogTrigger asChild>
                                  <TokenSelectorButton
                                    disabled={account.status !== "connected"}
                                    className="h-14"
                                    selectedSymbol={field.value?.symbol}
                                  />
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogTitle>Token Selector</DialogTitle>
                                  <DialogDescription>
                                    Select the token you want to use as
                                    collateral.
                                  </DialogDescription>
                                  <TokenSelector
                                    tokens={collateralAssetsWithBalance}
                                    onSelect={(token) => {
                                      field.onChange(token);
                                      form.setValue(
                                        "collateralAmount",
                                        undefined
                                      );
                                      setCollateralTokenSelectorOpen(false);
                                    }}
                                  />
                                </DialogContent>
                              </Dialog>
                            )}
                          />
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="mintAmount"
                    rules={{
                      required: "Amount is required",
                      validate: {
                        isNumber: (value) => {
                          return (
                            typeof value === "number" ||
                            "Amount must be a number"
                          );
                        },
                        isPositive: (value) => {
                          return value > 0 || "Amount must be greater than 0";
                        },
                      },
                    }}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel className="flex items-center gap-2">
                          Minted
                          {loadingMintedAmount && (
                            <Loader2 className="animate-spin size-3" />
                          )}
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Info className="size-4 text-muted-foreground cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>
                                  The amount of synthetic tokens you'll receive.
                                  These tokens earn yield through daily
                                  rebasing.
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </FormLabel>
                        <div className="flex items-end gap-2">
                          <FormControl>
                            <Input
                              className="h-14"
                              {...field}
                              value={(field.value || 0).toLocaleString(
                                undefined,
                                {
                                  minimumFractionDigits: 2,
                                }
                              )}
                              disabled
                            />
                          </FormControl>
                          <FormField
                            name="mint"
                            control={form.control}
                            rules={{
                              required: true,
                            }}
                            render={({ field }) => (
                              <Dialog
                                open={mintTokenSelectorOpen}
                                onOpenChange={setMintTokenSelectorOpen}
                              >
                                <DialogTrigger asChild>
                                  <TokenSelectorButton
                                    disabled={account.status !== "connected"}
                                    className="h-14"
                                    selectedSymbol={field.value?.symbol}
                                  />
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogTitle>Token Selector</DialogTitle>
                                  <DialogDescription>
                                    Select the token you want to mint.
                                  </DialogDescription>
                                  <TokenSelector
                                    tokens={formattedAssets}
                                    onSelect={(token) => {
                                      field.onChange(token);
                                      setMintTokenSelectorOpen(false);
                                    }}
                                  />
                                </DialogContent>
                              </Dialog>
                            )}
                          />
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="collateralRatio"
                    defaultValue={115}
                    // rules={{
                    //   required: "Collateral Ratio is required",
                    //   min: {
                    //     value: 150,
                    //     message: "Collateral Ratio must be at least 150%",
                    //   },
                    //   max: {
                    //     value: 250,
                    //     message: "Collateral Ratio must be at most 250%",
                    //   },
                    // }}
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel className="mb-2 flex items-center gap-2">
                          Collateral Ratio ({collateralRatioWatched}%)
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Info className="size-4 text-muted-foreground cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>
                                  The percentage of collateral value compared to
                                  your debt. Higher ratios provide more safety
                                  against liquidation.
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </FormLabel>

                        <FormControl>
                          <Slider
                            min={minCollateralRatio}
                            max={250}
                            {...field}
                            value={[field.value]}
                            onValueChange={(value) => {
                              field.onChange(value[0]);
                            }}
                          />
                        </FormControl>
                        <span
                          className={cn(
                            "flex flex-row justify-between text-neutral-400",
                            {
                              "text-destructive": !!fieldState.error,
                            }
                          )}
                        >
                          <span>{minCollateralRatio}%</span>
                          <span>250%</span>
                        </span>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lockPeriod"
                    defaultValue={3}
                    rules={{
                      required: "Lock period is required",
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="mb-2 flex items-center gap-2">
                          <span className="sm:hidden">
                            Lock: {lockPeriodWatched}m
                          </span>
                          <span className="hidden sm:inline">
                            Lock Period ({lockPeriodWatched} months)
                          </span>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Info className="size-4 text-muted-foreground cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>
                                  How long your assets will be locked. Longer
                                  periods typically offer higher yields. You can
                                  withdraw after the lock period ends.
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </FormLabel>

                        <FormControl>
                          <Slider
                            min={3}
                            max={12}
                            step={3}
                            {...field}
                            value={[field.value]}
                            onValueChange={(value) => {
                              field.onChange(value[0]);
                            }}
                          />
                        </FormControl>
                        <span className="flex flex-row justify-between text-neutral-400">
                          <span className="sm:hidden">3m</span>
                          <span className="hidden sm:inline">3 months</span>

                          <span className="sm:hidden">6m</span>
                          <span className="hidden sm:inline">6 months</span>

                          <span className="sm:hidden">12m</span>
                          <span className="hidden sm:inline">12 months</span>

                          <span className="sm:hidden">18m</span>
                          <span className="hidden sm:inline">18 months</span>
                        </span>
                        <div className="text-sm text-muted-foreground text-center mt-1">
                          Target APY: {targetAPY}%
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex flex-col w-full mt-2">
                    <Button
                      disabled={
                        account.status !== "connected" ||
                        loadingMintedAmount ||
                        form.formState.isSubmitting
                      }
                      onClick={handleSubmitMint}
                    >
                      {form.formState.isSubmitting && (
                        <Loader2 className="animate-spin size-3" />
                      )}
                      <span>
                        {collateralWatched &&
                        allowance &&
                        cleanCollateralAmount &&
                        allowance >= cleanCollateralAmount
                          ? "Mint"
                          : "Approve"}
                      </span>
                    </Button>
                  </div>
                  <CardFooter></CardFooter>
                </div>
              </CardContent>
            </Form>
          </Card>

          <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Your Positions</CardTitle>
              <CardDescription>
                These are the positions you currently have for the connected
                wallet.
              </CardDescription>
            </CardHeader>

            <CardContent>
              {account.status === "connected" && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Asset</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Collateral</TableHead>
                      <TableHead>
                        Current Ratio
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="size-3 text-muted-foreground cursor-help inline ml-1" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>
                                Your position's health ratio. Lower ratios
                                increase liquidation risk.
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableHead>

                      <TableHead>
                        Liq. Ratio
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="size-3 text-muted-foreground cursor-help inline ml-1" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>
                                The minimum ratio required to avoid liquidation
                                of your position.
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pricedPositions ? (
                      pricedPositions
                        .filter((position) => position.isActive)
                        .map((position) => (
                          <TableRow key={position.positionId}>
                            <TableCell className="pr-8 sm:pr-2">
                              <div className="flex items-center gap-2">
                                <Image
                                  src={assetsImages[position.syntheticSymbol]}
                                  alt={`${position.syntheticSymbol} Icon`}
                                  className="rounded-full"
                                  width={16}
                                  height={16}
                                />
                                <span className="leading-none">
                                  {position.syntheticSymbol}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {parseBigInt(position.mintedAmount, 18, 3)}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Image
                                  src={
                                    assetsImages[
                                      position.collateralSymbol || ""
                                    ]
                                  }
                                  alt={`${position.collateralSymbol} Icon`}
                                  className="rounded-full"
                                  width={16}
                                  height={16}
                                />
                                {parseBigInt(
                                  position.collateralAmount,
                                  getDecimalsPerCollateralSymbol(
                                    position.collateralSymbol
                                  ),
                                  4
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              {parseBigInt(
                                position.currentRatio as bigint,
                                2,
                                2
                              )}
                              %
                            </TableCell>
                            <TableCell>
                              {parseBigInt(
                                position.requiredRatio as bigint,
                                2,
                                2
                              )}
                              %
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="px-1">
                                    <EllipsisVertical className="size-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedPosition(position);
                                      setOpenDialog("deposit");
                                    }}
                                  >
                                    <BanknoteArrowUp className="mr-2 size-4" />
                                    Deposit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      // Log the position data to confirm it exists
                                      console.log(
                                        "Position data for withdrawal:",
                                        position
                                      );

                                      setSelectedPosition(position);
                                      setOpenDialog("withdrawal");
                                    }}
                                  >
                                    <BanknoteArrowDown className="mr-2 size-4" />
                                    Withdraw
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      console.log(
                                        "Position data for close:",
                                        position
                                      );
                                      setSelectedPosition(position);
                                      setOpenDialog("close-position");
                                    }}
                                  >
                                    <BanknoteX className="mr-2 size-4" />
                                    Close Position
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                    ) : (
                      <TableRow>
                        <TableCell>No Positions</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
              {(account.status === "disconnected" ||
                account.status === "connecting") && (
                <p>
                  Connect your wallet to see your positions. If you don&apos;t
                  have a wallet, you can create one using MetaMask.
                </p>
              )}
            </CardContent>
            {(account.status === "disconnected" ||
              account.status === "connecting") && (
              <CardFooter>
                <CustomConnectButton className="w-full" />
              </CardFooter>
            )}
          </Card>
        </main>
      </TooltipProvider>
    </div>
  );
}
