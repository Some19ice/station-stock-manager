import { CheckoutRedirect } from "@/components/payments/checkout-redirect"
import { TooltipProvider } from "@/components/ui/tooltip"
import { TailwindIndicator } from "@/components/utility/tailwind-indicator"
import ErrorBoundary from "@/components/utility/error-boundary"
import { ClerkProvider } from "@clerk/nextjs"
import type { Metadata } from "next"
import { ThemeProvider } from "next-themes"
import { Geist, Geist_Mono } from "next/font/google"
import { Toaster } from "sonner"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"]
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"]
})

export const metadata: Metadata = {
  title: "Station Stock Manager",
  description:
    "A SaaS inventory management platform helping independent filling station owners worldwide maintain live, accurate stock levels through simple, affordable real-time tracking with offline capabilities on any device."
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
            <ErrorBoundary>
              <TooltipProvider>
                {children}
                <CheckoutRedirect />

                <TailwindIndicator />
                <Toaster />
              </TooltipProvider>
            </ErrorBoundary>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
