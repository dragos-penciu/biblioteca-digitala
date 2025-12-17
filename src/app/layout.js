import "./globals.css";
import { Inter, Literata } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const literata = Literata({ subsets: ["latin"], variable: "--font-serif" });

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${literata.variable} h-full`}>
      <body className="h-full">
        {children}
      </body>
    </html>
  );
}
