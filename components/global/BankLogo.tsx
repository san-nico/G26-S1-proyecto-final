import Image from "next/image";
import { bankLogoPath } from "@/lib/format";

type BankLogoProps = {
  children: string;
  alt?: string;
  size?: "sm" | "lg";
};

const SIZE_CLASSES: Record<
  NonNullable<BankLogoProps["size"]>,
  { box: string; img: number }
> = {
  sm: { box: "size-9 rounded-lg", img: 36 },
  lg: { box: "size-14 rounded-xl", img: 100 },
};

export default function BankLogo({
  children,
  alt,
  size = "sm",
}: BankLogoProps) {
  const { box, img } = SIZE_CLASSES[size];

  return (
    <span
      className={`grid shrink-0 place-items-center overflow-hidden border border-line bg-panel ${box}`}
    >
      <Image
        width={img}
        height={img}
        src={bankLogoPath(children)}
        alt={alt ?? `Logo de la institución ${children}`}
        className="object-contain"
      />
    </span>
  );
}
