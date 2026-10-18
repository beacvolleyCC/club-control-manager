const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const js=fs.readFileSync('app.js','utf8');
test('Hungarian date parser accepts dd or padded day and rejects impossible dates',()=>{
 const a=js.indexOf('  function ccMatchDateFromHu_('),b=js.indexOf('  function ccMatchEditorDateIso_(',a);
 assert.ok(a>0&&b>a);
 const parsed=new Function('$','document','Event',js.slice(a,b)+';return ccMatchDateFromHu_;')(()=>null,{},function(){});
 assert.equal(parsed('2026. 10. 20.'),'2026-10-20');
 assert.equal(parsed('2026. 1. 2.'),'2026-01-02');
 assert.throws(()=>parsed('2026-10-20'));
 assert.throws(()=>parsed('2026. 02. 30.'));
});
test('federation fixture editor uses a HU date and separate touch/desktop hour-minute spinners',()=>{
 const a=js.indexOf('  function ccOpenSourceMatchEditor_('),b=js.indexOf('  function ccBindSourceMatchEdit_(',a);
 const editor=js.slice(a,b);
 assert.ok(editor.includes('Dátum (ÉÉÉÉ. HH. NN.)'));
 assert.ok(editor.includes('id="ccMHour"')&&editor.includes('id="ccMMinute"'));
 assert.ok(editor.includes('ccMatchBindTimeWheels_()'));
 assert.ok(editor.includes('ccMatchDateFromHu_(text($(\'#ccMDate\').value))'));
 assert.ok(!editor.includes('type="date"'));
 assert.ok(!editor.includes('ccMTime'));
 const wheel=js.slice(js.indexOf('  function ccMatchBindTimeWheels_('),js.indexOf('  function ccMatchEditorDateIso_('));
 assert.ok(wheel.includes("'wheel'"));
 assert.ok(wheel.includes('select.selectedIndex='));
});
