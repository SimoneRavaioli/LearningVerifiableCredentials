# Executive assessment

**Yes, a functional local education wallet was built with LearnCard through AI-assisted development, with demonstrated alignment to selected ITU LVC-3 draft requirements. Full LVC-3 conformance and production readiness were not established.**

The browser university issues a real VC 2.0 diploma, the learner receives/persists/inspects it, explicitly authorizes a complete disclosure and signs a presentation, and the employer independently checks proof, dates, status, issuer authority at issuance and a separate qualification policy. Revocation/suspension, encrypted backup/recovery, role access and replay protection work.

Twenty automated tests and a Chromium desktop/mobile journey pass. A clean Node-only runtime installation passes the same tests. The independent Digital Bazaar verifier validates LearnCard output, and an independent holder toolkit imports, preserves and presents it using the recovered original identity. This is stronger than a LearnCard-to-LearnCard round trip, but does not establish interoperability with a production wallet product or OpenID exchange.

Four REQUIRED section 6.4 rows have scoped evidence; the RECOMMENDED multi-issuer row and vendor-neutral ecosystem receipt remain partial. National governance, final education schemas, selective disclosure, independent consumer wallets, long-term archival and several incomplete ITU sections remain unresolved.

## Answers to the experiment’s five questions

| Question | Evidence-backed answer |
| --- | --- |
| Q1 — Agent readiness | The agent built and ran the workflow without further human intervention after the master prompt. Source/package inspection compensated for blocked hosted docs, and a real signing probe found a wrapper defect. |
| Q2 — Native standards alignment | LearnCard’s identity/signing/presentation primitives are useful foundations. Cryptographic compatibility does not supply historical issuer authorization, recognition policy, consent or national governance automatically. |
| Q3 — Implementation gaps | Local persistence/security/consent/status/trust/independent verification needed application components or adapters. Formal education schemas and ecosystem transports require further work. |
| Q4 — Interoperability | Independent library verification and holder-toolkit portability/presentation were executed successfully. Consumer wallets, OpenID protocols and deployed external counterparties remain untested. |
| Q5 — Reusable DPI | Source, tests, schema, matrix, reports, provenance and reusable agent instructions provide an executable reference. Institutional governance and operational security cannot be generated or certified by a passing test alone. |

## Implication

A specification can guide AI-generated executable evidence when its requirements are explicit and existing implementations expose stable APIs. The limits here are equally instructive: incomplete normative material, inconsistent package documentation, service-dependent skills, education-schema choices and trust/custody governance still require interpretation and independent review.

Use this as a reproducible engineering reference and a starting point for provider/standards improvements. Do not deploy it as student infrastructure without replacing the documented development security and governance assumptions.
