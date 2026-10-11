import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { Script, runInNewContext } from "node:vm";

const read = file => readFileSync(new URL("../" + file, import.meta.url), "utf8");
const app=read("app.js"),css=read("hu-picker.css"),picker=read("hu-picker.js"),
      html=read("index.html"),sw=read("sw.js");
function qaHelpers(){
 const window={};
 runInNewContext(picker,{
   window,document:{readyState:"loading",addEventListener(){},documentElement:{}},
   MutationObserver:class{observe(){}},
   Date,Intl,Object,Math,Number,String,Array,RegExp,Symbol
 },{timeout:3000});
 return window.__ccHungarianPickerQA;
}
const qa=qaHelpers();
const b=app.indexOf("  function massLevelColor(");
const e=app.indexOf("  function hexRgb(",b);
assert.ok(b>0 && e>b,"Missing mass color selector");
const massColor=new Function("text",app.slice(b,e)+"\nreturn massLevelColor;")(v=>String(v??"").trim());

test("all three Manager JavaScript assets parse without execution",()=>{
 for(const file of [app,picker,sw])new Script(file);
});
test("original main scoreboard and volleyball core scripts retained",()=>{
 for(const file of ["scoreboard.js","scoreboard.css","volleyball-core.js","volleyball-ui.js","volleyball.css"]){
  assert.ok(sw.includes("'./"+file+"'"),"Missing PWA core "+file);
  assert.ok(read(file).length>200,"Missing scoreboard asset "+file);
 }
});
test("main app still includes volleyball scoreboard navigation",()=>{
 assert.ok(app.toLowerCase().includes("számláló"));
});
test("HTML declares Hungarian locale",()=>assert.match(html,/<html lang="hu">/));
test("both picker assets are loaded by HTML",()=>{
 assert.match(html,/href="\.\x2fhu-picker\.css"/);
 assert.match(html,/src="\.\x2fhu-picker\.js"/);
});
test("PWA precaches both picker assets and has a fresh cache identity",()=>{
 for(const file of ["hu-picker.css","hu-picker.js"]){
  assert.ok(sw.includes("'./"+file+"'"));
 }
 assert.match(sw,/cc-manager-hu-picker-hotfix-2026-10-12a/);
});
test("date and time inputs remain native beneath the overlay",()=>{
 assert.match(app,/id="meDate" type="date"/);
 assert.match(app,/id="meStart" type="time"/);
 assert.match(app,/id="meEnd" type="time"/);
 assert.match(app,/id="ceDate" type="date"/);
});
test("dynamic Manager dialogs are supported",()=>{
 assert.match(picker,/new MutationObserver\(schedule\)/);
 assert.match(picker,/document\.querySelectorAll\('input\[type="time"\],input\[type="date"\]'\)/);
});
test("underlying native fields are kept for server-side form validation",()=>{
 assert.match(picker,/field\.dispatchEvent\(new Event\("input"/);
 assert.match(picker,/field\.dispatchEvent\(new Event\("change"/);
 assert.match(picker,/button\.disabled=input\.disabled/);
});
test("Monday is first weekday in localized date picker",()=>{
 assert.match(picker,/\["H", "K", "Sze", "Cs", "P", "Szo", "V"\]/);
 assert.equal(qa.mondayOffset("2026-10-12"),0);
});
test("Sunday has Monday-first grid offset 6",()=>assert.equal(qa.mondayOffset("2026-10-11"),6));
test("date helper validates leap days",()=>{
 assert.ok(qa.asDate("2028-02-29"));
 assert.equal(qa.asDate("2027-02-29"),null);
});
test("Budapest-local today is explicitly used instead of browser locale",()=>{
 assert.match(picker,/timeZone:"Europe\/Budapest"/);
});
test("HU date output is not US MM/DD/YYYY",()=>{
 const v=qa.dateText("2026-10-12");
 assert.match(v,/2026/);
 assert.ok(!v.includes("/"));
 assert.ok(v.includes("10"));
});
test("24h text accepts 23:59",()=>assert.equal(qa.timeText("23:59"),"23:59"));
test("12-hour AM/PM is rejected",()=>assert.equal(qa.timeText("07:30 PM"),"Időpont kiválasztása"));
test("exact midnight represented with 00:00",()=>assert.equal(qa.timeText("00:00"),"00:00"));
test("48 chronological half-hour presets with exact-minute override",()=>{
 assert.match(picker,/i<48;i\+\+/);
 assert.match(picker,/i%2\?"30":"00"/);
 assert.match(picker,/Percenkénti beállítás/);
});
test("precise wheels support 24 hours and 60 minutes",()=>{
 assert.match(picker,/makeWheel\("Óra",24/);
 assert.match(picker,/makeWheel\("Perc",60/);
});
test("scroll and keyboard adjustment supported",()=>{
 assert.match(picker,/addEventListener\("scroll"/);
 assert.match(picker,/ArrowDown:1,ArrowUp:-1/);
});
test("wheel controls respect hidden attributes and reduced motion",()=>{
 assert.match(css,/\.cc-hu-wheels\[hidden\]/);
 assert.match(css,/prefers-reduced-motion:reduce/);
});
test("Kezdő color remains blue",()=>assert.equal(massColor({level:"Kezdő"}),"#4B91E1"));
test("Középhaladó color remains red",()=>assert.equal(massColor({level:"Középhaladó"}),"#DE4F4F"));
test("Haladó color remains dark",()=>assert.equal(massColor({level:"Haladó"}),"#292929"));
test("mixed hyphen/en dash labels remain purple",()=>{
 assert.equal(massColor({level:"Középhaladó–Haladó"}),"#8856CD");
 assert.equal(massColor({level:"KÖZÉPHALADÓ-HALADÓ"}),"#8856CD");
});
test("saved custom event color is not overridden",()=>{
 assert.equal(massColor({level:"Kezdő",color:"#aBc123"}),"#aBc123");
});
test("legacy missing-color events have a colored fallback instead of gray",()=>{
 assert.notEqual(massColor({level:"Kezdő",color:null}),"#787878");
 assert.equal(massColor({level:"Kezdő",color:null}),"#4B91E1");
});
test("both Mass calendar/list color dots use the same level fallback",()=>{
 assert.ok((app.match(/background:\$\{esc\(massLevelColor\(e\)\)\}/g)||[]).length>=2);
});
test("edzés editor still has the original level, palette and manual color change",()=>{
 assert.match(app,/id="meLevel"/);
 assert.match(app,/id="meColor"/);
 assert.match(app,/data-cc-mass-color/);
 assert.match(app,/ccColorField\.dataset\.ccManual/);
});
test("all preset palettes exist and are styled",()=>{
 for(const code of ["#4B91E1","#DE4F4F","#292929","#8856CD","#E78B2D"]){
  assert.ok(app.includes('data-cc-mass-color="'+code+'"'));
 }
 assert.match(css,/\.cc-mass-swatch\.active/);
});
test("original manager calendar already has Monday week beginning",()=>{
 assert.ok(app.includes("(x.getDay()+6)%7"));
 assert.ok(app.includes("['H','K','Sze','Cs','P','Szo','V']"));
});
test("picker has no database, login or external-provider dependency",()=>{
 assert.doesNotMatch(picker,/createClient\(|service_role|RESEND_API_KEY|https?:\/\/|fetch\(/i);
});
