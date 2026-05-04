import { db } from '../../db'
import { projects, collaborators, users } from '../../db/schema'
import { eq, desc } from 'drizzle-orm'
import { createClient } from '../../supabase/server'

import { sql } from 'drizzle-orm'

export async function getProjectsByUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const [dbUser] = await db.select().from(users).where(eq(users.authId, user.id)).limit(1)
  if (!dbUser) return []

  const userProjects = await db
    .select({
      project: projects,
      role: collaborators.role,
      members: sql<{id: string, name: string}[]>`(
        SELECT json_agg(json_build_object('id', u.id, 'name', u.name))
        FROM ${collaborators} c
        JOIN ${users} u ON u.id = c.user_id
        WHERE c.project_id = ${projects.id}
      )`
    })
    .from(projects)
    .innerJoin(collaborators, eq(collaborators.projectId, projects.id))
    .where(eq(collaborators.userId, dbUser.id))
    .orderBy(desc(projects.updatedAt))

  return userProjects
}
