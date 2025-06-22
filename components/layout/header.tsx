import { cn } from "@/utils/css";
import Image from "next/image";
import Link from "next/link";
import { CustomConnectButton } from "./connect-button";

const routes = {
  mint: {
    href: "/",
    label: "",
  },
};

export const Header = ({
  activeRoute,
}: {
  activeRoute?: keyof typeof routes;
}) => {
  return (
    <header className="p-8 flex items-center relative z-20">
      <Link href="/" className="flex gap-2">
        <Image src="/cambi.svg" width={160} height={40} alt="Cambi Logo" />
      </Link>
      <div className="ml-12 max-sm:ml-4 font-semibold flex gap-6 max-sm:gap-3 max-sm:text-sm">
        {Object.entries(routes).map(([key, route]) => (
          <Link
            key={key}
            href={route.href}
            className={cn("link", {
              "text-green": activeRoute === key,
            })}
          >
            {route.label}
          </Link>
        ))}
      </div>

      <div className="ml-auto">
        {" "}
        <CustomConnectButton />
      </div>
    </header>
  );
};
