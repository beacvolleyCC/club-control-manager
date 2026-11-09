import test from 'node:test';
import assert from 'node:assert/strict';

test('Manager TEST OTP connects composed API and clears session on logout',async()=>{
 const previous={document:globalThis.document,window:globalThis.window,fetch:globalThis.fetch,Event:globalThis.Event,CustomEvent:globalThis.CustomEvent};
 const nodes=new Map(),events=[];
 const node=id=>{
  if(!nodes.has(id))nodes.set(id,{value:'',disabled:false,textContent:'',listeners:new Map(),
   setAttribute(){},replaceChildren(){},addEventListener(name,handler){this.listeners.set(name,handler)}});
  return nodes.get(id);
 };
 globalThis.document={getElementById:node};
 globalThis.window={dispatchEvent(event){events.push(event)}};
 globalThis.Event=class{constructor(type){this.type=type}};
 globalThis.CustomEvent=class extends globalThis.Event{constructor(type,options){super(type);this.detail=options.detail}};
 globalThis.fetch=async(url,options)=>{
  assert.match(url,/^https:\/\/szzoubvhlwnojtzqjebc\.supabase\.co\/auth\/v1\//);
  assert.equal(options.cache,'no-store');
  if(url.endsWith('/otp'))return {ok:true,json:async()=>({})};
  if(url.endsWith('/verify'))return {ok:true,json:async()=>({access_token:'fake-token',expires_in:3600})};
  throw new Error('Unexpected auth URL');
 };
 try{
  const auth=await import('../apps/manager/test-auth.js?manager-otp-regression');
  node('authKey').value='public-test-key';
  node('authEmail').value='example@example.test';
  await node('sendOtp').listeners.get('click')();
  node('authOtp').value='123456';
  await node('verifyOtp').listeners.get('click')();
  const sessions=events.filter(e=>e.type==='cc:v2-authenticated-test-session');
  assert.equal(sessions.length,1);
  assert.equal(sessions[0].detail.url,'https://szzoubvhlwnojtzqjebc.supabase.co');
  assert.equal(auth.getTestSession().accessToken,'fake-token');
  node('logoutTest').listeners.get('click')();
  assert.equal(auth.getTestSession(),null);
  assert.equal(events.at(-1).type,'cc:v2-authenticated-test-signout');
 }finally{
  for(const [key,value] of Object.entries(previous)){
   if(value===undefined)delete globalThis[key];else globalThis[key]=value;
  }
 }
});
