import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { QueryProvider } from "@/providers/query-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navbar from "@/components/Navbar";
import "./globals.css";

const geistSans = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

export const metadata = {
  title: {
    default: "ICA · Intelligent Course Advisor",
    template: "%s · ICA",
  },
  description: "AI course advisor for IIIT Hyderabad MTech students: grounded answers from the official syllabi, personalised recommendations and progress tracking.",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider afterSignOutUrl="/" appearance={{ variables: { colorPrimary: "oklch(0.51 0.21 275)", borderRadius: "0.75rem" } }}>
      <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full`} suppressHydrationWarning>
        <body className="flex min-h-full flex-col font-sans">
          <ThemeProvider>
            <QueryProvider>
              <TooltipProvider delayDuration={150}>
                <Navbar />
                <main className="flex flex-1 flex-col">{children}</main>
                <Toaster position="top-right" richColors closeButton />
              </TooltipProvider>
            </QueryProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
