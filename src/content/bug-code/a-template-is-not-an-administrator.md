---
title: "A template shall not promote its author."
description: "Server-side template injection: brace-free QWeb syntax passed the WAF, then exposed privileged database reads and writes."
rule: "05"
order: 10
maxim: "Permission to write the message is not permission to run the office."
mechanism: "Server-side template injection / privileged ORM access"
outcome: "Denied direct access, privileged template reads, and a persisted own-record write documented; report pending"
layout: rulebook
date: 2026-09-07
draft: false
---

The strongest evidence in this case was a comparison. An internal account asked the application API to count records in a protected model and received an access error. The same account then asked a mail template to perform the operation with elevated ORM privileges. Rendering returned the count.

That is a more useful explanation than stopping at “the template evaluated 7 × 7.” Arithmetic established expression evaluation. The denied-query comparison established a security boundary being crossed. A later write to the researcher's own record showed that rendering could also persist a change.

*Requests are abridged from the report, with hosts and record identifiers replaced. Model names specific to the deployment are generalized.*

## 01. An internal account was not an administrator

The template test used a non-admin internal account. The source describes it being created through publicly reachable signup. A companion report records a form that did not display password fields, while its backend accepted `password` and `confirm_password` and provisioned an internal account.

That signup behavior is a separate prerequisite, not the template bug itself. The rendering requests below are authenticated. Calling the complete chain reachable from an unauthenticated starting point must not become the misleading claim that every template endpoint accepted requests without a session.

The template report concerns an Odoo deployment using QWeb for mail bodies. QWeb directives are executable template instructions, not ordinary HTML. The significant permissions were the ability to create a template and to invoke its rendering operation.

## 02. The WAF blocked one syntax, not the capability

The conventional brace-style template probes were blocked by the WAF. That was the reason for changing the payload, not a cosmetic preference. The application rendered QWeb, whose native output directive places an expression inside an XML attribute instead of surrounding it with template braces:

```xml
<div><t t-out="7*7"/></div>
```

The significant part is `t-out`. QWeb evaluates the attribute's expression and inserts its result into the rendered document. This body contains no template braces, but it still asks the server to evaluate `7*7`. The report records that this form passed the WAF and rendered successfully.

That gives two separate observations: the edge filter rejected the conventional syntax, while the template engine still accepted a native expression. It does not identify the WAF rule or prove that every brace-containing input was blocked. The practical lesson is to identify the actual renderer and its supported syntax instead of treating a blocked generic probe as evidence that evaluation is unavailable.

The account saved this in `body_html`, then invoked `generate_email`. Here is the rendering request with example IDs:

```http
POST /web/dataset/call_kw HTTP/1.1
Host: backoffice.example.invalid
Content-Type: application/json
Cookie: session_id=REDACTED

{
  "jsonrpc": "2.0",
  "method": "call",
  "params": {
    "model": "mail.template",
    "method": "generate_email",
    "args": [[41], 702, ["body_html"]],
    "kwargs": {}
  }
}
```

The selected fields in the response were:

```json
{
  "body_html": "<div>49</div>",
  "body": "49"
}
```

The response came from generation, not from a victim opening an email. There is no need to introduce a browser recipient into this exploit. The server evaluated the expression and returned its result through the RPC response.

Expression evaluation can be intended behavior for a trusted template editor. The security question was whether this ordinary account could use it to do something its application permissions prohibited.

## 03. Compare the normal path with the rendering path

The direct API request selected a protected document model and called `search_count`. The report records an `AccessError` identifying groups the caller did not belong to. It then records the same model operation inside a template, reached through `object.env` and elevated with `.sudo()`.

With the deployment-specific model renamed, that expression was:

```xml
<div>
  <t t-out="object.env['example.document'].sudo().search_count([])"/>
</div>
```

`object.env` provides the model registry and environment. `sudo()` requests superuser mode for the recordset. `search_count([])` counts records without a filtering domain. The same save-and-render sequence now returned a count instead of an access error. The privilege change was inside the expression, not in the caller's session token.

| Path | Caller | Recorded result |
| --- | --- | --- |
| Direct protected-model query | Internal non-admin account | Access error |
| Template expression using elevated ORM access | Same session | Record count returned |
| Template reading a protected configuration value | Same session | Value returned |

The count demonstrated access to an operation that the direct API denied. It did not demonstrate downloading every document counted. The protected configuration read provided a separate confidentiality result, without publishing that value here.

The dangerous object in the rendering context was not just a string to format. It gave expressions access to the application environment and privileged database operations. The report also records permissive rendering configuration and template-editor membership available to ordinary internal users. Together, those conditions made the template editor a route around normal model checks.

<figure class="case-flow"><figcaption>One session, different effective authority</figcaption><ol><li><strong>Template author</strong><span>Ordinary internal account</span></li><li><strong>Expression context</strong><span>Exposes privileged ORM operations</span></li><li><strong>Database operation</strong><span>Succeeds where direct access failed</span></li></ol></figure>

## 04. A write distinguished rendering from read-only exposure

The report next checked ordinary write permission on a contact model. The API returned `false`. A template then changed a comment on the researcher's own contact record through the elevated path.

The evidence did not end with a template returning `True`. A normal read of that contact returned the new comment, confirming that the change had persisted. The recorded cleanup restored the comment and removed the test templates.

This supports both confidentiality and integrity impact within the demonstrated application operations. It is not proof of operating-system root access, a shell, or unrestricted process execution. An application superuser and the operating-system user are different identities. The article's central finding is privileged database access through template evaluation, which is already consequential.

## 05. Restrict both authorship and rendering capability

The first correction is to prevent public signup from creating an internal staff identity. The second is to restrict template editing to appropriately trusted roles. Neither should be confused with constraining what the renderer itself exposes.

A template that accepts untrusted authorship should not expose database environments or privilege-elevating operations. Where rich rendering is required, apply the framework's restricted-rendering controls and verify them in the exact deployed version. Do not rely on a WAF recognizing one expression syntax: the authorization decision belongs in the application.

The regression comparison should remain the same as the investigation: a caller denied a model operation directly must not acquire it indirectly by rendering a message. Verify both reads and own-record writes in a controlled test environment. An arithmetic result alone cannot establish whether that boundary is fixed.

<aside class="code-corollary"><strong>Corollary 05.a</strong><p>A preview button should preview a message, not a promotion.</p></aside>
