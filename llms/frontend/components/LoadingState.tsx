'use client'

import { motion } from 'framer-motion'
import { 
  GlobeAltIcon,
  CodeBracketIcon,
  DocumentMagnifyingGlassIcon,
  CpuChipIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'

const steps = [
  {
    icon: GlobeAltIcon,
    title: 'Scanning Website',
    description: 'Analyzing website structure and content...'
  },
  {
    icon: DocumentMagnifyingGlassIcon,
    title: 'Extracting APIs',
    description: 'Finding OpenAPI specs and documentation...'
  },
  {
    icon: CodeBracketIcon,
    title: 'Processing Code',
    description: 'Analyzing GitHub repositories for examples...'
  },
  {
    icon: CpuChipIcon,
    title: 'AI Optimization',
    description: 'Generating machine-readable content...'
  },
  {
    icon: SparklesIcon,
    title: 'Finalizing',
    description: 'Creating comprehensive llms.txt file...'
  }
]

export function LoadingState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card rounded-2xl p-8 max-w-2xl mx-auto"
    >
      <div className="text-center mb-8">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-white/10 border-t-primary-500 rounded-full mx-auto mb-4"
        />
        <h3 className="text-2xl font-bold font-space mb-2">
          Scanning Website & Generating llms.txt
        </h3>
        <p className="text-white/60">
          This will take about 30-60 seconds...
        </p>
      </div>

      <div className="space-y-4">
        {steps.map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ 
              opacity: 1, 
              x: 0,
              scale: [1, 1.02, 1]
            }}
            transition={{ 
              delay: index * 0.3,
              scale: {
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse"
              }
            }}
            className="flex items-center p-4 glass-card rounded-xl border-white/5"
          >
            <div className="flex-shrink-0 w-10 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center mr-4">
              <step.icon className="w-5 h-5 text-primary-400" />
            </div>
            <div>
              <h4 className="font-semibold text-white">{step.title}</h4>
              <p className="text-sm text-white/60">{step.description}</p>
            </div>
            <div className="ml-auto">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity,
                  delay: index * 0.2
                }}
                className="w-2 h-2 bg-primary-500 rounded-full"
              />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 text-center">
        <p className="text-xs text-white/40">
          Scanning includes: Website analysis • API discovery • GitHub parsing • AI optimization
        </p>
      </div>
    </motion.div>
  )
}