'use client'

import { motion } from 'framer-motion'
import { 
  MagnifyingGlassIcon,
  SparklesIcon,
  RocketLaunchIcon,
  DocumentTextIcon,
  ClipboardDocumentIcon,
  ChartBarIcon,
  BoltIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'
import { Header } from '@/components/Header'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="container mx-auto px-6 py-12 max-w-6xl">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-6xl font-bold font-space mb-6">
            AI Engine{' '}
            <span className="gradient-text">Optimization</span>{' '}
            Tools
          </h1>
          <p className="text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">
            Transform your APIs from human-focused documentation to AI-agent-ready discovery files. 
            Generate perfect llms.txt files or evaluate existing ones for AI compatibility.
          </p>
        </motion.div>

        {/* Tools Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
          {/* Generator Tool */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card rounded-2xl p-8 border-2 border-primary-500/20 hover:border-primary-500/40 transition-all group"
          >
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-primary-500/20 rounded-xl flex items-center justify-center mr-4">
                <SparklesIcon className="w-6 h-6 text-primary-500" />
              </div>
              <div>
                <h3 className="text-2xl font-bold font-space">llms.txt Generator</h3>
                <p className="text-white/60 text-sm">Create AI-optimized discovery files</p>
              </div>
            </div>
            
            <p className="text-white/80 mb-6 leading-relaxed">
              Automatically scan any website and generate comprehensive, machine-readable llms.txt files. 
              Transform B2B vendor sites for AI agent adoption with complete API documentation.
            </p>
            
            <ul className="space-y-2 mb-8">
              {[
                'Website scanning & API discovery',
                'OpenAPI spec integration',
                'GitHub repository analysis',
                'Machine-optimized output'
              ].map((feature, index) => (
                <li key={index} className="flex items-center text-sm text-white/70">
                  <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-3" />
                  {feature}
                </li>
              ))}
            </ul>
            
            <a 
              href="/generator"
              className="block w-full button-primary text-center py-3 px-6 rounded-xl font-semibold group-hover:bg-primary-600 transition-all"
            >
              <SparklesIcon className="w-5 h-5 inline mr-2" />
              Generate llms.txt
              <ArrowRightIcon className="w-4 h-4 inline ml-2 group-hover:translate-x-1 transition-transform" />
            </a>
          </motion.div>

          {/* Evaluator Tool */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card rounded-2xl p-8 border-2 border-blue-500/20 hover:border-blue-500/40 transition-all group"
          >
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mr-4">
                <MagnifyingGlassIcon className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <h3 className="text-2xl font-bold font-space">llms.txt Evaluator</h3>
                <p className="text-white/60 text-sm">Analyze AI readiness</p>
              </div>
            </div>
            
            <p className="text-white/80 mb-6 leading-relaxed">
              Get instant AI-powered evaluation of your website's llms.txt file and API documentation. 
              Discover how well your APIs work with AI agents like Claude, GPT-4, and others.
            </p>
            
            <ul className="space-y-2 mb-8">
              {[
                'llms.txt file validation',
                'API documentation analysis',
                'Authentication method check',
                'AI compatibility scoring'
              ].map((feature, index) => (
                <li key={index} className="flex items-center text-sm text-white/70">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-3" />
                  {feature}
                </li>
              ))}
            </ul>
            
            <a 
              href="/evaluator"
              className="block w-full bg-blue-500 hover:bg-blue-600 text-white text-center py-3 px-6 rounded-xl font-semibold transition-all"
            >
              <MagnifyingGlassIcon className="w-5 h-5 inline mr-2" />
              Evaluate AI Readiness
              <ArrowRightIcon className="w-4 h-4 inline ml-2 group-hover:translate-x-1 transition-transform" />
            </a>
          </motion.div>
        </div>

        {/* What is llms.txt Section */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold font-space mb-6">What is llms.txt?</h2>
          <div className="max-w-4xl mx-auto">
            <p className="text-lg text-white/80 mb-8 leading-relaxed">
              llms.txt is like robots.txt for AI agents - a standardized discovery file that helps AI systems 
              understand your APIs, documentation, and integration patterns. It's the key to transforming 
              your B2B vendor site from human-optimized to AI-agent-ready.
            </p>
            
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: DocumentTextIcon,
                  title: 'Discovery Protocol',
                  description: 'Standardized format for AI agents to find and understand your APIs'
                },
                {
                  icon: RocketLaunchIcon,
                  title: 'Faster Adoption',
                  description: 'Reduce time to API integration from days to minutes for AI developers'
                },
                {
                  icon: BoltIcon,
                  title: 'Machine Optimized',
                  description: 'Structured data that AI agents can parse and understand instantly'
                }
              ].map((item, index) => (
                <div key={index} className="glass-card rounded-xl p-6">
                  <item.icon className="w-8 h-8 text-primary-500 mx-auto mb-4" />
                  <h4 className="font-semibold text-white mb-2">{item.title}</h4>
                  <p className="text-white/60 text-sm">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <div className="glass-card rounded-2xl p-8 max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold font-space mb-4">Ready to Optimize for AI?</h3>
            <p className="text-white/70 mb-6">
              Start with our generator to create a comprehensive llms.txt file, or use our evaluator 
              to analyze your existing AI readiness.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/generator"
                className="button-primary px-6 py-3 rounded-xl font-semibold"
              >
                <SparklesIcon className="w-5 h-5 inline mr-2" />
                Generate New File
              </a>
              <a 
                href="/evaluator"
                className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-semibold transition-all"
              >
                <MagnifyingGlassIcon className="w-5 h-5 inline mr-2" />
                Evaluate Existing
              </a>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  )
}