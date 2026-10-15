# V2 exchange and interoperability declaration

## Executed profile: application JSON exchange v2

Credential: W3C VC2 with pinned OB3 context 3.0.3, DataIntegrityProof eddsa-rdfc-2022; did:key Ed25519. Local application-subset schema is pinned separately. Full official OB3 certification validation remains unavailable. Presentation: W3C VP with authentication proof, fresh challenge and verifier audience. Independent execution: Digital Bazaar proof/status verification.

Local Node roles use separate origins/processes. Issuer operator authenticates on its own origin, issues a one-use opaque credential offer bound to the learner DID, valid five minutes. The browser holder receives it and verifies its original proof/binding. Verifier operator creates a five-minute request with policy/version/purpose and a unique challenge. The holder reviews the full credentials, then sends a signed VP to the configured verifier response endpoint. The verifier loads status/trust only from configured services and pins the authority DID independently. It consumes the request before verification to prevent replay; a failed submission requires a fresh request. Result responses contain check outcomes rather than learner attributes.

Endpoints are documented by the server source: issuer `POST /login`, `POST /issue`, `GET /offers/:token`, `GET /status/revocation`, `GET /status/suspension`, `POST /status`; authority `GET /registry`, `POST /close`; verifier `POST /requests`, `GET /requests/:id`, `POST /responses`, `GET /results/:id`. Operator POST endpoints require same-origin session; cross-origin holder requests use explicit CORS allowlisting. No issuer/authority seed is available through any endpoint. Server restart clears sessions, offers and requests; credentials/private keys persist in separate role stores.

The QR contains the wallet deep link with an opaque request URL, no learner attributes/private keys. The holder validates the request origin/path against the configured verifier and verifies the audience before signing. This relies on configured service identity and HTTPS in remote deployments; localhost is an explicitly synthetic local environment. Camera scanning and cross-device delivery are not established by QR rendering.

## External wallet compatibility gate

No external consumer wallet is claimed compatible yet. A production partner test must pin wallet/product version, issuance and presentation protocol versions, supported credential/proof format, identifier methods, status profile, trust source and requester identity scheme. An executable test now demonstrates our Data Integrity diploma through final-1 style OID4VCI and PEX OID4VP with unmodified LearnCard OpenID plugin 0.3.11. This corrects its older README’s deferral statement; see [protocol status](learncard-protocol-status.md). The complete consumer app remains untested.

A valid partner integration must demonstrate: independent wallet receives the credential, holder reviews actual disclosure, separate verifier requests and verifies, no shared vendor-only transport is required, wrong/expired/audience/replay requests fail, status/trust failures remain distinct, and a phone-to-desktop exchange succeeds. Required inputs are a named partner wallet/test environment, supported compatible format and an authorized public HTTPS deployment of isolated services. The static showcase host alone is insufficient.

## Experimental privacy profile

`core/sdjwt.mjs` separately implements RFC9901-style salted disclosures with JOSE EdDSA and a declared application `vct`, `dc+sd-jwt` issuer header, holder `cnf.jwk`, key-binding JWT with nonce/audience/iat/sd_hash, and exact allowed-fields checks. Tests demonstrate qualification-only disclosure and reject extra attributes, mismatched nonce and old key binding. This module is not represented as a redacted version of the signed OB3 diploma, does not implement token status or OID4VP, and has not passed an external verifier/conformance suite. It is a testable experimental component, not a completed privacy claim for the main product.

## Holder-continuity evaluation

LearnCard holder-continuity 0.2.21 documents its encrypted ZIP envelope. V2 deliberately retains an explicit JSON holder-backup v2: PBKDF2-SHA256/600000, AES-GCM with authenticated metadata, holder seed and original signed received credentials/public evidence only. Clean-profile recovery and subsequent presentation are executed; original issuer records are unnecessary. No LearnCard native bundle compatibility is claimed. A future adapter must preserve DID/proofs and independently verify key/credential bindings, migrations and rejection of unsupported envelopes without importing issuer secrets.
