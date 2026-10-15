# V2 backlog acceptance status

All 25 items have been addressed; acceptance remains incomplete where stated. No real-device study, consumer-app run, official accreditation or production operation is invented. V1 remains unchanged.

| ID | Status | Delivered | Evidence or remaining acceptance |
|---|---|---|---|
| UX-01 | implemented | Learner default and explicit studio role chooser | Browser journey |
| UX-02 | implemented | Separate wallet/detail/request/review/confirmation/activity/settings screens | 320/390/430/1440px and 200% zoom checks |
| UX-03 | implemented | Readable fields, purpose, expiry, exact optional payload, approval digest and cancel | Production UI consent/cancel tests |
| UX-04 | implemented | Immediate result with accepted/mismatch/invalid/incomplete states | Core outcome tests and mobile result UI |
| UX-05 | implemented | Action-specific progress, expired requests, one-use send, named revocation confirmation | UI double-submit guard; status/expiry backend tests |
| UX-06 | partial | 44px controls, keyboard focus, native modal, labels, contrast; automated axe clean on tested result | Manual screen reader and full WCAG review require human/device testing |
| DEMO-01 | implemented | Seeded personas/pending diploma/request, guided tour and v2-only reset | Browser default journey; private keys remain random, not fixed demo seeds |
| DEMO-02 | implemented | No fake role passwords in demo; explicit custody, backup and conformance limits | Product copy review and documented mode boundaries |
| REL-01 | implemented | Portable build/download packaging, no dependency symlink, generated schema and manifests | Fresh sanitized checkout build/package test; ZIP validation |
| REL-02 | partial | Separate private v2 deployment, portable Node/Python launchers and v1 retained | Owner-device route and real Windows/macOS execution require external checks |
| QA-01 | implemented | Versioned CI workflow, source/build/lock/evidence/deployment manifests | Local automated test results; CI remote run recorded separately if available |
| QA-02 | external-validation-required | Responsive browser tests and novice-study protocol ready | Need real iPhone/Android and five independent novice participants; no simulated study |
| SEC-01 | partial | Mode threat models, pinned loaders, CSP, origin controls, egress and dependency audit | Live host headers and independent security review remain required |
| INT-01 | partial | LearnCard consumer selected; limited OID4VCI final1 ldp_vc and OID4VP PEX/direct_post implemented and tested with unmodified OpenID plugin0.3.11 | SDK round trip passes; actual consumer app/storage, remote HTTPS and physical cross-device test still required |
| INT-02 | partial | LearnCard consumer offer/request URLs, real QR and opaque request handoffs generated; strict audience and descriptor validation | Local protocol test passes; real camera/app return/cross-device TLS deployment still required |
| INT-03 | implemented | Second issuer UI receipt, original proof-preserving import and per-issuer bundle verification | Core multi-issuer test and production UI second-issuer receipt |
| DATA-01 | partial | Pinned official OB3 context/model and validated declared application subset with qualification codes | Full official schema/certification and jurisdiction partner profile remain prerequisites |
| SEC-02 | partial | Separate issuer/authority/verifier processes/origins; browser-only holder key; operator signing restrictions | Local protocol and browser integration tests; independent institutional deployments/KMS not provisioned |
| REC-01 | implemented | Holder-only encrypted backup restores on clean browser and answers new request | Production clean-context recovery + wrong password rejection; native LearnCard ZIP incompatibility documented |
| PRIV-01 | partial | Experimental JOSE-verified qualification-only SD-JWT module with binding/overdisclosure negatives | Not wired into OB3 UI or externally certified; requires partner-compatible privacy profile/status |
| TRUST-01 | partial | Signed authority history, closure preservation, versioned qualification-code policy | Synthetic authority only; real governance source and legal recognition partner needed |
| QA-03 | partial | Cross-tab concurrent issuance, quota failure with no false save, schema version rejection, stale-cache tests and controlled request expiry | Production browser fault tests pass; actual physical eviction and deployed storage-version migration still require additional validation |
| OPS-01 | partial | Incident, key compromise, cache outage, retention, rollback, recovery and telemetry runbooks | Institutions must assign actual operators, services and independently exercise recovery before pilot |
| MOB-01 | partial | Responsive PWA manifest and precached app shell; native decision documented | Real home-screen installation and device keystore comparison need target phones |
| LIFE-01 | partial | Unicode/RTL rendering, correction/revoke linkage and synthetic institution closure | Minors/guardianship, real qualification mappings and long-term archival/algorithm migration need partner governance |
