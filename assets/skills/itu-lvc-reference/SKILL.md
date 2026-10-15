---
name: itu-lvc-learncard-reference
description: Reproduce and extend the local LearnCard ITU LVC-3 education wallet with independent verification and exact-requirement evidence.
license: MIT
---

# ITU LVC reference workflow

Use for synthetic local reference implementations. Read README.md, docs/research.md, docs/conformance.md and docs/requirements.json before changing wallet functionality.

## Prerequisites

Node 22.12+ (Node 24 recommended), npm, browser. Chromium is needed for the automated browser test. The local stack needs no provider API key. Respect managed network policy and do not print seeds or full environments.

## Process

1. Retrieve and hash the current ITU snapshot with a discovered read-only tool. Record draft/version and exact normative identifiers. Profiles are alternatives, not automatic levels.
2. Inspect maintained SDK/package source and executable examples. Never invent an invoke method from a feature name. Separate native, configurable, adapter, custom and unresolved capabilities.
3. Generate distinct secure issuer/holder/authority keys. Load the pinned local LearnCard WASM, retain its integrity check and disable uncontrolled remote context fetching.
4. Keep the signing and independent verification implementations separate. independent/ modules must not import LearnCard. Validate allowed context/schema, proof, dates, status, authority-at-issue-date and recognition independently.
5. Enforce recipient/purpose/full-disclosure review, explicit approval and an unchanged digest before presenting. Use one-time challenges and audience binding. Do not label full disclosure as selective disclosure.
6. Preserve issuer records and original proofs; recovery cannot reset revocation. Serialize mutations. Do not retain employer presentations beyond their approved purpose/expiry.
7. Run npm test, lint, build and browser checks. Preserve actual logs; fail closed on missing/stale/tampered caches. Use negative fixtures and an independent holder/verifier.
8. Report toolkit interoperability separately from deployed third-party wallet/OpenID exchange. Subject-bound credentials require identity continuity; do not pretend moving a JSON file changes its holder.
9. Update the matrix with test evidence, exact source quotes and explicit gaps. Do not equate signatures, issuer trust, recognition or full ITU certification.
10. Package reusable source/tests/schema/configuration and source-license provenance. Publish or deploy externally only within user authorization.

## Done criteria

A real browser lifecycle, independently verified signed credential and holder presentation, executed negatives/recovery/privacy tests, production build, machine-readable traceability, honest gaps and clean reproduction instructions.

## iGrant extension boundary

Provider skills in L3-iGrant/skills target OWS/API-key/trust-registration workflows, usually SD-JWT/OpenID exchange. Review pinned versions/licenses and verify compatible credentials before integrating. Lack of credentials means “not executed,” never a mock passing result. A comparison needs independent clean runs and comparable instrumentation.
