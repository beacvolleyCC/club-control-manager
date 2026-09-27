CLUB CONTROL PLAYER — V2.3.10.20
CLUB CONTROL MOTION SYSTEM V1

BASELINE
- Direct base: V2.3.10.19 HOME_COURTS.
- V2.3.10.19 itself was rebuilt from the V2.3.10.16 stable rollback, preserving the iOS/Android notification-swipe fixes.
- Scope of this build is motion / interaction quality only. Existing event, calendar-export, auth, push, attendance, payment, team and home-court behavior is retained.

FIX / INCLUDED — MOTION SYSTEM V1
1) Shared timing/easing tokens
- Micro interactions: 140 ms (system range: 120–160 ms).
- Normal UI transitions: 210 ms (system range: 180–240 ms).
- Structural token: 280 ms (system range: 240–320 ms).
- Standard easing: cubic-bezier(.2,0,0,1).
- Enter easing: cubic-bezier(.2,.8,.2,1).
- Exit easing: cubic-bezier(.4,0,1,1).
- Dialog/detail open: 200 ms.
- Dialog/detail close: 160 ms.
- Drag release snap: 200 ms with a restrained spring curve.
- Skeleton -> content crossfade: 100 ms.

2) Event cards / controls
- Event cards use a 0.985 press scale, with a faster press and slightly slower release.
- Buttons use small transform-only press feedback; no layout dimensions are animated.
- Roster expansion now transitions instead of popping open/closed.
- Filter panels use the shared normal timing and restrained vertical enter/exit movement.
- Disclosure triangles/toggles use the shared motion tokens.

3) Attendance slider
- Replaced threshold-only swipe behavior with true draggable behavior.
- Slider follows the pointer 1:1 horizontally within clamped bounds.
- First 8 px are reserved for direction arbitration so vertical page scrolling is not hijacked.
- While dragging: transition = none.
- On release: projected pointer velocity + nearest-state calculation chooses Jövök / Nincs jelzés / Nem jövök.
- Thumb snaps to the resolved state over 200 ms.
- Existing save / cancellation-note business behavior is unchanged.

4) Bottom navigation
- No page-slide animation is used.
- The active indicator travels between the three nav items.
- Icon gets only a small move/scale change.
- Label opacity/emphasis transitions with the active state.
- Reduced-motion mode restores a static active icon highlight.

5) Dialogs / panels
- Event, cancellation, logout, Settings and Notifications use opacity + 16 px translate on enter.
- Close is deliberately quicker than open.
- Escape/backdrop/X close routes use the same close motion instead of abrupt native close.
- On mobile, Settings and Notifications panel headers can be dragged downward.
- Drag follows the finger 1:1; sufficient distance/velocity closes the panel, otherwise it snaps back.
- Desktop panel behavior remains unchanged.

6) Menetrend scrolling
- Native X/Y scrolling remains authoritative.
- overscroll-behavior: contain.
- touch-action: pan-x pan-y.
- Scroll-container/table dimensions are explicitly excluded from motion transitions.
- No scrollTop animation or scroll-time height change was introduced.

7) Loading -> content
- Notification inbox gets a lightweight skeleton only when no previous content is available.
- Real notification content crossfades in over 100 ms.
- Silent refresh with existing notifications does not flash the skeleton/empty state.

8) Reduced motion
- prefers-reduced-motion: reduce is applied app-wide.
- Non-essential transforms/animations collapse to effectively instant state changes.
- Refresh spinner and skeleton shimmer stop moving.
- Native scrolling remains available.

RETAINED FROM V2.3.10.19
- Compact contextual training/home/away event information.
- Away Google Maps routing from event.address.
- One-time Apple/iPhone + Google Calendar .ics export.
- Europe/Budapest ICS timezone.
- BEAC home court fallback:
  * BEAC Férfi Monday home match -> 3. pálya
  * BEAC Női I. Friday home match -> 3. pálya
  * BEAC Női II. Tuesday home match -> 2. pálya
  * explicit event.court always wins.
- V2.3.10.16 browser-native notification swipe and red-tail fix.

JAVÍTANDÓ / PHYSICAL QA BEFORE PRODUCTION
- iPhone PWA: attendance drag vs vertical page scroll; Settings/Notifications pull-down panel; notification native swipe; bottom-nav indicator; dialog open/close; reduced motion.
- Android PWA: same interaction smoke, especially pointer drag and native notification swipe coexistence.
- Desktop: hover/press, filters, dialogs, bottom navigation, keyboard/Escape/focus flow.
- Real imported away match + real home match compact display.
- Calendar export smoke remains required from V2.3.10.19.

TELEPÍTÉS
Replace only:
- index.html
- app.js
- styles.css
- sw.js

NO SQL REQUIRED.
Do not rerun 047–053, MGR001 or MGR002.

Build:
Player V2.3.10.20
