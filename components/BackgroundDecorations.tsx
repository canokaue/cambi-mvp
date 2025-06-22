import Image from "next/image";

export const BackgroundDecorations = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
      {/* Far top left - away from header */}
      <Image
        src="/asset1.svg"
        className="absolute top-48 left-16 opacity-30 rotate-12"
        width={160}
        height={160}
        alt=""
      />

      {/* Far top right - away from header and disconnect button */}
      <Image
        src="/asset2.svg"
        className="absolute top-35 right-28 opacity-30 -rotate-30"
        width={140}
        height={140}
        alt=""
      />

      {/* Left side middle - next to cards */}
      <Image
        src="/asset3.svg"
        className="absolute top-1/2 left-16 opacity-30 rotate-45"
        width={120}
        height={120}
        alt=""
      />

      {/* Right side middle - next to cards */}
      <Image
        src="/asset4.svg"
        className="absolute top-1/2 right-2 opacity-30 -rotate-60"
        width={130}
        height={130}
        alt=""
      />

      {/* Bottom area - below all content */}
      <Image
        src="/asset5.svg"
        className="absolute bottom-8 left-1/3 opacity-30 rotate-90"
        width={160}
        height={160}
        alt=""
      />

      {/* Additional decorations */}

      {/* Top center area */}
      <Image
        src="/asset4.svg"
        className="absolute top-10 left-1/2 transform -translate-x-1/2 opacity-30 rotate-75"
        width={110}
        height={110}
        alt=""
      />

      {/* Left bottom area */}
      <Image
        src="/asset2.svg"
        className="absolute bottom-32 left-8 opacity-30 -rotate-45"
        width={135}
        height={135}
        alt=""
      />

      {/* Right bottom area */}
      <Image
        src="/asset3.svg"
        className="absolute bottom-16 right-20 opacity-30 rotate-120"
        width={125}
        height={125}
        alt=""
      />
    </div>
  );
};
