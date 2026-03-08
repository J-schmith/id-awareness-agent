import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { Tag, Plus, Check, X } from 'lucide-react'

export default async function ThemesPage() {
  const themes = await prisma.theme.findMany({
    orderBy: { label: 'asc' },
    include: {
      _count: {
        select: { awarenessDays: true },
      },
    },
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Themes</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage inclusion and diversity themes for awareness days
          </p>
        </div>
        <span className="text-sm text-gray-400">
          {themes.length} theme{themes.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Theme Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {themes.map((theme) => (
          <div
            key={theme.id}
            className="bg-white/80 backdrop-blur-xl border border-black/[0.07] rounded-2xl shadow-sm p-5 group hover:shadow-md transition-shadow"
          >
            {/* Color dot + label */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: theme.color }}
                />
                <h3 className="text-[15px] font-semibold text-gray-900">
                  {theme.label}
                </h3>
              </div>

              {/* Active/Inactive toggle indicator */}
              <button
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors ${
                  theme.active
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-gray-50 text-gray-500 border border-gray-200'
                }`}
              >
                {theme.active ? (
                  <>
                    <Check className="w-3 h-3" /> Active
                  </>
                ) : (
                  <>
                    <X className="w-3 h-3" /> Inactive
                  </>
                )}
              </button>
            </div>

            {/* Description */}
            {theme.description && (
              <p className="text-[13px] text-gray-500 leading-relaxed mb-3 line-clamp-2">
                {theme.description}
              </p>
            )}

            {/* Stats */}
            <div className="flex items-center gap-3 pt-3 border-t border-black/[0.05]">
              <span className="text-[12px] text-gray-400">
                {theme._count.awarenessDays} awareness day
                {theme._count.awarenessDays !== 1 ? 's' : ''}
              </span>
              <span className="text-[12px] text-gray-300">&middot;</span>
              <div className="flex items-center gap-1">
                <span className="text-[12px] text-gray-400">Color:</span>
                <span className="text-[12px] font-mono text-gray-500">
                  {theme.color}
                </span>
              </div>
            </div>
          </div>
        ))}

        {/* Add Theme Card */}
        <div className="bg-white/80 backdrop-blur-xl border-2 border-dashed border-black/[0.1] rounded-2xl p-5 flex flex-col items-center justify-center min-h-[180px] hover:border-[#0071e3]/30 hover:bg-[#0071e3]/[0.02] transition-colors cursor-pointer group">
          <div className="w-10 h-10 rounded-xl bg-gray-100 group-hover:bg-[#0071e3]/10 flex items-center justify-center mb-3 transition-colors">
            <Plus className="w-5 h-5 text-gray-400 group-hover:text-[#0071e3] transition-colors" />
          </div>
          <p className="text-[13px] font-medium text-gray-500 group-hover:text-[#0071e3] transition-colors">
            Add New Theme
          </p>
          <p className="text-[11px] text-gray-400 mt-0.5">
            Label, description &amp; color
          </p>
        </div>
      </div>

      {/* Inline Create Form (placeholder) */}
      <div className="bg-white/80 backdrop-blur-xl border border-black/[0.07] rounded-2xl shadow-sm p-6">
        <h3 className="text-[14px] font-semibold text-gray-900 mb-4">
          Create New Theme
        </h3>
        <form className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-[12px] font-medium text-gray-500 mb-1.5">
              Label
            </label>
            <input
              type="text"
              placeholder="e.g. Neurodiversity"
              className="w-full h-9 px-3 text-[13px] text-gray-700 bg-gray-50 border border-black/[0.07] rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20 focus:border-[#0071e3]/30"
            />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-gray-500 mb-1.5">
              Description
            </label>
            <input
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
                type="color"
                defaultValue="#0071e3"
                className="w-9 h-9 rounded-lg border border-black/[0.07] cursor-pointer"
              />
              <input
                type="text"
                placeholder="#0071e3"
                defaultValue="#0071e3"
                className="flex-1 h-9 px-3 text-[13px] text-gray-700 bg-gray-50 border border-black/[0.07] rounded-lg font-mono placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0071e3]/20 focus:border-[#0071e3]/30"
              />
            </div>
          </div>
          <div className="sm:col-span-3 flex justify-end">
            <Button variant="primary" size="md">
              <Tag className="w-4 h-4" />
              Create Theme
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
