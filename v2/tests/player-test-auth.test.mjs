import test from 'node:test';
import assert from 'node:assert/strict';

test('Player TEST OTP login publishes session, signout clears it, no persistence',async()=>{
 const previous={document:globalThis.document,window:globalThis.window,fetch:globalThis.fetch,Event:globalThis.Event,CustomEvent:globalThis.CustomEvent};
 const nodes=new Map();
 const element=id=>{
  if(!nodes.has(id))nodes.set(id,{
   value:'',disabled:false,textContent:'',listeners:new Map(),
   setAttribute(){},addEventListener(name,handler){this.listeners.set(name,handler)}
  });
  return nodes.get(id);
 };
 const emitted=[];
 globalThis.document={getElementById:element,addEventListener(){}};
 globalThis.window={dispatchEvent(event){emitted.push(event)}};
 globalThis.Event=class {constructor(type){this.type=type}};
 globalThis.CustomEvent=class extends globalThis.Event {constructor(type,options){super(type);this.detail=options.detail}};
 let calls=0;
 globalThis.fetch=async(url,options)=>{
  calls++;
  assert.match(url,/^https:\/\/szzoubvhlwnojtzqjebc\.supabase\.co\/auth\/v1\//);
  assert.equal(options.cache,'no-store');
  if(url.endsWith('/otp'))return {ok:true,json:async()=>({})};
  if(url.endsWith('/verify'))return {ok:true,json:async()=>({access_token:'fake-token',expires_in:3600})};
  throw new Error('Unexpected auth endpoint');
 };
 try{
  await import('../apps/player/test-auth.js?otp-regression');
  element('playerAuthKey').value='public-test-key';
  element('playerAuthEmail').value='example@example.test';
  await element('playerSendOtp').listeners.get('click')();
  element('playerAuthOtp').value='123456';
  await element('playerVerifyOtp').listeners.get('click')();
  assert.equal(calls,2);
  const sessions=emitted.filter(e=>e.type==='cc:v2-authenticated-test-session');
  assert.equal(sessions.length,1);
  assert.equal(sessions[0].detail.accessToken,'fake-token');
  assert.equal(sessions[0].detail.url,'https://szzoubvhlwnojtzqjebc.supabase.co');
  assert.equal(element('playerAuthOtp').value,'');
  element('playerLogout').listeners.get('click')();
  assert.equal(emitted.at(-1).type,'cc:v2-authenticated-test-signout');
  assert.equal(element('playerAuthKey').value,'');
 }finally{
  for(const [key,value] of Object.entries(previous)){
   if(value===undefined)delete globalThis[key];else globalThis[key]=value;
  }
 }
});
