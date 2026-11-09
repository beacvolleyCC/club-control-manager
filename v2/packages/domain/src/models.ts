/** Shared domain contracts. These are V2 contracts, not V1 database row shapes. */
export type EntityId = string & { readonly __entityId: unique symbol };
export type ISODateTime = string & { readonly __isoDateTime: unique symbol };
export type UserRole = 'player' | 'coach' | 'team_manager' | 'club_admin';
export type SportArea = 'mass' | 'competition';
export type EventKind = 'training' | 'match' | 'other';
export type RSVPStatus = 'yes' | 'no' | 'unset' | 'waitlisted';
export type AttendanceStatus = 'present' | 'absent' | 'unmarked';
export interface Player { id: EntityId; displayName: string; email?: string | null; }
export interface Team { id: EntityId; name: string; area: SportArea; }
export interface TeamMembership { id: EntityId; playerId: EntityId; teamId: EntityId; activeFrom: ISODateTime; activeUntil?: ISODateTime | null; }
export interface Event { id: EntityId; kind: EventKind; area: SportArea; teamId?: EntityId | null; startsAt: ISODateTime; endsAt: ISODateTime; venueId?: EntityId | null; cancelled: boolean; }
export interface RSVP { id: EntityId; eventId: EntityId; playerId: EntityId; status: RSVPStatus; submittedAt: ISODateTime | null; }
export interface Attendance { eventId: EntityId; playerId: EntityId; status: AttendanceStatus; source: 'coach' | 'auto' | 'import'; correctedAt?: ISODateTime | null; }
export interface PermissionGrant { subjectId: EntityId; role: UserRole; scope: { kind: 'club' } | { kind: 'team'; teamId: EntityId }; resource: string; action: 'view' | 'edit' | 'notify'; }
export interface AuditEvent { id: EntityId; actorId: EntityId | null; entityType: string; entityId: EntityId; operation: string; occurredAt: ISODateTime; before: unknown; after: unknown; }
/** Missing timestamp must remain null, never be silently converted to Unix epoch. */
export function parseOptionalTimestamp(value: string | null | undefined): ISODateTime | null {
  if (value == null || value.trim() === '') return null;
  const ms = Date.parse(value);
  if (!Number.isFinite(ms)) return null;
  return new Date(ms).toISOString() as ISODateTime;
}
export function formatOptionalTimestamp(value: ISODateTime | null, locale = 'hu-HU'): string {
  if (!value) return 'Nincs adat';
  return new Intl.DateTimeFormat(locale, { dateStyle: 'short', timeStyle: 'short', timeZone: 'Europe/Budapest' }).format(new Date(value));
}
