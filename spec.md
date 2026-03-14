# AffiliatePilot

## Current State
A full-stack affiliate marketing platform with a public storefront showing affiliate offers, click tracking, and an admin dashboard to manage offers and log earnings.

## Requested Changes (Diff)

### Add
- Stripe payment integration so the admin can receive payments from visitors/buyers
- A "Support / Buy" or "Make a Payment" option on the storefront for visitors to pay the site owner directly
- Payment history visible in the admin dashboard

### Modify
- Admin dashboard: add a Payments tab showing received payments
- Storefront: add a visible way for visitors to send a payment (e.g. a tip jar or support button)

### Remove
- Nothing removed

## Implementation Plan
1. Select the `stripe` Caffeine component
2. Regenerate backend to include Stripe payment recording (createPayment, listPayments)
3. Add a "Support This Site" / tip-jar section to the storefront with a Stripe checkout button
4. Add a Payments tab to the admin dashboard showing all received payments with amount, date, and payer info
