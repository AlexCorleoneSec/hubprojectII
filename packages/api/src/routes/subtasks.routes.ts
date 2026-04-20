import { NextRequest, NextResponse } from 'next/server'
import * as subtaskService from '../services/subtask.service'
import type { CreateSubtaskInput, UpdateSubtaskInput, CreateTimeLogInput } from '@hubproject/shared'

export async function listSubtasks(taskId: string): Promise<NextResponse> {
  const subtasks = await subtaskService.listByTask(taskId)
  return NextResponse.json(subtasks)
}

export async function createSubtask(taskId: string, req: NextRequest): Promise<NextResponse> {
  const body = (await req.json()) as Omit<CreateSubtaskInput, 'task_id'>
  const subtask = await subtaskService.createSubtask({ ...body, task_id: taskId })
  return NextResponse.json(subtask, { status: 201 })
}

export async function updateSubtask(id: string, req: NextRequest): Promise<NextResponse> {
  const body = (await req.json()) as UpdateSubtaskInput
  const subtask = await subtaskService.updateSubtask(id, body)
  return NextResponse.json(subtask)
}

export async function deleteSubtask(id: string): Promise<NextResponse> {
  await subtaskService.deleteSubtask(id)
  return NextResponse.json({ success: true })
}

export async function listTimeLogs(subtaskId: string): Promise<NextResponse> {
  const logs = await subtaskService.listTimeLogs(subtaskId)
  return NextResponse.json(logs)
}

export async function createTimeLog(subtaskId: string, req: NextRequest): Promise<NextResponse> {
  const body = (await req.json()) as Omit<CreateTimeLogInput, 'subtask_id'>
  const log = await subtaskService.createTimeLog({ ...body, subtask_id: subtaskId })
  return NextResponse.json(log, { status: 201 })
}

export async function deleteTimeLog(id: string): Promise<NextResponse> {
  await subtaskService.deleteTimeLog(id)
  return NextResponse.json({ success: true })
}
