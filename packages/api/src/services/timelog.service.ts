import * as repo from '../repositories/timelog.repository'
import type { ProjectTimelogSummary } from '@hubproject/shared'

export async function getProjectTimelogs(
  projectId: string,
  month?: string
): Promise<ProjectTimelogSummary> {
  return repo.findByProject(projectId, month)
}
