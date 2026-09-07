---
title: "A valid token shall speak for one account only."
description: "Account impersonation through email normalization: distinct authenticated subjects resolved to the same application account."
rule: "04"
order: 30
maxim: "Thou shalt not confuse a familiar name with a proven identity."
mechanism: "Identity normalization / incorrect account binding"
outcome: "Locally documented with researcher-controlled accounts; source marked draft, not submitted"
layout: rulebook
date: 2026-09-06
draft: false
---

The interesting part of this case happens after login. The identity provider issues a token for one person, but the application resolves it to another person's account. Nothing in that sequence requires a forged signature. A token can be genuine and still be used incorrectly.

The report documents an account-mapping discrepancy in a workforce application. Distinct provider identities were treated as the same application identity after an email-normalization step. The documented consequences included private-data access and a reversible change to an attendance record on researcher-controlled accounts.

*Examples are adapted from the report, with identifying details and credentials removed. Python illustrates the backend logic.*

## 01. First, separate the two account systems

There are two different records in this design. The identity provider owns the login identity: credentials, authentication, and a subject identifier. The application owns the business account: organization membership, role, and access to records. A backend must connect them, but the choice of connecting key is a security decision.

The reported application used an email-derived lookup where a stable provider identity was needed. The provider and application did not agree on which inputs represented the same identity. That disagreement mattered because the lookup selected an existing business account, not merely a display name.

Concretely, the source describes case-sensitive login usernames at the provider, but a lowercased email lookup in the application. Using fictional addresses, `reader@example.invalid` and `Reader@example.invalid` could belong to distinct provider subjects while both became `reader@example.invalid` at the application lookup. That is the collision the earlier draft left too abstract.

<figure class="case-flow"><figcaption>Where the identity changed meaning</figcaption><ol><li><strong>Identity provider</strong><span>Authenticates a distinct subject</span></li><li><strong>Application lookup</strong><span>Collapses an email attribute</span></li><li><strong>Business account</strong><span>Returns another account's context</span></li></ol></figure>

The failure is therefore more specific than “authentication bypass.” Authentication established a provider identity; the next layer attached the wrong application privileges to it.

## 02. The observation that matters

The report records this sequence on researcher-controlled accounts: establish the original account's identity and application profile; register a case-variant login that receives a different provider subject; authenticate that second login with its own chosen password; then use its token to request the current application user. The application returned the original user's account. The provider auto-confirmed the new registration, and the backend did not enforce email verification before using that attribute as an account key.

The relevant claims differed like this:

```json
{
  "original_identity": {
    "sub": "subject-a",
    "email": "reader@example.invalid"
  },
  "second_identity": {
    "sub": "subject-b",
    "email": "Reader@example.invalid"
  }
}
```

The diagnostic request was an ordinary authenticated profile read:

```http
GET /api/account/me HTTP/1.1
Host: api.example.invalid
Authorization: Bearer SECOND_IDENTITY_TOKEN_REDACTED
Accept: application/json
```

Its result was the original application account, despite the token's different `sub`. The attack did not alter a JWT, know the original password, or ask the original user to approve a login. It made the application choose the wrong account after normal authentication.

The decisive comparison in the source report is between the authenticated subject and the application account returned. A successful login by itself would establish very little. Even a familiar email in a response could be a presentation issue. Distinct subjects resolving to the same privileged account is the observation that crosses the security boundary.

Comparing the provider subjects with the application accounts makes the mismatch clear:

| Evidence field | Controlled identity A | Controlled identity B |
| --- | --- | --- |
| Provider subject | `subject-a` | `subject-b` |
| Expected application account | `account-a` | A separate account, or rejection |
| Documented application resolution | `account-a` | `account-a` |

This distinguishes identity confusion from a session accidentally left open in a browser. The source records a separate authenticated subject resolving into the existing application context. It also records a difference in email-verification state that the application did not enforce. That is relevant to the trust placed in the attribute, but it is not a substitute for checking the subject-to-account binding.

## 03. Why normalization cannot establish ownership

Normalization is useful for searching and displaying data. It is not evidence that two people are the same person. If two distinct provider identities collapse to one lookup key, the application needs a deliberate account-linking policy; silently selecting an existing account supplies that policy accidentally.

The important review question is not whether lowercasing is always wrong. It is whether a mutable or differently interpreted attribute is being used as the authority for account ownership. Changing the string function alone leaves that design assumption in place.

AWS's [Cognito guidance on user-pool case sensitivity](https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-case-sensitivity.html) addresses this exact mismatch and recommends a stable identifier such as `sub` instead of case-sensitive sign-in attributes. This is a reference checked during editing, not a resource the report records using during discovery.

## 04. A model of the corrected boundary

Token validation has already happened in trusted middleware, including signature, expected issuer and audience, expiration, and token purpose. This function only resolves a validated identity through a server-controlled binding.

```python
def resolve_account(validated_identity, bindings):
    # Subject identifiers are scoped to their issuer.
    key = (
        validated_identity["issuer"],
        validated_identity["subject"],
    )
    account = bindings.get(key)
    if account is None:
        raise PermissionError("No linked application account")
    return account
```

Notice what is absent: no email lookup, fallback to a matching profile, or automatic merge. An authenticated but unlinked identity receives a denial. Provisioning and account linking can still exist, but must be separate operations with their own ownership checks.

The second example is a regression test. It checks the property that the original account resolution failed to preserve: two distinct authenticated identities must not inherit one account merely because they share a profile attribute.

```python
bindings = {("issuer-a", "subject-a"): "account-a"}
known = {
    "issuer": "issuer-a",
    "subject": "subject-a",
    "email": "reader@example.invalid",
}
assert resolve_account(known, bindings) == "account-a"

# The same profile attribute does not establish the same identity.
for different in (
    {**known, "subject": "subject-b"},
    {**known, "issuer": "issuer-b"},
):
    try:
        resolve_account(different, bindings)
    except PermissionError:
        pass
    else:
        raise AssertionError("Distinct identity inherited an account")
```

A production review should also examine how bindings are created, migrated, and removed: a correct lookup cannot repair an incorrectly linked record.

## 05. Impact is more than a matching profile

The local evidence goes beyond displaying another account's name. It documents access to private signing-related data and a reversible attendance write in controlled account contexts, including an administrative context. Those observations support a confidentiality and integrity impact within the tested accounts.

They do not establish the number of affected customers, every role's reachable permissions, or an accepted program severity. The source proposes a broad account-takeover impact, but remains marked draft/not submitted. Those distinctions belong in the article, not in a footnote that contradicts the headline.

The underlying risk is that downstream authorization can operate exactly as designed and still authorize the wrong person. Once the lookup returns the wrong account, correctly enforced business permissions protect the wrong identity boundary.

<aside class="code-corollary"><strong>Corollary 04.a</strong><p>A signed introduction is not permission to assume somebody else's seat.</p></aside>
