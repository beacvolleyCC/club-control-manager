# CLUB CONTROL — LIVE vendégkezelés átadás (2026-11-23)

## Elkészült
- LIVE Manager: **Tömegsport → Vendégek** menüpont.
- Vendéglista, új vendég, vendég szerkesztése, e-mail, csapatjogosultság, aktív/inaktív állapot, egyszer megjelenített 8 jegyű PIN és PIN újragenerálás.
- A PIN generálását a meglévő LIVE Supabase `cc_guest_admin_save_v1` RPC végzi; a böngésző nem tárolja véglegesen és nem küldi el e-mailben.
- A vendégkezelő oldal a meglévő Manager Auth-folyamatot és a `mass.athletes` view/edit szerveroldali jogosultságát használja. Nem jött létre új Manager OTP/PIN/magic-link.
- Vendégoldal: https://beacvolleycc.github.io/club-control-manager/vendeg/
- Repo: `beacvolleyCC/club-control-manager`, PR #103, LIVE commit `5c21baffc71546909bb75bddb93f36768d7b071c`.
- `Manager guest administration safety QA` sikeres és minden meglévő PR regresszió zöld.
- LIVE GitHub Pages telepítés [#45086947071](https://github.com/beacvolleyCC/club-control-manager/actions/runs/45086947071) **success**.

## Adatforrás / biztonság
- LIVE Supabase: `snqsxlyhontaepembaic`; a Manager nem kapcsol át TEST-re.
- Szerveroldali `cc_guest_admin_list_v1` és `cc_guest_admin_save_v1` RPC, csak megfelelő Manager-jogosultsággal.
- A megjelenő PIN egyszeri, további megtekintés helyett új PIN generálható.
- Éles vendég létrehozásának valódi UI end-to-end tesztje **nyitott**; a korábbi ellenőrzéskor a LIVE-ban 0 vendég volt. Nem hoztunk létre tesztvendéget automatikusan.

## Hátravan
- Egy valódi, szándékosan létrehozott LIVE tesztvendég felvétele és PIN-es belépésének ellenőrzése.
- Vendégek névsora/létszáma a LIVE Manager meccs- és edzéskártyákon, illetve a LIVE Playerben még nem integrált. PR #101 és Player PR #38 csak referenciaként szolgál; nincs teljesen átemelve.
- Rövid `beacvolley.hu/vendeg` domain-útvonal később Cloudflare kiadással.
- Rollback: LIVE Manager előző főági commit visszaállítása, a vendégadatok változtatása nélkül.
