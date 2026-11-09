// Frontend-next Player: isolated, read-only interaction preview; no LIVE/TEST transport.
const screens={
 home:{title:'Áttekintés',description:'Az edzések, meccsek és fontos teendők közös kiindulópontja.',cards:[
  ['Következő edzés','Edzések adatai csak hitelesített TEST RPC bekötés után érhetők el.'],
  ['Következő meccs','Nincs csatlakoztatott mérkőzésforrás az új frontendben.'],
  ['Bérlet és jelentkezés','A fizetési és jelentkezési adatok még nincsenek bekötve.']]},
 trainings:{title:'Edzések',description:'Jelentkezés és jelenléti szándék – a szerveroldali jogosultságokkal együtt.',cards:[['Jelentkezések','Az edzéslista és a mentés csak a hitelesített V2 adatkapcsolat után működhet.']]},
 matches:{title:'Meccsek',description:'Saját mérkőzések és hivatalos jegyzőkönyvek.',cards:[['Mérkőzéslista','Az eredmények, névsorok és jegyzőkönyvek csak közös azonosítóval jelenhetnek meg.']]},
 standings:{title:'Tabella',description:'Egységes eredmények és bajnoki pontozás.',cards:[['Bajnoki állás','Nincs csatlakoztatott tabella. Nem jelenítünk meg kitalált pontokat vagy helyezéseket.']]},
 notifications:{title:'Értesítések',description:'Edzések, meccsek és várólista-ajánlatok.',cards:[['Beérkező értesítések','A valódi értesítési jogosultságokat és az olvasott állapotot még nem kötöttük be.']]},
 profile:{title:'Profil',description:'Játékosadatok, csapatok és fizetési státusz.',cards:[['Saját adatok','A profil kizárólag hitelesített, felhasználóhoz rendelt TEST adatokból tölthető be.']]}
};
const $=id=>document.getElementById(id);
const nav=$('playerNav'),content=$('playerView'),title=$('playerTitle'),desc=$('playerDescription'),menu=$('playerMenuToggle');
let exampleChoice='neutral';
function element(tag,cls,text){const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e}
function render(){
 const hash=location.hash.slice(1),key=Object.hasOwn(screens,hash)?hash:'home';
 const screen=screens[key];title.textContent=screen.title;desc.textContent=screen.description;content.replaceChildren();
 for(const link of nav.querySelectorAll('a[data-view]')){if(link.dataset.view===key)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current')}
 const grid=element('div','player-grid');
 for(const [heading,description] of screen.cards){const card=element('section','cc-card player-card');card.append(element('p','kicker','Nincs adatkapcsolat'),element('h2','',heading));
 const empty=element('div','player-empty');empty.append(element('strong','','Adatokra vár'),element('p','',description));card.append(empty);grid.append(card)}
 if(key==='trainings'){const card=element('section','cc-card player-card player-card-wide');card.append(element('h2','','Jelenlétválasztó · UI-próba'),element('p','cc-muted','A gombok csak a megjelenést demonstrálják. Nem rögzítenek jelentkezést, és nem kapcsolódnak edzéshez.'));
 const group=element('div','player-demo');group.setAttribute('role','group');group.setAttribute('aria-label','Példa jelenléti szándék');
 const status=element('p','player-demo-status');status.setAttribute('role','status');
 for(const [value,label] of [['going','Jövök'],['not-going','Nem jövök'],['neutral','Nincs jelölés']]){const button=element('button','',label);button.type='button';button.setAttribute('aria-pressed',String(exampleChoice===value));button.addEventListener('click',()=>{exampleChoice=value;for(const b of group.querySelectorAll('button'))b.setAttribute('aria-pressed',String(b===button));status.textContent=label+' · csak helyi UI-próba, nincs mentés';});group.append(button)}
 status.textContent='Csak helyi UI-próba · nincs mentés';card.append(group,status);grid.append(card)}
 content.append(grid);nav.classList.remove('open');menu.setAttribute('aria-expanded','false')
}
menu.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open))});
window.addEventListener('hashchange',render);
render();
