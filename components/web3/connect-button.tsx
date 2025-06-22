"use client";
import { cn } from "@/utils/css";
import { useCallback, useMemo } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { Button, ButtonProps } from "../ui/button";

export const ConnectButton = () => {
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const account = useAccount();

  const handleClick = useCallback(() => {
    if (account.status === "connected") {
      disconnect();
    } else {
      connect({ connector: connectors[0] });
    }
  }, [account.status, connectors, connect, disconnect]);

  const commonProps = useMemo(
    (): ButtonProps => ({
      className: "ml-auto",
      onClick: () => handleClick(),
      children: account.status === "connected" ? "Disconnect" : "Connect",
    }),
    [account.status, handleClick]
  );

  return (
    <>
      <Button
        size="lg"
        {...commonProps}
        className={cn("max-sm:hidden", commonProps.className)}
      />
      <Button
        size="sm"
        {...commonProps}
        className={cn("sm:hidden", commonProps.className)}
      />
    </>
  );
};
