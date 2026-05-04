import { createClient } from '@fluxsql/backend/supabase/server'
import { notFound } from 'next/navigation'
import { PublicDiagramView } from '@/components/public/PublicDiagramView'

interface PublicPageProps {
  params: Promise<{ id: string }>
}

export default async function PublicPage({ params }: PublicPageProps) {
  const { id } = await params
  
  const supabase = await createClient()

  const { data: diagram } = await supabase
    .from('diagrams')
    .select('id, flow_json, name, is_public')
    .eq('project_id', id)
    .eq('is_public', true)
    .single()

  if (!diagram) {
    notFound()
  }

  const flow = diagram.flow_json as { nodes?: any[]; edges?: any[] }

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
