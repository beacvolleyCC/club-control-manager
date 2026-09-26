CLUB CONTROL MANAGER PWA V0.3 — LIVE READ-ONLY

DEPLOY TARGET
- GitHub Pages
- Use a SEPARATE repository from the Player PWA.
- Recommended repository name: club-control-manager
- Do NOT put this inside the Player repo /manager folder because the Player service worker may control that path.

UPLOAD THESE TO THE REPOSITORY ROOT:
- index.html
- app.js
- styles.css
- config.js
- manifest.webmanifest
- sw.js
- icons/ folder (all 3 PNG files)

DO NOT UPLOAD:
- SQL files
- Apps Script files
- service-role keys
- old Manager source

GITHUB PAGES
Settings -> Pages
Source: Deploy from a branch
Branch: main
Folder: / (root)
Save

EXPECTED URL
https://<github-username>.github.io/club-control-manager/

FIRST LOGIN
Use: elteroplabda@gmail.com
The Manager account and 14 permissions were installed by MGR001.
Authentication uses the same Supabase OTP flow as the Player.

SCOPE V0.3
READ-ONLY only. Competition Overview / Teams / Players / Calendar use live Supabase RPCs.
Mass-sport and several competition modules are migration placeholders and do NOT replace the old Manager yet.
Keep the existing Apps Script Manager online in parallel.
