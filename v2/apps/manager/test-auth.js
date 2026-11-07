/** TEST-only Supabase passwordless email OTP, no persisted tokens. */
const host='https://szzoubvhlwnojtzqjebc.supabase.co';
const el=id=>document.getElementById(id);
const status=(s,error=false)=>{el('authStatus').textContent=s;el('authStatus').setAttribute('role',error?'alert':'status');};
let accessToken=null;
let publishableKey=null;
export function getTestSession(){return accessToken && publishableKey ? {accessToken,publishableKey} : null;}
async function authRequest(path,body){
 const response=await fetch(host+'/auth/v1/'+path,{method:'POST',headers:{apikey:publishableKey,'Content-Type':'application/json'},body:JSON.stringify(body),cache:'no-store'});
 const data=await response.json().catch(()=>({}));
 if(!response.ok)throw new Error('TEST Auth HTTP '+response.status);
 return data;
}
el('sendOtp').addEventListener('click',async()=>{
 publishableKey=el('authKey').value.trim();const email=el('authEmail').value.trim();
 if(!publishableKey||!email){status('TEST publikus kulcs és email szükséges.',true);return;}
 el('sendOtp').disabled=true;
 try{await authRequest('otp',{email,create_user:false});status('Ha a fiók létezik, az egyszer használatos kódot elküldtük.');}
 catch(e){status(e.message,true);}finally{el('sendOtp').disabled=false;}
});
el('verifyOtp').addEventListener('click',async()=>{
 const email=el('authEmail').value.trim(),token=el('authOtp').value.trim();
 if(!publishableKey||!email||!token){status('Előbb kérj kódot, majd add meg.',true);return;}
 el('verifyOtp').disabled=true;
 try{
  const data=await authRequest('verify',{email,token,type:'email'});
  if(!data.access_token)throw new Error('Nem érkezett munkamenet-token');
  accessToken=data.access_token;
  el('authOtp').value='';
  status('TEST bejelentkezés sikeres. Az adatok lekérdezhetők.');
 }catch(e){accessToken=null;status(e.message,true);}finally{el('verifyOtp').disabled=false;}
});
el('logoutTest').addEventListener('click',()=>{
 accessToken=null;publishableKey=null;
 for(const id of ['authKey','authOtp'])el(id).value='';
 for(const id of ['testTeams','testEvents'])el(id).replaceChildren();
 status('TEST munkamenet törölve a felületről.');
});
