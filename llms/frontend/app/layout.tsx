import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'LLMs.txt Generator - DevMCP.ai',
  description: 'Generate comprehensive, AI-optimized llms.txt files for any website automatically',
  keywords: 'llms.txt, AI optimization, API documentation, AI agents, machine readable',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-black text-white antialiased">
        {children}
      </body>
    </html>
  )
}