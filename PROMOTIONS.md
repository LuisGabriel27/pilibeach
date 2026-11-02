# Seasonal promotions

The booking windows are defined once in `js/promotions.js`, using Philippine time (`+08:00`):

| Campaign | First day shown | Last day shown |
| --- | --- | --- |
| Habagat | July 1, 2026 | November 30, 2026 |
| Christmas celebrations | November 1, 2026 | December 31, 2026 |

`startsAt` is inclusive. `endsAt` is exclusive, so an offer ending November 30 uses December 1 at midnight. Years are explicit: an old promotion will not return automatically the following year.

Cards and room badges with `data-promotion="habagat"` or `data-promotion="christmas"` are shown only during their campaign's window. New seasonal cards and badges should have `hidden` in their HTML; the script reveals them when active.

Room `promoPrice` values and `promotionId` associations are in `js/main.js`. When a room's campaign is inactive, both its card and detail modal show **Check current rates** and retain the existing Cloudbeds booking links. Regular rates have not been supplied, so the site does not invent replacement prices. The same fallback applies when JavaScript is unavailable.

One active offer is centered. With no active offers, the promotions section shows a general availability link. Open tabs refresh at campaign boundaries and when visitors return to the page. Scheduling uses the visitor's device clock.

To renew an offer, review its dates, prices, and terms, then update the schedule and corresponding visible date labels. Keep `js/promotions.js` before `js/main.js` in `index.html`, and change the scripts' `?v=` values when updating them so cached copies are refreshed.

Run the scheduling and page-state checks with:

```sh
node --test tests/promotions.test.cjs
```
