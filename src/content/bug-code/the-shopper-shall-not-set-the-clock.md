---
title: "The shopper shall not set the clock."
description: "Pricing logic abuse: a guest-writable shopper context activated a scheduled future discount in the product response and basket."
rule: "07"
order: 35
maxim: "Tomorrow's price is not today's permission."
mechanism: "Overprivileged guest token / shopper-context price manipulation"
outcome: "Future pricing reflected in product and basket; no completed payment or fulfilled purchase evidenced"
layout: rulebook
date: 2026-09-07
draft: false
---

The test did not submit a lower price. It submitted a different time.

The storefront used a pricing engine that could evaluate scheduled prices and promotions for a supplied effective date. Its guest client was allowed to write that date into the shopper's context. The product API and basket then used the resulting future price in the current shopping session.

This is the kind of business-logic flaw that can survive careful checks of the price field itself. The calculated price came from the server. The untrusted input was one of the assumptions used to calculate it.

*Requests follow the recorded flow with identifying details removed. Dates, product identifiers, and prices below are illustrative.*

## 01. A guest token is still a token with permissions

The storefront issued visitors a guest session token. No registered account was needed, but the API requests were not credential-free: they carried that guest bearer token.

The report records the `sfcc.shopper-context.rw` scope on the public client. That permission allowed a guest to update its own Shopper Context, including `effectiveDateTime`. Ownership of the session was not the missing check. The problem was allowing that owner to control an input with authority over pricing.

The baseline was an ordinary product read in the guest session. In this example, the current product price is 120.00 and a later scheduled price is 100.00. Those are not arbitrary amounts an attacker can choose; the pricing configuration must already contain a relevant future price or promotion.

## 02. Change the context, not the product

The recorded write used the same guest token and its own session identifier:

```http
PUT /shopper-context/guest-session-01?siteId=EXAMPLE HTTP/1.1
Host: commerce.example.invalid
Authorization: Bearer GUEST_TOKEN_REDACTED
Content-Type: application/json

{"effectiveDateTime":"2030-08-15T12:00:00Z"}
```

The source records HTTP 201 for the write. A subsequent context read returned the stored date. That matters because it distinguishes a silently ignored field from a value actually accepted into the pricing context.

Notice what the request does not contain: no product price, coupon code, administrative account, or modification to the promotion definition. The guest asks the existing engine to evaluate its own session as though a different point in time were current.

## 03. Repeat the same product read

The next request selected the same product under the same guest authorization:

```http
GET /products/item-01?siteId=EXAMPLE&expand=prices,promotions HTTP/1.1
Host: commerce.example.invalid
Authorization: Bearer GUEST_TOKEN_REDACTED
```

The report records a lower price and corresponding promotional price in the response. The storefront also displayed the changed price, and adding the item produced a basket line and total using it.

| Observation | Before the context write | After the context write |
| --- | --- | --- |
| Product selection | Same item | Same item |
| Caller | Guest session | Same guest session |
| Effective pricing date | Normal session context | Shopper-supplied future date |
| Product and basket price, illustrated | 120.00 | 100.00 |

That basket check is the important follow-through. A changed product-page label could be a display-only issue. A server-calculated basket accepting the changed price demonstrates that the injected context influences a commercial operation beyond presentation.

The evidence does not include a settled payment or a fulfilled order. The source discusses checkout impact, but the concrete result retained here is the product response and basket pricing. It would be inaccurate to turn that into a claim that goods were purchased at the lower price.

## 04. Why the server's calculation was still wrong

<figure class="case-flow"><figcaption>The input that changed the price</figcaption><ol><li><strong>Guest context write</strong><span>Supplies an effective date</span></li><li><strong>Pricing engine</strong><span>Selects scheduled price or promotion</span></li><li><strong>Product and basket</strong><span>Use the future result now</span></li></ol></figure>

The engine was doing what it was asked to do. Its configuration supported future-state evaluation, and the caller was given a permission that exposed that capability in a real shopping context. Correct arithmetic cannot compensate for an unauthorized premise.

Salesforce's [Shopper Context guidance](https://developer.salesforce.com/docs/commerce/sfra/guide/shopper-context-api.html) is directly relevant: it recommends setting context through a secure backend with a private client and warns about granting the scope to public clients. This reference was checked during editing. It explains why a guest's ability to update its own context is not automatically an appropriate permission.

The scope of the finding is also bounded by the engine's configured schedules. The test did not establish arbitrary pricing, free items, or a discount on every product. Other context fields and storefronts need their own evidence; sharing a platform does not make every possible pricing manipulation demonstrated.

## 05. Keep preview authority out of shopper sessions

Remove direct guest authority to set pricing-sensitive context. If the storefront needs context updates, a trusted backend should accept only the fields appropriate to the feature and derive sensitive values from server-controlled policy.

Future-pricing preview can still be useful for authorized staff. It should be isolated from live shopper baskets and orders, not exposed through the same guest capability. Revalidate the applicable commercial terms at checkout rather than trusting a context value because it was previously stored.

The regression sequence should preserve the original comparison: attempt the guest context write, then read the product and calculate a basket. A rejected write is useful; an unchanged server-calculated basket confirms that the unwanted pricing authority has not moved to another path.

<aside class="code-corollary"><strong>Corollary 07.a</strong><p>A price can be calculated correctly from a date nobody should have accepted.</p></aside>
