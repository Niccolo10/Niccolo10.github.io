---
title: "An identifier shall not choose the route."
description: "Path-only SSRF: a product ID redirected a backend request to an internal staff directory, then a decoding error exposed the response."
rule: "07"
order: 15
maxim: "One field, one identifier. No detours."
mechanism: "Server-side path injection / constrained SSRF / error disclosure"
outcome: "Internal staff-directory response disclosed through a public error message"
layout: rulebook
date: 2026-09-07
draft: false
---

The public endpoint was supposed to return information about one product. It accepted a `productId`, inserted that value into an internal URL, and fetched the result. The destination host was fixed. The path was not.

The recorded test changed the upstream route through that identifier, reaching an internal staff-directory endpoint. The public service could not decode the directory's response as a product, so it returned HTTP 400. Its error message also included the upstream body. A failed product lookup had become a successful disclosure.

*Requests retain the relevant syntax with hosts, route names, and identifiers replaced. The JavaScript model illustrates URL construction without making a request.*

## 01. Establish what the identifier controls

A normal request with a numeric product identifier returned HTTP 200 and a single product. The backend constructed an upstream path shaped like this:

```text
Public input: productId=12
Upstream:    /catalog/api/v2/products/12/summary
```

The next useful observation was not an immediate directory dump. A slash inserted into the identifier produced a routing error that exposed the constructed upstream URL. The added segment appeared inside the path, demonstrating that the value was being treated as URL structure rather than as an opaque product identifier.

```http
GET /api/product-info?productId=1%2Fprobe HTTP/1.1
Host: shop.example.invalid
```

The report records an error identifying a route shaped like `/catalog/api/v2/products/1/probe/summary`. That narrowed the hypothesis considerably: changing the query parameter could change the server-side request's path. It did not establish control over the upstream hostname or HTTP method.

## 02. The question mark was as important as the traversal

The final input combined a parent-directory segment with an encoded question mark:

```http
GET /api/product-info?productId=..%2Fstaff%3Fx HTTP/1.1
Host: shop.example.invalid
```

There are two distinct effects. After the query value is decoded and interpolated, `../` selects a sibling route. The `?` starts the upstream query string, so the fixed `/summary` suffix no longer belongs to the path. It becomes part of the query instead.

This local model shows why that last character matters:

```javascript
const productId = "../staff?x";
const upstream = new URL(
  `http://catalog.internal.example.invalid/catalog/api/v2/products/${productId}/summary`
);

console.assert(upstream.pathname === "/catalog/api/v2/staff");
console.assert(upstream.search === "?x/summary");
console.assert(upstream.hostname === "catalog.internal.example.invalid");
```

The host stays exactly the same. This is constrained server-side request manipulation, not a primitive that can fetch an arbitrary internet address. The boundary crossed is between the public product route and other routes on its trusted internal service.

## 03. The response validator leaked what it rejected

Reaching the staff route was only half the disclosure chain. The internal endpoint returned a top-level JSON array, while the public backend expected a product response wrapped in a `data` object. Its decoder rejected the shape.

That rejection did not discard the data. The report records the upstream array inside the public error message. The caller received HTTP 400 containing the internal directory's records, including corporate account details and role information.

<figure class="case-flow"><figcaption>The route and response boundaries</figcaption><ol><li><strong>Product identifier</strong><span>Changes the internal request path</span></li><li><strong>Internal service</strong><span>Returns a staff-directory array</span></li><li><strong>Public decoder</strong><span>Rejects the shape but exposes the body</span></li></ol></figure>

The interesting interaction is that validation ran and still failed to protect confidentiality. Checking a response's schema is not sufficient if the failure message includes the rejected response. The error path needs its own output policy.

## 04. Keep the impact tied to the reachable operation

The recorded directory contained internal usernames, corporate email addresses, roles, and other staff-related fields. Some names and consultant information overlapped public sources. That does not make the bulk directory or its internal account metadata public.

The demonstrated operation was a read. The server-side client used GET; the evidence does not show changing the method, modifying staff records, or reaching arbitrary hosts. The report also distinguishes this staff-directory result from customer or borrower data, which it did not establish through this path.

No user account was required at the public product endpoint. The internal service's lack of an effective authorization check for this request allowed the public backend's network position to become a route to the directory. Calling an API “internal” did not make the request authorized.

## 05. Fix the identifier, the internal policy, and the error

Validate the product identifier according to its actual domain before constructing a URL. In this case, a numeric identifier did not need slashes, dot segments, or query delimiters. Do not rely on the fixed hostname as proof that the request cannot leave its intended resource scope.

The internal service should independently authorize access to staff data. The public product backend should not acquire broad directory privileges merely because it can connect to the same service. A constrained service identity and route-specific authorization limit the consequences of a path-construction mistake.

Finally, return a generic decoding failure and a correlation identifier to the caller. Keep the rejected upstream body in appropriately protected diagnostics if it is needed at all. The regression test must inspect both the selected upstream route and the public response body, including the 400 path.

<aside class="code-corollary"><strong>Corollary 07.a</strong><p>A fixed destination does not imply a fixed destination inside it.</p></aside>
