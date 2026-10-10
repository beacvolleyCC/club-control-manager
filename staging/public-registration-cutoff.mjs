/** Public booking card state, Club Control. Stage-only: wire into the actual public registration UI. */
export const BOOKING_CUTOFF_MINUTES = 120;

/**
 * @param {{ startsAt: string|Date, capacity?:number, activeBookings?:number, waitlistCount?:number,
 * registrationActive?: boolean, waitlistEnabled?: boolean }} event
 * @param {Date} now
 */
export function publicRegistrationState(event, now = new Date()) {
  const start = new Date(event.startsAt);
  if (!Number.isFinite(start.getTime())) return {kind:'unavailable',showFreePlaces:false,freePlaces:null,canBook:false,canJoinWaitlist:false,waitlistCount:null};
  const closed = start.getTime() - now.getTime() <= BOOKING_CUTOFF_MINUTES * 60_000;
  const free = Math.max(0,Math.trunc(Number(event.capacity)||0)-Math.max(0,Math.trunc(Number(event.activeBookings)||0)));
  const waitlistCount = Math.max(0,Math.trunc(Number(event.waitlistCount)||0));
  if (closed) return {kind:'closed',label:'Jelentkezés lezárva',showFreePlaces:false,freePlaces:null,canBook:false,canJoinWaitlist:false,waitlistCount};
  if (event.registrationActive === false) return {kind:'closed-manual',label:'Jelentkezés lezárva',showFreePlaces:false,freePlaces:null,canBook:false,canJoinWaitlist:false,waitlistCount};
  if (free===0) return {kind:'full',label:'Betelt',showFreePlaces:false,freePlaces:0,canBook:false,canJoinWaitlist:event.waitlistEnabled!==false,waitlistCount};
  return {kind:'open',label:'Jelentkezés nyitva',showFreePlaces:true,freePlaces:free,canBook:true,canJoinWaitlist:false,waitlistCount};
}
// IMPORTANT: The server-side 2-hour cutoff must also be deployed and tested before release.
// Existing waitlist entries are preserved; this function does not mutate any data.
