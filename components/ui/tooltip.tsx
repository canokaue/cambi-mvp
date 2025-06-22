"use client";

import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "@/utils/css";

const TooltipProvider = TooltipPrimitive.Provider;

const Tooltip = TooltipPrimitive.Root;

const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = ({
  className,
  children,
  side = "top",
  ...props
}: {
  className?: string;
  children: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  [key: string]: any;
}) => (
  <TooltipPrimitive.Content
    side={side}
    sideOffset={4}
    className={cn(
      "z-50 overflow-hidden rounded-md bg-popover border px-3 py-1.5 text-xs text-popover-foreground shadow-md",
      className
    )}
    {...props}
  >
    {children}
  </TooltipPrimitive.Content>
);

TooltipContent.displayName = "TooltipContent";

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
