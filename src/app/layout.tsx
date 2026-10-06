import type { Metadata, Viewport } from "next";
import { Dancing_Script, Lora, Playfair_Display } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
});

const lora = Lora({
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  variable: "--font-lora",
  display: "swap",
});

const dancingScript = Dancing_Script({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-dancing",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Tailany & Jeffson",
  description:
    "Galeria de fotos do casamento de Tailany e Jeffson — 10 de outubro de 2026.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // A tela e usada em celular no salao; o tom creme evita a barra branca do iOS.
  themeColor: "#F9F5EE",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${playfair.variable} ${lora.variable} ${dancingScript.variable} h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
