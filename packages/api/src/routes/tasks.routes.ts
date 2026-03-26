import { NextRequest, NextResponse } from 'next/server'
import * as taskService from '../services/task.service'

export async function listTasksByProject(
  projectId: string
): Promise<NextResponse> {
  const tasks = await taskService.listTasksByProject(projectId)
  return NextResponse.json(tasks)
}

export async function createTask(req: NextRequest): Promise<NextResponse> {
  const body = await req.json()
  const task = await taskService.createTask(body)
  return NextResponse.json(task, { status: 201 })
}

export async function updateTask(
  id: string,
  req: NextRequest
): Promise<NextResponse> {
  const body = await req.json()
  const task = await taskService.updateTask(id, body)
  return NextResponse.json(task)
}

export async function deleteTask(id: string): Promise<NextResponse> {
  await taskService.deleteTask(id)
  return NextResponse.json({ success: true })
}

export async function reorderTask(
  id: string,
  req: NextRequest
): Promise<NextResponse> {
  const body = await req.json()
  const projectId = body.project_id as string
  const newPosition = body.position as number
  await taskService.reorderTask(projectId, id, newPosition)
  return NextResponse.json({ success: true })
}

export async function approveSuggestion(id: string): Promise<NextResponse> {
  const task = await taskService.approveSuggestion(id)
  return NextResponse.json(task)
}

export async function rejectSuggestion(id: string): Promise<NextResponse> {
  const task = await taskService.rejectSuggestion(id)
  return NextResponse.json(task)
}
