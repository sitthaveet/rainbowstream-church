import type { Metadata, Viewport } from "next";
import { Trirong, Anuphan } from "next/font/google";
import "./globals.css";
import { LIFFProvider } from "../providers/liff-providers";
import { AuthProvider } from "../providers/auth-provider";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

// Display: an elegant high-contrast Thai+Latin serif — editorial gravitas for
// all headings and hero moments.
const trirong = Trirong({
  weight: ["400", "600"],
  subsets: ["latin", "thai"],
  variable: "--font-trirong",
  display: "swap",
});

// Body/UI: a clean, modern loopless Thai+Latin sans — quiet and highly legible.
const anuphan = Anuphan({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin", "thai"],
  variable: "--font-anuphan",
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
        className={`${trirong.variable} ${anuphan.variable} flex min-h-dvh flex-col antialiased`}
      >
        {/* Atmosphere: spectral aurora mesh + film grain, behind everything */}
        <div aria-hidden className="bg-aurora" />
        <div aria-hidden className="bg-grain" />
        <LIFFProvider>
          <AuthProvider>
            <Header />
            <main className="mx-auto w-full max-w-2xl flex-1 px-4 pt-28 pb-16">
              {children}
            </main>
            <Footer />
          </AuthProvider>
        </LIFFProvider>
      </body>
    </html>
  );
}
