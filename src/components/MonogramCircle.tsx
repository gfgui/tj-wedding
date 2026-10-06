import Image from "next/image";

export function MonogramCircle({ size = 140 }: { size?: number }) {
  return (
    <Image
      src="/brand/monogram.png"
      alt="Monograma de Tailany e Jeffson"
      width={size}
      height={size}
      priority={size > 100}
      style={{ objectFit: "contain", display: "block" }}
    />
  );
}
