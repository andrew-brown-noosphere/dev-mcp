'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  GlobeAltIcon, 
  CodeBracketIcon, 
  DocumentTextIcon,
  PlusCircleIcon,
  SparklesIcon 
} from '@heroicons/react/24/outline'

interface FormData {
  websiteUrl: string
  openApiUrl?: string
  githubRepo?: string
  docsUrl?: string
}

interface GeneratorFormProps {
  onGenerate: (data: FormData) => void
}

export function GeneratorForm({ onGenerate }: GeneratorFormProps) {
  const [formData, setFormData] = useState<FormData>({
    websiteUrl: '',
    openApiUrl: '',
    githubRepo: '',
    docsUrl: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.websiteUrl.trim()) {
      return
    }

    // Clean and validate the website URL
    let cleanUrl = formData.websiteUrl.trim()
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = `https://${cleanUrl}`
    }

    onGenerate({
      ...formData,
      websiteUrl: cleanUrl
    })
  }

  const updateField = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-2xl p-8 max-w-4xl mx-auto"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Main URL Input */}
        <div>
          <label htmlFor="websiteUrl" className="block text-sm font-medium text-white/90 mb-2">
            <GlobeAltIcon className="w-4 h-4 inline mr-1" />
            Website to Scan
          </label>
          <div className="relative">
            <input
              type="text"
              id="websiteUrl"
              value={formData.websiteUrl}
              onChange={(e) => updateField('websiteUrl', e.target.value)}
              placeholder="scylladb.com"
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:border-primary-500 focus:bg-white/10 transition-all pr-12"
              required
            />
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/40">
              <GlobeAltIcon className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Additional Resources */}
        <div className="glass-card rounded-xl p-6 bg-white/[0.02] border-white/5">
          <div className="flex items-center mb-4">
            <PlusCircleIcon className="w-5 h-5 text-primary-500 mr-2" />
            <h3 className="font-semibold text-white">Additional Resources (Optional)</h3>
          </div>
          <p className="text-sm text-white/60 mb-6">
            Provide additional resources to generate an even more comprehensive llms.txt file.
          </p>

          <div className="grid md:grid-cols-1 gap-4">
            {/* OpenAPI URL */}
            <div>
              <label htmlFor="openApiUrl" className="block text-sm font-medium text-white/80 mb-2">
                <CodeBracketIcon className="w-4 h-4 inline mr-1" />
                OpenAPI/Swagger Specification URL
              </label>
              <input
                type="url"
                id="openApiUrl"
                value={formData.openApiUrl}
                onChange={(e) => updateField('openApiUrl', e.target.value)}
                placeholder="https://api.example.com/swagger.json"
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:border-primary-500 focus:bg-white/10 transition-all"
              />
            </div>

            {/* GitHub Repo */}
            <div>
              <label htmlFor="githubRepo" className="block text-sm font-medium text-white/80 mb-2">
                <svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                GitHub Repository (for code examples)
              </label>
              <input
                type="url"
                id="githubRepo"
                value={formData.githubRepo}
                onChange={(e) => updateField('githubRepo', e.target.value)}
                placeholder="https://github.com/username/repo-name"
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:border-primary-500 focus:bg-white/10 transition-all"
              />
            </div>

            {/* Docs URL */}
            <div>
              <label htmlFor="docsUrl" className="block text-sm font-medium text-white/80 mb-2">
                <DocumentTextIcon className="w-4 h-4 inline mr-1" />
                API Documentation URL
              </label>
              <input
                type="url"
                id="docsUrl"
                value={formData.docsUrl}
                onChange={(e) => updateField('docsUrl', e.target.value)}
                placeholder="https://docs.example.com/api"
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:border-primary-500 focus:bg-white/10 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!formData.websiteUrl.trim()}
          className="w-full button-primary text-white font-semibold py-4 px-8 rounded-xl font-mono uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          <SparklesIcon className="w-5 h-5 mr-2" />
          Generate AI-Optimized llms.txt
        </button>
      </form>
    </motion.div>
  )
}