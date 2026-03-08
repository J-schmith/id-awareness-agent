'use client'

import { useState, useRef } from 'react'
import { createTheme } from '@/actions/themes'
import { Button } from '@/components/ui/button'
import { Tag, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export function CreateThemeForm() {
  const [loading, setLoading] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const result = await createTheme(formData)

    if (result.success) {
      toast.success('Theme created successfully')
      formRef.current?.reset()
    } else {
      toast.error(result.error || 'Failed to create theme')
    }

    setLoading(false)
  }

  return (
    <div className="bg-white/80 backdrop-blur-xl border border-black/[0.07] rounded-2xl shadow-sm p-6">
      <h3 className="text-[14px] font-semibold text-gray-900 mb-4">
        Create New Theme
      </h3>
      <form ref={formRef} onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-[12px] font-medium text-gray-500 mb-1.5">
            Label
          </label>
          <input
            name="label"
            type="text"
            required
            placeholder="e.g. Neurodiversity"
            className="w-full h-9 px-3 text-[13px] text-gray-700 bg-gray-50 border border-black/[0.07] rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20 focus:border-[#0071e3]/30"
          />
        </div>
        <div>
          <label className="block text-[12px] font-medium text-gray-500 mb-1.5">
            Description
          </label>
          <input
            name="description"
            type="text"
            placeholder="Brief description..."
            className="w-full h-9 px-3 text-[13px] text-gray-700 bg-gray-50 border border-black/[0.07] rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20 focus:border-[#0071e3]/30"
          />
        </div>
        <div>
          <label className="block text-[12px] font-medium text-gray-500 mb-1.5">
            Color
          </label>
          <div className="flex items-center gap-2">
            <input
              name="colorPicker"
              type="color"
              defaultValue="#0071e3"
              className="w-9 h-9 rounded-lg border border-black/[0.07] cursor-pointer"
              onChange={(e) => {
                const textInput = e.currentTarget.parentElement?.querySelector<HTMLInputElement>('input[name="color"]')
                if (textInput) textInput.value = e.currentTarget.value
              }}
            />
            <input
              name="color"
              type="text"
              placeholder="#0071e3"
              defaultValue="#0071e3"
              className="flex-1 h-9 px-3 text-[13px] text-gray-700 bg-gray-50 border border-black/[0.07] rounded-lg font-mono placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20 focus:border-[#0071e3]/30"
            />
          </div>
        </div>
        <div className="sm:col-span-3 flex justify-end">
          <Button variant="primary" size="md" type="submit" disabled={loading}>
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Tag className="w-4 h-4" />
            )}
            {loading ? 'Creating...' : 'Create Theme'}
          </Button>
        </div>
      </form>
    </div>
  )
}
