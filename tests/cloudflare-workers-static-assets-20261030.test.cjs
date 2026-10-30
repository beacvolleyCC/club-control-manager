'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
test('Workers static hosting is isolated and named for the correct TEST app', () => {
 const config = JSON.parse(fs.readFileSync(path.join(root,'wrangler.jsonc'),'utf8'));
 assert.equal(config.name,"cc-manager-test-beac");
 assert.equal(config.workers_dev,true);
 assert.equal(config.assets.directory,'./dist-test');
 assert.equal(config.assets.not_found_handling,'single-page-application');
 assert.equal(config.compatibility_date,'2026-10-30');
 assert.equal(config.main,undefined);
 assert.equal(config.route,undefined);
 assert.equal(config.routes,undefined);
 assert.equal(config.triggers,undefined);
});
test('builder uses only isolated TEST Supabase and static public assets', () => {
 const build = fs.readFileSync(path.join(root,'scripts/build-cloudflare-test.cjs'),'utf8');
 assert.match(build,/szzoubvhlwnojtzqjebc\.supabase\.co/);
 assert.match(build,/sb_publishable_/);
 assert.match(build,/dist-test/);
 assert.match(build,/snqsxlyhontaepembaic\|sb_secret_\|service_role/);
 assert.match(build,/PASS:/);
});
