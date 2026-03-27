import { NextRequest, NextResponse } from 'next/server'
import { CreateProjectInput, UpdateProjectInput } from '@hubproject/shared'
import * as projectService from '../services/project.service'

export async function listProjects(): Promise<NextResponse> {
  const projects = await projectService.listProjects()
  return NextResponse.json(projects)
}

export async function createProject(req: NextRequest): Promise<NextResponse> {
  const body = (await req.json()) as CreateProjectInput
  const userId = req.headers.get('x-user-id')!
  const project = await projectService.createProject(body, userId)
  return NextResponse.json(project, { status: 201 })
}

export async function getProject(id: string): Promise<NextResponse> {
  const project = await projectService.getProject(id)
  return NextResponse.json(project)
}

export async function updateProject(
  id: string,
  req: NextRequest
): Promise<NextResponse> {
  const body = (await req.json()) as UpdateProjectInput
  const project = await projectService.updateProject(id, body)
  return NextResponse.json(project)
}

export async function archiveProject(id: string): Promise<NextResponse> {
  const project = await projectService.archiveProject(id)
  return NextResponse.json(project)
}
