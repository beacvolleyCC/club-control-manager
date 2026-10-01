CLUB CONTROL / BRSZ 2026/27 SOURCE DATA
=======================================
Source supplied by the user in Club Control chat on 2026-10-01.
This package does not web-verify or silently reconcile the source rows.

LIVE MANAGER IMPORT DATA
- brsz_beac_match_import_2026_27.json
- 22 BEAC team-page rows total
- 19 clean/importable rows
- 3 review-only rows where the source says BEAC vs BEAC:
  * BEAC Férfi — 2027-01-13 20:30
  * BEAC Férfi — 2027-03-04 19:30
  * BEAC Női I — 2026-11-10 19:30
- The Manager import preview excludes those three rows by default.
- Import uses the existing authenticated Manager competition event series RPC.
- Import sends no Player notification.
- Duplicate guard: same internal team + Budapest-local date + start time.

FUTURE STANDINGS / COMPETITION SOURCE
- brsz_group_fixtures_2026_27_source.json
- 133 source fixture/fragments stored across:
  * Női II. osztály B csoport: 15
  * Női II. osztály A csoport: 16 (includes ambiguous source fragments)
  * Női I. osztály: 31
  * Férfi I. osztály B csoport: 29
  * Férfi I. osztály A csoport: 42
- This file is NOT consumed by the current UI and does not calculate standings yet.
- review=true marks ambiguous/malformed rows preserved from the supplied source.

YEAR MAPPING
- October–December -> 2026
- January–March -> 2027
