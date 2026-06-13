import type { Metadata, Viewport } from "next";
import { Kanit, Noto_Sans_Thai_Looped } from "next/font/google";
import "./globals.css";
import { LIFFProvider } from "../providers/liff-providers";
import { AuthProvider } from "../providers/auth-provider";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

const kanit = Kanit({
  weight: "400",
  subsets: ["latin", "thai"],
  variable: "--font-headings",
  display: "swap",
});

const notoSansThaiLooped = Noto_Sans_Thai_Looped({
  weight: ["400", "700"],
  subsets: ["latin", "thai"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Rainbow Stream Church",
  description: "ชุมชนคริสเตียนที่โอบรับทุกคน — เช็คอินกิจกรรม สะสมแต้ม และติดตามข่าวสาร",
  icons: { icon: "/favicon.ico" },
  openGraph: { images: ["/og-image.png"] },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1.0,
};

/** Applies the system dark theme before paint (class strategy, .dark). */
const themeScript = `try{if(window.matchMedia("(prefers-color-scheme: dark)").matches)document.documentElement.classList.add("dark")}catch(e){}`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body
        className={`${kanit.variable} ${notoSansThaiLooped.variable} flex min-h-dvh flex-col font-serif antialiased`}
      >
        <LIFFProvider>
          <AuthProvider>
            <Header />
            <main className="mx-auto w-full max-w-2xl flex-1 px-4 pt-28 pb-12">
              {children}
            </main>
            <Footer />
          </AuthProvider>
        </LIFFProvider>
      </body>
    </html>
  );
}
