CLUB CONTROL MANAGER V0.5.2B6J
================================
Baseline: V0.5.2B6I

Hotfix scope:
- root/document horizontal offset is forcibly reset without touching internal table/grid scrollers
- Overview/content cannot remain shifted to the right after an older horizontally-scrollable build
- pass price parsing no longer turns NULL/empty values into 0 Ft
- actual imported pass price remains first priority; configured team/global amount is fallback
- Finance load invokes MGR022 BEAC reconciliation when installed
- unlocked manual BEAC/tagdij state can be replaced by a real imported competition pass
- explicitly locked manual override remains protected

Replace: index.html, app.js, styles.css, sw.js
Do not replace config.js.
MGR022 should be installed before finance retest.
- normalized an older escaped-newline CSS block (literal \\n / \\" artifacts) so later responsive rules parse normally
