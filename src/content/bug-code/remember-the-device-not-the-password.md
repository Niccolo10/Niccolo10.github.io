---
title: "Remember the device. Forget the password."
description: "Recoverable password storage: a remember-me cookie retained a Base64-encoded password for 180 days, readable by page scripts."
rule: "06"
order: 50
maxim: "A change of alphabet is not a security control."
mechanism: "Recoverable password storage / script-readable persistent cookie"
outcome: "Password recovery demonstrated on an owned account; no attacker-side read primitive or completed takeover shown"
layout: rulebook
date: 2026-09-07
draft: false
---

This finding did not need a payload. A normal login with “Remember me” enabled was enough to put the account password into a browser cookie. The value looked different from the password because it had been Base64-encoded and URL-encoded. Reversing those operations recovered the original password exactly.

The interesting failure was a product feature implemented with the wrong kind of credential. Remembering a device should mean retaining a limited, revocable token. This implementation retained the secret used to establish the account's identity in the first place.

*Examples preserve the recorded behavior with a fictional password, cookie name, and host. The JavaScript below is a small reconstruction.*

## 01. Follow the successful login

The report records testing on an owned account. After entering valid credentials and selecting “Remember me,” the login script wrote a persistent cookie through `document.cookie`. The observed lifetime was 180 days, with `Path=/` and no explicit `HttpOnly`, `Secure`, or `SameSite` attribute in the writer.

The cookie subsequently appeared on an ordinary account request:

```http
GET /account HTTP/1.1
Host: shop.example.invalid
Cookie: session_id=REDACTED; remember_value=bGFiLXBhc3N3b3Jk
```

That second value is the Base64 encoding of the fictional string `lab-password`. It is not a hash and it is not encrypted. Its appearance alongside a session cookie does not make it another session token.

The useful investigation step was to trace the cookie writer in the login JavaScript and compare the decoded value with the password used for the test account. Merely finding an opaque-looking value in browser storage would not establish a password-storage bug.

## 02. Two encodings, no secret

The relevant transformation can be reduced to this local example:

```javascript
const password = "lab-password";
const cookieValue = encodeURIComponent(btoa(password));

const recovered = atob(decodeURIComponent(cookieValue));
console.assert(recovered === password);
```

URL encoding makes a value suitable for a particular textual representation. Base64 changes bytes into another representation. Neither operation requires a secret key to reverse it. The report's demonstration used the corresponding decoding operations on the cookie value and recovered the owned account's password.

The ASCII test string keeps the example focused on the observed encoding. A robust application's Unicode handling is a separate concern; fixing an encoding edge case would not correct the decision to store a recoverable password.

<figure class="case-flow"><figcaption>What the remember-me option retained</figcaption><ol><li><strong>Successful login</strong><span>JavaScript has the submitted password</span></li><li><strong>Persistent cookie</strong><span>Stores a reversible encoding</span></li><li><strong>Later script access</strong><span>Can recover the original secret</span></li></ol></figure>

## 03. Why the cookie attributes matter

A cookie written through `document.cookie` cannot be made `HttpOnly` by that writer. It remains accessible to JavaScript executing in the page's origin. That includes a third-party script loaded directly into the page, which executes with the page's privileges; it does not mean any unrelated website can read the cookie.

`Path=/` also made the value eligible for requests throughout the host's path space. The captured account request confirmed that the browser sent it back to the server. That broadens where the recoverable password travels, but does not prove a CDN, WAF, or application log actually recorded the cookie header. Logging configuration was not demonstrated in the report.

The missing explicit `SameSite` attribute should not be described as “all cross-site requests are allowed.” Browser defaults may apply. Likewise, the absence of `Secure` is a transport-hardening issue, not evidence that a password was intercepted over HTTP.

MDN's [cookie attribute reference](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie#httponly) is useful for these exact distinctions: script access, transport restrictions, and cross-site sending are separate controls. It is a reference checked during editing, not a documented discovery source.

## 04. Password exposure is not yet a completed takeover

The test proved that the application retained a recoverable account password and exposed it to its own script context. It did not demonstrate an XSS flaw, a compromised third-party script, or another attacker-side way to read a different user's cookie.

That missing step matters to the exploit story. An attacker would need a suitable read primitive before this becomes password theft from another account. If such a primitive existed, the exposed value would be more sensitive than a revocable session identifier: it would be the password itself. Credential reuse elsewhere is a possible consequence, not something established by this test.

The report also identified the same cookie-writing code in other storefronts. Shared code is useful evidence for follow-up review, but it is not the same as demonstrating the runtime behavior on every host. The article's confirmed example remains the tested account and storefront.

## 05. Remember a token instead

The corrective design is to stop writing the password-derived cookie and expire existing copies at the appropriate scope. A remembered-device feature can use a server-issued random token with expiry and revocation, protected with suitable cookie attributes. Store a verifier server-side rather than a recoverable password in the browser.

Adding `Secure` or `SameSite` alone would not fix the root problem. Even an `HttpOnly` cookie should not contain the password. The feature needs a different credential, not a different wrapper around the same secret.

For regression, log in with the option both enabled and disabled, inspect storage and outgoing requests, and confirm that no retained value decodes to the test password. Then check the replacement token's logout, expiry, and revocation behavior separately.

<aside class="code-corollary"><strong>Corollary 06.a</strong><p>Remember me is a convenience setting, not permission to keep my password.</p></aside>
