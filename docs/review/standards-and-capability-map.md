# ITU, LearnCard and application responsibility map

## How to interpret this map

ITU supplies an education-sector profile and governance requirements. LearnCard supplies SDK primitives and optional platform services. W3C and other standards supply credential formats and protocols. Our application supplies the UI, local storage and several policy/security adapters. A capability mentioned in LearnCard documentation is not evidence that this application executed it.

The scope is ITU LVC Phase 1 material retrieved on 14 October 2026 and pinned SDK packages. “Demonstrated” below means within the recorded synthetic test environment. It does not imply official certification, live institutional authority or deployed external interoperability. The browser fork cannot inherit the Node server’s role-isolation evidence.

## ITU provisions actually used

Identifiers below preserve the source numbering. Rows are scoped to §6.4, not invented globally stable requirement IDs. LVC-1/2/3 are alternative conformance profiles, not maturity levels.

| ITU source / obligation | What we used it for | Implementation and evidence | Scope and next change |
| --- | --- | --- | --- |
| [§2, LVC-3](https://experience-digital-transform.gitbook.io/experience-digital-transformation/dpi-for-education/learning-verifiable-credentials/specifications/2.-conformance-profiles) | Learner-held credential and holder-authorized presentation. | Receive/store/share flow; `tests/lifecycle.test.mjs`; preview UI journey. | Node holder custody is server-side; browser preview places all demo identities together. Separate custody and real exchange: SEC-02, INT-01. |
| [§3, UC-05 and UC-06](https://experience-digital-transform.gitbook.io/experience-digital-transformation/dpi-for-education/learning-verifiable-credentials/specifications/3.-use-cases) | Diploma checked through issuer trust; multi-issuer bundle scenario. | UI demonstrates the diploma; `tests/interoperability.test.mjs` exercises multiple issuers. | Multi-issuer receipt is not a native UI capability. INT-03. |
| [§4.3, trust pattern](https://experience-digital-transform.gitbook.io/experience-digital-transformation/dpi-for-education/learning-verifiable-credentials/specifications/4.-ecosystem-and-trust#43-trust-pattern-per-profile) | Distinguish identity, authority, historical scope and recognition. | Separate fictional authority signs a registry; independent verifier checks scope at issuance. | Authority and history are synthetic, not accreditation. No operational key rotation or delegated national trust chain. TRUST-01. |
| [§5.1, building blocks](https://experience-digital-transform.gitbook.io/experience-digital-transformation/dpi-for-education/learning-verifiable-credentials/specifications/5.-data-models) | Credential/learner/issuer/status/presentation structure. | W3C VC 2.0 plus a local JSON-LD academic schema in `server/model.mjs`; schema tests. | The local academic vocabulary is a shortcut relative to the advice to build on OB3/CLR/ELM. No complete education-model conformance. DATA-01. |
| [§5.3, languages](https://experience-digital-transform.gitbook.io/experience-digital-transformation/dpi-for-education/learning-verifiable-credentials/specifications/5.-data-models#53-languages) | Preserve supplied names without generated official transliteration. | Entered UTF-8 text is retained. | Multilingual/RTL usability and identifier matching not tested. LIFE-01. |
| [§5.4, vocabularies](https://experience-digital-transform.gitbook.io/experience-digital-transformation/dpi-for-education/learning-verifiable-credentials/specifications/5.-data-models#54-controlled-vocabularies) | Acknowledged as the semantic target, not implemented. | Gap analysis records absent frameworks, credit and organization codes. | Not a completed capability. Choose regional profile and controlled identifiers. DATA-01. |
| [§6.4 row 1, REQUIRED](https://experience-digital-transform.gitbook.io/experience-digital-transformation/dpi-for-education/learning-verifiable-credentials/specifications/6.-specification#64-functional-requirements): issuer listed and authorized for type on issue date | Historical issuer authorization check. | `independent/verifier.mjs`; wrong issuer, scope and period tests in `tests/verification.test.mjs`. | Demonstrated with fictional registry and configured anchor. TRUST-01. |
| §6.4 row 2, RECOMMENDED: multi-issuer presentation, each credential verified independently | Per-credential results and preserved issuer/proof evidence. | `evaluatePresentation`; two-issuer bundle test. | Partial end-to-end support. The test’s untrusted issuer correctly prevents acceptance. INT-03. |
| §6.4 row 3, REQUIRED: published status/trust checks without live issuer or learner-record query | Signed revocation/suspension lists and signed trust snapshots; offline checking. | `server/service.mjs`, independent verifier; network-disabled verification test. | Node serves public artifacts. Browser preview passes local snapshots; its `/status/...` identifiers are not evidence of a publicly served multi-party status service. Offline first-time trust discovery is unproven. SEC-02, TRUST-01. |
| §6.4 row 4, REQUIRED: holder sees and approves full requested credentials/attributes before presentation | Recipient/purpose/full-payload review and explicit approval/digest gate. | UI consent; `tests/lifecycle.test.mjs`; recorded browser consent gate. | Cryptographic gate demonstrated; comprehension not tested. Raw JSON is poor informed-consent UX. UX-03, QA-02. |
| §6.4 row 5, REQUIRED: no retention/inference beyond approved purpose | Transient presentation processing; no VP persisted in tested path; verifier cannot browse other roles’ records in Node. | `tests/lifecycle.test.mjs`, `tests/api.test.mjs`; preview strips presentations before persistence. | No proof against every inference, browser downloads, hostile same-origin code or recipient behavior. Node isolation cannot be claimed for co-located browser roles. SEC-01–02. |
| [§6.3, vendor-neutrality SHALL](https://experience-digital-transform.gitbook.io/experience-digital-transformation/dpi-for-education/learning-verifiable-credentials/specifications/6.-specification#63-cross-cutting-requirements) | Independent receipt/verification goal. | Digital Bazaar verifier and separately implemented holder toolkit. | Partial: toolkit exchange, not an external consumer wallet or standardized protocol exchange. INT-01. |
| §6.2/6.3 remaining topics, §6.5 and §7 LVC-3 procurement | Boundaries on the completeness claim. | Snapshot identifies incomplete content and procurement placeholders. | No exhaustive final conformance test or tender-ready claim can be derived from missing material. See upstream proposals ITU-01–08. |

Qualification recognition is an application decision informed by the education context. In this reference it is an exact qualification-name comparison, not a legally authoritative recognition decision.

## LearnCard components actually executed

| Package / version | API or facility used | Application use | What this does not supply automatically |
| --- | --- | --- | --- |
| `@learncard/core` **9.4.38** | `generateLearnCard()`, `addPlugin()` | Compose the minimal wallet stack in Node and browser. | Full consumer wallet UX, hosted storage or institutional governance. |
| `@learncard/didkit-plugin` **1.10.3** | `getDidKitPlugin(binary, false)` and signing delegated through plugins | Bundled Rust/WASM signing engine; SHA-256 checked before use. VC Data Integrity route executed. | Every advertised proof format is not thereby tested; compact-JWT issuance failed in the recorded probe. |
| `@learncard/didkey-plugin` **1.1.38** | `getDidKeyPlugin(...)`, `id.did()` | Distinct seeded Ed25519 `did:key` identities for issuer, holder and demo authority. | Legal identity, accreditation, device-bound custody or in-place rotation of a fixed `did:key`. |
| `@learncard/vc-plugin` **1.6.4** | `invoke.issueCredential()` | Sign diplomas and synthetic registry/status artifacts. | Authoritative education schemas, accreditation or verifier policy. |
| Same VC plugin + DIDKit | `invoke.issuePresentation()` | Holder proof with challenge/domain; full credentials disclosed. | OID4VP transport, QR/deep-link sessions, selective disclosure or unlinkability. |

Evidence: `server/learncard.mjs`, `server/service.mjs`, `preview/src/browser-service.mjs`, lockfiles, lifecycle/interoperability tests. DIDKit WASM hash: `fe1d254186130480a3ae831fe1b17c58ea732adc39cad16f895aa58e03f1bd62`.

## Researched LearnCard capabilities that were not executed as product features

| Capability | Source/version scope | Actual project status |
| --- | --- | --- |
| LearnCard Network status and trust lookup | Repository docs at `1de9e4a8aed6a03b9428a6fa7895c9681e50ea7e` | Not connected. We built local adapters; do not attribute them to executed Network APIs. |
| Holder continuity | `@learncard/holder-continuity` **0.2.21**, inspected documentation | Native encrypted ZIP bundle researched. Our Node and browser backups are separate formats; compatibility was not established. |
| SD-JWT VC | `@learncard/sd-jwt-vc-plugin` **0.2.16**, inspected README/source | Not in the executed credential journey. README roadmap and shipped presentation source differ; not proof that current upstream functionality is absent or broken. |
| OpenID issuance/presentation | Repository plugin/docs inspected | No selected version/format matrix and no protocol exchange executed. |
| OB3/CLR templates and models | SDK construction docs inspected | We did not validate a complete OB3/CLR/ELM credential. A template reference is not conformance. |

## Other standards and custom components

| Component | Attribution | Actual use / limitation |
| --- | --- | --- |
| VC Data Model 2.0 / W3C VP | W3C; selected from ITU’s listed options | Credential/presentation structures. No claim that every alternative format in ITU is mandatory. |
| Data Integrity, `eddsa-rdfc-2022` | W3C; implemented by LearnCard/DIDKit and Digital Bazaar | Real signatures and independent verification. Not a LearnCard-specific credential format. |
| `did:key` | W3C CCG method ecosystem and implementations; not a DID Core mandated method | Self-contained Ed25519 identifiers. Does not establish institutional authority. |
| Bitstring Status List | W3C; Digital Bazaar generation/checking with LearnCard signing | Revocation/suspension snapshots; 24-hour freshness is our chosen demo policy, not an ITU-mandated constant. |
| Independent verifier and holder | Digital Bazaar packages + our orchestration | Different verification implementation; toolkit-level interoperability only. |
| Consent, role UI, schema, registry policy, one-use requests | Our application | ITU-informed behaviors built around SDK primitives. |
| Node encrypted vault / backup | Our application using Node crypto | Server custody; AES-GCM and scrypt-based backup. Requires mode-specific recovery review. |
| Browser persistence / backup | Our application using IndexedDB/Web Crypto | Same-origin AES-GCM device key; PBKDF2 backup. Nonextractable device key does not prevent same-origin code from using it. |
| Static private hosting and local launcher | Delivery infrastructure and our packaging | Makes the demo reachable. Does not confer wallet security or standards conformance. |

## Source references

- ITU [specification root](https://experience-digital-transform.gitbook.io/experience-digital-transformation/dpi-for-education/learning-verifiable-credentials/specifications), especially §§2–6.
- LearnCard [repository snapshot](https://github.com/learningeconomy/LearnCard/tree/1de9e4a8aed6a03b9428a6fa7895c9681e50ea7e); published package versions above and lockfile integrity values.
- [W3C VC 2.0](https://www.w3.org/TR/vc-data-model-2.0/), [EdDSA cryptosuites](https://www.w3.org/TR/vc-di-eddsa/), [Bitstring Status List](https://www.w3.org/TR/vc-bitstring-status-list/), [DID Core](https://www.w3.org/TR/did-core/).
- Existing project [source provenance](../sources.md), [capability inventory](../capabilities.json), [requirement matrix](../requirements.json), [interop report](../interoperability.md). Historical entries in these files have the narrower scope explained here; they are not substituted for a new external conformance audit.
