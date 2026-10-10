# CLUB CONTROL — HANDOVER 2026-10-10

## START HERE

Új chatben ezt írd:

> Innen folytatjuk. Olvasd el a repo manager-rebuild ágán a HANDOVER_2026-10-10_MRSZ_AND_CC2.md fájlt, ellenőrizd a branch állapotát, és a "KÖVETKEZŐ KONKRÉT LÉPÉS" résztől folytasd. Ne merge-elj mainre, amíg a divergence nincs feloldva és a 11× QA nem zöld.

---

# 1. REPO / BRANCH ÁLLAPOT

Repository:
- beacvolleyCC/club-control-manager

Production:
- branch: main
- HEAD: 885bda7ad6c22ba23c0f0fee520680528f1074f7
- commit: Manager röplabda Számláló V3 – feladóállás, mínusz és cserék

Development:
- branch: manager-rebuild
- HEAD: 0f14e1d2c23b21d29a9ec699a7436f587344e72b
- commit: R1 UI1.9M: overlay MRSZ standings without breaking BRSZ league identity

Merge base:
- 305d767e5b63e4ca5af7fe56cc203999c592ce6d

CURRENT WARNING:
- manager-rebuild is 12 commits AHEAD and 4 commits BEHIND main.
- Status: DIVERGED.
- DO NOT blind merge manager-rebuild -> main.
- main contains later volleyball scoreboard/scorer V3 work that manager-rebuild does not have.
- First release task later must reconcile both lines safely, preserve scorer V3 + MRSZ/UI1.9M.

Diff main...manager-rebuild currently includes:
- app.js modified
- config.js modified
- index.html modified
- sw.js modified
- supabase/functions/cc-competition-mrsz-sync/index.ts ADDED

Current Manager build markers:
- R1 UI1.9M
- manager-r1-ui1-9m-2026-10-10
- SW cache: cc-manager-r1-ui1-9m-2026-10-10

NOT LIVE. Test branch only.

---

# 2. CURRENT MRSZ / HUNVOLLEY WORK — EXACT STATE

Goal:
- Update Club Control standings from official MRSZ/Hunvolley data.
- First stage is STANDINGS ONLY.
- It must NOT change match events, match start times, venues, RSVP, attendance, meeting times, or Player statuses.

Official source family:
- hunvolley.info
- BEAC club code: 198
- current season: 2026/27

Current Edge Function:
- supabase/functions/cc-competition-mrsz-sync/index.ts
- blob SHA at handover: 51771b8e8ec7f0aab499727b138856d9d220c9a3

Important implementation facts:
- SOURCE='mrsz'
- DEFAULT_SEASON='2026/27'
- MRSZ_CLUB_CODE='198'
- club profile:
  https://www.hunvolley.info/pr_a/920/002/p_002.asp?p_sportszervezet_kod=198
- discovers the three BEAC contexts from the club page instead of hardcoding Hunvolley team IDs.
- internal Club Control team UUIDs remain:
  - Női I: 10000000-0000-4000-8000-000000000001
  - Női II: 10000000-0000-4000-8000-000000000002
  - Férfi: 10000000-0000-4000-8000-000000000003
- fetches official Hunvolley HTML server-side.
- parses standings rows only.
- ensures/upserts an MRSZ row in competition_source_team_maps.
- calls:
  cc_competition_sync_apply_results_standings_v1
  with:
  - p_source='mrsz'
  - p_results=[]
  - p_standings=<official parsed standings>
- therefore it does NOT call cc_competition_sync_apply_team_v1 and does NOT touch canonical events.
- sync run details version:
  MRSZ-STANDINGS-V1.2-NAME-ROWS
- mode:
  standings_only

Authentication:
- Manager JWT -> cc_manager_competition_sync_authorize_v1
- scheduler secret path also supported via x-cc-sync-secret
- service-role only for DB writes.

CURRENT STATUS:
- Code exists on manager-rebuild.
- Runtime/deployment to Supabase Edge Function is NOT confirmed in this handover.
- Do not claim it works live until deploy + authenticated smoke test succeeds.

---

# 3. MANAGER FRONTEND MRSZ INTEGRATION

Current app.js blob SHA:
- 5a507a2aad417e034b56f4c24aa771c14d5a12bc

Relevant logic already present:

## Preferred standings source
ccPreferredStandingsSource_(rows)
- groups standings by contextTeamId
- if MRSZ rows exist for a context, MRSZ wins
- otherwise single/latest source behavior remains

loadCompetitionResultsStandings()
- still loads canonical results RPC
- loads standings RPC
- falls back to cc_manager_competition_overview_standings_v1 if needed
- runs ccPreferredStandingsSource_ before storing state.competitionStandings

## Standings page overlay
MRSZ is intentionally overlaid onto existing BRSZ league identity/history rather than replacing the whole league model.

Functions:
- msMrszRows_()
- msMrszStandingFor_()
- msRows_()
- msStandingSourceRow_()

Behavior:
- BRSZ/league insight payload remains the structural league source.
- MRSZ values overlay:
  - position
  - played
  - wins
  - losses
  - tablePoints
  - setsFor / setsAgainst
  - setRatio
  - pointsFor / pointsAgainst
  - pointRatio
  - updatedAt
- standingsSource='mrsz'

Current aliases include:
- kozgaz <-> corvinus
- obudai egyetem kando <-> kando
- bdse emericus <-> emericus
- ute u20pink <-> ute u20p

This was deliberate: do not break existing BRSZ source IDs, history, league match filtering, logos, opponent analytics just because MRSZ uses different naming/IDs.

## Matches page controls
Current renderCompetitionMatchCards_:
- main ↻ toolbar button:
  id=competitionSourceSync
  label/title: MRSZ tabella frissítése
  handler: runMrszCompetitionSync_
- BRSZ remains a separate fallback:
  id=competitionBrszSync
  text: BRSZ fallback
  handler: runCompetitionSourceSync_

runMrszCompetitionSync_:
- invokes Supabase Edge Function:
  cc-competition-mrsz-sync
- body:
  {season:'2026/27'}
- reloads:
  - sync status
  - standings/results
- does NOT reload/write activityEvents/calendar
- success feedback:
  MRSZ kész · X csapat · Y tabellasor

BRSZ fallback remains Browser Helper-based and can still update schedule/results/standings according to its existing MGR014 behavior.

---

# 4. BACKEND FOUNDATION ALREADY INSTALLED / HISTORICAL SOURCE FILES

These project files are the canonical historical sources used to build the MRSZ adapter:

1.
CC_COMPETITION_SYNC_MGR014_EDGE_FUNCTION_V1_5_BROWSER_HELPER_ID_FIX.txt
Project file id:
file_00000000d49082108a9511f6041e9524
Library id:
libfile_cc6f6419805c8191b883fe620a987245

Contains deployed-era BRSZ MGR014 Edge Function V1.5 behavior.

2.
MGR014_RESULTS_STANDINGS_V1_SAFE.sql
Project file id:
file_0000000027808246967abbcd7c0cccc2
Library id:
libfile_827c9072b1908191a01068803377ef6c

Important existing pieces:
- result columns on competition_source_matches
- competition_source_standings
- cc_manager_competition_results_v1
- cc_manager_competition_standings_v1
- cc_competition_sync_apply_results_standings_v1
- source check already allows ('brsz','mrsz')

3.
MGR013_COMPETITION_SOURCE_SYNC_V1_SAFE.sql
Project file id:
file_000000001d80821097ab2ec1c65d294d
Library id:
libfile_2972c21225bc819197fd8da57e0d6c8c

Important existing pieces:
- competition_source_team_maps
- competition_sync_runs
- competition_source_matches
- competition_source_changes
- manager auth/status
- cc_competition_sync_apply_team_v1
- schema source checks already allow ('brsz','mrsz')

Do NOT rerun one-time MGR013/MGR014 install migrations blindly. They were already installed historically.

---

# 5. NEXT CONCRETE STEP — KEEP IT SHORT

User explicitly asked to work in short stages.

NEXT ETAP ONLY:

1. Inspect manager-rebuild HEAD and current MRSZ Edge Function.
2. Static QA of MRSZ standings-only code:
   - no event writes
   - only expected tables/RPC
   - parser validation
   - source/context validation
   - auth path
3. Deploy cc-competition-mrsz-sync to Supabase IF deployment path/tool is available.
4. Authenticated test from Manager.
5. Verify all three contexts:
   - Női I
   - Női II
   - Férfi
6. Verify Manager standings show MRSZ official numbers.
7. Verify no calendar/event fields changed.
8. Stop and report concise result.

DO NOT in this etap:
- add match schedule import from MRSZ
- alter BRSZ fallback
- merge main
- refactor Club Control 2.0
- touch Player frontend unless required for read compatibility

If Edge deploy is not possible from available tools:
- create deploy-ready Edge Function package/instructions
- do not pretend deployment happened.

---

# 6. 11× RELEASE QA RULE

Before any production merge, run the established full 11× QA:

1. Git/PR ancestry and branch divergence
2. JS parse + build/version markers
3. runtime selector scan ($().forEach etc.)
4. DOM/route structure + duplicate IDs
5. OTP/auth/session/bootstrap
6. native mobile date/time inputs
7. team selector consistency
8. Teams grid / attendance / coach availability
9. standings/matches filters and source behavior
10. topbar/responsive/mobile CSS
11. SW/cache/release markers

Additional MRSZ-specific checks:
- MRSZ sync cannot touch public.events
- p_results is [] in standings-only mode
- only MRSZ source maps/snapshots change
- BRSZ league history/identity remains available
- MRSZ preferred-source logic is per context, not global
- Player fallback behavior must not regress

Known old JS hazard:
- replacement strings interpret $$ specially.
- use callback/direct slicing when literal $$ must survive.

---

# 7. IMPORTANT RECENT MANAGER UI STATE

R1 UI1.9L / UI1.9M lineage:

Training cards were changed so training name/team is the main title and court is underneath.
Desired example:
- Női II edzés
- 2. pálya

Helper:
ccTrainingCardTitle_(e,teamName)

Rules:
- meaningful custom training title stays
- generic Edzés / Csapatedzés derives from team name
- match title logic unchanged

Mobile date/time:
- already fixed to native input[type=date] / input[type=time]
- time step=60
- do not reintroduce text HH:MM inputs

---

# 8. CLUB CONTROL 2.0 — PRODUCT DIRECTION AGREED IN THIS CHAT

This is a future rebuild from scratch using current data/experience.

Core principle:
THE CORE MUST NOT KNOW VOLLEYBALL.
Volleyball is a Sport Pack.

The new system should work for any sport.

Three UX surfaces on one backend/data model:
- Player
- Coach
- Club Admin / Manager

## Platform Core
- Organisations / clubs / departments
- Sports
- Seasons
- People
- Groups
- Roles
- Permissions
- Venues/resources
- Events
- Participation
- Module registry
- Audit log
- Notification engine
- Rules engine

Groups must be generic:
- team
- training group
- level
- age group
- squad
- course
- individual programme

Do NOT assume every sport has teams.

## Training Planner = THE HEART OF THE SYSTEM

Not merely another module.

Structure:
Season
-> cycle
-> week/microcycle
-> session
-> block
-> drill/task
-> variation

Simple UI can expose only:
Week -> Session -> Drills

Advanced periodisation can be optional.

Core objects:
1. Drill / exercise
2. Session template
3. Concrete session instance

Session planner connects:
- calendar/event
- player/group
- coach
- venue/resource
- planned load
- actual load
- attendance
- notifications
- analytics

Live Session mode should later support:
- current drill
- countdown/timer
- next drill
- check-offs
- delays
- skip/add block
- group split
- quick notes
- planned vs actual

Existing older roadmap:
- general Games & mini-tournaments module
- live volleyball scoring
- rotation order
- current/next server
- physical scoreboard radio/Wi-Fi
- TV/projector fullscreen scoreboard from same data source

## Functional modules
Suggested modular catalogue:
- Training Engine
- Calendar
- Registration / waitlist
- Attendance
- Competition
- Finance / entitlements
- Rules / sanctions
- Communication / notifications
- Medical
- Performance
- Facilities/resources
- Data Explorer
- Integrations
- Guest/access
- Reporting/analytics

## Sport Packs
Example Volleyball Pack:
- positions
- jersey number
- rotations
- lineup
- sets / scoring
- standings
- opponent
- federation connectors
- medical/licence sport fields

Other sports should plug in their own typed data.

Architecture principle:
- relational Core
- typed module tables
- JSONB only for config/custom fields where appropriate
- modular monolith initially, NOT microservice sprawl

---

# 9. PLAYER 2.0 DIRECTION

Player must be part of the new modular system.

One Player shell, rights/eligibility determine what appears.

Possible competition athlete sees:
- team trainings
- match schedule
- standings
- stats
- medical/licence
- notifications

Mass/open-training athlete sees:
- open training registration
- waitlist
- pass/entitlement
- attendance
- payments

Person can belong to both and see both.

Recommended stable primary nav:
- Home
- Calendar
- Sport
- Notifications
- Profile

Sport tab content comes from Sport Pack + permissions.

## Interactive custom Home
User wants an iOS Control Center / lock-screen-like interactive customisation system.

Recommended:
- dashboard widgets in S/M/L sizes
- long-press edit mode
- add/remove/reorder/resize
- widget gallery
- personalised Home
- stable core navigation must NOT be freely destroyed

Potential Player widgets:
- next training
- training registration
- today's session plan
- next match
- standings
- pass
- payment
- attendance
- notifications
- wellness
- stats

Same widget engine can power Manager/Coach dashboards with different widgets.

---

# 10. MANAGER / COACH NOTIFICATIONS — NEW REQUIREMENT

Manager AND coaches need notifications.

Example confirmed use case:
If an athlete cancels less than X hours before training:
- cancellation reason becomes mandatory
- send in-app/push notification to relevant coach(es)
- optionally team manager / club admin
- notification includes reason
- click deep-links to event + athlete cancellation record

Important:
These are THREE independent configurable rules:
1. registration closing deadline
2. free cancellation deadline
3. coach late-cancellation notification threshold

Example:
- registration closes 6h before
- free cancellation ends 6h before
- coach notification only if cancellation is within 2h

Reason model recommendation:
- illness/injury
- work/study
- travel
- other
+ required short text when late

Rules Engine use case:
late cancellation -> required reason -> coach/manager notification -> deep link -> audit

---

# 11. MASS SPORT ADMIN REQUIREMENTS DISCUSSED

## Automatic registration close
Not confirmed complete in current old system.

Desired:
- Registration closes X hours before event.
- Free cancellation deadline separately configurable.
- When creating a new training and user changes registration close, cancellation deadline should default/follow same value.
- Both must remain independently editable.

Suggested state model:
- AUTO
- MANUALLY OPEN
- MANUALLY CLOSED

Manual reopen must override auto-close so scheduler does not immediately close again.

Suggested UI:
Registration closes: [6] hours before
☑ Cancellation deadline follows
Free cancellation: [6] hours before

If user manually changes cancellation, linked behavior can detach.

## Sanctions module
Need full Manager UI, not just backend behavior.

Requirements:
- view all sanctions
- see who is sanctioned
- why
- sanction type
- start/end
- source (auto/manual)
- edit
- revoke/remove
- manual add sanction
- audit all changes

Deletion should normally mean revoke/void, not hard-delete, so audit stays.

Possible types:
- warning
- registration ban
- other configurable action

Triggers:
- no-show
- late cancellation
- repeated incidents
- manual reason

Existing historical backend already had some no-show sanction workflow, but new full UI/CRUD/audit is still required.

## Data Explorer / feedback area
User wants a Manager area where they can see essentially all canonical table data in human-friendly spreadsheet form:
- athletes
- groups/memberships
- events
- bookings
- waitlist
- attendance
- passes/entitlements
- payments
- sanctions
- notifications
- imports
- overrides
- audit logs

Searchable/filterable/exportable.
Editable only where safe, with audit.

---

# 12. BEAC PASS IMPORT — CURRENT IDEA

User originally asked about simplifying BEAC admin pass import on phone.

Historical system already had a BEAC import pipeline:
- raw data pasted into BEAC_IMPORT_RAW
- processing/dedupe
- pass number/product/email/date/month/season logic
- canonical sync

Do NOT rebuild whole import first.

Desired mobile flow:
BEAC admin
-> copy whole list/table
-> Manager > BEAC import
-> paste
-> Import

Manager sends raw pasted dataset to existing Apps Script/backend logic.
Goal: remove Google Sheets manual navigation/delete/paste/run steps.

Possible later improvement:
- export/API if BEAC system provides one
- Safari shortcut/bookmarklet if copying table is difficult

---

# 13. CURRENT BRSZ/MRSZ HISTORY

BRSZ team seeds historically:
- Női I: 299
- Női II/B: 959
- Férfi I/B: 709

BRSZ server fetch previously got HTTP 403.
Desktop workaround:
- Chrome Browser Helper
- three BRSZ competition pages
- Browser sends page HTML to Edge Function

Current BRSZ 2026/27 competition IDs in existing code:
- 1121 Női I.
- 1146 Női II. B
- 1137 Férfi I. B

Old MRSZ official API discovery:
MRSZ published a BackOffice API option to clubs in 2020:
https://hunvolley.hu/?p=69251
Historically advertised:
- match schedule
- results
- match sheets
- current standings
Access:
backoffice@hunvolley.hu
Old API.docx link was 404 when checked 2026-10-10.
Current availability/BRSZ coverage not verified.

Long-term:
official API is preferable to HTML parsing.
Current standings-only Hunvolley HTML connector is an interim practical solution.

---

# 14. RELEASE / SAFETY PRINCIPLES

- Do not touch main unless user explicitly asks live/production.
- Do not claim runtime success without actual authenticated test.
- External sync must preserve:
  - meeting_at
  - meeting_place
  - RSVP
  - attendance
  - Player statuses
- Future official match schedule changes should go through change review/Manager approval where appropriate.
- federation missing row must never silently delete/cancel a Club Control event.
- audit external changes.
- Player/Manager should consume same canonical data.

---

# 15. FILE MANIFEST — CURRENT REPO

Branch:
manager-rebuild @ 0f14e1d2c23b21d29a9ec699a7436f587344e72b

Critical current files:
- app.js
- config.js
- index.html
- styles.css
- sw.js
- supabase/functions/cc-competition-mrsz-sync/index.ts

Current blob SHAs known:
- app.js:
  5a507a2aad417e034b56f4c24aa771c14d5a12bc
- config.js:
  8569f8943c3cfe5207f2d05c9c9040f7a72f21ef
- index.html:
  0585501c1a0f24b2a019870c41e8a0e8682ae058
- sw.js:
  76d19cfaf1d65ebe34bc59076006a34976d9b32b
- MRSZ Edge Function:
  51771b8e8ec7f0aab499727b138856d9d220c9a3

Use GitHub connector against this exact branch/ref in the next chat.

---

# 16. FINAL NEXT-CHAT PROMPT

Copy/paste only this if needed:

"Innen folytatjuk. A Club Control manager repo manager-rebuild ágán olvasd el a HANDOVER_2026-10-10_MRSZ_AND_CC2.md fájlt. Először csak a KÖVETKEZŐ KONKRÉT LÉPÉS MRSZ standings-only etapját csináld meg. Ne merge-elj mainre. Figyelj rá, hogy manager-rebuild 12 ahead / 4 behind main, és a mainben benne van a röplabda Számláló V3. Rövid etapokban haladj."

