import test from 'node:test';
import assert from 'node:assert/strict';
import {createI18n,formatMessage,normalizeLocale,intlLocale} from '../frontend-next/shared/i18n-core.js';
import {OFFLINE_HU} from '../frontend-next/shared/i18n-offline-hu.js';
import {createTestI18n} from '../frontend-next/shared/i18n-test-loader.js';

const bundle=(locale,revision,messages)=>({
 schemaVersion:1,locale,revision,fallbackLocale:'hu',
 languages:[{code:'hu',nativeName:'Magyar'},{code:'en',nativeName:'English (UK)'}],messages
});
test('Common Manager/Player renderer keeps offline Hungarian fallback',()=>{
 const i=createI18n({offlineHu:OFFLINE_HU});
 assert.equal(i.t('common.save'),'Mentés');
 assert.equal(i.t('player.attending'),'Jövök');
 assert.equal(i.t('missing.name'),'missing.name');
 assert.equal(i.setLanguage('de'),'hu');
 assert.equal(i.setLanguage('en-GB'),'en');
 assert.equal(i.t('common.save'),'Mentés');
 assert.equal(normalizeLocale('EN_GB',['hu','en']),'en');
 assert.equal(intlLocale('en'),'en-GB');
});
test('Published bundle and revisions preserve newer values and user language',()=>{
 const i=createI18n({offlineHu:OFFLINE_HU});
 const messages={'common.save':'Save','player.attending':"I'll attend",
 'common.itemsCount':'{count, plural, one {# item} other {# items}}'};
 assert.equal(i.installBundle(bundle('en',3,messages)),true);
 i.setLanguage('en');
 assert.equal(i.t('common.save'),'Save');
 assert.equal(i.t('player.attending'),"I'll attend");
 assert.equal(i.t('common.itemsCount',{count:1}),'1 item');
 assert.equal(i.t('common.itemsCount',{count:5}),'5 items');
 assert.equal(i.date('2026-11-11T12:00:00Z',{dateStyle:'long',timeZone:'UTC'}),'11 November 2026');
 assert.equal(i.installBundle(bundle('en',2,{'common.save':'Old value'})),false);
 assert.equal(i.t('common.save'),'Save');
 assert.equal(i.getRevision('en'),3);
 i.setLanguage('hu');
 assert.equal(i.t('common.save'),'Mentés');
 assert.equal(i.number(1234.5,{minimumFractionDigits:1,maximumFractionDigits:1}),new Intl.NumberFormat('hu-HU',{minimumFractionDigits:1,maximumFractionDigits:1}).format(1234.5));
});
test('Message placeholders never modify data enums or usernames',()=>{
 assert.equal(formatMessage('Hello {person}',{person:'Réka'},'en'),'Hello Réka');
 assert.equal(formatMessage('Missing {name} and {name2}',{},'hu'),'Missing {name} and {name2}');
 assert.equal(formatMessage('{count, plural, one {# elem} other {# elem}}',{count:4},'hu'),'4 elem');
});
test('Malformed payload does not override published translation',()=>{
 const i=createI18n({offlineHu:OFFLINE_HU});
 assert.throws(()=>i.installBundle({locale:'en',revision:1,messages:{}}),/INVALID_BUNDLE/);
 assert.throws(()=>i.installBundle(bundle('fr',1,{'common.save':'Enregistrer'})),/INVALID_LOCALE/);
 assert.throws(()=>i.installBundle(bundle('en',0,{'common.save':'Save'})),/INVALID_REVISION/);
});
test('Network read uses fixed TEST RPC, no mutation, no LIVE origin; offline fallback works',async()=>{
 const calls=[];
 const request=async (url,options)=>{
  calls.push({url,options});
  return {ok:true,json:async()=>bundle('en',2,{'common.save':'Save'})};
 };
 const i=createTestI18n({request});
 const outcome=await i.refresh('en');
 assert.equal(outcome.loaded,true);
 assert.equal(calls.length,1);
 assert.match(calls[0].url,/^https:\/\/szzoubvhlwnojtzqjebc\.supabase\.co\/rest\/v1\/rpc\/cc_v2_i18n_bundle_v1$/);
 assert.equal(calls[0].options.method,'POST');
 assert.equal(JSON.parse(calls[0].options.body).p_locale,'en');
 assert.doesNotMatch(JSON.stringify(calls),/snqsxlyhontaepembaic|service_role/);
 i.setLanguage('en');
 assert.equal(i.t('common.save'),'Save');
 const offline=createTestI18n({request:async()=>{throw Error('Offline')}});
 assert.equal((await offline.refresh('en')).loaded,false);
 assert.equal(offline.t('common.save'),'Mentés');
});
test('Late response cannot overwrite more recent bundle',async()=>{
 let resolveOld;
 const request=(url,{body})=>JSON.parse(body).p_locale==='en'
  ? new Promise(resolve=>{resolveOld=resolve})
  :Promise.resolve({ok:true,json:async()=>bundle('hu',5,{'common.save':'Mentés'})});
 const i=createTestI18n({request});
 const older=i.refresh('en');
 const newer=await i.refresh('hu');
 assert.equal(newer.loaded,true);
 resolveOld({ok:true,json:async()=>bundle('en',6,{'common.save':'Unexpected'})});
 const stale=await older;
 assert.equal(stale.stale,true);
 assert.equal(i.getRevision('en'),0);
});
