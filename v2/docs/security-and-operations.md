# V2 security, deployment and operations

## Threat models and retained limits

| Mode | Keys and trust | Implemented controls | Residual risks / deployment boundary |
| --- | --- | --- | --- |
| Browser-local showcase | Holder, two issuers and fictional authority at one origin; encrypted IndexedDB | Distinct keys, signed artifacts, digest-bound consent, one-use presentations, Web Locks across tabs, authenticated storage, no analytics/remote document loader, app CSP and pinned WASM/schema/context | Same-origin script can use keys; demo tools are not institutional authentication. No genuine accreditation or physical device binding. Synthetic data only. |
| Isolated Node PoC | Per-role processes/files; holder seed only in separate browser DB; verifier anchor configured by launcher | Operator session cookie, origin checks, JSON/body limits, rate-limited login, one-use offers/requests, independent verification, fixed public-evidence fetch origins/timeouts, private file modes, per-service serialized writes | Services share an OS administrator and local machine, lack production identity/HTTPS and independent operator deployments. Node role key files are owner-readable plaintext private files, unlike the browser encrypted store; production requires a proper keystore/KMS and separate OS/service identities. |
| Original v1 | Unchanged single-server custodial reference | Original controls/tests retained | Do not attribute v2 custody, recovery or UX results to v1. |

Attack checks include changed signed data, wrong holder/audience/challenge, replay, unknown/stale trust and status, overbroad selective disclosure, cross-origin operator signing, cookie misuse and oversized imports. Current proof/schema paths use pinned local contexts and do not perform arbitrary document fetching. The verifier does not accept evidence URLs from a presentation as an instruction to fetch arbitrary hosts.

Node request/result retention is bounded by five-minute request expiry; prune on access/creation. Results contain check outcomes, not presented learner attributes. The browser activity list retains at most 50 local entries. Browser credential exports and encrypted backups are deliberate user-owned downloads. No forensic memory-erasure claim is made. Clear both wallet database and saved downloads when disposing of a demo machine.

## Dependencies

The recorded v2 default installation includes optional/native ecosystem packages with audit findings (see the dated audit evidence for the installed graph; the scan additionally omitting optional packages reports zero). The separately recorded omit-optional/peer audit isolates the Node/browser web path but does not establish general security or that every advisory is unreachable. The directly introduced ZIP library was upgraded from fflate 0.8.2 to 0.8.3 after its malformed-ZIP64 advisory was found. The product only creates ZIPs; it imports JSON backups, not arbitrary ZIPs. Keep exact post-fix audit counts in evidence, not copied from v1.

The reference uses native Web Crypto on supported browsers and Node 24. Do not ship an Expo/React Native build from this source without separately testing and remediating its dependency graph. Pinned LearnCard/WASM versions are retained to preserve the executed interop baseline; upgrade in a reviewed branch with the complete signature/status/recovery fixture suite.

The build precompiles JSON Schema validation so the web CSP does not need `unsafe-eval`. Browser scripts may compile WASM using `wasm-unsafe-eval`. Source/static packages contain no operator secret or runtime state. Node CSP/Referrer-Policy/no-sniff headers are enforced by the local server. Static Site header behavior must be checked on the deployed route; HTML CSP is included, but CSP `frame-ancestors` needs an HTTP header and is not guaranteed by a meta policy.

## Operational runbooks

Proposed accountable roles must be assigned before a real-user pilot: education authority owns trust scope/disputes; issuer owns issuance/status and corrections; wallet operator owns recovery/storage; verifier owns recognition/privacy; delivery owner owns uptime/release/rollback. A document is not evidence that these institutions have accepted those duties.

**Key compromise:** stop issuance, isolate affected service, preserve non-personal incident evidence, mark affected key/period under authority policy, publish signed trust/status updates, notify authorized operators through their established channel, reissue affected credentials with explicit replacement links. A fixed did:key does not rotate in place: create a new identity and retain governed historical mappings. Do not “fix” a compromise by silently changing a trust anchor supplied by a learner.

**Status/trust outage:** fail closed for acceptance with an “incomplete” outcome; show freshness and retry instructions. Public snapshots expire after 24 hours in this application policy. Republish from the rightful issuer/authority, never regenerate their keys on the learner device. Recover historical keys/records using the institution's independently tested backup procedure.

**Credential correction:** issue a replacement linked in the signed description to the previous ID, revoke the previous credential, preserve its original proof and show its status. This is a demonstration linkage, not an official OB3 correction relationship profile. Retain issuer-authority history when an institution closes. Do not conflate closure with revocation of all past credentials.

**Release/rollback:** reproduce from locked source, test, build and package, hash artifacts, publish exact source SHA and deployment metadata, preserve v1 URL, smoke-test owner access. Roll back to an identified saved v2 Site version; do not silently revert IndexedDB schema or discard user records. Unsupported storage versions show an error and preserve the existing data. Back up before schema migration.

**Support/telemetry:** collect version/build ID, browser family, scenario ID, coarse error category and user-approved diagnostic text. Never collect seeds, full credentials, raw presentations, passwords or arbitrary JSON backup contents. No network analytics are implemented. Any future telemetry or contact workflow needs a declared purpose/retention policy and authorization.

**Recovery:** holder backup restore is tested on a clean context. Institutional key recovery, new physical device OS security, passkeys/secure enclave, malicious extension resistance and lost-password recovery are not established. An installable PWA is a delivery option, not a hardware-security guarantee.

## Mobile decision

Ship the responsive web/PWA proof first; it now has short learner screens, cacheable public app assets and 44 px buttons. Native development is gated on physical iOS/Android checks, actual wallet/protocol partner compatibility, storage/recovery needs and measured startup performance. The PWA manifest uses the retained vector icon; add audited platform-specific icon assets if required for the target home-screen installation experience. OS installation and biometrics are not claimed as tested capabilities.
