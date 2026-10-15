# Executed interoperability report

The issuing implementation is LearnCard’s Rust/WASM DIDKit path. The independent implementation is Digital Bazaar’s JavaScript VC, Ed25519 Multikey, DID method key and eddsa-rdfc-2022 libraries. It does not import LearnCard in its verifier or holder modules. Both implement the same public standards; shared standards do not mean shared verification execution.

| Experiment | Actual result | Evidence and precise scope |
| --- | --- | --- |
| A: independent credential verification | Passed | A LearnCard VC 2.0 academic credential verifies with Digital Bazaar; local academic JSON Schema, dates, signed status, pinned trust anchor and employer recognition policy are checked separately. |
| B: independent presentation | Passed for local W3C VP exchange | LearnCard holder presentation verifies in Digital Bazaar with challenge/domain; the independent holder also produces a presentation accepted by the application verifier. No OpenID4VP/VCI transport exchange was attempted. |
| C: portability | Passed at independent toolkit level | Digital Bazaar holder imports and persists the signed credential, displays its qualification, preserves original proof and presents it with recovered original identity. This uses the decrypted local backup seed under synthetic custody. No consumer wallet product was tested. |
| D: negative verification | Passed | Tampered award, invalid proof, malformed schema/context, expiration, revoked/suspended status, wrong challenge/domain, replay and holder mismatch are rejected. |
| E: issuer trust and recognition | Passed | Valid signatures remain visible when issuer scope/date/registry is untrusted; a trusted history diploma fails the employer’s computer-science recognition policy. |
| Multi-issuer bundle | Passed for independent verifier | Two signed credentials preserve separate issuers/results. The second issuer remains untrusted and the bundle is not accepted. Browser wallet foreign-issuer receipt remains a gap. |
| Offline verification | Passed | global fetch is disabled during verification using published signed status/trust snapshots. Missing/tampered caches and wrong anchors fail. Offline first-time trust discovery is not demonstrated. |

## Reproduce

Run npm test. tests/interoperability.test.mjs exercises independent wallet import/presentation and multi-issuer bundles. tests/verification.test.mjs exercises independent signature/status/trust checks. tests/lifecycle.test.mjs produces portable synthetic examples.

Then execute the independent CLI against examples/diploma.json and examples/presentation.json as documented in the README. Fresh sample requests last five minutes, public caches 24 hours. Results are in evidence/independent-credential.json and evidence/independent-presentation.json; these are executed results, not hand-authored fixtures.

The independent holder is a small reference adapter over maintained Digital Bazaar packages, not a third-party production wallet. Its plaintext credential file is owner-readable in a temporary test directory and removed after testing. Credentials bound to a different holder are rejected. Seed transfer demonstrates identity continuity but changes custody assumptions; it does not establish wallet-product compatibility or privacy-preserving migration.

No claim is made for QR/deep-link exchanges, mobile/native wallets, DIDComm, SD-JWT/mDoc, EUDI wallet compatibility, cryptographic selective disclosure, CLR aggregation, Open Badges certification or production cross-border recognition.
