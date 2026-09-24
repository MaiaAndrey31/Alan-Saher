import { Fraunces, Inter } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz", "SOFT"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

/**
 * True app root. Intentionally minimal — no theme, no providers, no
 * page-specific metadata. The public site (dark, cinematic, GSAP/Lenis) and
 * the admin panel (light, plain) each own their own look via
 * `(site)/layout.tsx` and `(admin)/layout.tsx`, so neither ever inherits the
 * other's styling or JS.
 */
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable} h-full`} suppressHydrationWarning>
      <body className="min-h-full antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
