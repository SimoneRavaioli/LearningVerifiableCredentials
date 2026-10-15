# LearnCard × ITU LVC gap analysis

| Group | Findings |
| --- | --- |
| A — Native, executed | LearnCard provides distinct seeded did:key identities, Ed25519 credential signing, VC 2.0 Data Integrity proofs, and holder authentication presentations. Digital Bazaar verifies the resulting artifacts. |
| B — Configurable, executed | Custom plugin composition avoids hosted services; local WASM loading avoids network dependency; explicit proof purpose/challenge/domain secures presentations. Pinned contexts and library versions establish a reproducible format. |
| C — Additional components, executed | Local encrypted storage, role authentication, consent UI/digest, single-use request handling, signed status publication/caching, historical issuer authority registry, independent verification and local backup are implemented adapters/application responsibilities. |
| D — Unsupported or unproven here | Consumer wallet interoperability, standardized exchange transports, learner-controlled key custody, full OB3/CLR/ELM schemas, selective disclosure/unlinkability, minors/guardians, national identity/accreditation, operational key rotation and decades-long preservation. |

LearnCard Network documents native Bitstring Status List management and app-level trust registry lookup. They depend on services outside the chosen minimal local stack and were not executed here. The standalone implementation supplies status/trust adapters rather than claiming these are native LearnCard capabilities. LearnCard’s holder-continuity ZIP package documents key/credential recovery; our custom local storage uses a separately documented envelope. Native ZIP compatibility is not claimed.

The installed didkit-plugin 1.10.3 credential JWT path calls JSON.parse on a compact token and fails. research/probe.mjs reproduces this without logging private key material. The functioning VC 2.0 DataIntegrityProof path avoids that wrapper. No installed dependency was modified. The SD-JWT plugin README lists presentation as future work while shipped present.ts exists; no capability claim is inferred from that discrepancy.

## Local academic model

The credential model uses W3C VC 2.0 issuer/subject/validity/status/proof fields; a declared education extension uses Schema.org hasCredential, EducationalOccupationalCredential and dateCreated semantics. UniversityDegreeCredential is a local type at https://example.edu/vocab/UniversityDegreeCredential; BachelorDegree is an illustrative local term. The local JSON Schema is published at /public/schema and supplied in assets/.

Informative crosswalk: local diploma/degree → Open Badges 3.0 achievementType Degree → ELM LearningAchievement/Qualification. This is a semantic mapping only, not an implemented conversion or validation against either complete model. Qualification framework levels, ISCED/ISCED-F codes, credits and controlled national identifiers are absent. Section 5 detailed schemas are not final, so final education-model conformance remains unresolved.

## Recommendations

For LearnCard: fix/test compact JWT return handling; keep package README imports/storage descriptions synchronized; add executable independent-library vectors; clarify SD-JWT feature/version status; offer Node-only dependency paths without optional mobile chains; expose a documented local persistence interface compatible with holder-continuity.

For ITU LVC: publish stable versioned requirement identifiers and machine-readable schemas; specify acceptable securing/exchange profiles and status freshness; complete LVC-3 procurement/tests; clarify row 2 wallet bundling responsibilities and the section 7 reference to nonexistent row 6; define governed trust-history/key-retention rules; separate implementation metadata from official accreditation/recognition.

For this reference: replace custodial learner keys with browser/device custody; add a real independent wallet and OpenID exchange; adopt country-specific OB3/ELM/CLR schemas; implement selective disclosure with explicit tests; separate issuer/holder/verifier deployments; integrate an independently governed authority.
