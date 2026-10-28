# Dabble prototype: end to end

A static, mobile-only HTML/CSS/JS prototype of Dabble. It covers the splash
screen and every Mid-fi V2 flow: **A** first run and onboarding, **B** weekday
evening, **C** weekend outing, **D** capture from Instagram and occasion
boards, and **E** Explore, Profiles, settings and error states.

It uses vanilla HTML, CSS and ES modules. There is no framework, no build step,
and no dependencies other than Google Fonts.

## Run it

```bash
cd dabble
python3 -m http.server 8000
```

Open http://localhost:8000. ES modules need a server, so opening `index.html`
straight from disk will not work.

On a wide window the app sits in a phone frame, with **Prototype controls** to
its right. On a phone-width window, long-press the status bar clock for 1 second
to open the controls.

- **Full run (A1):** clears all data and starts at Welcome. The clock picks the theme.
- **Weekday evening (B1):** loads Niharika's three weeks of history, forces the
  evening theme, and opens the lock screen nudge.
- **Weekend outing (C1):** the same history, day theme, Home in the weekend state.
- **Capture from Instagram (D1)** and **Unreadable reel (D1, no location)**:
  the simulated share sheet, leading to D3 or D4.
- Theme: Auto / Day / Evening. Toggles: Offline, Location off, A save is due
  (unset means on for Saturdays), Empty Moments. **Simulate an error** opens E6.
- Demo OTP code: **246810**. Any other code goes to the wrong-code state.
- Reset demo data opens a confirm sheet first.

## Deploy to GitHub Pages

1. Push the contents of this `dabble/` folder to the root of a repo, on `main`.
2. Settings → Pages → Source: `main` / `/ (root)`.
3. Open `https://<user>.github.io/<repo>/`.

All paths are relative, routing uses the hash, and `.nojekyll` and `404.html`
(a byte-for-byte copy of `index.html`) are included.

## Built

| Route | Screen |
| --- | --- |
| splash | Logo mark plus "Dabble" wordmark, about 1.6s on every cold load, then fades to A1 (or Home once onboarded) |
| `#/a1` | Welcome |
| `#/a2`, `#/a2?back=1` | Sign in, and the "Welcome back" variant |
| `#/a3`, `#/a4` | OTP entry and the wrong-code state (same screen) |
| `#/a5` to `#/a10` | Child basics, interests, temperament, parent profile, Parent Lens, evenings |
| `#/a11` | Nudge permission |
| `#/home` (`a12`, `b2`, `b15`, `c1`, `d6`) | Home. One module stack; only the lead card changes (see Round 2) |
| `#/b1` | Lock screen nudge |
| `#/b3` to `#/b5` | Check-in, steps 1 to 3 |
| `#/b6` | Results (shows B16 Offline instead when offline) |
| `#/b7` | Nothing fits |
| `#/b8/<idea>` | Idea detail |
| `#/b9/<idea>/<step>` | Idea in progress. B10 early exit opens as a sheet over it |
| `#/b11/<idea>` | Capture moment sheet |
| `#/b12` | Moments album of polaroids, two columns, grouped by month (shows E5 when empty or when Empty Moments is on) |
| `#/b13` | Fold into a routine |
| `#/b14` | Saved, Our regulars |
| `#/b17` | Import from images |

### Skip sign-in
You asked for a way to skip sign-in. It appears in two places:
- A1 Welcome: a ghost "Skip sign-in for now" button below the caption.
- A2 Sign in: a ghost "Skip" action at the right of the top bar.

Both go straight to A5 Child basics.

### Lanes C, D, E

| Route | Screen |
| --- | --- |
| `#/c2/1` to `#/c2/3`, `#/c3` | Outing check: time, how far, energy, who and the live summary |
| `#/c4` (`c13`) | Results, outings. Saving a place from C6 returns here with the SAVED tag and the Undo toast (C13) |
| `#/c5` | Nothing within limits |
| `#/c6/<place>` | Place detail. Shows C15 when the place is closed on the planned day, and C12 for ordinary places |
| `#/c7/<place>` | Ground truth from parents. C8 Ask a question opens as a sheet |
| `#/c9/<place>` | Plan around her day. C10 Share opens as a sheet |
| `#/c11` | Day of, with a live "Leave in N minutes" countdown |
| `#/c12/<place>` | Ordinary place, play kit |
| `#/c14/<place>` | After the outing (sheet) |
| `#/c15/<place>`, `#/c16` | Place closed, Location off |
| `#/d1`, `#/d1?reel=2` | Instagram share sheet (simulated OS screen) |
| `#/d2` to `#/d4` | Reading the reel, Confirm and tag, Could not read the reel |
| `#/d5` | Saved, Want to try (the Saved tab root) |
| `#/d7`, `#/d8` | Occasion board, votes back |
| `#/e1`, `#/e2/<interest>`, `#/e2?kind=<posture>` | Explore with live search, interest thread |
| `#/e3`, `#/e7`, `#/e8` | Child Lens, Profiles (the Profile tab root), Parent Lens |
| `#/e4` | Ritual and nudges, reached from the tune icon on Profiles |
| `#/e6` | Something went wrong |

### Logo and wordmark
The wordmark lives on the splash only (2s, tap to skip). In-app screens open
with their own top bar. A1 Welcome keeps its larger lockup. The B1 lock screen
and D1 share sheet keep the logo only as the notification and share-target icon.

### Bug fix: doubled borders on form fields
The field wrapper (`.field__control`) draws the border and the 2px focus
border. The input, select or textarea inside it was also drawing its own
`:focus-visible` outline, so a second box appeared inside the field. The OTP
boxes had the same problem. Those inner outlines are now removed in
`css/components.css`, so each field draws one border only.

## Round 2 changes

**1. One Home, two contexts.** `home()` in `js/screens/b.js` now builds one
stack in the same order every time: greeting, lead card, compact row(s),
Moments strip, Your regulars, Your saves. `dayHome()` is gone; its two cards
are `weekendSlotCard()` and `saveBackCard()` in `c.js`. Lead, first match wins:
first run, skipped tonight, a save is due (D6), Thursday to Saturday before 6pm
(C1 weekend slot), otherwise tonight. The compact rows use one builder,
`compactRow()`. "20 minutes before bed?" / "Find something" goes to B3. The
weekend row reads "Sunday, Lumbini Gardens at 8am" (to C9) once a plan is
confirmed, otherwise "Sunday morning is open" / "Plan something" (to C2). The
first-run, skipped and save-due leads show both rows.

**2. Moments.** New `polaroid()` builder (white print, 4:3 image, Caveat
caption, date and verdict meta, alternating tilt, `sm` and `lg`). Home has a
Moments strip (`.hscroll`, newest first, up to 8, "See all" to B12). With no
moments, or with Empty Moments on, it shows one polaroid of tonight's top idea
captioned "Your first one lands tonight", which opens B3. `store.momentCaption()`
returns a saved caption, else "{child}'s first {title}" for the earliest
moment of an activity, else "{Title}, nth time", all through `fill()`. Tapping a
polaroid opens a caption sheet (Save / Cancel). B11 is unchanged. B12 uses `lg`
polaroids in two columns and keeps the month groups and summary. Caveat 600 is
loaded, with `--font-hand` and `--text-caption-hand` tokens used only for
captions. Photos are attached to m2 (Cubbon, moment-01), m13 (kitchen band,
moment-02), m8 (Lumbini, moment-03) and m3 (pouring, moment-04). Every activity
had a seeded moment, so no swaps were needed. The other ten moments keep
`photos: []` and show their illustration.

**3. Parent flow, one parent in V1.** A8: every adult row has Edit, which opens
a name sheet. "Set up" is gone. "Add someone else" is still Coming soon. A9
writes enjoys, avoids and evening energy to the user's adult record as you tap.
E7: your card opens E8 with a chevron; other adults show "Not set up yet" as
static text. "Why this matters" is unchanged. E8: Edit opens the same name
sheet, "Wrong?" removes with Undo, and the Set up button is now the caption
"Partner profiles are coming soon." Two-adult ideas still gate only on the
check-in answer.

**4. Names survive.** `seededState()` now receives the current state. If a
child name is set, it keeps the child's name, age and pronouns and every
adult's name, and only seeds history (saves, regulars, moments, learned lines,
offline ideas). If the family also finished onboarding, their onboarding
answers (interests, mess, home items, enjoys, avoids) are kept too, so B6
matches what they actually said. The seed names are used only on a cold lane
start. The D7 send toast now builds the names from state.

**5. The mascot moves.** `mascot()` fetches each SVG once (module `Map`
cache), inlines it in a sized `span.mascot`, strips the SVG's own role and
label, and sets `aria-hidden` or `role="img"` on the wrapper. The wrapper's
size is set before the fetch, so nothing jumps. If the fetch fails it falls
back to the old `<img>`. `css/dabba.css` is linked after `components.css`.

**6. Notification permission.** `store.askNotify()` calls
`Notification.requestPermission()` inside the tap on A11 "Turn on the evening
nudge" and when the E4 evening nudge switch turns on. Navigation never waits.
Granted or dismissed shows the existing Simulated toast; denied turns the
setting off and shows "Notifications are off. You can turn them on in your
browser settings."; unsupported or a throw falls through silently. It never asks
twice in a session or once the browser has an answer.

**Inferred in round 2 (please review)**
- "Before 18:00" is read from the theme (evening means after 6pm), so the
  demo panel's Evening override always gives the tonight lead.
- The Weekend outing and Instagram demo lanes set a hidden `demoLead:
  'weekend'` flag so they still open on the C1 weekend card on any weekday. The
  weekday lane and Full run do not set it. No panel controls changed.
- Weekend row with no plan uses the E4 slot name ("Sunday morning is open"
  by default) so it stays true if the slot is changed.
- Home regulars show the first two regulars, with the short twist for places
  and "Worked N times" for ideas, in every lead. The avatar on Home opens
  Profiles in every lead, not only by day.
- "First" in a caption means the earliest dated moment of that activity. Idea
  titles are lower-cased after "first"; place names keep their capitals.
- An emptied caption falls back to the generated one.
- **New strings:** "Your name", "Edit {name}", "Name", "Add a name to
  continue", "Edit caption", "Caption", "Partner profiles are coming soon."
- The photos skew younger than three, most visibly the bath photo on the
  pouring moment. Data is unchanged, as asked.

**Not verified.** Nothing was opened in a browser, so acceptance items 1 to 10
(console errors, `getAnimations()`, the permission prompt, reduce-motion, the
Lighthouse scores) are untested. Only static import, export and syntax checks
were run.

## Not built (shows a toast, never a dead button)

- **Coming soon:** the "..." menu on a regular, Add someone else
  (A8), Add another child (A5), Use email instead (A4), Recap (B12), Edit on a
  plan (C9), Share on a board (D7), "Add from Want to try, or search" (D7), Edit
  on E3, The metro (E1), and Add from Import from images when it was opened from the empty
  Moments screen.
- **Simulated:** Google and Apple sign-in, Resend code, the evening nudge once
  permission is granted, the WhatsApp/Copy/More share targets, "Sent to
  {partner} (simulated)", "Sent to {other adults} (simulated)". Navigate shows "Opens Maps in the real app".

## Inferred from mid-fi

These decisions were not fully specified. Please review them.

**Flow and behaviour**
- Onboarding progress uses 5 segments throughout: A5 = 1, A6 = 2, A7 = 3, A8 = 3,
  A9 = 4, A10 = 5. The mid-fi shows 4 segments on A5 to A7 and 5 on A8 to A10.
- Onboarding starts empty, as a real first run would: name, chips and choices
  are unselected. The exceptions are age (defaults to 3 years) and the phone
  number on A2 (prefilled as 98450 12321 to match the masked "98••• •••21").
- A2 validates a 10-digit number. **Invented error copy:** "Enter a 10-digit mobile number".
- A3/A4: the code checks itself automatically once all six digits are in, or
  when you tap Verify. A wrong code leads to "Two attempts left", then "One
  attempt left", then a 30-second lock. **Invented lock copy:** "That code did
  not match. Try again in 0:30." The "Use email instead" link appears only after
  a wrong code, matching where it shows in A4.
- Both A11 buttons mark onboarding done and go to Home. Back cannot return into
  onboarding.
- Home with no regulars and no saves shows the A12 first-run copy. Once
  anything exists, the lead follows the Round 2 table. The greeting switches
  between "Evening, {name}" and "<Weekday>, {name}".
- Check-in answers are preselected (20 minutes, sitting down, and "who" from
  A10), so Next always works. Skip uses the defaults 20 minutes, sitting down,
  just me.
- B6 rules follow the brief. In addition, routine ideas (dinner, bath, bedtime)
  are kept out of B6, because they belong to B13. This is why B6 shows exactly
  Torch shadow stories, Dal sensory tray and Two-parent kitchen band for the
  lane B seed.
- The B6 heading counts the results: "Three/Two/One that fit(s) both of you".
- B7 body is templated: "You have {ten} minutes and nothing at home from
  {Aanya}'s list." The "Torch stories, again" option only appears when Torch
  is a regular. Otherwise the heading reads "One that still works for both of you".
- B9 last step: the button reads **Finish** (invented) instead of "Next step".
- B10: "She did not like it" counts towards the "Not for her twice" exclusion,
  as does the "Not for her" verdict on B11.
- B11 opens as a sheet over a dimmed "Tonight / idea title" page, as the
  mid-fi shows. Tapping the backdrop, Escape or Skip goes to Home. Saving
  without a verdict records "Mixed".
- "She loved it" adds 1 to the idea's regular count, or creates a regular with
  lastDone "today" (invented).
- B12: the summary card covers the current month, or the most recent month
  that has moments.
- B16 lists ideas "saved on this phone": Torch and Dal in the seed, plus any
  idea you save.
- B17: no parent photos ship with the handoff, so the gallery uses the
  illustrations as stand-in photos. The Screenshots tab is empty.
- B1: the clock shows the live time, and the date is fixed at "Monday 19 October"
  as the brief asks. Tapping the notification, or swiping up, opens Home.
  "now" next to DABBLE is invented.

**Looks**
- Hi-fi wins on looks. Save rows (B2) and regular rows (B14) use a tag-colour
  thumb with an icon, as in `03-home-evening.png` and `06-our-regulars.png`.
  Regular tiles on Home use the illustration, as the asset table asks.
- The Plant nursery thumb on B14 is sky with `local_florist`, to match
  `06-our-regulars.png`. The asset table says leaf with `yard`.
- The B14 subhead "Each one comes back with a small twist, so it stays fresh."
  comes from the hi-fi. The mid-fi does not have it.
- Mid-fi red error boxes (A4) are rendered as inline error text, and the red
  offline box (B16) as a blue info Banner, per the component rules.
- The lock screen clock uses an 84px Figtree size, which is not a type token,
  because it imitates the OS lock screen.
- The A11 nudge preview card adds a small Dabble app row (logo mark, "Dabble",
  "5:30 PM") and the Pouring and counting illustration.

**Lanes C, D, E**
- C4 follows the brief's rule (travel time within the band). With the default
  "Short drive", it lists Lumbini Gardens, Cubbon Park and Claytopia, plus the
  ordinary Nursery on 8th Main. That gives "Four places that fit".
  `05-outing-results.png` shows Butterfly Park (45 min) under Short drive, which
  breaks the 30-minute band. Butterfly Park appears under "Worth a drive" instead.
- Places are ordered by a fixed rank, so Lumbini Gardens (the slot pick) comes first.
- D6 saves list the board first and leave out Cubbon Park, since it is the hero.
- Home "See all" on saves and the Saved tab now go to D5. The B14 tabs move
  between D5, B14 and D7.
- "Fits both of you" on C6 is a tappable row that opens C7.
- "Save for later" on C6, when opened from C4, saves the place and returns to C4.
  The card there shows SAVED with the toast "Saved. We will bring it up when a
  free day fits." and Undo (C13). From anywhere else it saves in place.
- Only Lumbini has a plan in the mid-fi. Other places (for example Butterfly
  Park from D8) get a plan built from their travel time and stay, in the same
  format.
- C11 counts down from 12 minutes after you confirm. It reads "Time to leave" at zero (invented).
- C12 "Take this with me" saves the place and goes to C14, as the brief asks.
  The park at the end of your road has one thing to do, so its heading reads "One thing...".
- C14: "Also help other parents" expands into three quick single-choice rows:
  Crowd, Washroom and Would bring a toddler again. Their options are invented.
- C7 recent photos are `photo_camera` tiles, because no parent photos ship.
- C16 "Turn on location" flips the demo setting and opens C4. Pressing Enter
  in the area field confirms the area with a toast.
- D2 ticks off each row about every 0.55s. The second reel fails "Location tag" and goes to D4.
- D3 "Yes, save it" / "Edit" is a two-option choice. Edit reveals a place name field.
- D3 save moves Cubbon Park to the top of Want to try. "Also add to an occasion
  board" adds it to the board too.
- D4 requires a note or a place name. Discard, on D3 or D4, asks first.
- D7 rows toggle the shortlist. Sending needs at least one shortlisted place.
  D8 tallies the seeded votes (both pick Butterfly Park) among shortlisted places.
- E1 interest tiles show only the child's interests, or all four if none are
  set. Category tiles open a posture-filtered thread, and "Out of the house"
  opens the outing check. Category counts are static, as the brief asks.
- E2 meta lines are computed from the data, so Animal sounds reads "up and
  about" where the mid-fi says "sitting down".
- E4 has no link in the mid-fi. It is reached from a `tune` icon in the E7 top bar.
- E7 summary lines are computed from the child and parent answers.
- E6 uses the thinking/sleepy mascot in place of the "!" box.

## Invented copy (please review)

The mid-fi only has full content for Torch shadow stories. Everything below was
written to fill gaps, in the same voice:

- Torch shadow stories "say" lines for steps 1, 3 and 4.
- For the other seven ideas: the "What you need" and "Mess and safety" lines,
  the steps and their "say" lines, and the "Why this one" lines. Their
  attributes (posture, mess level, needs) are inferred too. For example, Make a
  shadow zoo is "some mess" and Animal sounds is "up and about".
- B10 sheet body copy is verbatim ("Four minutes still counts") and is not
  computed from the time spent.
- Toast copy: "Removed from saves", "Demo reset". The demo reset confirm body:
  "Everything you set up and saved in this prototype goes back to the start."
- A1 / A2 skip labels: "Skip sign-in for now" and "Skip".
- Lanes C/D/E: the C2 time step and the C2 energy step (from the brief), plus
  descriptions, stay times, distances and fit lines for places other than
  Lumbini. Also: "Write your question first", "Play kit saved to your phone",
  "Time to leave", "Discard this reel?" / "Nothing from it is saved." /
  "Discarded", "Saved to Want to try", "Add a note or a place name",
  "Add a place name to plan it", "Add at least one place to the shortlist",
  "Kept in Want to try", "Removed", "Reset", the E3 reset confirm body,
  "Nothing learned yet", and the non-Animals E2 "nearby" items.

## Assets

| Where | File |
| --- | --- |
| Splash, A11 preview, B1 notification | `logo-mark.png` |
| Favicon | `favicon.svg` |
| Mascot | `assets/mascot/dabba-<theme>-<mood>.svg`, chosen by the current theme, inlined so `css/dabba.css` can animate it |
| Ideas, places, steps | `assets/illustrations/*.webp` |
| Moment photos | `assets/photos/moment-01.webp` to `moment-04.webp` |

Every image slot has a designed fallback: a block in the tag colour with a
centred Material Symbol. A missing file never shows a broken image.

The illustrations are WebP, about 1.6 MB in total, and the four photos about 0.3 MB.
