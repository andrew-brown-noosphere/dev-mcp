'use client'

import { motion } from 'framer-motion'
import { 
  RocketLaunchIcon,
  MagnifyingGlassIcon,
  CodeBracketIcon,
  ChartBarIcon,
  TagIcon,
  BoltIcon
} from '@heroicons/react/24/outline'

const features = [
  {
    icon: RocketLaunchIcon,
    title: 'AI-Agent Optimized',
    description: 'Creates massive, machine-readable files that AI agents can parse instantly'
  },
  {
    icon: MagnifyingGlassIcon,
    title: 'Comprehensive Scanning',
    description: 'Automatically discovers APIs, documentation, and GitHub repositories'
  },
  {
    icon: CodeBracketIcon,
    title: 'Complete API Documentation',
    description: 'Extracts endpoints, parameters, schemas, and authentication methods'
  },
  {
    icon: ChartBarIcon,
    title: 'Performance Metrics',
    description: 'Includes benchmarks, competitive positioning, and quantified differentiators'
  },
  {
    icon: TagIcon,
    title: 'Discovery Keywords',
    description: 'Comprehensive keyword taxonomy optimized for AI agent discovery'
  },
  {
    icon: BoltIcon,
    title: 'Instant Results',
    description: 'Generate production-ready llms.txt files in under 30 seconds'
  }
]

export function FeatureGrid() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto"
    >
      {features.map((feature, index) => (
        <motion.div
          key={feature.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 * index }}
          whileHover={{ y: -5 }}
          className="glass-card rounded-xl p-6 text-center hover:border-primary-500/30 transition-all duration-300"
        >
          <div className="w-12 h-12 button-primary rounded-xl flex items-center justify-center mx-auto mb-4">
            <feature.icon className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            {feature.title}
          </h3>
          <p className="text-sm text-white/60 leading-relaxed">
            {feature.description}
          </p>
        </motion.div>
      ))}
    </motion.div>
  )
}