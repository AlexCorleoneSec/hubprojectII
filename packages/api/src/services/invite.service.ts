import * as inviteRepo from '../repositories/invite.repository'
import * as profileRepo from '../repositories/profile.repository'
import { NotFoundError, ValidationError } from '../lib/errors'
import type { Invite, UserRole } from '@hubproject/shared'

export async function createInvite(
  email: string,
  role: UserRole,
  invitedBy: string
): Promise<Invite> {
  if (!email?.trim()) {
    throw new ValidationError('Email is required')
  }

  const existingProfile = await profileRepo.findByEmail(email)
  if (existingProfile) {
    throw new ValidationError('User with this email already exists')
  }

  const existingInvites = await inviteRepo.findByEmail(email)
  const pendingInvite = existingInvites.find((inv) => !inv.accepted_at)
  if (pendingInvite) {
    throw new ValidationError('A pending invite already exists for this email')
  }

  return inviteRepo.create({ email, role, invited_by: invitedBy })
}

export async function acceptInvite(
  inviteId: string,
  userId: string
): Promise<Invite> {
  const invites = await inviteRepo.findByEmail('')
  // We need to find the invite by ID — fetch it via accept and check
  const invite = await inviteRepo.accept(inviteId)
  if (!invite) throw new NotFoundError('Invite not found')

  // Update the user profile with the invited role
  await profileRepo.update(userId, { role: invite.role })

  return invite
}
