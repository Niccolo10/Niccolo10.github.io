---
title: "When an echo endpoint becomes a script runner"
description: "A missing Content-Type header, Go’s MIME detection, and the browser behavior behind CVE-2026-43644."
category: Advisory
date: 2026-09-06
cve: CVE-2026-43644
product: podinfo
featured: true
draft: false
---

An echo endpoint has a simple job: return the bytes it receives. That sounds harmless until the response reaches a browser. The distinction between returning text and serving a document is a security boundary in its own right.

This is a technical walkthrough of my [public podinfo advisory](https://github.com/Niccolo10/Security-Advisories/blob/main/CVE-2026-43644/cve-2026-43644.md), rather than a claim about the current state of every deployment. The advisory documents the behavior in versions through 6.11.2.

## The assumption

In the default direct-response configuration, podinfo’s echo handler reads the request body and writes it back. It sets an application-specific header and a status code, but does not explicitly choose a response media type.

The application is effectively delegating that choice to its HTTP stack. Go can detect a content type from the beginning of a response body. If those bytes look like HTML, the resulting response can be labelled as HTML.

## The turning point

> The interesting boundary wasn’t whether input came back unchanged. It was whether the browser treated those bytes as data or as a document.

The documented reproduction returned status 202 alongside `Content-Type: text/html; charset=utf-8`. An accepted response can still carry an executable HTML document. The status code does not make that content inert.

The chain was:

1. A requester controls the bytes sent to an echo endpoint.
2. The handler returns those bytes without selecting a non-HTML content type.
3. MIME detection identifies an HTML signature.
4. A browser renders the response in the endpoint’s origin.

## From response to browser impact

The advisory covers both `/echo` and `/api/echo`. Its browser demonstration uses a plain-text form submission to deliver the body through a navigation. This matters because a response observed in a command-line client alone does not demonstrate browser execution.

The demonstrated impact is reflected cross-site scripting in the podinfo origin, with user interaction required. The significance of that origin depends on deployment: cookies, neighboring applications, and available authenticated functionality all affect what an attacker could accomplish. Cross-origin account compromise should not be inferred from script execution alone.

## Make the response unambiguous

For an endpoint that returns arbitrary bytes, the response should explicitly identify them as non-HTML data before writing the body. The advisory’s proposed change uses `application/octet-stream`, adds `X-Content-Type-Options: nosniff`, and applies a restrictive content security policy.

The public advisory records a local verification of that change against version 6.11.2. That is a verification of the proposed patch, not a statement that all upstream or deployed versions have adopted it. Consult the current project release information when assessing a deployment.

## What this finding teaches

“We don’t modify the input” is not an output-handling guarantee. A browser interprets a response using both its bytes and its headers. When applications let untrusted bytes influence the content type, a utility endpoint can acquire capabilities its author never intended.

For testing, follow the response all the way to its consumer. For remediation, make the interpretation explicit.

## References

- [My full advisory and local reproduction](https://github.com/Niccolo10/Security-Advisories/blob/main/CVE-2026-43644/cve-2026-43644.md)
- [CVE-2026-43644 at NVD](https://nvd.nist.gov/vuln/detail/CVE-2026-43644)
- [Go: DetectContentType](https://pkg.go.dev/net/http#DetectContentType)
