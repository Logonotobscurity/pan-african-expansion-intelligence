import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Pan-African Expansion Intelligence | LOG_ON",
  description: "Evidence-led market expansion signals, country verification tracks, constraints and opportunity prioritisation across African markets.",
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className="antialiased">{children}</body></html>
}
