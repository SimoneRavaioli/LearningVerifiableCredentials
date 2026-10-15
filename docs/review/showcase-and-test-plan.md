# Showcase and test plan — LCV Passport - Wallet v1 / LCV Passport - Wallet v2

Updated 15 October 2026 after implementation and private deployment of LCV Passport - Wallet v2. The original hosted product is now **LCV Passport - Wallet v1**. This plan retains the original scenario IDs and acceptance criteria; its evidence column reflects the delivered v2 build rather than treating completed work as future work.

## Current release position

[LCV Passport - Wallet v2](https://learning-passport-wallet-v2.wellanole256.chatgpt.site/) is deployed owner-private. [LCV Passport - Wallet v1](https://learning-passport-wallet-preview.wellanole256.chatgpt.site/) remains available separately with its original workflow/storage. V2's [release manifest](../../v2/evidence/release.json), [deployment record](../../v2/evidence/deployment.json), [local-package browser test](../../v2/evidence/local-package-browser.json) and [backlog status](../../v2/docs/backlog-status.json) are the evidence baseline.

Seven v2 Node tests and production browser scenarios pass. The recorded browser checks include widths 320/390/430/1440, 200% zoom, 44 px buttons, consent/cancel, fresh-context recovery, second-issuer receipt, suspension, warm offline reload and no external requests. The result-screen axe scan reports zero violations in that tested scope. Separate service and storage-fault browser tests also pass. These are Chromium and local-service results, not real iOS/Android, human accessibility or novice-study results.

The complete showcase gate below is **not yet fully accepted** because physical-device/human and owner-device end-to-end checks remain. Interoperability and real-user-pilot gates remain partial. Native deployment success does not fill those gaps.

## Audience and story

Show one adult graduate carrying a qualification into an employment application. Use fictional university, employer and authority identities. Explain once that this is a synthetic demonstration of real credential cryptography, not a national accreditation service.

The mobile learner is the central product in LCV Passport - Wallet v2. Its hosted Demo tools switch between co-located fictional roles. The separate local Node PoC has distinct issuer/authority/verifier processes and browser-held learner keys; those services and the OpenID endpoints are not running behind the hosted demo. Describe role switching as a demonstration shortcut, not cross-device exchange.

## Five-minute demonstration using the implemented v2 UI

| Time budget | Scene | What the audience should understand |
| --- | --- | --- |
| 0:00–0:30 | Open the learner wallet with a seeded pending diploma. | The qualification belongs to the learner and has an identifiable issuer. |
| 0:30–1:15 | Inspect and receive the diploma. | The wallet checks the credential; a recognizable card makes its meaning clear. Raw JSON is available on demand. |
| 1:15–2:00 | Open the seeded employer request; create a fresh one in Demo tools if expired. | The request has an identified recipient, a stated purpose and an expiry. |
| 2:00–3:00 | Learner sees the actual disclosed fields and approves. | Sharing is an intentional decision. The present format reveals the full credential; do not simulate selective disclosure by hiding fields on screen. |
| 3:00–4:00 | Employer gets an immediate decision with separate proof, status, issuer-authority and policy results. | A valid signature alone does not mean an employer must accept a qualification. |
| 4:00–5:00 | In Demo tools, suspend the credential, make a fresh request and repeat; reset only v2 after confirmation. | A validly signed credential can be suspended or fail employer policy. The system explains the difference. |

Prepare two optional follow-ups: historical issuer authority and verification with previously obtained signed offline snapshots. State when snapshots were obtained and when they expire. A network-disabled check does not prove a new wallet can discover trust offline, and reopening the website offline is a separate capability.

Have the private URL signed in on the presenting device before the session. Keep a local launcher and a short recorded demo available, labeled as fallback material. Check their behavior on the actual presentation machine; do not improvise hosting changes during a showcase.

## Scenario catalogue

Expected outcomes remain acceptance requirements. The last column records executed v2 evidence and remaining tests; partial coverage is not a blanket pass for that scenario. Historical v1 evidence is labeled where relevant.

| ID / priority | Scenario | Expected result / evidence to capture | Existing evidence and remaining gap |
| --- | --- | --- | --- |
| T01 / P0 | Issue → receive → review → approve → verify, with reload. | Same signed credential preserved; correct holder proof; no browser errors; record commit/mode/device. | V2 production Chromium journey and reload pass; separate-service browser journey also passes. Private deployment succeeded. Owner-device deployed journey still needs evidence. |
| T02 / P0 | New visitor uses phone without instructions. | Finds diploma/request, understands sharing, reaches result without facilitator intervention. | V2 has a guided tour, seeded data and short screens. No novice study executed; retain the five-participant target and measure comprehension. |
| T03 / P0 | iPhone Safari and Android Chrome, portrait/landscape; 320/390/430 px and large text. | No clipped action or obscured consent; keyboard/camera/download/return navigation works. | V2 checks widths 320/390/430/1440 and 200% zoom without overflow. Physical iOS Safari/Android Chrome, landscape, camera and OS file handling remain untested. |
| T04 / P0 | Keyboard, screen reader, focus, validation and contrast. | Correct reading order, labels and status announcements; focus reaches new results/errors; primary targets usable by touch. | V2 labels, focus management/native dialog and 44 px button checks implemented; tested result-screen axe scan has zero violations. Full manual keyboard/screen-reader/contrast audit remains open. |
| T05 / P0 | Wrong password; deny consent; change selection after review; expired request; double tap. | Safe retry/cancel; no signature before approval; payload change requires new review; expiry is explained. | V2 consent-disabled gate and cancel-without-sharing pass; request expiry is tested with a controlled clock. Operation guard and named revocation confirmation implemented. Complete double-tap/expiry/resume UI matrix remains open. |
| T06 / P0 | Tamper with award; wrong challenge/domain; replay; wrong holder; malformed/oversized import. | Independent rejection; no acceptance badge; actionable error without retained payload. | V2 proof/binding/challenge, tampering and one-use protocol checks pass in core/service/SDK tests. Import size/profile guards implemented. Broader malformed/oversized production-UI matrix remains open; v1 negatives remain historical evidence. |
| T07 / P0 | Active → suspended → active; permanent revocation. | Verifier distinguishes outcomes; revocation confirmation; cannot reactivate revoked credential. | V2 production UI suspension rejection and revocation-cancel safety pass. Permanent-revocation enforcement is implemented; complete mobile revoke/reactivate/reissue journey needs explicit additional evidence. |
| T08 / P0 | Valid credential, wrong employer qualification; valid signature, untrusted issuer; missing/stale caches. | Distinguish policy mismatch, trust unknown and check incomplete from cryptographic invalidity. Fail closed for acceptance. | V2 core tests distinguish policy mismatch, malformed/tampered credentials, stale/missing evidence and suspended status. UI renders accepted/mismatch/invalid/incomplete. Full UI matrix still needs coverage. |
| T09 / P0 | Clean clone build; every download; archive extraction; local start on supported OS. | All advertised files exist and match release SHA; launch without developer workspace; documented runtime preconditions. | Final v2 source ZIP fresh install, seven tests, build and recreation of all four downloads pass. Extracted local package runs a complete Linux Node browser journey. macOS/Windows launcher syntax/mode checked, real OS execution untested. |
| T10 / P0 | Inspect storage, downloads, logs and network after sharing. | No VP persisted by app after verification/expiry; no unapproved egress. Explicitly document user-downloaded presentation retention. | V2 encrypted-envelope checks, no external requests in browser suite, transient VP design and service result without learner attributes. Mode threat models/CSP present. Deployed header/log review and independent security/privacy audit remain open. |
| T11 / P1 | Clean-device holder backup recovery. | Same holder DID and credential proof survive on a new profile without original issuer records; new challenge can be answered. | V2 export → new independent browser context → restore → same holder DID/original credential → new accepted presentation passes; wrong password rejected. No original issuer records needed. Physical-device recovery, lost-password and native ZIP compatibility unproven. |
| T12 / P1 | Desktop employer ↔ mobile external wallet using QR/deep link. | Pinned protocol/format success; expired QR, wrong audience and return-path failures handled. | V2 implements offer/request consumer links and QR, final-1 style OID4VCI ldp_vc and PEX OID4VP ldp_vp/direct_post. Unmodified LearnCard plugin0.3.11 round trip passes. Complete consumer app, physical camera/return path and remote HTTPS services remain untested. |
| T13 / P1 | Two independent issuers, one trusted and one unknown; mixed validity. | Receipt policy clear; each issuer/proof/status result remains separate; no blanket trust. | V2 core bundle verifies two issuer results independently; production UI second-issuer receipt passes. Import checks holder/proof without granting trust. Arbitrary-wallet receipt and full mixed-validity UI bundle matrix remain open. |
| T14 / P1 | Independently governed historical authority and changed/closed issuer. | Authority evaluated at issuance with retained keys/evidence; current revocation separately respected. | V2 signed synthetic registry, historical closure and versioned code-based recognition policy implemented; core/service checks pass. Real accreditation, delegated governance and institutional key recovery/closure remain open. |
| T15 / P1 | Offline after preload, offline first visit, offline reload, expired cache and clock boundaries. | Clearly different supported/unsupported states; no stale-cache acceptance. | V2 network-disabled verification, stale-cache outcome and warm-cache offline reload pass. First-ever offline load unsupported. Clock-controlled request expiry passes; broader device clock skew and first-load/cache eviction matrix remains open. |
| T16 / P1 | Two tabs issue/share concurrently; storage full/denied/cleared; browser interrupted. | No duplicate index, lost credential or false “saved” message; recovery route explicit. | V2 Web Locks serialize changes across tabs; concurrent issuance and synthetic quota refusal without false save pass. Unsupported storage versions are rejected. Real OS/browser eviction, interruption and schema migrations remain open. |
| T17 / P1 if claimed | Selective disclosure via agreed external wallet/verifier. | Required fact verifies; unused attributes are absent from transmitted proof; challenge/replay tests pass. | V2 experimental JOSE SD-JWT module proves qualification-only disclosure and rejects overdisclosure, wrong nonce and old binding. It is not the main OB3 flow or a LearnCard SD-JWT-plugin/external-verifier result. Full-disclosure consent remains explicit. |
| T18 / P2 before relevant pilot | Unicode/RTL names, long institutional titles, qualification codes, corrections/reissue and minors. | Original-script fidelity; no silent truncation or fabricated equivalence; appropriate guardianship if in scope. | V2 Unicode profile fixture and signed original-script names, correction/revocation linkage, issuer closure and qualification code catalogue implemented. Physical RTL/long-text study, official code mappings, full reissue journey and minors/guardians remain open. |

## Release gates

**Showcase-ready synthetic demo:** T01–T10 pass in declared supported modes; owner can open the deployed private URL and complete the journey; mobile learner/disclosure/result screens are understandable; reset and fallback are proven on the presenting device. Publish a short limitations card. No certification, external-wallet or production-custody claims.

**Interoperability PoC:** showcase gate plus T11–T16; one named external wallet and a pinned profile; a real education data-model profile; separated institutional roles/custody and an independently configured governance source. T17 is required only if selective disclosure is claimed; otherwise explicitly label full disclosure. A synthetic independently operated authority can prove integration, but cannot be described as official accreditation.

**Real-user pilot:** interoperability gate plus applicable T17/T18, independent security/privacy review, accountable governance, issuer onboarding, key lifecycle/incident/recovery exercises, operational service ownership and jurisdiction-specific learner-data controls. Real student data is outside the current demo scope.

## Performance and usability measurements

Set targets before testing, then report actual results. Suggested initial targets: guided demo ≤5 minutes; ≥4/5 novice completion without coaching; every participant identifies recipient and actual disclosed data; first actionable screen ≤3 seconds and normal share/verify feedback ≤2 seconds on a named midrange phone/network after engine initialization. Measure cold-start separately: LCV Passport - Wallet v1 included about 8.84 MB raw signing WASM and 1.27 MB raw JavaScript, so size, compression, caching and startup timing need device evidence. These size figures are observed build output, not measured transfer sizes or mobile timings.

A release evidence record should include UTC timestamp, source SHA, application mode, build/archive hashes, test runner and version, OS/browser/device, network/cache conditions, scenario IDs, pass/fail/skip with reasons, deployment URL/ID and an explicit live-route verification result. Preserve redacted artifacts, never wallet seeds or real learner data. Historical JSON summaries must not be rewritten to pretend they were produced by a newer release.

## Current build and integration evidence

V2's build manifest records the exact file sizes/hashes rather than reusing v1's totals. Its signing WASM is 8,840,700 raw bytes; JavaScript is split between main/storage and PoC/operator entries. These are artifact sizes, not measured network transfer times or real-phone startup benchmarks. The timing/usability figures above remain proposed targets, not achieved measurements.

Run from `v2/`: `npm test`, `node profiles/validate-fixture.mjs`, `npm run build`, `npm run package`; serve `dist` at the test URL and run `npm run test:browser`, `node tests/services-browser.mjs` and `node tests/storage-browser.mjs`. `npm run release` checks evidence against the build/source hash. The GitHub workflow is implemented; do not infer a remote CI pass merely from the existence of the workflow file.

[LearnCard integration status](../../v2/docs/learncard-protocol-status.md) separates the executed SDK protocol result from the untested consumer UI. [Security and operations](../../v2/docs/security-and-operations.md) names required operational responsibilities without implying an institution has accepted them.
