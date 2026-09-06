---
title: "A service shall not lend its privileges to strangers."
description: "An unauthenticated processing API used its managed identity to access storage, and its error handler returned a readable diagnostic object."
rule: "02"
maxim: "The service has credentials. This does not mean you do."
mechanism: "Missing API authentication / service identity misuse"
outcome: "No-auth processing and a signed diagnostic-object read documented"
layout: rulebook
date: 2026-09-06
draft: false
---

The frontend required a login. Its document-processing API did not. In the recorded test, a request with no authentication header reached the processing code, failed, and returned a signed URL. Fetching that URL returned HTTP 200 with the request data and a Python stack trace from cloud storage.

The bug combined a missing API authentication check with privileged server-side storage access and an error handler that handed its caller a storage capability. A separate PDF operation accepted a container and object path from the request and attempted to retrieve that object using the service's managed identity. **The signed-link test demonstrated a diagnostic-object read. The PDF test demonstrated processing behavior, not disclosure of the original file.**

*Examples are adapted from the report, with identifying details and credentials removed. Python illustrates the backend logic.*

## 01. Two identities, one missing decision

A managed identity lets a cloud application access resources without embedding a long-lived storage password in its code. It establishes whether the service is allowed to access storage. It does not decide whether an HTTP caller is entitled to request that access.

The frontend sent authentication information, but the API did not validate it before executing business logic. Storage consequently saw the service’s authorized identity even when the original caller had no valid session.

<figure class="case-flow"><figcaption>The request crossed two separate trust boundaries</figcaption><ol><li><strong>HTTP caller</strong><span>No API authentication enforced</span></li><li><strong>Processing service</strong><span>Uses its own managed identity</span></li><li><strong>Cloud storage</strong><span>Evaluates the service’s permissions</span></li></ol></figure>

Private storage can remain private and still be misused through an application that has access to it. The missing decision was at the API boundary.

## 02. A request without credentials still reached the worker

The recorded request called an image-processing operation without a cookie or `Authorization` header:

```http
POST /api/segment HTTP/1.1
Host: processing.example.invalid
Content-Type: application/json

{
  "function": "classify_items",
  "pdf_name": "sample.pdf",
  "username": "test-user",
  "project_name": "test-project",
  "container_name": "sample-projects",
  "existing_hits": [],
  "zones": [],
  "symbols": [],
  "page_number": 1
}
```

The response was HTTP 500 and contained a Python stack trace and a signed diagnostic URL. The important observation was not merely that it returned 500 rather than 401. The handler had executed application logic and generated a storage object before answering an unauthenticated caller. A generic reverse-proxy error would not demonstrate that.

The request's `username` was also just input, not an authenticated identity. The source records that changing it changed the diagnostic object's path. That supports caller-controlled log naming; it does not establish a login as the named user.

## 03. The PDF path borrowed the service's access

One operation accepted a storage location from the request, downloaded the object using the service identity, and attempted to process it as a document. The report describes no caller authentication or authorization binding that location to an allowed resource.

The concrete test selected an SVG for a PDF compression operation:

```http
POST /api/document HTTP/1.1
Host: processing.example.invalid
Content-Type: application/json

{
  "function": "compress_pdf",
  "container_name": "sample-assets",
  "compressed_type": "medium",
  "blob_path": "catalogue/diagram.svg"
}
```

The observed response was a Ghostscript error about a missing trailer dictionary while recovering a damaged file. An SVG is not a PDF, so a failure at the PDF parser is consistent with the selected object reaching that parser. The interesting input was not an exotic injection string: it was a storage reference the caller had no business authorizing.

Here, `storage` is a client authenticated as the service:

```python
# Reconstructed behavior; not original application source.
def process_vulnerable(request, storage, parse_document):
    # No caller authentication or resource authorization here.
    container = request["container"]
    object_path = request["object_path"]
    content = storage.download(container, object_path)
    return parse_document(content)
```

The problem is the ordering: caller-controlled resource selection reaches storage before the application establishes who the caller is and what they may access. The storage SDK can authenticate the service correctly while the application fails to authorize the request.

## 04. What the two failures actually established

The operation can fail before a download succeeds or after content reaches a parser:

```text
Request
  -> Download object using service identity
       -> Download fails: retrieval error
       -> Download succeeds:
            -> Parse document
                 -> Parse fails: processing error
                 -> Parse succeeds: normal result
```

The distinction mattered because an HTTP failure is not necessarily a failed security test. If a request reaches a document parser, the application may already have performed privileged work before producing the error. The recorded processing error was consistent with an object being downloaded and passed to that processor. It narrowed the explanation from “the service rejected the request” to “the service attempted the requested work, then failed.” The response did not return the document’s contents to the requester.

A retrieval error is weaker evidence. It does not, by itself, prove a container exists or that all its objects are accessible. Different storage failures can be collapsed into the same application error.

That is how to read this part of the investigation: identify which component could have produced each observation, then stop the claim at that boundary. Parser behavior supports a processing-path conclusion. A direct content response would be needed for a stronger disclosure claim. The report's second path supplied a narrower, concrete read result instead.

## 05. From an error response to a confirmed object read

A separate processing operation wrote diagnostics to storage when it failed. The response included a signed link to that diagnostic object. Such a link is a temporary capability: its holder can perform the covered operations on the covered resource until it expires.

The documented sequence was:

1. An unauthenticated request reached processing logic.
2. Processing failed and created a diagnostic object containing request data and a stack trace.
3. The error response returned a signed link for that object.
4. Reading the link returned the diagnostic contents.

The next request went to storage, not back through the processing API:

```http
GET /errors/test-user/test-project/run-01/Error.json?se=REDACTED&sp=rt&sv=2020-02-10&sr=b&sig=REDACTED HTTP/1.1
Host: storage.example.invalid
```

Storage returned HTTP 200 with `FunctionName`, `args`, and `stacktrace`. The relevant structure was:

```json
{
  "FunctionName": "Processing / classify_items",
  "args": {
    "function": "classify_items",
    "pdf_name": "sample.pdf",
    "username": "test-user",
    "project_name": "test-project"
  },
  "stacktrace": "[Python trace omitted]"
}
```

This was the direct disclosure proof: the link delivered to an unauthenticated requester retrieved stored diagnostic content. The reflected test arguments alone were not somebody else's confidential data; the internal trace and unintended storage access are the relevant observations.

This established read access to **the generated diagnostic object**. It did not show that the same link authorized other objects or that every object available to the service identity was downloadable by the requester.

The signed link introduces a different authority from the managed identity. Storage authenticated the application during processing; later, the holder of the link could use its delegated permission. These are connected events, not interchangeable credentials. The source does not establish which SAS signing mechanism was used, so this article does not attribute the link to a particular key type.

The retained query fields explain the scope: `sr=b` denotes a blob; `sp=rt` includes read and blob-tag permissions; `se` sets expiry. Only reading the object was demonstrated; tag operations were not tested. Microsoft's [SAS resource and permission tables](https://learn.microsoft.com/en-us/rest/api/storageservices/create-service-sas#specify-the-signed-resource-blob-storage-only) are a precise reference for interpreting these fields. This reference was checked while editing the article; the report does not record using it during discovery.

| Observation | What it established |
| --- | --- |
| Business logic ran without authentication | The API admitted an unauthenticated caller |
| Document parsing failed after retrieval | Evidence consistent with internal content processing |
| A signed diagnostic link returned data | Confirmed read of that generated object |

## 06. Fix the two authorization boundaries

Authenticate the caller and resolve an authorized application resource before invoking storage. Storage locations should come from a server-controlled resource record rather than unrestricted container and path values in the request.

This model uses an organization-scoped policy to illustrate the check. Real applications may need narrower permissions for individual documents.

```python
# user comes from trusted authentication middleware.
# documents is a server-controlled resource catalog.
def process_authorized(user, document_id, documents, storage, parse_document):
    if user is None:
        raise PermissionError("Authentication required")

    document = documents.get(document_id)
    if document is None or document["organization"] != user["organization"]:
        raise PermissionError("Document not available")

    content = storage.download(
        document["container"], document["object_path"]
    )
    return parse_document(content)
```

An unauthenticated or wrong-organization request now fails **before any storage call occurs**. That ordering is a useful regression test. Presenting a valid token should not unlock arbitrary storage paths.

Limit the managed identity to the resources the service needs. For errors, return a correlation identifier and keep detailed traces internally. If users need diagnostic downloads, authorize them separately and constrain the signed link’s permissions and lifetime.

<aside class="code-corollary"><strong>Corollary 02.a</strong><p>An error response is still a response. Check what it hands back.</p></aside>
