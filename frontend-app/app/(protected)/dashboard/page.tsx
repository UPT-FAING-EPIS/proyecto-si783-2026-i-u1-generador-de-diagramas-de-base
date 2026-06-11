'use client'

import { useEffect, useState } from 'react'
import { getProjectsByUser } from '@/lib/backend/actions/projects/list'
import { DashboardPageContent } from '@/components/dashboard/DashboardPageContent'

export default function DashboardPage() {
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProjects() {
      try {
        const data = await getProjectsByUser()
        setProjects(data)
      } catch (error) {
        console.error('Error fetching projects:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchProjects()
  }, [])

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#0A0F1E' }}>
      <DashboardPageContent
        userName="Usuario Local"
        userEmail={undefined}
        userAvatarUrl={null}
        projects={projects}
        currentUserId="local"
        currentUser={null}
      />
    </div>
  )
}
