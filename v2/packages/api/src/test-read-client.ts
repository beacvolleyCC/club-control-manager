/** V2 read-only TEST adapter. Auth token must come from an authenticated Supabase session. */
export interface TestReadConfig { url: string; publishableKey: string; accessToken: string; }
export interface LegacyTeam { id: string; name: string; active: boolean | null; }
export interface LegacyEvent { id: string; team_id: string | null; title: string | null; event_type: string | null; starts_at: string; ends_at: string | null; venue: string | null; status: string | null; }
export interface LegacyPlayer { id: string; display_name: string | null; name: string; position: string | null; active: boolean | null; }
function validate(config: TestReadConfig): string {
 const url=new URL(config.url);
 if(url.protocol!=='https:' || url.hostname!=='szzoubvhlwnojtzqjebc.supabase.co') throw new Error('V2 TEST adapter refuses non-TEST Supabase hosts');
 if(!config.publishableKey || !config.accessToken) throw new Error('Authenticated TEST session required');
 return url.origin;
}
async function readRows<T>(config: TestReadConfig, table: string, query: string): Promise<T[]> {
 const origin=validate(config);
 const response=await fetch(origin+'/rest/v1/'+table+'?'+query, {method:'GET',headers:{'apikey':config.publishableKey,'Authorization':'Bearer '+config.accessToken,'Accept':'application/json'},cache:'no-store'});
 if(!response.ok) throw new Error('TEST read failed ('+response.status+'); verify RLS and permissions');
 const body: unknown=await response.json();
 if(!Array.isArray(body)) throw new Error('Unexpected TEST response');
 return body as T[];
}
export const testRead={
 teams:(c:TestReadConfig)=>readRows<LegacyTeam>(c,'teams','select=id,name,active&order=name.asc&limit=100'),
 events:(c:TestReadConfig)=>readRows<LegacyEvent>(c,'events','select=id,team_id,title,event_type,starts_at,ends_at,venue,status&order=starts_at.asc&limit=100'),
 players:(c:TestReadConfig)=>readRows<LegacyPlayer>(c,'players','select=id,display_name,name,position,active&order=name.asc&limit=100')
};
