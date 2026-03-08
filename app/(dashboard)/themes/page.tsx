import { prisma } from '@/lib/prisma'
import { Plus } from 'lucide-react'
import { ThemeCard } from '@/components/themes/theme-card'
import { CreateThemeForm } from '@/components/themes/create-theme-form'

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
          <ThemeCard key={theme.id} theme={theme} />
        ))}

        {/* Add Theme Card (scroll anchor) */}
        <a href="#create-theme" className="block">
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
        </a>
      </div>

      {/* Create Theme Form */}
      <div id="create-theme">
        <CreateThemeForm />
      </div>
    </div>
  )
}
