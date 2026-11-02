# LDMA website navigation and journey audit
**Date:** 2 November 2026  
**Scope:** 2027 feature branch / Vercel Preview only. Production remains unchanged.

## Why the audit was requested
LDMA requested a thorough review of the logo, Home navigation, header tabs, footer tabs, course filters and links, avoiding unfinished modules, repeated forms, and destinations that lead nowhere.

## Findings and fixes

| Finding | What changed on Preview |
| --- | --- |
| Homepage **My LDMA** tab opened an unready student portal placeholder | Removed the tab and the portal section from the public homepage until a real backend and admissions workflow are ready. Portal source code remains available for later development. |
| **AI Lab** tab sounded like a working standalone product but pointed back to a general course area | Removed the misleading header tab. Repositioned the existing AI pillar as **Practical AI Training** and linked it to the real 2027 AI programme in the calendar. |
| Homepage **Store** section showed a catalogue awaiting activation | Removed the Store from the public homepage and footer; underlying module remains in the repository for later launch. |
| Homepage **Corporate Training Brief** duplicated the dedicated corporate enquiry flow | Removed the duplicate homepage form; /for-business/ is the single dedicated corporate training enquiry journey. |
| Homepage course details modal provided a second generic email-enquiry form that competed with the real 2027 application journey | Simplified the course detail modal to direct visitors to /calendar/ and /apply/. |
| Career Hub and Events were labelled as in development and had homepage/footer destinations | Removed the unfinished placeholder sections and their footer links from public navigation until there is real content to show. |
| Corporate header **Individual learning** link opened the top of the homepage instead of the programmes | Updated it to /#programmes. |
| Incoming deep links such as /#programmes and /#trainee-stories might not scroll correctly because React renders after the initial HTML | Added a post-render hash scroll to the homepage. |
| Homepage logo navigated only to the local #top anchor | Changed it to / so the logo consistently means Home across the site. |
| The homepage FAQ implied no dates or fees had been published | Clarified that /calendar/ contains proposed 2027 dates and fees, subject to confirmation. |
| Footer links were scattered across live and incomplete sections | Replaced with a concise set of actual destinations. |

## Homepage header destinations
1. **Logo** → / (Home)
2. **Courses** → /#programmes
3. **Battleship** → /battleship/
4. **Dates & Fees** → /calendar/
5. **For Business** → /for-business/
6. **Trainee Videos** → /#trainee-stories
7. **Resources** → /insights/
8. **Find Your Edge** CTA → /#course-finder

No two main navigation tabs lead to the same destination. The logo is the Home control, avoiding a redundant Home tab on the homepage.

## Other user journeys
- **Course finder:** user chooses goal and experience → opens relevant learning-area detail → /calendar/ for real programmes → /apply/ to prepare the application. The finder no longer jumps behind an open modal.
- **Battleship:** /battleship/ explains the programme, shows actual Instagram trainee recordings, and links to /apply/?programme=battleship.
- **Corporate:** /for-business/ is the single corporate enquiry form; fallback is an email draft that requires the visitor to press Send.
- **Calendar:** all six programme filters and 20 session application links remain in place. Filters are wired to update session visibility and counts.
- **Student application:** three-step form validates selections, contact details and consent; online intake is feature-gated. When not enabled, it prepares an email draft; it does not reserve a seat or collect payment.
- **Testimonials:** 11 original Instagram Reel URLs; initial three cards and a reveal-all option. Instagram iframe loads only after user action, with original Reel fallback links.
- **Ask LDMA:** links to Battleship, Calendar, Application, Corporate Training, Insights and real trainee videos.

## Checks run
- New `scripts/audit-navigation.mjs` validates the **10 defined pages**, **195 local link references**, internal route existence, hash destinations, consistent logo/Home behaviour, distinct navigation tabs, and absence of unfinished public homepage modules.
- `scripts/check-site.mjs` still validates required pages and admissions/AI protections.
- Existing automated tests: **42 passed, 0 failed**.
- Verified Vercel Preview GET HTTP **200** for all 10 public routes and the LDMA logo; an invalid path returned **404** on the prior Preview.
- Inspected the deployed JS bundles: the homepage contains the updated navigation and hash handling and does **not** include the unready Portal/Store placeholders or duplicate corporate form.

## Limits and final approval
This is a thorough **source, link-graph, build and deployed HTTP audit**, not a full human browser session. Before production, manually check mobile menu layout, modal close/keyboard behaviour, actual Instagram embed playback (subject to Instagram restrictions), the calendar filter controls, and the final email application flow in a real browser. Do not enable the portal, catalogue or online application until their backends are approved. Do not merge or deploy Production without LDMA's explicit approval.
