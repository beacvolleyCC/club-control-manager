'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'..');
const app=fs.readFileSync(path.join(root,'app.js'),'utf8');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const worker=fs.readFileSync(path.join(root,'sw.js'),'utf8');
const builder=fs.readFileSync(path.join(root,'scripts/build-cloudflare-test.cjs'),'utf8');
const target='https://cc-manager-test-beac.elteroplabda.workers.dev/';
test('TEST Manager requests default magic links using only the exact isolated callback',()=>{
 assert.ok(app.includes('function ccManagerMagicLinkRedirect_(){return "https://cc-manager-test-beac.elteroplabda.workers.dev/"}'));
 assert.equal((app.match(/emailRedirectTo:ccManagerMagicLinkRedirect_\(\)/g)||[]).length,2);
 assert.equal((app.match(/shouldCreateUser:false,emailRedirectTo:ccManagerMagicLinkRedirect_\(\)/g)||[]).length,2);
 assert.doesNotMatch(app,/signInWithOtp\(\{email,options:\{shouldCreateUser:true/);
 assert.doesNotMatch(app,/snqsxlyhontaepembaic\.supabase\.co/);
});
test('login copy never asks user to type a numeric code for default email templates',()=>{
 assert.match(html,/id="requestCodeBtn" type="button">Belépési link kérése/);
 assert.match(html,/Belépési link elküldve/);
 assert.match(html,/Sign in/);
 assert.doesNotMatch(html,/id="verifyCodeBtn"/);
 assert.doesNotMatch(html,/id="loginCode"/);
 assert.match(html,/id="loginCodeStep" class="login-step hidden"/);
 assert.match(html,/id="resendCodeBtn" type="button">Új link küldése/);
 assert.match(app,/E-mailben belépési linket küldtünk/);
});
test('sign-in callback session detection and Manager scope checking remain enabled',()=>{
 assert.match(app,/detectSessionInUrl:true/);
 assert.match(app,/persistSession:true/);
 assert.match(app,/auth\.getSession\(\)/);
 assert.match(app,/cc_manager_bootstrap_v1/);
 assert.match(app,/A kód jó, de ehhez az emailhez nincs érvényes Manager-hozzáférés/);
});
test('PWA service worker and HTML load the same version for immediate update',()=>{
 const version=/app[.]js[?]v=([^"]+)/.exec(html)?.[1];
 assert.equal(version,'test-20261030-stage24-magiclink-login-v1');
 assert.ok(html.includes('styles.css?v='+version));
 assert.ok(worker.includes("const CACHE='cc-manager-"+version+"'"));
 assert.match(worker,/key\.startsWith\('cc-manager-test-'\)/);
});
test('TEST Supabase only remains wired in generated bundle, not LIVE',()=>{
 assert.match(builder,/DATA_MODE:'supabase'/);
 assert.match(builder,/szzoubvhlwnojtzqjebc\.supabase\.co/);
 assert.match(builder,/sb_publishable_/);
 assert.match(builder,/shouldCreateUser:false/);
 assert.doesNotMatch(builder,/https:\/\/snqsxlyhontaepembaic\.supabase\.co/);
 assert.ok(target.endsWith('workers.dev/'));
});
