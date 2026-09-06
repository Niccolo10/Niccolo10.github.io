---
title: "The moment JSON stops being data"
description: "Following a constructor name into dynamic code generation in TeleJSON."
category: Advisory
date: 2026-09-06
cve: CVE-2026-47099
product: TeleJSON
featured: true
draft: false
---

JSON is a data format. A deserializer can nevertheless give that data much more power than its name suggests.

My [public advisory for CVE-2026-47099](https://github.com/Niccolo10/Security-Advisories/blob/main/CVE-2026-47099/cve-2026-47099.md) concerns TeleJSON before version 6.0.0. The issue sits in object reconstruction: input describing an object’s constructor can become part of dynamically generated JavaScript.

## The assumption

Libraries that preserve richer JavaScript values need to do more than decode ordinary JSON. Here, the dangerous step occurs when metadata about a constructor is treated as safe material for a function declaration. A name supplied in the serialized input is still untrusted input.

## The turning point

> Follow the value past parsing. The security boundary is crossed when reconstruction turns a string into executable syntax.

The essential distinction is between describing an object and supplying code used to recreate it. Reviewing the initial JSON parser in isolation misses the later interpretation.

## Reachability matters

The affected library must receive attacker-controlled serialized data. A browser application that sends cross-frame messages to a deserializer can create such a path, but actual reachability and impact depend on the consuming application. A dependency version alone is not a complete exploit demonstration.

The full advisory discusses Storybook as a browser consumer. When assessing an application, trace the source of the message, its validation, and the parser options before drawing conclusions about its exposure.

## Version history and disclosure

TeleJSON 6.0.0 addressed the issue in 2022; the maintainer advisory was published in 2026. A newly published advisory can describe a flaw already fixed in older release history. It does not mean the latest version acquired a new vulnerability.

The [maintainer advisory](https://github.com/storybookjs/telejson/security/advisories/GHSA-ccgf-5rwj-j3hv) identifies versions below 6.0.0 as affected, versions from 6.0.0 as patched, and credits my GitHub account as reporter. Its severity assessment differs from the CVSS v3.1 assessment in my advisory; those scores should be read with their respective contexts and scoring versions.

## What this finding teaches

Treat object revival as an interpretation boundary. During review, identify every step that creates behavior from input: constructors, prototypes, evaluators, and callbacks. During remediation, upgrade the vulnerable dependency and validate the data paths that reach it.

The practical question is broader than “is the JSON valid?” It is “what will this application do with the values after parsing?”

## References

- [My CVE-2026-47099 advisory](https://github.com/Niccolo10/Security-Advisories/blob/main/CVE-2026-47099/cve-2026-47099.md)
- [Maintainer advisory and reporter credit](https://github.com/storybookjs/telejson/security/advisories/GHSA-ccgf-5rwj-j3hv)
- [CVE-2026-47099 at NVD](https://nvd.nist.gov/vuln/detail/CVE-2026-47099)
