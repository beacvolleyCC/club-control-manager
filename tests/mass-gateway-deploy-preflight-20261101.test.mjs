import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const configPath='vnext/mass-gateway/wrangler.jsonc';
const raw=fs.readFileSync(configPath,'utf8');
const config=JSON.parse(raw.replace(/^\s*\/\/[^\n]*$/gm,''));
const worker=fs.readFileSync('vnext/mass-gateway/src/worker.mjs','utf8');
const required=[
 'SUPABASE_TEST_SECRET_KEY','TURNSTILE_SECRET','EMAIL_PROOF_SECRET',
 'EMAIL_OTP_PEPPER','RESEND_TEST_API_KEY','TEST_EMAIL_FROM','TEST_ALLOWED_EMAIL'
];
test('gateway config targets ONLY separate disabled TEST Worker',()=>{
 assert.equal(config.name,'cc-mass-gateway-test-beac');
 assert.equal(config.main,'src/worker.mjs');
 assert.equal(config.workers_dev,false);
 assert.equal(config.preview_urls,false);
 assert.equal(config.vars.TEST_ONLY,'true');
 assert.equal(config.vars.SUPABASE_URL,'https://szzoubvhlwnojtzqjebc.supabase.co');
 assert.equal(config.vars.PUBLIC_WRITES_ENABLED,'false');
 assert.equal(config.vars.EMAIL_VERIFICATION_ENABLED,'false');
 assert.equal(config.vars.EMAIL_DELIVERY_ENABLED,'false');
 assert.equal(config.vars.ALLOWED_ORIGIN,'https://cc-player-test-beac.elteroplabda.workers.dev');
 assert.equal(config.vars.TURNSTILE_EXPECTED_HOSTNAME,'cc-player-test-beac.elteroplabda.workers.dev');
 assert.equal(config.route,undefined);
 assert.equal(config.routes,undefined);
 assert.equal(config.triggers,undefined);
 assert.equal(config.assets,undefined);
 assert.doesNotMatch(raw,/snqsxlyhontaepembaic|cc-manager-test-beac|cc-player-test-beac[.]elteroplabda[.]workers[.]dev[\\/]api/i);
});
test('no secret values stored in source, and config declares every expected binding',()=>{
 assert.deepEqual(new Set(config.secrets.required),new Set(required));
 for(const key of required)assert.equal(config.vars[key],undefined,key);
 assert.doesNotMatch(raw,/\bsb_secret_[A-Za-z0-9]{16,}|\bre_[A-Za-z0-9]{20,}|\bsk_[A-Za-z0-9]{20,}/);
 assert.doesNotMatch(worker,/snqsxlyhontaepembaic|BEGIN PRIVATE KEY|DATABASE_URL=/);
 assert.match(worker,/env[.]SUPABASE_URL===DB_ORIGIN/);
 assert.match(worker,/env[.]PUBLIC_WRITES_ENABLED!=='true'/);
 assert.match(worker,/env[.]EMAIL_DELIVERY_ENABLED==='true'/);
});
test('two distinct rate-limit bindings, with supported 60s periods and positive quotas',()=>{
 const rates=config.ratelimits;
 assert.equal(rates.length,2);
 assert.deepEqual(new Set(rates.map(x=>x.name)),new Set(['IP_LIMITER','IDENTITY_LIMITER']));
 assert.equal(new Set(rates.map(x=>x.namespace_id)).size,2);
 for(const rate of rates){
  assert.match(rate.namespace_id,/^[1-9][0-9]*$/);
  assert.ok(Number.isInteger(rate.simple.limit)&&rate.simple.limit>=1&&rate.simple.limit<=100);
  assert.ok([10,60].includes(rate.simple.period));
 }
});
test('health remains read-only and is not confused with authorized feature enablement',()=>{
 assert.match(worker,/GET/);
 assert.match(worker,/publicWritesEnabled:false,readyForLive:false/);
 assert.match(worker,/if\(request.method!=='POST'\)/);
 assert.match(worker,/if\(env.PUBLIC_WRITES_ENABLED!=='true'\|\|!configReady\(env\)\)/);
});

test('manual Cloudflare upload is explicit, TEST-only and cannot deploy automatically',()=>{
 const flow=fs.readFileSync('.github/workflows/upload-mass-gateway-disabled-test-draft-20261101.yml','utf8');
 assert.match(flow,/workflow_dispatch:/);
 assert.doesNotMatch(flow,/^\s+push:/m);
 assert.doesNotMatch(flow,/^\s+schedule:/m);
 assert.match(flow,/inputs[.]confirm == 'UPLOAD_DISABLED_TEST_DRAFT'/);
 assert.match(flow,/github[.]ref == 'refs\/heads\/test\/20261026-manager-document-intake'/);
 assert.match(flow,/CLOUDFLARE_TEST_API_TOKEN/);
 assert.match(flow,/CLOUDFLARE_ACCOUNT_ID/);
 assert.match(flow,/wrangler@4 versions upload --config vnext\/mass-gateway\/wrangler[.]jsonc/);
 const commands=flow.split('\n').filter(x=>/npx .*wrangler@4 /.test(x));
 assert.equal(commands.length,2);
 assert.ok(commands.some(x=>/deploy --dry-run/.test(x)));
 assert.ok(commands.some(x=>/versions upload/.test(x)));
 assert.ok(commands.every(x=>!(/\bdeploy\b/.test(x)&&!/--dry-run/.test(x))));
});
