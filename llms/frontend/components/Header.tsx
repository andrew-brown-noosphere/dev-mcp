'use client'

import { motion } from 'framer-motion'

export function Header() {
  return (
    <motion.nav 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-50 glass-card border-b border-white/10"
    >
      <div className="container mx-auto px-6 py-6">
        <div className="flex justify-between items-center">
          <a href="/" className="text-2xl font-bold font-space text-white">
            DevMCP.ai
          </a>
          
          <div className="hidden md:flex items-center space-x-8">
            <a href="/" className="text-white/70 hover:text-white transition-colors">
              Home
            </a>
            <a href="/llms-txt-evaluator" className="text-white/70 hover:text-white transition-colors">
              Evaluator
            </a>
            <a href="/llms-txt-generator" className="text-primary-500 font-semibold">
              Generator
            </a>
            <a href="/blog.html" className="text-white/70 hover:text-white transition-colors">
              Blog
            </a>
            <a href="#demo" className="text-white/70 hover:text-white transition-colors">
              Get Demo
            </a>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="text-white/70 hover:text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </motion.nav>
  )
}