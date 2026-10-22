// Club Control read-only subscription endpoint. Not deployed yet.
// Supabase Edge Function MUST use verify_jwt=false for Apple (which sends no JWT).
// Every request still verifies the private bearer secret through a service-role-only RPC.
import { createClient } from "npm:@supabase/supabase-js@2.116.0";
import { createCalendarHandler } from './handler.mjs';

const url=Deno.env.get('SUPABASE_URL')||'';
const key=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')||'';
const admin=url&&key
  ? createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}})
  : null;
// Never log requests, URLs or their token query parameters.
Deno.serve(createCalendarHandler(admin));
