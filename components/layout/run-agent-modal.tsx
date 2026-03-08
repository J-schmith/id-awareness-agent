'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface Theme {
  id: string
  label: string
  color: string
  active: boolean
}

interface RunAgentModalProps {
  open: boolean
  onClose: () => void
}

export function RunAgentModal({ open, onClose }: RunAgentModalProps) {
  const [themes, setThemes] = useState<Theme[]>([])
  const [selectedThemeIds, setSelectedThemeIds] = useState<string[]>([])
  const [quarter, setQuarter] = useState(getDefaultQuarter())
  const [loading, setLoading] = useState(false)
  const [fetchingThemes, setFetchingThemes] = useState(false)

  useEffect(() => {
    if (open) {
      setFetchingThemes(true)
      fetch('/api/themes')
        .then((res) => res.json())
        .then((data) => {
          const activeThemes = (data.themes || data || []).filter((t: Theme) => t.active)
          setThemes(activeThemes)
          setSelectedThemeIds(activeThemes.map((t: Theme) => t.id))
        })
        .catch(() => toast.error('Failed to load themes'))
        .finally(() => setFetchingThemes(false))
    }
  }, [open])

  function toggleTheme(id: string) {
    setSelectedThemeIds((prev) =>
      prev.includes(id) ? prev.filter((tid) => tid !== id) : [...prev, id]
    )
  }

  async function handleRun() {
    if (selectedThemeIds.length === 0) {
      toast.error('Select at least one theme')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/agent/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'research',
          quarter,
          themeIds: selectedThemeIds,
        }),
      })
      const data = await res.json()
      if (data.success || res.ok) {
        toast.success('Agent research started')
        onClose()
      } else {
        toast.error(data.error || 'Failed to start agent')
      }
    } catch {
      toast.error('Failed to start agent')
    }
    setLoading(false)
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Run Agent"
      subtitle="Configure and start awareness day research"
      footer={
        <>
          <Button variant="secondary" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="md" onClick={handleRun} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {loading ? 'Running...' : 'Start Research'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="block text-[12px] font-medium text-gray-500 mb-1.5">
            Quarter
          </label>
          <select
            value={quarter}
            onChange={(e) => setQuarter(e.target.value)}
            className="w-full h-9 px-3 text-[13px] text-gray-700 bg-gray-50 border border-black/[0.07] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20 focus:border-[#0071e3]/30"
          >
            {getQuarterOptions().map((q) => (
              <option key={q} value={q}>
                {q}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[12px] font-medium text-gray-500 mb-1.5">
            Themes
          </label>
          {fetchingThemes ? (
            <div className="flex items-center gap-2 text-[13px] text-gray-400 py-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading themes...
            </div>
          ) : themes.length === 0 ? (
            <p className="text-[13px] text-gray-400">No active themes found</p>
          ) : (
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {themes.map((theme) => (
                <label
                  key={theme.id}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedThemeIds.includes(theme.id)}
                    onChange={() => toggleTheme(theme.id)}
                    className="w-4 h-4 rounded border-gray-300 text-[#0071e3] focus:ring-[#0071e3]/30"
                  />
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: theme.color }}
                  />
                  <span className="text-[13px] text-gray-700">{theme.label}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}

function getDefaultQuarter(): string {
  const now = new Date()
  const q = Math.ceil((now.getMonth() + 1) / 3)
  return `Q${q} ${now.getFullYear()}`
}

function getQuarterOptions(): string[] {
  const now = new Date()
  const year = now.getFullYear()
  const options: string[] = []
  for (let y = year; y <= year + 1; y++) {
    for (let q = 1; q <= 4; q++) {
      options.push(`Q${q} ${y}`)
    }
  }
  return options
}
