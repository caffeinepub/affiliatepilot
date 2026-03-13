# AffiliatePilot

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- Admin dashboard (login-protected) to manage affiliate offers/links
- Public storefront page listing affiliate offers with tracked outbound links
- Click tracking: every click on an affiliate link is recorded with timestamp
- Earnings tracker: admin manually logs commissions earned per offer
- Analytics: total clicks, earnings, conversion estimates per offer
- Offer CRUD: create/edit/delete affiliate offers (title, description, image URL, affiliate link, category, commission rate)
- Category filtering on the public storefront
- Featured offers section on the storefront

### Modify
N/A

### Remove
N/A

## Implementation Plan
1. Backend: Offers stable store (id, title, description, imageUrl, affiliateUrl, category, commissionRate, featured, active), Click events store (offerId, timestamp, userAgent), Earnings log store (offerId, amount, date, note)
2. Backend API: createOffer, updateOffer, deleteOffer, listOffers, recordClick, getClickStats, logEarning, getEarnings, getTotalEarnings
3. Authorization: admin role gates all write/management operations
4. Frontend public page: storefront with category filter, offer cards with tracked outbound links
5. Frontend admin: dashboard with offer management, click analytics, earnings tracker
