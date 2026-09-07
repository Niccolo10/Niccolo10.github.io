---
title: "An invitation shall admit its recipient. Nobody else."
description: "Privilege escalation through invitation hijacking: a missing recipient check assigned an administrator role to a different account."
rule: "01"
order: 900
maxim: "Possession of the invitation does not constitute an invitation."
mechanism: "Broken access control / invitation acceptance"
outcome: "Approved by triage; ordinary-member access and a pending admin invite required"
layout: rulebook
date: 2026-09-06
draft: false
---

The bug was in the handoff between an invitation and an account. An ordinary member could see invitations intended for other people. The acceptance operation then allowed a different account to receive the role attached to one of those invitations, without checking that it belonged to the intended recipient. A pending administrator invitation therefore became a way to obtain administrator privileges.

Two authorization failures combined: **excessive invitation visibility**, followed by **missing recipient validation at acceptance**. The second failure converted exposed information into elevated access.

*Examples are adapted from the report, with identifying details and credentials removed. Python illustrates the backend logic.*

## 01. What the application was supposed to do

An administrator invited a person to join an organization. Creating that invitation also prepared a record with the intended role. On acceptance, the application connected a user account to that record.

In Example Workspace, Alex is the intended administrator; Sam is an ordinary member.

| Record | Before acceptance |
| --- | --- |
| Organization | Example Workspace |
| Invitation | `invite-01`, pending |
| Intended recipient | `alex@example.invalid` |
| Prepared membership | Administrator role, no user attached yet |
| Sam’s existing access | Ordinary member |

The administrator role already existed in a prepared record. Accepting the invitation would determine **which account received it**.

## 02. What an ordinary member could see

The report documents that the invitation-listing operation was available to ordinary members and returned pending invitations across their organization, including administrative ones.

The invitation identifier did not have to be guessed: the application disclosed it through an authenticated session. This was not an outsider entering an arbitrary organization. The test began with an existing low-privilege membership.

The listing request used the ordinary member's session:

```http
GET /api/organizations/workspace-1/invitations HTTP/1.1
Host: api.example.invalid
Authorization: Bearer MEMBER_TOKEN_REDACTED
Accept: application/json
```

The report records that the result exposed a pending administrative invitation's UUID. It does not include the raw listing response body, so there is no invented JSON response here. The important facts are the caller's ordinary-member role, organization-wide invitation visibility, and a pending administrator invitation.

At this point, the observation was an information-access problem. The escalation depended on what acceptance would do with that information.

## 03. Where the role changed hands

The acceptance request supplied a user identifier. The backend attached that user to the invitation’s prepared role record without verifying that the accepting account matched the intended recipient.

The recorded chain used a second researcher-controlled account. After registering it, the tester created its application user record and retrieved its user ID. That distinction matters: an identity-provider account and an application user record were separate objects. Registration made the second account usable; it did not itself grant administrative privileges.

The decisive request used the **second account's token**, the **exposed invitation identifier**, and the **second account's user ID**:

```http
PUT /api/invitations/invite-01 HTTP/1.1
Host: api.example.invalid
Authorization: Bearer SECOND_ACCOUNT_TOKEN_REDACTED
Content-Type: application/json

{"user_id": "second-account"}
```

There is no `role: administrator` in that body. The administrator role was already attached to the invitation's prepared membership record. The request changed which user received that record. The missing check was whether the authenticated account was the invitation's intended recipient, not whether the client had typed a forbidden role name.

The behavior can be reduced to this Python model:

```python
# Reconstructed behavior; not the application's source.
def accept_vulnerable(invite, supplied_user_id):
    if invite["status"] != "pending":
        raise ValueError("Invitation is not pending")

    # Missing: is this the intended, verified recipient?
    return {
        "user_id": supplied_user_id,
        "organization": invite["organization"],
        "role": invite["role"],
    }
```

The invitation has to be pending, but the function never establishes whether the account receiving its permissions is entitled to accept it. Authentication identifies a caller; it does not authorize that caller to redeem somebody else’s invitation.

In the documented test, a fresh researcher-controlled account received the administrative role. The account-creation behavior made that account available; the decisive step was attaching it to the privileged record.

<figure class="case-flow"><figcaption>Authority transfer in the documented chain</figcaption><ol><li><strong>Ordinary member</strong><span>Can see another person’s pending invitation</span></li><li><strong>Acceptance operation</strong><span>Does not bind the recipient to the accepting account</span></li><li><strong>Different account</strong><span>Receives the prepared administrator role</span></li></ol></figure>

## 04. What proved the impact

The resulting account was recognized as an administrator. Triage approved the report and explicitly considered its prerequisites: ordinary-member access and a pending administrative invitation.

| Actor | Before | After |
| --- | --- | --- |
| Existing test member | Ordinary member | Still an ordinary member |
| Fresh test account | No administrative membership | Administrator in the organization |
| Intended recipient | Named on the invitation | Not the account that received the role |

The original member did not need to change its own role directly. The escalation completed through a second account. The report discusses the authority associated with the administrator role; this article does not claim every possible administrative action was tested.

## 05. Bind the permission to the person

Acceptance needs a recipient check before attaching an account to the prepared membership. The user identifier must come from the authenticated session, and any email used for matching must be verified through a trusted identity flow.

This model isolates that correction:

```python
# Both fields of authenticated_user come from trusted middleware.
# verified_emails is NOT accepted from the request body.
def accept_with_recipient_check(invite, authenticated_user):
    if invite["status"] != "pending":
        raise ValueError("Invitation is not pending")

    if invite["recipient"] not in authenticated_user["verified_emails"]:
        raise PermissionError("This invitation belongs to someone else")

    return {
        "user_id": authenticated_user["id"],
        "organization": invite["organization"],
        "role": invite["role"],
    }
```

A full implementation must also validate expiry, organization and inviter authority, and the permitted role; create the membership and consume the invitation atomically; and use a consistent server-side identity-matching policy. Restricting invitation visibility is a separate fix. Random identifiers and single-use tokens do not replace recipient validation.

The regression test: **a valid invitation must still be rejected when the authenticated account is the wrong recipient**. The rightful recipient should succeed, and a second redemption should fail.

<aside class="code-corollary"><strong>Corollary 01.a</strong><p>A UUID may be difficult to guess. It is not proof of identity.</p></aside>
