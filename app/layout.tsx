import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Reverse Akinator - 歴史上の人物当てゲーム",
  description: "私が思い浮かべた歴史上の人物を質問して当ててください。AI搭載の推理ゲーム。",
  openGraph: {
    title: "Reverse Akinator - 歴史上の人物当てゲーム",
    description: "私が思い浮かべた歴史上の人物を質問して当ててください。AI搭載の推理ゲーム。",
    type: "website",
    locale: "ja_JP",
  },
  twitter: {
    card: "summary_large_image",
    title: "Reverse Akinator - 歴史上の人物当てゲーム",
    description: "私が思い浮かべた歴史上の人物を質問して当ててください。AI搭載の推理ゲーム。",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
