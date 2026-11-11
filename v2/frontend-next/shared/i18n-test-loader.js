/**
 * The only remote translation source for V2 TEST. The endpoint is fixed to the
 * existing TEST Supabase project, never LIVE. No JWT or write permission needed.
 * UI will use bundled HU text when offline or the RPC is unavailable.
 */
import {TEST_ORIGIN,TEST_PUBLISHABLE_KEY} from './test-rpc.js';
import {createI18n} from './i18n-core.js';
import {OFFLINE_HU} from './i18n-offline-hu.js';

export async function fetchPublishedTestBundle(locale,{request=fetch,signal}={}){
 const requested=String(locale||'hu').trim().toLowerCase();
 if(!/^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$/.test(requested))throw Error('CC_I18N_INVALID_LOCALE');
 const response=await request(TEST_ORIGIN+'/rest/v1/rpc/cc_v2_i18n_bundle_v1',{
  method:'POST',
  headers:{apikey:TEST_PUBLISHABLE_KEY,'Content-Type':'application/json',Accept:'application/json'},
  cache:'no-store',
  body:JSON.stringify({p_locale:requested}),
  signal
 });
 if(!response.ok)throw Error('CC_I18N_TEST_RPC_'+response.status);
 return response.json();
}
export function createTestI18n({offlineEn={},request=fetch,initialLocale='hu'}={}){
 const engine=createI18n({offlineHu:OFFLINE_HU,offlineEn,initialLocale});
 let requestEpoch=0;
 async function refresh(locale=engine.getLanguage(),{signal}={}){
  const token=++requestEpoch;
  try{
   const bundle=await fetchPublishedTestBundle(locale,{request,signal});
   if(token!==requestEpoch)return {loaded:false,stale:true};
   engine.installBundle(bundle);
   return {loaded:true,locale:engine.getLanguage(),revision:engine.getRevision(bundle.locale)};
  }catch(error){
   // Offline fallback is intentional; do not replace Hungarian UI with a network error.
   return {loaded:false,error:String(error?.message||error)};
  }
 }
 return Object.freeze({...engine,refresh,cancelPending:()=>{requestEpoch++}});
}
