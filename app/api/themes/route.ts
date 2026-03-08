import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const themes = await prisma.theme.findMany({
    orderBy: { label: "asc" },
    select: { id: true, label: true, color: true, active: true },
  })
  return NextResponse.json({ themes })
}
