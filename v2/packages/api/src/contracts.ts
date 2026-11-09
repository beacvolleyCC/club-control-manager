import type { EntityId, Event, RSVP, Attendance, PermissionGrant } from '../../domain/src/models.js';
import { canAccess } from '../../domain/src/authorization.js';

export type ApiErrorCode = 'UNAUTHENTICATED' | 'FORBIDDEN' | 'NOT_FOUND' | 'CONFLICT' | 'VALIDATION_ERROR';
export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: { code: ApiErrorCode; message: string } };
export interface ActorContext { userId: EntityId | null; grants: readonly PermissionGrant[]; }
export interface EventReader { getEvent(id: EntityId): Promise<Event | null>; }
export interface EventWriter { setRSVP(eventId: EntityId, playerId: EntityId, status: RSVP['status'], idempotencyKey: string): Promise<RSVP>; setAttendance(eventId: EntityId, playerId: EntityId, status: Attendance['status'], idempotencyKey: string): Promise<Attendance>; }
export interface EventRepository extends EventReader, EventWriter {}

/** Reference application service; server must verify actor and team-scoped grants. */
export async function readEvent(ctx: ActorContext, repo: EventReader, id: EntityId): Promise<ApiResult<Event>> {
  if (!ctx.userId) return { ok: false, error: { code: 'UNAUTHENTICATED', message: 'Login required' } };
  const event = await repo.getEvent(id);
  if (!event) return { ok: false, error: { code: 'NOT_FOUND', message: 'Event not found' } };
  if (!canAccess(ctx.grants, { subjectId: ctx.userId, resource: 'events', action: 'view', teamId: event.teamId }))
    return { ok: false, error: { code: 'FORBIDDEN', message: 'No event access' } };
  return { ok: true, data: event };
}
