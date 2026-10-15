# Showcase and test plan

## Audience and story

Show one adult graduate carrying a qualification into an employment application. Use fictional university, employer and authority identities. Explain once that this is a synthetic demonstration of real credential cryptography, not a national accreditation service.

The mobile learner is the central product. The issuer and employer are separate workspaces in the intended PoC. Until they are separated, a facilitator can use the role controls, but should explain that switching tabs is a demonstration shortcut rather than cross-device exchange.

## Proposed five-minute demonstration

| Time budget | Scene | What the audience should understand |
| --- | --- | --- |
| 0:00–0:30 | Open the learner wallet with a seeded pending diploma. | The qualification belongs to the learner and has an identifiable issuer. |
| 0:30–1:15 | Inspect and receive the diploma. | The wallet checks the credential; a recognizable card makes its meaning clear. Raw JSON is available on demand. |
| 1:15–2:00 | Employer requests evidence for a specific role. | The request has an identified recipient, a stated purpose and an expiry. |
| 2:00–3:00 | Learner sees the actual disclosed fields and approves. | Sharing is an intentional decision. The present format reveals the full credential; do not simulate selective disclosure by hiding fields on screen. |
| 3:00–4:00 | Employer gets an immediate decision with separate proof, status, issuer-authority and policy results. | A valid signature alone does not mean an employer must accept a qualification. |
| 4:00–5:00 | Show one meaningful failure, then reset. | A validly signed credential can be suspended or fail employer policy. The system explains the difference. |

Prepare two optional follow-ups: historical issuer authority and verification with previously obtained signed offline snapshots. State when snapshots were obtained and when they expire. A network-disabled check does not prove a new wallet can discover trust offline, and reopening the website offline is a separate capability.

Have the private URL signed in on the presenting device before the session. Keep a local launcher and a short recorded demo available, labeled as fallback material. Check their behavior on the actual presentation machine; do not improvise hosting changes during a showcase.

## Scenario catalogue

All outcomes below are **proposed test requirements**, except where the “existing evidence” column explicitly says otherwise. Do not count them as completed merely because this table exists.

| ID / priority | Scenario | Expected result / evidence to capture | Existing evidence and remaining gap |
| --- | --- | --- | --- |
| T01 / P0 | Issue → receive → review → approve → verify, with reload. | Same signed credential preserved; correct holder proof; no browser errors; record commit/mode/device. | Recorded Node and browser-preview Chromium journeys pass. Real deployed owner-device journey still needs evidence. |
| T02 / P0 | New visitor uses phone without instructions. | Finds diploma/request, understands sharing, reaches result without facilitator intervention. | No usability study recorded. Measure with five new users; proposed target ≥4/5 complete, and all can name recipient and disclosed information. Investigate each failure. |
| T03 / P0 | iPhone Safari and Android Chrome, portrait/landscape; 320/390/430 px and large text. | No clipped action or obscured consent; keyboard/camera/download/return navigation works. | Chromium 390 px no-overflow check only. Real devices and WebKit behavior untested. |
| T04 / P0 | Keyboard, screen reader, focus, validation and contrast. | Correct reading order, labels and status announcements; focus reaches new results/errors; primary targets usable by touch. | Some labels/live regions exist. No comprehensive accessibility audit. |
| T05 / P0 | Wrong password; deny consent; change selection after review; expired request; double tap. | Safe retry/cancel; no signature before approval; payload change requires new review; expiry is explained. | Node approval/digest and preview checkbox tests exist. Full UI expiry/cancel/double-tap coverage needed. |
| T06 / P0 | Tamper with award; wrong challenge/domain; replay; wrong holder; malformed/oversized import. | Independent rejection; no acceptance badge; actionable error without retained payload. | Several backend negative tests and preview tamper test exist. Add production UI coverage and import resource-limit checks. |
| T07 / P0 | Active → suspended → active; permanent revocation. | Verifier distinguishes outcomes; revocation confirmation; cannot reactivate revoked credential. | Status tests and preview suspension rejection exist. Confirm mobile UX and irreversible-action handling. |
| T08 / P0 | Valid credential, wrong employer qualification; valid signature, untrusted issuer; missing/stale caches. | Distinguish policy mismatch, trust unknown and check incomplete from cryptographic invalidity. Fail closed for acceptance. | Underlying distinctions partly tested. Improve and test result language/tri-state UI. |
| T09 / P0 | Clean clone build; every download; archive extraction; local start on supported OS. | All advertised files exist and match release SHA; launch without developer workspace; documented runtime preconditions. | Cloud/source downloads and Linux local journey pass. Published GitHub source lacks generated download ZIPs; Windows/macOS launcher behavior unverified. |
| T10 / P0 | Inspect storage, downloads, logs and network after sharing. | No VP persisted by app after verification/expiry; no unapproved egress. Explicitly document user-downloaded presentation retention. | Node persistence test and preview envelope checks exist. Broader deployed network/log/header review needed. “Removed from memory” is not a forensic erasure guarantee. |
| T11 / P1 | Clean-device holder backup recovery. | Same holder DID and credential proof survive on a new profile without original issuer records; new challenge can be answered. | Existing restore depends on original issuer records. Current test is same-environment restoration, not disaster recovery. |
| T12 / P1 | Desktop employer ↔ mobile external wallet using QR/deep link. | Pinned protocol/format success; expired QR, wrong audience and return-path failures handled. | Not implemented; toolkit portability is not a substitute. |
| T13 / P1 | Two independent issuers, one trusted and one unknown; mixed validity. | Receipt policy clear; each issuer/proof/status result remains separate; no blanket trust. | Independent bundle test exists. Foreign-issuer UI receipt absent. |
| T14 / P1 | Independently governed historical authority and changed/closed issuer. | Authority evaluated at issuance with retained keys/evidence; current revocation separately respected. | Fictional scope/date tests exist. Real governance, rotation/closure and archival integration absent. |
| T15 / P1 | Offline after preload, offline first visit, offline reload, expired cache and clock boundaries. | Clearly different supported/unsupported states; no stale-cache acceptance. | Network-disabled verification and single-HTML journey after load pass. First visit/reload offline and clock-change matrix incomplete; use controlled test time. |
| T16 / P1 | Two tabs issue/share concurrently; storage full/denied/cleared; browser interrupted. | No duplicate index, lost credential or false “saved” message; recovery route explicit. | Node concurrent issuance test exists; browser queue is within one module instance, not proof of cross-tab coordination. |
| T17 / P1 if claimed | Selective disclosure via agreed external wallet/verifier. | Required fact verifies; unused attributes are absent from transmitted proof; challenge/replay tests pass. | Not executed. Full-credential consent must remain honest until this passes. |
| T18 / P2 before relevant pilot | Unicode/RTL names, long institutional titles, qualification codes, corrections/reissue and minors. | Original-script fidelity; no silent truncation or fabricated equivalence; appropriate guardianship if in scope. | UTF-8 storage only. Jurisdictional rules and scenarios remain to be designed. |

## Release gates

**Showcase-ready synthetic demo:** T01–T10 pass in declared supported modes; owner can open the deployed private URL and complete the journey; mobile learner/disclosure/result screens are understandable; reset and fallback are proven on the presenting device. Publish a short limitations card. No certification, external-wallet or production-custody claims.

**Interoperability PoC:** showcase gate plus T11–T16; one named external wallet and a pinned profile; a real education data-model profile; separated institutional roles/custody and an independently configured governance source. T17 is required only if selective disclosure is claimed; otherwise explicitly label full disclosure. A synthetic independently operated authority can prove integration, but cannot be described as official accreditation.

**Real-user pilot:** interoperability gate plus applicable T17/T18, independent security/privacy review, accountable governance, issuer onboarding, key lifecycle/incident/recovery exercises, operational service ownership and jurisdiction-specific learner-data controls. Real student data is outside the current demo scope.

## Performance and usability measurements

Set targets before testing, then report actual results. Suggested initial targets: guided demo ≤5 minutes; ≥4/5 novice completion without coaching; every participant identifies recipient and actual disclosed data; first actionable screen ≤3 seconds and normal share/verify feedback ≤2 seconds on a named midrange phone/network after engine initialization. Measure cold-start separately: the current build includes about 8.84 MB raw signing WASM and 1.27 MB raw JavaScript, so size, compression, caching and startup timing need device evidence. These size figures are observed build output, not measured transfer sizes or mobile timings.

A release evidence record should include UTC timestamp, source SHA, application mode, build/archive hashes, test runner and version, OS/browser/device, network/cache conditions, scenario IDs, pass/fail/skip with reasons, deployment URL/ID and an explicit live-route verification result. Preserve redacted artifacts, never wallet seeds or real learner data. Historical JSON summaries must not be rewritten to pretend they were produced by a newer release.
