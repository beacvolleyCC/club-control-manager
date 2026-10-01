CLUB CONTROL MANAGER V0.5.2B5A — MGR014 403/UI HOTFIX

Frontend changes only:
- BRSZ sync/status strip wraps correctly and cannot overflow its panel.
- Match/training RSVP summary shows only the three larger counts; J / N / ? letters are hidden.
- Existing B5 MGR014 results/standings/multi-team filters retained.
- config.js is NOT included / must not be replaced.

Replace in club-control-manager:
- app.js
- styles.css
- sw.js
- index.html

The separate Edge Function hotfix must also be deployed before re-testing BRSZ sync.
