'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { Bot } from 'lucide-react'

export default function AgentBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Poll a lightweight status endpoint to check if agent is running.
    // Falls back to hidden if the endpoint is unavailable.
    let cancelled = false

    async function check() {
      try {
        const res = await fetch('/api/agent/status')
        if (!cancelled && res.ok) {
          const data = await res.json()
          setVisible(data.running === true)
        }
      } catch {
        if (!cancelled) setVisible(false)
      }
    }

    check()
    const interval = setInterval(check, 15_000)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [])

  if (!visible) return null

  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#0071e3]/[0.06] border border-[#0071e3]/[0.12] mb-5">
      {/* Pulsing dot */}
      <span className="relative flex h-2.5 w-2.5 shrink-0">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#34c759] opacity-75" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#34c759]" />
      </span>

      <Bot className="w-4 h-4 text-[#0071e3] shrink-0" />

      <p className="text-[13px] font-medium text-[#0071e3]">
        Agent is running &mdash; generating drafts and discovering upcoming awareness days.
      </p>
    </div>
  )
}
