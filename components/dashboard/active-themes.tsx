import { prisma } from '@/lib/prisma'
import { Card, CardHeader, CardBody } from '@/components/ui/card'
import { ThemeChip } from '@/components/ui/theme-chip'

export default async function ActiveThemes() {
  const themes = await prisma.theme.findMany({
    where: { active: true },
    orderBy: { label: 'asc' },
    include: {
      _count: {
        select: { awarenessDays: true },
      },
    },
  })

  return (
    <Card>
      <CardHeader
        title="Active Themes"
        action={{ label: 'Manage', href: '/themes' }}
      />
      <CardBody>
        {themes.length === 0 && (
          <p className="text-[13px] text-gray-400 py-4 text-center">
            No active themes configured.
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          {themes.map((theme) => (
            <ThemeChip
              key={theme.id}
              label={`${theme.label} (${theme._count.awarenessDays})`}
              color={theme.color}
              active
            />
          ))}
        </div>
      </CardBody>
    </Card>
  )
}
