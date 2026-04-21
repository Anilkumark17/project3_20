import { Poppins } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { QueryProvider } from "@/providers/query-provider";
import Navbar from "@/components/Navbar";
import "./globals.css";

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
});

export const metadata = {
  title: "Intelligent Course Advisor",
  description: "AI-powered course recommendations for students",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${poppins.variable} h-full antialiased`}>
        <body className="min-h-full flex flex-col font-poppins bg-white text-black">
          <QueryProvider>
            <Navbar />
            {children}
          </QueryProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
