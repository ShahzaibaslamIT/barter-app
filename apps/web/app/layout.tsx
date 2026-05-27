// import type React from "react"
// import type { Metadata } from "next"
// import { Playfair_Display, Source_Sans_3 } from "next/font/google"
// import { GeistMono } from "geist/font/mono"
// import "./globals.css"


// const playfairDisplay = Playfair_Display({
//   subsets: ["latin"],
//   display: "swap",
//   variable: "--font-playfair-display",
// })

// const sourceSansPro = Source_Sans_3({
//   subsets: ["latin"],
//   display: "swap",
//   variable: "--font-source-sans-pro",
// })

// export const metadata: Metadata = {
//   title: "BarterHub - Local Trading Platform",
//   description: "Trade items and services with your local community",
//   generator: "v0.app",
// }

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode
// }>) {
//   return (
//     <html lang="en">
//       <body
//         className={`font-sans ${sourceSansPro.variable} ${playfairDisplay.variable} ${GeistMono.variable} antialiased`}
//       >
//         {children}
//       </body>
//     </html>
//   )
// }



// import type React from "react"
// import type { Metadata } from "next"
// import { Playfair_Display, Source_Sans_3 } from "next/font/google"
// import { GeistMono } from "geist/font/mono"
// import "./globals.css"
// import { Providers } from "./providers"   // ✅ import wrapper

// const playfairDisplay = Playfair_Display({
//   subsets: ["latin"],
//   display: "swap",
//   variable: "--font-playfair-display",
// })

// const sourceSansPro = Source_Sans_3({
//   subsets: ["latin"],
//   display: "swap",
//   variable: "--font-source-sans-pro",
// })

// export const metadata: Metadata = {
//   title: "BarterHub - Local Trading Platform",
//   description: "Trade items and services with your local community",
//   generator: "v0.app",
// }

// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode
// }) {
//   return (
//     <html lang="en">
//       <body
//         className={`font-sans ${sourceSansPro.variable} ${playfairDisplay.variable} ${GeistMono.variable} antialiased`}
//       >
//         {/* ✅ Wrap in client Providers */}
//         <Providers>{children}</Providers>
//       </body>
//     </html>
//   )
// }



import type React from "react"
import type { Metadata } from "next"
import { Playfair_Display, Source_Sans_3 } from "next/font/google"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import { Providers } from "./providers"
import NotificationProvider from "@/components/NotificationProvider"
import RegisterSW from "@/components/RegisterSW"
import StatusBanner from "@/components/StatusBanner"

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-playfair-display",
})

const sourceSansPro = Source_Sans_3({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-source-sans-pro",
})

export const metadata: Metadata = {
  title: "BarterHub - Local Trading Platform",
  description: "Trade items and services with your local community",
  generator: "v0.app",
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180" },
    ],
  },
  other: {
    "apple-mobile-web-app-title": "BarterHub",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body
        className={`font-sans ${sourceSansPro.variable} ${playfairDisplay.variable} ${GeistMono.variable} antialiased`}
      >
        <Providers>
           <RegisterSW />
           <NotificationProvider />
           <StatusBanner />
           {children}
        </Providers>
      </body>
    </html>
  )
}