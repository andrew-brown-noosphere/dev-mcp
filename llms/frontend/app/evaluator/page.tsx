'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  SparklesIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline'
import { Header } from '@/components/Header'

export default function EvaluatorPage() {
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!websiteUrl.trim()) return
    
    setIsAnalyzing(true)
    
    // Redirect to the static evaluator for now
    // Later we can integrate this into the React app
    window.location.href = `/evaluator/index.html?url=${encodeURIComponent(websiteUrl)}`
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="container mx-auto px-6 py-12 max-w-6xl">
        {/* Tool Switcher */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-xl p-4 mb-8 text-center max-w-2xl mx-auto"
        >
          <p className="text-white/60 text-sm mb-2">
            Need to generate a new llms.txt file?
          </p>
          <a 
            href="/generator" 
            className="text-primary-500 hover:text-white transition-colors font-semibold"
          >
            <SparklesIcon className="w-4 h-4 inline mr-1" />
            Use the llms.txt Generator instead
          </a>
        </motion.div>

        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-6xl font-bold font-space mb-6">
            Is Your API{' '}
            <span className="gradient-text">AI-Ready</span>?
          </h1>
          <p className="text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">
            Get an instant AI-powered evaluation of your website's llms.txt file and API documentation. 
            Discover how well your APIs work with AI agents like Claude, GPT-4, and others.
          </p>
        </motion.div>

        {/* Evaluation Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-2xl p-8 max-w-2xl mx-auto"
        >
          <form onSubmit={handleAnalyze} className="space-y-6">
            <div>
              <label htmlFor="websiteUrl" className="block text-sm font-medium text-white/90 mb-2">
                Domain to Evaluate
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="websiteUrl"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="example.com"
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:border-primary-500 focus:bg-white/10 transition-all pr-12"
                  required
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/40">
                  <MagnifyingGlassIcon className="w-5 h-5" />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={!websiteUrl.trim() || isAnalyzing}
              className="w-full button-primary text-white font-semibold py-4 px-8 rounded-xl font-mono uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Analyzing...
                </>
              ) : (
                <>
                  <MagnifyingGlassIcon className="w-5 h-5 mr-2" />
                  Analyze AI Readiness
                </>
              )}
            </button>
          </form>
        </motion.div>

        {/* Features - What We Check */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-16"
        >
          <h2 className="text-3xl font-bold font-space text-center mb-12">What We Analyze</h2>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="space-y-6">
              {[
                {
                  title: 'LLMs.txt File Discovery',
                  description: 'Locate and validate your AI instruction file'
                },
                {
                  title: 'Authentication Methods',
                  description: 'Check API key, OAuth, and bearer token support'
                },
                {
                  title: 'Endpoint Documentation',
                  description: 'Evaluate clarity and completeness of API docs'
                }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="flex items-start"
                >
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-3 mr-4 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-white mb-1">{item.title}</h4>
                    <p className="text-white/60 text-sm">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            
            <div className="space-y-6">
              {[
                {
                  title: 'Example Usage',
                  description: 'Assess quality and relevance of code examples'
                },
                {
                  title: 'Rate Limiting Info',
                  description: 'Verify rate limit documentation for AI agents'
                },
                {
                  title: 'AI-Specific Guidelines',
                  description: 'Check for AI usage policies and best practices'
                }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="flex items-start"
                >
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-3 mr-4 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-white mb-1">{item.title}</h4>
                    <p className="text-white/60 text-sm">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  )
}