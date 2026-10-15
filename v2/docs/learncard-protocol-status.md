# LearnCard integration implemented in v2

Target selected by the user: LearnCard consumer wallet. Its public web routes are recorded in the companion consumer-source analysis. V2 now implements a **limited, executed OpenID profile** rather than relying on a documentation claim:

- Issuer metadata, pre-authorized credential offers, authorization-server discovery, one-use token redemption, nonce endpoint and holder-bound JWT proof validation.
- Final-1 style `ldp_vc` credential response with original signed OB3-profile VC2 credential. Both `proofs.jwt` and the legacy single-proof envelope are parsed, but the executed test uses the selected SDK’s final-1 path.
- PEX `ldp_vp` direct_post presentation request and response, exact `redirect_uri:` client ID bound as proof domain, nonce/state binding and strict submission descriptor mapping.
- Configured independent authority and status sources; no verifier trust anchor from the learner payload.
- Operator buttons generate LearnCard consumer URLs and real QR handoffs. Loopback endpoints require local SDK tests; remotely usable consumer flows need public HTTPS services and an actual app session.

`tests/learncard.test.mjs` uses the **unmodified npm `@learncard/openid4vc-plugin@0.3.11`** to accept the offer and submit its signed presentation. Digital Bazaar independently verifies that result. It also rejects reusing the pre-authorized offer. This is genuine client SDK protocol interoperability; it is **not** evidence that LearnCard’s complete UI, cloud persistence, mobile camera or native app has been tested.

The published SDK README’s “ldp_vc deferred” note differs from its executable decoder, which accepts the JSON-LD object. The source and the executed round trip supersede that old README statement for this pinned version. No dependency source was patched.

Remaining acceptance: deploy separate services with authorized public HTTPS origins/credential metadata, use LearnCard’s actual holder identity and storage account, exercise its import/consent/return UX on a real device, and record a real consumer-app result. Its unmodified local seed-login route avoids real account credentials but still requires the full Brain/LearnCloud/LCA and database stack. This repository does not claim to run that stack.

No certification claim is made for every OpenID feature: authorization-code issuance, wallet attestation, DPoP, encrypted direct_post.jwt, DCQL, SD-JWT status and token refresh are outside the selected implemented profile. The code fails unsupported cases instead of quietly accepting an arbitrary format.
