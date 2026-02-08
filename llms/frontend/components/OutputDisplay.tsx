'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  ClipboardDocumentIcon,
  CheckIcon,
  ArrowDownTrayIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'

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

interface OutputDisplayProps {
  result: GenerationResult
  onGenerateAnother: () => void
}

export function OutputDisplay({ result, onGenerateAnother }: OutputDisplayProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result.llmsTxt)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy text:', err)
    }
  }

  const handleDownload = () => {
    const blob = new Blob([result.llmsTxt], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'llms.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Stats Summary */}
      <div className="glass-card rounded-xl p-6">
        <h3 className="text-xl font-bold font-space mb-4 text-white">
          Generation Complete
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-500">
              {result.metadata.endpointsFound}
            </div>
            <div className="text-sm text-white/60">Endpoints</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-500">
              {result.metadata.schemasExtracted}
            </div>
            <div className="text-sm text-white/60">Schemas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-500">
              {result.llmsTxt.split('\n').length}
            </div>
            <div className="text-sm text-white/60">Lines</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-500">
              {Math.round(result.llmsTxt.length / 1024)}K
            </div>
            <div className="text-sm text-white/60">Size</div>
          </div>
        </div>
      </div>

      {/* Generated Output */}
      <div className="glass-card rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold font-space text-white">
            Generated llms.txt
          </h3>
          <div className="flex space-x-2">
            <button
              onClick={handleCopy}
              className="flex items-center px-4 py-2 bg-primary-500/20 border border-primary-500/40 rounded-lg text-primary-400 hover:bg-primary-500/30 transition-colors"
            >
              {copied ? (
                <>
                  <CheckIcon className="w-4 h-4 mr-1" />
                  Copied!
                </>
              ) : (
                <>
                  <ClipboardDocumentIcon className="w-4 h-4 mr-1" />
                  Copy
                </>
              )}
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors"
            >
              <ArrowDownTrayIcon className="w-4 h-4 mr-1" />
              Download
            </button>
          </div>
        </div>

        <div className="code-block rounded-xl p-6 max-h-96 overflow-y-auto">
          <pre className="text-sm whitespace-pre-wrap font-mono">
            {result.llmsTxt}
          </pre>
        </div>
      </div>

      {/* Next Steps */}
      <div className="glass-card rounded-xl p-6 bg-primary-500/5 border-primary-500/20">
        <h4 className="text-lg font-bold text-white mb-4 flex items-center">
          <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
          Next Steps
        </h4>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="text-center p-4 glass-card rounded-lg border-white/5">
            <h5 className="font-semibold text-primary-400 mb-2">1. Save the File</h5>
            <p className="text-sm text-white/80">
              Save the generated content as "llms.txt" in your website's root directory.
            </p>
          </div>
          <div className="text-center p-4 glass-card rounded-lg border-white/5">
            <h5 className="font-semibold text-primary-400 mb-2">2. Upload to Your Site</h5>
            <p className="text-sm text-white/80">
              Upload it to <code className="bg-white/10 px-1 rounded">yoursite.com/llms.txt</code> so AI agents can discover it.
            </p>
          </div>
          <div className="text-center p-4 glass-card rounded-lg border-white/5">
            <h5 className="font-semibold text-primary-400 mb-2">3. Test & Evaluate</h5>
            <p className="text-sm text-white/80">
              Use our{' '}
              <a href="/llms-txt-evaluator" className="text-primary-400 underline">
                evaluator tool
              </a>{' '}
              to verify it works perfectly.
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={onGenerateAnother}
          className="flex items-center justify-center px-6 py-3 button-primary text-white font-semibold rounded-xl transition-all"
        >
          <ArrowPathIcon className="w-5 h-5 mr-2" />
          Generate Another
        </button>
        <a
          href="/llms-txt-evaluator"
          className="flex items-center justify-center px-6 py-3 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 transition-colors"
        >
          <MagnifyingGlassIcon className="w-5 h-5 mr-2" />
          Evaluate This File
        </a>
      </div>
    </motion.div>
  )
}