---
title: "A mask shall not answer questions about what it hides."
description: "LIKE-wildcard injection: a public leaderboard masked account numbers in its output but let search filters test the hidden digits."
rule: "09"
order: 45
maxim: "Hiding the answer is not enough if the search will confirm it."
mechanism: "Wildcard matching / masked-identifier inference"
outcome: "Hidden account digits recovered and confirmed through exact-match searches"
layout: rulebook
date: 2026-09-07
draft: false
---

The leaderboard hid several digits of each account number. Its search function still matched against the full number, and it treated wildcard characters as instructions rather than literal input. The response could therefore answer questions about digits that the display was trying to keep private.

The key distinction is that this was not SQL injection. The recorded behavior did not require escaping a string literal, appending a clause, or changing the query structure. It used the search operator's intended pattern syntax in a place where literal identifier matching was expected.

*Examples use fictional identifiers and a replacement route. The SQL below is an executable teaching model, not recovered application source.*

## 01. Start with what the page already disclosed

The public board displayed a fixed mask over a sixteen-digit identifier. Nine digits remained visible and seven were hidden. A frontend minimum-length check on the search field did not change what the server accepted.

For example, a displayed value might look like `4827**50629*****`. The stars are presentation characters. They do not mean that those characters exist in the stored account number.

The report records the board data and API location in the page's server-rendered state. The API was therefore not found by guessing a hidden administrative endpoint. It was the ordinary backend used by a public leaderboard.

## 02. The search spoke a different language from the mask

A request using underscores in place of the hidden positions returned the matching row:

```http
POST /api/ranking/search HTTP/1.1
Host: ranking.example.invalid
Content-Type: application/json

{"board_id":"example-board","filter":"4827__50629_____"}
```

The report records that `_` matched one character and `%` matched a variable-length sequence. By contrast, searching for the displayed star-masked value did not return that row. Taken together, these observations showed that matching operated on the unmasked identifier, not the display string.

The distinction is easy to demonstrate on fictional data:

```sql
SELECT
  '4827315062981740' LIKE '4827__50629_____' AS pattern_matches,
  '4827315062981740' LIKE '4827**50629*****' AS display_matches;
```

The first expression is true; the second is false. The mask changed the output, but the search function still exposed a predicate over the secret value.

## 03. One matching row became a digit test

The researcher replaced a wildcard at one hidden position with a candidate digit while leaving the other hidden positions as wildcards. A matching response retained the same target row; a nonmatching response excluded it. Repeating that comparison resolved the hidden portion, and a final exact-value search confirmed the reconstructed identifier.

Here is the beginning of that comparison with the fictional row above:

| Filter | Result for the example row |
| --- | --- |
| `4827__50629_____` | Matches the partially known identifier |
| `48270_50629_____` | Does not match |
| `48273_50629_____` | Matches, fixing the next digit as 3 |

The useful signal is whether the target row remains in the result, not merely whether the response contains any row. Other accounts can share a visible prefix. Tracking the row's stable ranking context prevents a different match from being mistaken for confirmation.

<figure class="case-flow"><figcaption>The hidden value remained searchable</figcaption><ol><li><strong>Masked board entry</strong><span>Reveals part of an identifier</span></li><li><strong>Wildcard filter</strong><span>Tests the unmasked stored value</span></li><li><strong>Matching row</strong><span>Confirms a candidate hidden digit</span></li></ol></figure>

The source records recovered identifiers confirmed through exact matches. It does not support a claim that every board was harvested or that a bulk extraction algorithm was executed. The privacy failure is already clear from the demonstrated reconstruction.

## 04. Parameterization does not make a pattern literal

A safely bound SQL parameter can still contain wildcard syntax. For example, binding a value to `WHERE account_number LIKE ?` protects the query's structure, but the database will still interpret `_` and `%` as pattern characters unless the application handles them appropriately.

This is why reporting the issue as SQL injection would send remediation in the wrong direction. Prepared statements are important, but they do not establish that the caller is entitled to pattern-match a private identifier.

PostgreSQL's [LIKE documentation](https://www.postgresql.org/docs/current/functions-matching.html#FUNCTIONS-LIKE) provides a precise reference for the pattern semantics and escaping distinction. It is included to explain the operator, not to identify the target's database engine. The report does not establish that backend implementation.

The public endpoint needed no account. The result was disclosure of complete account identifiers, not proof of access to the accounts themselves. Any downstream API that accepts those identifiers needs a separate authorization assessment; this search finding does not automatically establish takeover or private-profile access elsewhere.

## 05. Remove the oracle, not just the visible wildcards

If a feature requires an exact account-number lookup, enforce the permitted length and character set on the server and use literal equality. If wildcard search is genuinely intended, its searchable fields must be information the caller is allowed to discover. Escaping metacharacters fixes the pattern behavior, but it does not make a sensitive identifier an appropriate public search key.

A stronger design gives leaderboard entries a separate public identifier, independent of the account number. Masking an underlying private value creates a temptation to reuse that value elsewhere in the feature, which is what made the display and search policies disagree here.

Regression tests should cover the whole information boundary: display, search, no-match behavior, and alternative filters. The question is whether the public feature can answer facts about hidden digits, not simply whether the stars still appear on screen.

<aside class="code-corollary"><strong>Corollary 09.a</strong><p>A hidden digit is not hidden if the server will mark your guesses.</p></aside>
