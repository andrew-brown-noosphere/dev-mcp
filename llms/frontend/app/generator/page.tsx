'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  MagnifyingGlassIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline'
import { Header } from '@/components/Header'
import { GeneratorForm } from '@/components/GeneratorForm'
import { LoadingState } from '@/components/LoadingState'
import { OutputDisplay } from '@/components/OutputDisplay'
import { FeatureGrid } from '@/components/FeatureGrid'

interface GenerationResult {
  llmsTxt: string
  metadata: {
    scannedUrl: string
    timestamp: string
    endpointsFound: number
    schemasExtracted: number
    githubRepo?: string
    openApiSpec?: string
  }
}

export default function GeneratorPage() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [result, setResult] = useState<GenerationResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async (formData: {
    websiteUrl: string
    openApiUrl?: string
    githubRepo?: string
    docsUrl?: string
  }) => {
    setIsGenerating(true)
    setError(null)
    
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error(`Generation failed: ${response.statusText}`)
      }

      const data: GenerationResult = await response.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed')
    } finally {
      setIsGenerating(false)
    }
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
            Looking to evaluate an existing llms.txt file?
          </p>
          <a 
            href="/evaluator" 
            className="text-primary-500 hover:text-white transition-colors font-semibold"
          >
            <MagnifyingGlassIcon className="w-4 h-4 inline mr-1" />
            Use the llms.txt Evaluator instead
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
            Generate Perfect{' '}
            <span className="gradient-text">llms.txt</span>{' '}
            Files
          </h1>
          <p className="text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">
            Automatically scan any website and generate comprehensive, AI-optimized llms.txt files. 
            Transform your B2B vendor site from human-focused to AI-agent-ready in seconds.
          </p>
        </motion.div>

        {/* Main Content */}
        <div className="space-y-8">
          {!result && !isGenerating && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <GeneratorForm onGenerate={handleGenerate} />
            </motion.div>
          )}

          {isGenerating && <LoadingState />}

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card rounded-xl p-6 border-red-500/20 bg-red-500/5"
            >
              <div className="flex items-center text-red-400">
                <SparklesIcon className="w-5 h-5 mr-2" />
                <span className="font-semibold">Generation Error</span>
              </div>
              <p className="text-white/80 mt-2">{error}</p>
              <button
                onClick={() => {
                  setError(null)
                  setResult(null)
                }}
                className="mt-4 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
              >
                Try Again
              </button>
            </motion.div>
          )}

          {result && (
            <OutputDisplay
              result={result}
              onGenerateAnother={() => {
                setResult(null)
                setError(null)
              }}
            />
          )}

          {!result && !isGenerating && <FeatureGrid />}
        </div>
      </main>
    </div>
  )
}