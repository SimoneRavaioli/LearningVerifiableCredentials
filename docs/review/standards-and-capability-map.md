# ITU, LearnCard and application responsibility map — LCV Passport - Wallet v1 / v2

Updated 15 October 2026 after LCV Passport - Wallet v2 deployment. **LCV Passport - Wallet v1** is the original product previously named Wallet Preview. The URLs and independent browser stores remain unchanged: [LCV Passport - Wallet v1](https://learning-passport-wallet-preview.wellanole256.chatgpt.site/) and [LCV Passport - Wallet v2](https://learning-passport-wallet-v2.wellanole256.chatgpt.site/).

ITU provides an education-sector draft profile and governance requirements. LearnCard supplies SDK APIs and optional platform services. W3C, OpenID and 1EdTech supply public formats/protocols. Our application supplies UX, persistence and policy adapters. There is no separate LearnCard certification established here.

## Evidence scope

ITU evidence remains the Phase 1 working draft retrieved on 14 October 2026, not a newly retrieved upstream release. SDK package versions are pinned. V2 evidence is [release.json](../../v2/evidence/release.json), [deployment.json](../../v2/evidence/deployment.json), [LearnCard protocol status](../../v2/docs/learncard-protocol-status.md) and the referenced executable tests. V1 reports are preserved as historical evidence.

| Mode | Actual custody / deployment | Claims that must stay separate |
| --- | --- | --- |
| LCV Passport - Wallet v1 Node reference | Server-side learner-key custody and HTTP role controls. | Does not provide v2 clean-browser recovery or v2 mobile screens. |
| LCV Passport - Wallet v1 hosted browser demo | Issuer, holder and authority keys at one browser origin; role-password simulation. | Does not inherit the Node server's institutional isolation. |
| LCV Passport - Wallet v2 hosted browser demo | Focused mobile learner UI, encrypted local state, two demo issuers and holder-only recovery. | Still co-locates demo identities; full disclosure. Static hosting does not run the isolated services or consumer-wallet integration. |
| LCV Passport - Wallet v2 local Node / OpenID PoC | Distinct service processes/origins; holder key stays in browser; verifier anchor configured independently of presented evidence. | Same local administrator and synthetic governance; not separate institutions, secure hardware or a consumer-app deployment. |

## ITU provisions used and current coverage

Rows 1–5 are exact identifiers scoped to §6.4, not globally stable invented IDs. LVC-1/2/3 are alternative profiles, not maturity levels. “Demonstrated” means within the named synthetic mode, not complete conformance.

| ITU provision | LCV Passport - Wallet v1 | LCV Passport - Wallet v2 / evidence | Remaining limit |
| --- | --- | --- | --- |
| [§2 LVC-3](https://experience-digital-transform.gitbook.io/experience-digital-transformation/dpi-for-education/learning-verifiable-credentials/specifications/2.-conformance-profiles) and §3 UC-05 | Learner receives and presents a diploma through three role tabs. | Learner default, short screens, readable request approval and explicit result. Browser journey passes. | Hosted demo roles are not distinct institutional security boundaries. |
| §3 UC-06; §6.4 row 2 RECOMMENDED, multi-issuer bundles | Toolkit bundle verified; foreign-issuer UI receipt missing. | Two demo issuers, signed-file import with holder binding, second-issuer UI receipt and independent per-credential bundle checks in `v2/tests/core.test.mjs`. | Arbitrary consumer-wallet/jurisdiction compatibility still requires partner tests. Import never grants issuer trust. |
| [§4.3 issuer trust/history](https://experience-digital-transform.gitbook.io/experience-digital-transformation/dpi-for-education/learning-verifiable-credentials/specifications/4.-ecosystem-and-trust#43-trust-pattern-per-profile); §6.4 row 1 REQUIRED, scope at issuance | Signed fictional registry and issue-time scope checks. | Same policy principle, synthetic issuer closure/history and independent service anchor. Core/service tests pass. | No national authority, delegated accreditation chain or operational compromise/rotation exercise. |
| [§5.1 education models](https://experience-digital-transform.gitbook.io/experience-digital-transformation/dpi-for-education/learning-verifiable-credentials/specifications/5.-data-models) | Local UniversityDegreeCredential schema and Schema.org terms. | VC2 with unchanged pinned OB3 context 3.0.3; OpenBadgeCredential/AchievementSubject/Achievement, criteria and qualification codes. [Profile fixtures and subset validator](../../v2/profiles/education.mjs) pass. | Application subset, not complete official OB3 certification, CLR, ELM or country-specific education profile. |
| §5.3 original-script names; §5.4 vocabularies | UTF-8 preserved, broad multilingual tests absent. | Unicode JSON-LD fixture, original-script display, synthetic qualification code catalogue and versioned employer policy. | No comprehensive RTL/device study, qualification-framework/credit alignment or authoritative cross-border equivalence. |
| §6.4 row 3 REQUIRED, published status/trust without learner-record query | Node serves signed lists/registry; offline snapshots tested. | Signed revocation/suspension and trust snapshots; independent offline tests and stale/missing/unknown outcomes. Node services publish public evidence; warm cached browser reload passes separately. | Hosted browser snapshots are local. Their status identifiers do not prove a public multi-party service. First-load offline trust discovery unproven. 24 hours is our cache policy, not an ITU constant. |
| §6.4 row 4 REQUIRED, full disclosure shown and approved | Full JSON, recipient/purpose and approval/digest gate. | Readable actual-field summary with optional exact JSON, purpose/recipient/expiry, unchanged digest and cancel-without-sharing; production UI tests pass. | Comprehension study and relying-party authentication in the actual consumer app remain open. Full credentials are still shared. |
| §6.4 row 5 REQUIRED, purpose-limited retention/inference | Node role boundary and no persisted VP in tested path. | Transient presentations, bounded requests/results/activity and no external requests observed in browser suite; isolated-service result omits learner attributes. | No universal non-inference proof or forensic memory-erasure claim. User downloads and malicious same-origin code remain separate risks. |
| §6.3 vendor neutrality SHALL | Independent Digital Bazaar verifier and holder toolkit. | Unmodified LearnCard OpenID plugin 0.3.11 performs credential receipt and signed VP submission; Digital Bazaar independently checks it. | SDK protocol interoperability is stronger than the v1 toolkit-only result, but does not establish the complete consumer UI/storage, mobile app or an unrelated wallet vendor. |
| §6.2/6.3 remaining topics, §6.5, §7 | Incomplete upstream draft/procurement topics documented. | V2 adds explicit mode/profile/test declarations without inventing missing normative requirements. | No exhaustive final ITU conformance suite or tender certification. |

## Executed LearnCard APIs and selected public standards

| Component | Version / standard | LCV Passport - Wallet v1 use | LCV Passport - Wallet v2 use and boundary |
| --- | --- | --- | --- |
| `@learncard/core` | 9.4.38 | `generateLearnCard`, `addPlugin` composition. | Same native primitives in shared identity module. SDK composition is not a consumer wallet or governance service. |
| `@learncard/didkit-plugin` | 1.10.3 | Locally loaded WASM signing; hash pinned. | Same pinned WASM and DataIntegrityProof signing. Compact-JWT wrapper defect remains a version-scoped finding; v2 did not patch it. |
| `@learncard/didkey-plugin` | 1.1.38 | Distinct seeded Ed25519 `did:key` identities, `id.did()`. | Holder, issuers and authority keys remain distinct; isolated service mode separates their storage. did:key does not rotate in place or prove legal identity. |
| `@learncard/vc-plugin` | 1.6.4 | `invoke.issueCredential`, `invoke.issuePresentation`. | OB3-profile credentials and challenge/domain-bound W3C VPs. It does not supply UI consent, accreditation or recognition policy. |
| `@learncard/openid4vc-plugin` | **0.3.11** | Not executed. | Unmodified plugin's `acceptCredentialOffer` and `presentCredentials` complete a local round trip in [learncard.test.mjs](../../v2/tests/learncard.test.mjs). Test dependency/client, not a hosted Network connection. |
| W3C VC/VP + Data Integrity | VC2, `eddsa-rdfc-2022` | Local academic VC and full-credential VP. | OB3-profile VC2 and full-credential VP; independent Digital Bazaar verification. These are public standards, not proprietary LearnCard formats. |
| W3C Bitstring Status List | Signed revocation/suspension lists | Application adapter with Digital Bazaar generation/checking and LearnCard signing. | Same attribution; separately published Node evidence and locally cached browser evidence. LearnCard Network status APIs remain unused. |
| OpenID exchange | Limited final-1 style OID4VCI `ldp_vc`, pre-authorized grant/JWT key proof; PEX OID4VP `ldp_vp`/direct_post | Custom JSON only. | Implemented service endpoints, nonce/state/audience binding and strict descriptor mapping; pinned SDK test passes. No claim for all OpenID modes, certification or complete consumer-app compatibility. |
| 1EdTech education context | OB3 context 3.0.3, pinned upstream source/hash | Not implemented. | Used with explicit application-subset schema and fixtures; not the complete official conformance suite. |

## Custom application work and researched capabilities

| Capability | V2 attribution / current evidence | What remains unproven |
| --- | --- | --- |
| Mobile screens, readable consent, status/outcome UX, demo reset | Our React application; production browser journey and tested result-screen axe scan. | Real iOS/Android, manual screen-reader audit and novice comprehension. |
| Clean-browser holder backup | Our JSON v2 envelope: PBKDF2-SHA256/600000, AES-GCM, original holder seed/credentials and public evidence; no issuer seeds. Clean-context recovery and new presentation pass. | Lost-password recovery, secure enclave custody and LearnCard native ZIP import compatibility. |
| LearnCard holder-continuity | Native 0.2.21 documentation evaluated; explicit compatibility boundary recorded. | Native ZIP adapter not implemented. V1 and v2 JSON envelopes also remain distinct. |
| Experimental selective disclosure | Custom `v2/core/sdjwt.mjs`, JOSE issuer/holder binding, qualification-only and overdisclosure/nonce/expiry tests. | Not main OB3 UI, not LearnCard SD-JWT-plugin execution, not external verifier certification or SD-JWT status support. |
| `@learncard/sd-jwt-vc-plugin` 0.2.16 | README/source researched; presentation-status discrepancy retained as a documentation finding. | Do not attribute custom JOSE tests to this unused plugin. |
| Trust, qualification recognition, role authorization and storage | Our policies/adapters. V2 compares explicit synthetic qualification codes under a versioned policy. Node services pin authority separately. | No real ministry source, official recognition decision or independent institutional deployment. |
| LearnCard Network / LearnCloud | Source/docs researched; no hosted service connection in this product. | Running a protocol test with its SDK is not using its consumer storage or Network services. |
| PWA shell and packaging | Our manifest, public-asset cache, portable ZIP generation, source/build/deployment evidence and CI workflow. | Native installation/security, actual Windows/macOS execution and remote CI success are not inferred from local tests. |

## References

- [ITU specification](https://experience-digital-transform.gitbook.io/experience-digital-transformation/dpi-for-education/learning-verifiable-credentials/specifications), retrieved 14 October 2026.
- [LearnCard source snapshot](https://github.com/learningeconomy/LearnCard/tree/1de9e4a8aed6a03b9428a6fa7895c9681e50ea7e), published package lockfiles and [v2 consumer source analysis](../../v2/docs/learncard-consumer-integration.md). Executable plugin source/round-trip tests supersede its older README-only `ldp_vc` deferral statement.
- [V2 education profile](../../v2/docs/education-profile.md), [security/operations](../../v2/docs/security-and-operations.md), [exchange declaration](../../v2/docs/exchange-profile.md), [current acceptance tracker](../../v2/docs/backlog-status.json).
- Historical [source provenance](../sources.md), [v1 capability inventory](../capabilities.json) and [v1 requirement matrix](../requirements.json). Their earlier JOSE description of the Data Integrity verifier is historical metadata; the current attribution above is explicit.
