"use client";

// import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--toast-action-background-color": "#ddd759",
          "--toast-action-color": "#1c1b22",
          "--toast-button-background": "#ddd759",
          "--toast-button-color": "#1c1b22",
        } as React.CSSProperties
      }
      toastOptions={{
        actionButtonStyle: {
          backgroundColor: "#b7e3c8",
          color: "#1c1b22",
          border: "none",
          borderRadius: "6px",
          fontWeight: "500",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
