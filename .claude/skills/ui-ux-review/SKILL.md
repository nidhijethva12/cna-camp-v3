---
name: ui-ux-review
description: Review pages of the CNA Camp site (apps/frontend) for UI/UX problems and broken functionality on desktop and phone, then report prioritised, concrete improvements. Use when asked to review, audit or analyse the site's UI, UX, design, mobile layout, or "what can still improve" on any page.
---

# CNA Camp UI/UX review

Review one or more pages of the running site and return a prioritised list of improvements. Look at the page the way a visitor does (a parent, a student, a teacher, a trekker on a phone), not the way the code reads.

## Setup

1. Make sure the dev server answers: `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/`. If nothing runs, start `npm run dev -- -p 3000` in `apps/frontend` in the background.
2. Pages to review: the ones the user named. "Whole site" means: `/`, `/trips`, one trip page (`/trips/manali-snow-camp`), `/batches`, `/group-trips`, `/travellers`, `/olympiad`, `/about`, `/gallery`, `/blog`, one post, `/contact`.
3. Take screenshots with headless Chrome over the DevTools protocol at **1280px** and **390px** width: the top of the page, then one per section (scroll each section to the top). Close the Olympiad pop-up (`dialog.olympiad-popup`) and the "Need more updates?" card first, or they hide the page.

## What to check, per page

**Functionality (test, do not assume)**
- Every menu and footer link opens the right page; region links (`/trips?region=…`) pre-select the filter and the result count changes, also when clicked while already on `/trips`.
- Filters, the home trip finder, the Olympiad "Which group am I?" finder, FAQ open/close, carousels, section pill menus, the mobile drawer menu.
- The enquiry form: empty submit shows field errors; Send stays disabled until consent is ticked.
- No sideways scroll at 390px (`document.documentElement.scrollWidth` must equal the window width), no broken images (`img.complete && img.naturalWidth === 0`), exactly one `<h1>`.

**Visual and layout**
- Alignment: cards in a row line up (titles, prices, buttons at the same height); nothing floats or is off-grid.
- Spacing: consistent gaps between sections; no huge empty bands; on phones no section is needlessly tall.
- Text: readable size (body 15px+, labels 13px+), enough contrast, no single word alone on the last line, no text over a busy photo without an overlay.
- Images: sharp at full width (use 1600px+ sources for banners), subject visible, captions match the photo.
- Mobile: long card lists use swipe rows (`rail`), tap targets at least 44px, the bottom bar never hides content or buttons.

**UX and content**
- Is the page's main action obvious within the first screen (Contact us, Explore trips, the Olympiad form)?
- Is anything repeated, confusing, or missing (prices, dates, who it is for, what happens next)?
- Trust: real photos, organiser names, safety and refund information easy to find.

## House rules (follow them in every suggestion)

- Only semantic colour tokens (primary, secondary, dark, muted, line, soft, light…), never raw colours in components.
- Never suggest removing content as done work: list possible cuts and let the user choose.
- Copy style: no dashes in ranges ("2 to 3"), sentence case, short plain sentences.
- Do not commit or push.

## Report format

Group findings by page. For each finding give:
1. **What** is wrong, in one sentence, with where (section name).
2. **Why** it matters to a visitor.
3. **Fix**: the concrete change (component or file if known).
4. **Priority**: High (broken or confusing), Medium (looks off, slows people down), Low (polish).

Start with a short summary of the 3 to 5 highest-impact fixes. Say plainly which checks passed. Then ask which fixes to apply.
