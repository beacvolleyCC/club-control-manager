/**
 * Club Control V2 shared i18n runtime (Manager and Player).
 * Pure ESM: no network calls, no auth, no writes, no DOM mutations.
 * Bundles may only add published UI copy; business enums and identifiers never change.
 */
const DEFAULT_LOCALE='hu';
const SUPPORTED_CODE=/^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$/;
const own=(obj,key)=>Object.prototype.hasOwnProperty.call(obj,key);

export function normalizeLocale(code,available=['hu','en']){
 const requested=String(code||'').trim().toLowerCase().replace(/_/g,'-');
 const codes=new Set(available.map(x=>String(x).toLowerCase()));
 if(codes.has(requested))return requested;
 const base=requested.split('-')[0];
 return codes.has(base)?base:DEFAULT_LOCALE;
}
export function intlLocale(locale){
 const map={hu:'hu-HU',en:'en-GB'};
 return map[locale]||locale;
}
function formatPlural(template,params,locale){
 // ICU subset supported by the initial DB seed: {count, plural, one {# item} other {# items}}.
 // Nested/select ICU expressions must use a full ICU parser before being published.
 const pattern=/\{([a-zA-Z_]\w*),\s*plural,\s*((?:(?:=?\d+|zero|one|two|few|many|other)\s*\{[^{}]*\}\s*)+)\}/g;
 return template.replace(pattern,(whole,name,options)=>{
  const amount=Number(params?.[name]);
  if(!Number.isFinite(amount))return whole;
  const choices=Object.create(null);
  for(const match of options.matchAll(/(=?\d+|zero|one|two|few|many|other)\s*\{([^{}]*)\}/g))choices[match[1]]=match[2];
  const category=new Intl.PluralRules(intlLocale(locale)).select(amount);
  const message=choices['='+amount]??choices[category]??choices.other;
  if(message===undefined)return whole;
  return message.replace(/#/g,new Intl.NumberFormat(intlLocale(locale)).format(amount));
 });
}
export function formatMessage(template,params={},locale='hu'){
 const plurals=formatPlural(String(template??''),params,locale);
 return plurals.replace(/\{([a-zA-Z_]\w*)\}/g,(whole,key)=>own(params,key)?String(params[key]):whole);
}
export function createI18n({offlineHu={},offlineEn={},initialLocale='hu'}={}){
 const fallback=Object.freeze({...offlineHu});
 const fallbackEn=Object.freeze({...offlineEn});
 const bundles=new Map();
 let languages=['hu','en'],current=normalizeLocale(initialLocale,languages);
 let versionByLocale=new Map(),listeners=new Set();
 const notify=()=>{for(const fn of listeners)fn(current)};
 function setLanguage(value){
  const next=normalizeLocale(value,languages);
  if(next!==current){current=next;notify()}
  return current;
 }
 function installBundle(bundle){
  if(!bundle||typeof bundle!=='object'||!Array.isArray(bundle.languages)||!bundle.messages||typeof bundle.messages!=='object'||Array.isArray(bundle.messages))throw Error('CC_I18N_INVALID_BUNDLE');
  const codes=bundle.languages.map(x=>x&&x.code).filter(x=>typeof x==='string'&&SUPPORTED_CODE.test(x.toLowerCase())).map(x=>x.toLowerCase());
  if(!codes.includes('hu')||!codes.includes(String(bundle.locale).toLowerCase()))throw Error('CC_I18N_INVALID_LOCALE');
  if(!Number.isSafeInteger(bundle.revision)||bundle.revision<1)throw Error('CC_I18N_INVALID_REVISION');
  const locale=String(bundle.locale).toLowerCase(),prior=versionByLocale.get(locale)||0;
  if(bundle.revision<prior)return false; // stale requests cannot overwrite newer published text.
  const safe=Object.create(null);
  for(const [key,value] of Object.entries(bundle.messages)){
   if(!/^[a-z][a-zA-Z0-9_]*(?:\.[a-z][a-zA-Z0-9_]*)+$/.test(key)||typeof value!=='string')continue;
   safe[key]=value;
  }
  languages=[...new Set(codes)];
  bundles.set(locale,safe);
  versionByLocale.set(locale,bundle.revision);
  const normalized=normalizeLocale(current,languages);
  if(current!==normalized)current=normalized;
  notify();
  return true;
 }
 function t(key,params){
  const name=String(key);
  const active=bundles.get(current);
  const source=bundles.get('hu');
  const template=(active&&own(active,name)?active[name]:undefined)
   ?? (current==='en'&&own(fallbackEn,name)?fallbackEn[name]:undefined)
   ?? (source&&own(source,name)?source[name]:undefined)
   ?? (own(fallback,name)?fallback[name]:name);
  return formatMessage(template,params,current);
 }
 function date(value,options={dateStyle:'medium',timeZone:'Europe/Budapest'}){
  return new Intl.DateTimeFormat(intlLocale(current),options).format(new Date(value));
 }
 function number(value,options){return new Intl.NumberFormat(intlLocale(current),options).format(value)}
 function onLanguageChange(fn){listeners.add(fn);return()=>listeners.delete(fn)}
 return Object.freeze({t,date,number,setLanguage,getLanguage:()=>current,
  installBundle,onLanguageChange,getRevision:locale=>versionByLocale.get(locale)||0,
  availableLanguages:()=>[...languages]});
}
