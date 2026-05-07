export default function EditorLoading() {
  return (
    <div className="flex h-screen bg-[#07101F] text-white">
      <div className="w-14 border-r border-[#1E2A45] bg-[#0B1322]" />
      <div className="flex flex-1 flex-col">
        <div className="h-14 border-b border-[#1E2A45] bg-[#0B1322]" />
        <div className="grid flex-1 grid-cols-[34%_1fr_320px]">
          <div className="animate-pulse border-r border-[#1E2A45] bg-[#0B1322]" />
          <div className="animate-pulse bg-[#07101F] [background-image:radial-gradient(#1E3A5F_1px,transparent_1px)] [background-size:24px_24px]" />
          <div className="animate-pulse border-l border-[#1E2A45] bg-[#0D1424]" />
        </div>
      </div>
    </div>
  )
}
