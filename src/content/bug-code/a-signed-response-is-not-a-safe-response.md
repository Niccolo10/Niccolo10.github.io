---
title: "A signature shall not vouch for what the parser swallowed."
description: "Unauthenticated XXE in SAML: local DTD reuse turned a signed error response into a server-file disclosure channel."
rule: "03"
order: 20
maxim: "Signing the answer does not make the question safe."
mechanism: "XML external entities / local DTD reuse / response reflection"
outcome: "File-content disclosure recorded; submitted report marked pending"
layout: rulebook
date: 2026-09-07
draft: false
---

The distinctive part of this finding was not simply that the XML parser resolved an external entity. It was where the resulting content appeared: inside `InResponseTo`, a SAML response attribute normally used to associate an answer with its request. The identity provider returned an error, but that error carried data read from its own filesystem.

The report records an unauthenticated path through XML parsing, local DTD reuse, and response generation. A valid login was not needed to reach the vulnerable parser. Nor was successful authentication the outcome. The result was file disclosure through an authentication protocol's error handling.

*Examples adapt the recorded mechanism with identifying details removed. The XML excerpts isolate the relevant fields.*

## 01. Decode the transport before reasoning about the request

The endpoint received a `SAMLRequest` query parameter. In the recorded flow, that value wrapped XML in DEFLATE compression, Base64, and URL encoding. On the wire, the request looked like this:

```http
GET /saml/test-idp/sso?SAMLRequest=ENCODED_XML&RelayState=test-01 HTTP/1.1
Host: identity.example.invalid
```

There was no authenticated session in that request. The server still needed to inspect the message to decide how to respond. That made the parser configuration part of the unauthenticated attack surface.

The report describes a DNS callback as the initial confirmation of external-entity resolution. A callback answers a narrow question: did processing cause a lookup? It does not establish that a file was readable, that its contents were returned, or that an internal service was accessible. The later response evidence established the stronger result.

## 02. The local DTD was the important component

An XML document can declare entities through a document type definition. With unsafe resolution enabled, processing those declarations can cause the parser to load external resources, including local files. The interesting complication here was how to turn the loaded bytes into content the application would return.

The recorded technique reused an XML Schema DTD bundled inside a servlet API JAR. It overrode the parameter entity named `xs-datatypes`, introduced a general entity whose value came from a selected file, then loaded the expected datatype declarations so processing could continue. The local DTD supplied an existing external declaration context; it was not a file uploaded by the researcher.

That distinction separates this case from a basic demonstration where an attacker-controlled web server hosts a DTD. The useful resource was already installed with the application. The request caused the parser to reinterpret it with an overridden entity definition.

PortSwigger's [explanation of local DTD reuse](https://portswigger.net/web-security/xxe/blind#exploiting-blind-xxe-by-repurposing-a-local-dtd) is useful here: it explains why redefining a parameter entity from an external DTD changes what declarations are permitted. Its example returns data in a parser error. This case instead carried data into a SAML response field. The reference was checked during editing; it is not recorded as a discovery source.

The source's encoded payload combines those declarations with a request field that is later reflected. The excerpts below show the resulting data movement, not a complete SAML document or DTD:

```xml
<!-- Request field after the DTD has defined file_text. -->
<samlp:AuthnRequest
  xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol"
  ID="&file_text;" />
```

The general entity supplies the request identifier's value during parsing. The application then sees that expanded value as the identifier it should reference in its answer. The source documents file-content reflection for this parser; the fragment alone is not a portable XML recipe.

## 03. The error response became the output channel

The decisive evidence was the returned `SAMLResponse`. After decoding it, the report found file content in `InResponseTo`. Using a harmless hostname-like value to illustrate the field:

```xml
<samlp:Response
  xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol"
  InResponseTo="lab-idp-node">
  <!-- Other response fields and the signature omitted. -->
</samlp:Response>
```

The full recorded response was signed by the identity provider. The signature was not forged or bypassed. Response generation signed a message that already contained the unintended data. No successful SSO session was required, and there is no evidence here of an attacker issuing a valid login assertion.

<figure class="case-flow"><figcaption>The disclosure path</figcaption><ol><li><strong>Request parser</strong><span>Resolves a file-backed entity</span></li><li><strong>Request identifier</strong><span>Receives the expanded content</span></li><li><strong>Error response</strong><span>Returns it in InResponseTo</span></li></ol></figure>

This is why checking only whether authentication succeeded would miss the finding. A rejected protocol exchange can still disclose data before it ends.

## 04. What was actually readable

The report records content from system text files, runtime configuration, and directory listings. That supports a substantial confidentiality impact. It also records important limits: XML-sensitive characters and binary or NUL-containing data did not fit the demonstrated response channel. This was not a universal binary-file download primitive.

Reading a normally restricted file is evidence that the process could access it. By itself, it is not proof of the process's effective user ID: file permissions, container configuration, or mounted copies can change that interpretation. The article therefore does not turn file readability into a claim of root execution.

The source explicitly records that the signing private key was not recovered and no remote code execution or assertion forgery was demonstrated. Those are different outcomes, not automatic consequences of a file read. The confidentiality result stands without them.

## 05. Stop resolution at the parser boundary

A SAML handler should reject DTD-bearing input and disable external general entities, external parameter entities, external DTD loading, and XInclude wherever applicable to its parser. Each parser creation path needs the same policy. A safe configuration on one endpoint does not protect another parser pool used for logout or error handling.

The useful regression test is an input containing a DTD that references a controlled local marker. The expected result is rejection with no resource resolution and no marker in the response. Run it through the actual protocol handler, including its error path, rather than testing an unrelated XML utility in isolation.

Output escaping is not the primary fix: by the time the response serializer sees the value, the filesystem read has already happened. Signing the result also does nothing to prevent that read. The boundary to repair is where untrusted XML can ask the server to load a resource.

<aside class="code-corollary"><strong>Corollary 03.a</strong><p>An error may reject the login and still answer the wrong question.</p></aside>
