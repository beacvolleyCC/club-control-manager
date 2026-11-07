import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
const source=readFileSync(new URL('../packages/api/src/test-read-client.ts',import.meta.url),'utf8');
const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
const {testRead}=await import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'));
const config={url:'https://szzoubvhlwnojtzqjebc.supabase.co',publishableKey:'test-public-key',accessToken:'test-session'};
test('TEST adapter refuses LIVE project before network call',async()=>{
 await assert.rejects(testRead.teams({...config,url:'https://snqsxlyhontaepembaic.supabase.co'}),/refuses non-TEST/);
});
test('TEST adapter requires authenticated session token',async()=>{
 await assert.rejects(testRead.events({...config,accessToken:''}),/Authenticated TEST session required/);
});
test('TEST adapter only sends GET and uses bearer token',async()=>{
 const original=globalThis.fetch;
 let request;
 try{
 globalThis.fetch=async (url,options)=>{request={url,options};return {ok:true,json:async()=>[]};};
 assert.deepEqual(await testRead.players(config),[]);
 assert.match(request.url,/\/rest\/v1\/players\?/);
 assert.equal(request.options.method,'GET');
 assert.equal(request.options.headers.Authorization,'Bearer test-session');
 assert.equal(request.options.cache,'no-store');
 }finally{globalThis.fetch=original;}
});
