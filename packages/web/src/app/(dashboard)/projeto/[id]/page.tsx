import { redirect } from 'next/navigation'

export default function ProjectPage({ params }: { params: { id: string } }) {
  redirect(`/projeto/${params.id}/kanban`)
}
