# ITU LVC alignment assessment

**Target: LVC-3. Result: limited demonstrated alignment in a synthetic local environment.** Four REQUIRED rows of section 6.4 have executed evidence. The RECOMMENDED multi-issuer row is partially demonstrated. No formal certification is claimed; the complete profile is not established.

The ITU page retrieved on 14 October 2026 describes an interim Phase 1 working draft. It provides no numbered release identifier. LVC-1, LVC-2 and LVC-3 are independently valid alternatives; this learner-held application targets LVC-3. UC-05 (learner-held diploma verified via a trust registry) is the principal scenario; UC-06 multi-issuer presentations are exercised in a toolkit test.

| Exact identifier | Level | Demonstration | Result / limits |
| --- | --- | --- | --- |
| Section 6.4, row 1 | REQUIRED | Independently signed trust snapshot; credential type and authority intervals evaluated at validFrom. Wrong issuer, type, historical period and authority anchor rejected. | Demonstrated under fictional governance. No claim of official accreditation. |
| Section 6.4, row 2 | RECOMMENDED | A holder-signed bundle contains credentials from two distinct issuers; each proof and trust decision is checked separately. | Partially demonstrated. Native browser wallet receipt supports only the local university; third-party issuer receipt is not implemented. |
| Section 6.4, row 3 | REQUIRED | Published signed Bitstring Status Lists and a signed historical issuer registry; verifier operates with supplied public caches and network disabled. | Demonstrated. Cache freshness is 24 hours; expired/missing/tampered caches fail closed. |
| Section 6.4, row 4 | REQUIRED | Full credentials, attributes, purpose and recipient displayed; checkbox approval and exact disclosure digest required before signing. | Demonstrated with backend negative tests and a real browser consent gate. Full disclosure only. |
| Section 6.4, row 5 | REQUIRED | Employer cannot browse learner/issuer records; verifies approved data transiently; presentation removed after use/expiry and never persisted. | Demonstrated for the implemented paths. Tests verify absence of VP data in decrypted persistent state. This is not proof against every possible inference or host instrumentation. |
| Section 6.3, vendor neutrality (no identifier) | SHALL | Independent Digital Bazaar verifier and holder toolkit can receive, preserve, and present the credential. | Partially demonstrated: no consumer wallet product or standardized issuance exchange tested. |

The machine-readable JSON and CSV include verbatim normative statements, source links, components, evidence paths and limits. Null identifiers mean the source does not provide a requirement ID; they are not manufactured test IDs.

## Additional provisions and gaps

Section 4.3 calls for governed issuer entry/exit, historical entries, identifiers, keys and scope. The reference signs its registry with a separate fictional authority and preserves scope intervals. It does not implement a real ministry’s accreditation workflow, certificate authority or long-term key rotation.

The academic credential uses the W3C VC 2.0 context and eddsa-rdfc-2022 proof. Its local education extension is explicitly declared in JSON-LD and JSON Schema. It is **not** an Open Badges 3.0, CLR 2.0 or ELM-conformant diploma. Section 5’s vocabulary/model guidance is therefore only partially covered. A semantic crosswalk is recorded in gap-analysis.md rather than pretending this is a finalized international education schema.

No translation or transliteration is generated. Names retain the entered UTF-8 string, but multilingual/script coverage has not been tested. Minors/guardians and national identity binding are outside the adult synthetic scenario.

Selective disclosure, unlinkability, OpenID4VCI, OpenID4VP, DCQL, the browser Digital Credentials API, production wallet recovery, and decades-long operational preservation are not demonstrated. Neither W3C credential support nor successful toolkit exchange implies complete ITU conformance.

Sections 6.2/6.3 remain substantially incomplete, section 6.5 is Phase 2 placeholder material, and section 7 LVC-3 procurement clauses say “Coming soon.” The LVC-1 procurement reference to section 6.4 rows 3–6 exceeds the five current rows. These issues prevent a complete final conformance suite; source material was not reported externally.
