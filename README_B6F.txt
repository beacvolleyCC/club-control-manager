Club Control Manager V0.5.2B6F
2026-10-04

Frontend hotfix on top of B6E:
- Finance permission uses canonical competition.fees key (no invalid competition.finance admin payload)
- Overview RSVP matrix width follows widest team grid; matches use remaining width
- Mass-sport roster gets avatar/monogram and narrow-screen Note/Remove buttons never clip
- Competition Edzés/Meccs cards rebuilt to requested layout: icon, opponent/court title, team+event subtitle, date/time, attendance
- Finance player column narrower + avatar/monogram
- Feedback/status toast is a single compact line
- B6E dense grids, standings, equipment, finance, safe horizontal scroll remain

Run MGR018 before B6F if MGR017 was installed.
Do not replace config.js.
