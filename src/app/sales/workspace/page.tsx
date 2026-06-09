import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import WorkspaceClient from './WorkspaceClient'

export default function WorkspacePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 size={32} className="animate-spin text-zinc-300" />
        </div>
      }
    >
      <WorkspaceClient />
    </Suspense>
  )
}
