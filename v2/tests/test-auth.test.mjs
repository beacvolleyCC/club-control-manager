import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
const js=readFileSync(new URL('../apps/manager/test-auth.js',import.meta.url),'utf8');
const html=readFileSync(new URL('../apps/manager/index.html',import.meta.url),'utf8');
test('OTP does not create unknown users',()=>assert.match(js,/create_user:false/));
test('auth uses TEST host and does not persist token',()=>{assert.match(js,/szzoubvhlwnojtzqjebc\.supabase\.co/);assert.doesNotMatch(js,/localStorage|sessionStorage|indexedDB/);});
test('login controls exist',()=>{for(const id of ['authKey','authEmail','authOtp','sendOtp','verifyOtp','logoutTest','authStatus'])assert.match(html,new RegExp('id="'+id+'"'));});
