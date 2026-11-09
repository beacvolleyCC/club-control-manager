/** TEST-only Supabase passwordless email OTP, no persisted tokens. */
const host='https://szzoubvhlwnojtzqjebc.supabase.co';
const el=id=>document.getElementById(id);
const status=(s,error=false)=>{el('authStatus').textContent=s;el('authStatus').setAttribute('role',error?'alert':'status');};
let accessToken=null;
let publishableKey=null;
let expiresAt=0;
let sessionVersion=0;
let authAttemptVersion=0;
export function getSessionVersion(){return sessionVersion;}
function clearSession(){authAttemptVersion++;accessToken=null;expiresAt=0;sessionVersion++;window.dispatchEvent(new Event('cc:v2-test-clear'));window.dispatchEvent(new Event('cc:v2-authenticated-test-signout'));}
export function getTestSession(){if(accessToken && Date.now()>=expiresAt){clearSession();status('A TEST munkamenet lejárt. Jelentkezz be újra.',true);}return accessToken && publishableKey ? {accessToken,publishableKey} : null;}
async function authRequest(path,body){
 const response=await fetch(host+'/auth/v1/'+path,{method:'POST',headers:{apikey:publishableKey,'Content-Type':'application/json'},body:JSON.stringify(body),cache:'no-store'});
 const data=await response.json().catch(()=>({}));
 if(!response.ok)throw new Error('TEST Auth HTTP '+response.status);
 return data;
}
el('sendOtp').addEventListener('click',async()=>{
 publishableKey=el('authKey').value.trim();const email=el('authEmail').value.trim();
 if(!publishableKey||!email){status('TEST publikus kulcs és email szükséges.',true);return;}
 const attempt=++authAttemptVersion;
 el('sendOtp').disabled=true;
 try{await authRequest('otp',{email,create_user:false});if(attempt===authAttemptVersion)status('Ha a fiók létezik, az egyszer használatos kódot elküldtük.');}
 catch(e){if(attempt===authAttemptVersion)status(e.message,true);}finally{el('sendOtp').disabled=false;}
});
el('verifyOtp').addEventListener('click',async()=>{
 const email=el('authEmail').value.trim(),token=el('authOtp').value.trim();
 if(!publishableKey||!email||!token){status('Előbb kérj kódot, majd add meg.',true);return;}
 const attempt=++authAttemptVersion;
 el('verifyOtp').disabled=true;
 try{
  const data=await authRequest('verify',{email,token,type:'email'});
  if(attempt!==authAttemptVersion)return;
  if(!data.access_token)throw new Error('Nem érkezett munkamenet-token');
  clearSession();
  accessToken=data.access_token;
  expiresAt=Date.now()+Math.max(0,Number(data.expires_in)||0)*1000;
  if(!Number.isFinite(expiresAt)||expiresAt<=Date.now())throw new Error('Hiányzó vagy érvénytelen lejárati idő');
  el('authOtp').value='';
  status('TEST bejelentkezés sikeres. Az adatok lekérdezhetők.');
  window.dispatchEvent(new CustomEvent('cc:v2-authenticated-test-session',{detail:{url:host,publishableKey,accessToken}}));
 }catch(e){if(attempt===authAttemptVersion){clearSession();status(e.message,true);}}finally{el('verifyOtp').disabled=false;}
});
el('logoutTest').addEventListener('click',()=>{
 clearSession();publishableKey=null;
 for(const id of ['authKey','authOtp'])el(id).value='';
 for(const id of ['testTeams','testEvents'])el(id).replaceChildren();
 status('TEST munkamenet törölve a felületről.');
});
