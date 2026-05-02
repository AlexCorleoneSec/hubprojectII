import { ProjectTasksProvider } from './context'

export default function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { id: string }
}) {
  return (
    <ProjectTasksProvider projectId={params.id}>
      {children}
    </ProjectTasksProvider>
  )
}
