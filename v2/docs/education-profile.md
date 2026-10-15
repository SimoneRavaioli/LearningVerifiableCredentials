# Pinned education credential profile

V2 uses the Open Badges 3.0 achievement model with the W3C Verifiable Credentials 2.0 data model. It retains the existing LearnCard DIDKit `DataIntegrityProof` / `eddsa-rdfc-2022` signing path. This choice does not require downgrading the credential to VC 1.1. The official pinned 1EdTech model explicitly defines `AchievementCredential` against VC 2.0 and also separately defines a VC 1.1 variant.

This is an implementation profile for a synthetic proof of concept. It is not a claim of 1EdTech certification, complete Open Badges conformance, an ITU certification, or compatibility with an untested external wallet.

## Version and provenance

The unchanged context is `profiles/openbadges/context-3.0.3.json`, identified in credentials by `https://purl.imsglobal.org/spec/ob/v3p0/context-3.0.3.json`. It was retrieved from the official [1EdTech repository](https://github.com/1EdTech/openbadges-specification/tree/04c4bc2ee16d78d9ece12f837320a3e3fe66374a/ob_v3p0), pinned to commit `04c4bc2ee16d78d9ece12f837320a3e3fe66374a` on 15 October 2026. `profiles/openbadges/provenance.json` records source URLs and SHA-256 hashes for the context, upstream model and license. Do not label this moving repository snapshot as a formally certified implementation release.

Attribution: the Open Badges specification and retained context/model materials are copyright IMS Global Learning Consortium, Inc. (1EdTech). The unchanged `UPSTREAM-LICENSE.md` accompanies them. The local application schema is independently maintained code and is clearly named as a subset.

## Signed shape

The context array starts with the VC2 context and then the pinned OB3 context. V2 emits `VerifiableCredential` and `OpenBadgeCredential`. The required OB3 achievement fields are `id`, `type` containing `Achievement`, `name`, `description` and `criteria`. The subject has `id`, `type` containing `AchievementSubject`, and `achievement`. The surrounding VC supplies the credential identifier, issuer and issuance validity timestamp.

| V2 information | Signed field | Responsibility |
|---|---|---|
| Learner identifier | `credentialSubject.id` | W3C VC subject plus OB3 subject identity |
| Original-script learner name | `credentialSubject.name` | Application extension using the OB3 global `schema.org/name` term; not an OB3 mandatory subject field |
| Qualification title | `credentialSubject.achievement.name` | OB3 required achievement field |
| Qualification category | `credentialSubject.achievement.achievementType` | OB3 extensible vocabulary, currently `BachelorDegree` |
| Qualification code | `credentialSubject.achievement.humanCode` | OB3 standard human-readable code |
| Achievement identifier | `credentialSubject.achievement.id` | OB3 required URI; synthetic example.edu namespace |
| Assessment criteria | `credentialSubject.achievement.criteria.narrative` | OB3 achievement criteria; synthetic demo narrative |
| Activity completion date | `credentialSubject.activityEndDate` | OB3 optional date, used by the demo display as its completion/award date |
| Issuance time | `validFrom` | VC2 issuance/validity date; not synonymous with graduation |
| Proof, holder binding, nonce, status | Envelope proof/status/presentation fields | W3C security standards and application verification policy; the OB3 JSON shape alone does not establish these |

`makeSubject()` creates the subject shape and preserves Unicode names. `viewCredential()` derives the UX model without mutating signed data. `documents` maps the canonical OB3 context URL to local pinned bytes for offline signing and independent verification. A deployment must register that map with every JSON-LD loader; an unknown context should fail closed.

## Validation and limitations

`profiles/openbadges/unsigned-fixture.json` is an unsigned synthetic shape fixture with `did:example` identifiers. It is deliberately not a usable signed credential or trust assertion.

`validateEducationCredential()` uses Ajv against `learning-passport-profile.schema.json`. All schema references are local. It checks the selected application shape, ordered context prefix, OB3 types, URI syntax patterns and timestamp syntax. Date patterns are structural, not full calendar validation. Proof validity, supported cryptosuite, historical authority, status freshness, holder binding and recipient policy need their separate verification steps. The shape validator accepts unsigned input and must never be used as a signature verifier.

The generated complete official OB3 JSON Schemas were not present in the pinned source repository; the published schema host returned HTTP 403 in this environment. Consequently the retained schema is explicitly an application subset. Do not present passing this schema as passing the official 1EdTech certification suite. Optional alignments, endorsements, evidence, complex results, alternate identity encodings and the complete OB3 API are outside this subset.

Run the offline fixture and term-preservation checks:

```sh
cd v2
node profiles/validate-fixture.mjs
```

This check validates the fixture, rejects five malformed variants, expands the fixture with only local JSON-LD documents, and checks that the learner name and human-readable qualification code survive expansion. The main credential tests must additionally show that modifying each signed learner field invalidates the proof.

## Upstream context issue: awardedDate

The pinned context declares `awardedDate` with datatype `xsd:dateTime` but defines no `xsd` prefix; the VC2 context does not supply a global prefix either. A local JSON-LD expansion produced the datatype IRI `xsd:dateTime`, rather than the XML Schema datetime IRI. The retained upstream file is unchanged. The default fixture therefore omits `awardedDate` and uses `activityEndDate` for the activity completion date. If a distinct award timestamp is required, add and test a clearly separate context defining `xsd: http://www.w3.org/2001/XMLSchema#`, or obtain an upstream correction. Do not silently patch the pinned official file. Award and activity dates need separate form fields when institutions distinguish them.

## LearnCard exchange compatibility: researched, not executed here

The inspected LearnCard source is pinned to commit `1de9e4a8aed6a03b9428a6fa7895c9681e50ea7e`; its `packages/plugins/openid4vc/package.json` declares `@learncard/openid4vc-plugin` 0.3.11. Its [holder-plugin documentation](https://github.com/learningeconomy/LearnCard/blob/1de9e4a8aed6a03b9428a6fa7895c9681e50ea7e/packages/plugins/openid4vc/README.md) describes credential-offer parsing, preauthorized issuance, authorization-code + PKCE issuance, OID4VP request parsing, PEX/DCQL matching and signed presentations. These capabilities belong to that upstream plugin, not automatically to this wallet.

The same documentation marks `ldp_vc` issuance support as deferred. The PoC's JSON-LD VC2 / Data Integrity credential therefore must not be advertised as accepted through every existing OID4VCI integration. `jwt_vc_json` issuance needs a deliberately supported JWT credential representation, and cannot be simulated by wrapping this JSON in a text token. SD-JWT selective-disclosure and mdoc claims require their actual formats, holder keys and verifier support.

Recommended next integration evidence:

1. Pin a published plugin version and supported OID4VCI/OID4VP protocol revisions; do not rely on a monorepo feature claim alone.
2. Discover the partner issuer/verifier metadata and exact supported credential/proof formats. Select a compatible full credential format before showing an exchange action.
3. Use the upstream offer parser and protocol implementation, plus URL allowlisting and SSRF controls in any server fetch. Keep request expiry, nonce, audience, holder binding, consent and denial cases in the test matrix.
4. Run a real issuer → this wallet → independent verifier flow, retain redacted requests/results with versions and timestamps, and distinguish actual device tests from desktop mobile emulation.
5. Preserve full-disclosure consent for this EdDSA JSON-LD profile. Do not imply selective disclosure merely because a request asks for selected fields.

The upstream `tests/openid4vc-interop-e2e/README.md` describes walt.id, Sphereon/DCQL and EUDI reference suites, including documented gaps and skipped cases. Those are useful candidate harnesses, but their upstream results are not tests of this wallet. No partner test or certification has been performed by this profile research.

## Executed integration update

The later v2 test with unmodified OpenID plugin 0.3.11 successfully receives this JSON-LD profile through final-1 style issuance and submits an ldp_vp presentation. See [executed protocol status](learncard-protocol-status.md). Earlier README-only deferral statements are not the final capability conclusion. Consumer UI remains untested.
