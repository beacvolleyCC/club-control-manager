// TEST-only Player OTP login. Public key and access token remain in memory only.
const HOST='https://szzoubvhlwnojtzqjebc.supabase.co';
const $=id=>document.getElementById(id);
const status=(message,error=false)=>{const node=$('playerAuthStatus');node.textContent=message;node.setAttribute('role',error?'alert':'status');};
let publicKey='sb_publishable_1iOpBTxKteHCgJdNyzXQCA_5gxcFWZB',accessToken='',expiry=0,requestVersion=0;
$('playerAuthKey').value=publicKey;
function signout(){
 requestVersion++;accessToken='';expiry=0;
 window.dispatchEvent(new Event('cc:v2-authenticated-test-signout'));
}
async function request(path,body,key){
 const response=await fetch(HOST+'/auth/v1/'+path,{
  method:'POST',cache:'no-store',
  headers:{apikey:key,'Content-Type':'application/json'},
  body:JSON.stringify(body)
 });
 const result=await response.json().catch(()=>({}));
 if(!response.ok)throw new Error('TEST hitelesítés sikertelen (HTTP '+response.status+')');
 return result;
}
$('playerSendOtp').addEventListener('click',async()=>{
 const key=$('playerAuthKey').value.trim(),email=$('playerAuthEmail').value.trim();
 if(!key||!email){status('Publikus TEST kulcs és email szükséges.',true);return;}
 const version=++requestVersion;const button=$('playerSendOtp');button.disabled=true;
 try{
  await request('otp',{email,create_user:false},key);
  if(version!==requestVersion)return;
  publicKey=key;status('Ha a fiók létezik, a kódot elküldtük.');
 }catch(error){if(version===requestVersion)status(error.message,true)}
 finally{button.disabled=false}
});
$('playerVerifyOtp').addEventListener('click',async()=>{
 const email=$('playerAuthEmail').value.trim(),token=$('playerAuthOtp').value.trim();
 if(!publicKey||!email||!token){status('Előbb kérj kódot, majd add meg.',true);return;}
 const version=++requestVersion;const button=$('playerVerifyOtp');button.disabled=true;
 try{
  const data=await request('verify',{email,token,type:'email'},publicKey);
  if(version!==requestVersion)return;
  const duration=Number(data.expires_in);
  if(!data.access_token||!Number.isFinite(duration)||duration<=0)throw new Error('Érvénytelen TEST munkamenet');
  signout();accessToken=data.access_token;expiry=Date.now()+duration*1000;
  $('playerAuthOtp').value='';status('TEST bejelentkezés sikeres.');
  window.dispatchEvent(new CustomEvent('cc:v2-authenticated-test-session',{
   detail:{url:HOST,publishableKey:publicKey,accessToken}
  }));
 }catch(error){if(version===requestVersion){signout();status(error.message,true)}}
 finally{button.disabled=false}
});
$('playerLogout').addEventListener('click',()=>{
 signout();publicKey='sb_publishable_1iOpBTxKteHCgJdNyzXQCA_5gxcFWZB';
 $('playerAuthKey').value='';$('playerAuthOtp').value='';
 $('playerAuthKey').value=publicKey;
 status('TEST munkamenet törölve.');
});
document.addEventListener('visibilitychange',()=>{
 if(!document.hidden&&accessToken&&Date.now()>=expiry){signout();status('A TEST munkamenet lejárt.',true)}
});
