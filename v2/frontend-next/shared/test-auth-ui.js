/**
 * Shared TEST OTP login panel for both new PWAs. All session state is in memory.
 * Supabase's current TEST email template must send the numeric code for this flow.
 */
import {createTestAuthSession} from './test-rpc.js';
export function mountTestAuth(root,{onLogin=()=>{},onLogout=()=>{}}={}){
 if(!root)throw new Error('Missing TEST auth mount');
 root.innerHTML='<div class="test-auth-heading"><div><h2>TEST belépés</h2><p>Csak létező TEST-fiók. Valódi adat kizárólag hitelesítés után.</p></div><span class="test-auth-only">TEST</span></div><form class="test-auth-form" novalidate><label>Email<input data-auth-email type="email" autocomplete="email" inputmode="email" maxlength="254" required placeholder="email@example.com"></label><div class="test-auth-actions"><button data-auth-send type="button">Kód kérése</button></div><label>Egyszer használatos kód<input data-auth-code type="text" inputmode="numeric" pattern="[0-9]*" maxlength="10" autocomplete="one-time-code" placeholder="6 számjegy"></label><div class="test-auth-actions"><button data-auth-verify type="button">Belépés</button><button data-auth-logout type="button" class="quiet">Kijelentkezés</button></div></form><p class="test-auth-status" data-auth-status role="status">Nincs TEST munkamenet.</p><p class="cc-muted test-auth-footnote">A munkamenet nem kerül tartós tárolásra; oldalfrissítéskor megszűnik. Nem a LIVE alkalmazás.</p>';
 const get=sel=>root.querySelector(sel),email=get('[data-auth-email]'),code=get('[data-auth-code]'),status=get('[data-auth-status]');
 const send=get('[data-auth-send]'),verify=get('[data-auth-verify]'),logout=get('[data-auth-logout]');
 const auth=createTestAuthSession();
 let uiVersion=0;
 function message(value,error=false){status.textContent=value;status.setAttribute('role',error?'alert':'status')}
 function busy(value){send.disabled=value;verify.disabled=value}
 function signOut(){uiVersion++;auth.clear();busy(false);code.value='';message('Nincs TEST munkamenet.');onLogout()}
 send.addEventListener('click',async()=>{
  const own=++uiVersion;busy(true);message('TEST kódkérés folyamatban…');
  try{const accepted=await auth.requestCode(email.value);if(own===uiVersion&&accepted)message('Ha a fiók létezik, a kódot elküldtük.');}
  catch(error){if(own===uiVersion)message(error.message,true)}
  finally{if(own===uiVersion)busy(false)}
 });
 verify.addEventListener('click',async()=>{
  const own=++uiVersion;busy(true);message('TEST kód ellenőrzése…');
  try{
   const session=await auth.verifyCode(email.value,code.value);
   if(own!==uiVersion||!session)return;
   code.value='';message('TEST munkamenet aktív. Adatok betöltése…');
   onLogin(session);
  }catch(error){if(own===uiVersion){auth.clear();onLogout();message(error.message,true)}}
  finally{if(own===uiVersion)busy(false)}
 });
 logout.addEventListener('click',signOut);
 const onVisible=()=>{if(!document.hidden&&!auth.current()&&status.textContent.includes('aktív')){signOut();message('A TEST munkamenet lejárt. Jelentkezz be újra.',true)}};
 document.addEventListener('visibilitychange',onVisible);
 return Object.freeze({session:()=>auth.current(),signOut,dispose:()=>document.removeEventListener('visibilitychange',onVisible)});
}
