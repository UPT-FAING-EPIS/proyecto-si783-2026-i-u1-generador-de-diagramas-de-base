import { createClient } from '@fluxsql/backend/supabase/server'
import { notFound } from 'next/navigation'
import { PublicDiagramView } from '@/components/public/PublicDiagramView'
import { db } from '@fluxsql/backend/db'
import { diagrams } from '@fluxsql/backend/schema'
import { eq, and } from 'drizzle-orm'
interface PublicPageProps {
  params: Promise<{ id: string }>
}

export default async function PublicPage({ params }: PublicPageProps) {
  const { id } = await params
  
  const [diagram] = await db
    .select({
      id: diagrams.id,
      name: diagrams.name,
      flowJson: diagrams.flowJson,
      isPublic: diagrams.isPublic,
    })
    .from(diagrams)
    .where(
      and(
        eq(diagrams.projectId, id),
        eq(diagrams.isPublic, true)
      )
    )
    .limit(1)

  if (!diagram) {
    notFound()
  }

  let rawFlow = diagram.flowJson
  if (typeof rawFlow === 'string') {
    try {
      rawFlow = JSON.parse(rawFlow)
    } catch (e) {
      console.error("Failed to parse flowJson:", e)
    }
  }
  const flow = (rawFlow || {}) as { nodes?: any[]; edges?: any[] }

  return (
    <div className="h-screen w-full flex flex-col bg-[#0A0F1E] text-white">
      <header className="h-12 border-b border-[#1E2A45] bg-[#111827] flex items-center px-4 shrink-0">
        <h1 className="font-semibold text-[#E2E8F0]">{diagram.name}</h1>
        <span className="ml-4 px-2 py-0.5 text-xs bg-[#1E2A45] text-[#94A3B8] rounded border border-[#334155]">
          Solo lectura
        </span>
      </header>

      <main className="flex-1 relative min-h-0">
        <PublicDiagramView flowJson={flow} />
      </main>
    </div>
  )
}
