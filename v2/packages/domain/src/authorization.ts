import type { EntityId, PermissionGrant } from './models.js';

/** Pure permission evaluator. The API/database must enforce the same rules independently. */
export interface AccessRequest {
  subjectId: EntityId;
  resource: string;
  action: PermissionGrant['action'];
  teamId?: EntityId | null;
}
export function canAccess(grants: readonly PermissionGrant[], request: AccessRequest): boolean {
  return grants.some(grant =>
    grant.subjectId === request.subjectId &&
    grant.resource === request.resource &&
    grant.action === request.action &&
    (grant.scope.kind === 'club' ||
      (request.teamId != null && grant.scope.teamId === request.teamId))
  );
}
