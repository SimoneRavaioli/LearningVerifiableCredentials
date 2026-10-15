# LearnCard consumer wallet integration

The preferred compatible path is **OID4VCI 1.0 preauthorized issuance of the existing `ldp_vc` OB3/VC2 credential, followed by an OID4VP `ldp_vp` presentation**. This is a source-supported integration target, not a completed external-wallet test. A simpler fallback is importing the signed JSON credential into the consumer wallet, then presenting it through OID4VP.

Research uses the unmodified LearnCard source at commit `1de9e4a8aed6a03b9428a6fa7895c9681e50ea7e`, including consumer routes and `@learncard/openid4vc-plugin` 0.3.11 source. A deployed LearnCard website may run a different revision. Confirm its capabilities with an actual session before advertising compatibility.

## Exact consumer entry points

| Operation | Source-defined route |
|---|---|
| Issue to consumer wallet | `/oid4vci?offer=` followed by `encodeURIComponent(offerUri)` |
| Present from consumer wallet | `/oid4vp?request=` followed by `encodeURIComponent(requestUri)` |
| Local test login without a real account | `/developer/sign-in?profileId=<synthetic-profile>&next=<encoded-local-route>` |
| Raw credential import | Consumer Add to passport / Add to LearnCard menu → paste or upload credential; a modal rather than a guaranteed dedicated URL |

Use the selected consumer origin, normally `https://learncard.app`, before the route. The request URI uses `openid4vp://authorize?...`; the offer URI uses `openid-credential-offer://?credential_offer_uri=...` or a URL-encoded by-value `credential_offer` JSON parameter. The consumer claim router also recognizes these strings pasted/scanned directly.

A generic `https://issuer.example/credential.json` link does not automatically import a credential. The input parser recognizes known tenant URLs, explicit protocol schemes, interaction URLs with `?iuv=1`, and raw JSON candidates. Do not confuse a downloadable JSON link with a native consumer claim link.

Source: `apps/learn-card-app/src/Routes.tsx`, `src/hooks/parseClaimInput.ts`, `src/hooks/useClaimInputRouter.ts`, `src/hooks/useUploadVcFromText.ts`.

## OID4VCI issuer contract

The executable plugin source supports `ldp_vc` normalization as a JSON-LD object. Its README still says Linked Data issuance is deferred; that statement is stale relative to `src/vci/decode.ts` (`normalizeIssuedCredential`, `case 'ldp_vc'`) and `src/vci/accept.ts`. A real consumer run is necessary to resolve deployment/version drift.

The plugin discovers **final OID4VCI 1.0** metadata first, using insertion-style well-known discovery, with a legacy Draft 13 append-style fallback. For a root issuer `https://issuer.example`, serve:

- `GET /.well-known/openid-credential-issuer`
- `GET /.well-known/oauth-authorization-server`
- `POST /token` (form encoded preauthorized grant)
- `POST /nonce` (fresh `c_nonce` JSON)
- `POST /credential` (bearer access token plus JSON key proof)

For an issuer identifier containing a path, final well-known insertion occurs after the host and before the issuer path. Avoid using the metadata URL itself as the `credential_issuer` identifier.

Minimal configuration fragment:

```json
{
  "credential_issuer": "https://issuer.example",
  "credential_endpoint": "https://issuer.example/credential",
  "nonce_endpoint": "https://issuer.example/nonce",
  "authorization_servers": ["https://issuer.example"],
  "credential_configurations_supported": {
    "OpenBadgeCredential": {
      "format": "ldp_vc",
      "credential_definition": {
        "@context": ["https://www.w3.org/ns/credentials/v2", "https://purl.imsglobal.org/spec/ob/v3p0/context-3.0.3.json"],
        "type": ["VerifiableCredential", "OpenBadgeCredential"]
      },
      "cryptographic_binding_methods_supported": ["did:key"],
      "credential_signing_alg_values_supported": ["eddsa-rdfc-2022"],
      "proof_types_supported": {
        "jwt": {"proof_signing_alg_values_supported": ["EdDSA"]}
      }
    }
  }
}
```

This fragment deliberately declares only the holder method the PoC can independently resolve. If the actual consumer supplies a `did:web` or another holder key method, add a constrained verified resolver and tests before extending the declaration. Do not advertise methods merely because the consumer app supports them.

An offer supplies `credential_configuration_ids: ["OpenBadgeCredential"]` and the grant key `urn:ietf:params:oauth:grant-type:pre-authorized_code` with its `pre-authorized_code`. The token request is form encoded with that grant type and code. The final credential request uses `credential_configuration_id` and `proofs: {"jwt": ["<signed key-proof JWT>"]}`. When token authorization details supply credential identifiers, the consumer uses `credential_identifier` instead of configuration id; omit that optional mechanism until implemented.

Respond with `{"credentials":[{"credential": <signed JSON-LD credential>} ]}`. The inspected plugin also accepts the older singular `credential` field, but use the final response shape. Deferred-only `transaction_id` responses are explicitly unsupported by this source.

Verify the proof JWT's signature, `typ` (`openid4vci-proof+jwt`), issuer audience, nonce, `iat` and key control. The consumer proof supplies the verification-method `kid`; an anonymous preauthorized flow may omit `iss`, so **do not assume `iss` is the holder DID**. Bind the credential subject to the proven key controller under the selected identity policy. One-use codes, short access-token lifetime, one-use nonces and redemption limits are issuer responsibilities.

**Critical holder binding:** importing a credential already addressed to the PoC's own learner DID will not demonstrate a consumer holder-bound presentation. Issue to the consumer's proven DID, or use a clearly isolated synthetic test identity controlled by the consumer. Never export a real user's wallet seed to facilitate this.

## OID4VP verifier contract

A concrete PEX-compatible authorization request can use:

```text
response_type=vp_token
response_mode=direct_post
client_id=redirect_uri:https://verifier.example/oid4vp/response
response_uri=https://verifier.example/oid4vp/response
nonce=<unguessable one-use nonce>
state=<unguessable session state>
presentation_definition=<URL-encoded JSON>
client_metadata=<URL-encoded JSON>
```

The canonical `redirect_uri:` client-id prefix is supported by the inspected source and requires the unprefixed value to equal the response target. Alternatively the source supports the older separate `client_id_scheme=redirect_uri` parameter; identify that as a legacy compatibility mode. This contract uses PEX presentation definitions, which the plugin supports alongside final OID4VP 1.0 DCQL. Do not describe the PEX response as a DCQL response or a full final-only conformance claim.

The presentation definition should constrain the relevant credential using `format.ldp_vc` and require `type` containing `OpenBadgeCredential` plus the desired qualification code. Use supported JSONPath fields, such as `$.type` with an array `contains` filter and `$.credentialSubject.achievement.humanCode`. Omit selective-disclosure requirements for this full-disclosure JSON-LD profile.

Publish this client metadata to select the PoC's supported presentation proof:

```json
{
  "client_name": "Learning Passport demonstration verifier",
  "vp_formats_supported": {
    "ldp_vp": {
      "proof_type_values": ["DataIntegrityProof"],
      "cryptosuite_values": ["eddsa-rdfc-2022"]
    }
  }
}
```

This is operationally important: `src/plugin.ts` chooses Data Integrity presentation options when the metadata requests them; otherwise the consumer's LearnCard default can be historical `Ed25519Signature2020`. `src/vp/sign.ts` sets the presentation proof `domain` to the **exact request `client_id`**, including its `redirect_uri:` prefix, and `challenge` to the request nonce. The PoC must verify those exact values rather than its own former origin-only convention.

The callback receives `application/x-www-form-urlencoded` fields `vp_token` (JSON-stringified signed VP), `presentation_submission` (JSON), and `state`. Verify and constrain descriptor mappings rather than merely taking the first embedded credential. Enforce session expiry, one-time nonce consumption, state binding, holder ↔ subject binding, issuer proof, trust, status and employer policy independently. An HTTP 200 callback alone proves none of these. The endpoint can return `{"redirect_uri":"https://verifier.example/result/<session>"}` after verified handling.

A DCQL extension instead receives a `vp_token` JSON object keyed by query id with arrays of signed presentations and no `presentation_submission`; that is a separate response parser. JARM `direct_post.jwt` requires actual response encryption keys and JOSE processing, not an alias for cleartext form parsing.

## Experimental SD-JWT alternative

The inspected source has explicit `dc+sd-jwt` and legacy `vc+sd-jwt` issuance normalization, format-aware storage and presentation hooks calling `parseSdJwtVc` / `presentSdJwtVc` when the SD-JWT plugin is attached. A compact string must retain its raw form and disclosures. The W3C-shaped display projection is not the signed source of truth.

Use this only as a separately versioned experimental credential profile with a concrete `vct`, issuer verification metadata/key resolution, a proven `cnf` holder key and KB-JWT audience/nonce verification. It is not the same OB3 JSON-LD credential. Do not rename the existing Data Integrity credential to `dc+sd-jwt`, or infer selective disclosure from choosing fields in the UX. Prefer the existing `ldp_vc` path first because it preserves the already-tested proof and education model.

## Running the unmodified consumer locally

The official local stack supplies development service defaults and developer seed login, so a real Firebase/Web3Auth account is not intrinsically required for a synthetic integration run. From a complete pinned checkout:

```sh
bun install --frozen-lockfile
STAGE=local docker compose -f apps/learn-card-app/compose-local.yaml up --build
```

Alternatively the app's documented `bun run lc dev` starts the configured local tenant workflow. The container's `docker-start:tenant` prepares tenant assets/config and runs Vite. Use the local tenant stage explicitly; production is the default when no stage is supplied in other commands.

The stack is substantial: frontend 3000, Brain 4000, LearnCloud 4100, LCA API 5100, Neo4j, MongoDB replica set, three Redis services, ElasticMQ and additional configured AI/LRS/Keycloak services. `compose-local.yaml` is authoritative for exact dependencies and development-only defaults. `/developer/sign-in` accepts a synthetic 64-hex seed and optional profile id. Seed login initializes the actual wallet; import still calls encrypted LearnCloud storage and its index, so the frontend alone is insufficient. Native iOS/Android packaging is not necessary for initial browser interoperability.

At research time this checkout had no installed `node_modules` and no `bun` executable; Docker CLI existed, but no stack was started or daemon capability established by this research. Dependency installation, container builds and permitted image/package hosts must be available. Optional AI, hosted auth, notification and observability integrations can require their own account configuration; they should not be used to justify inserting real credentials into a synthetic test. The documented mocked-network tier replays auth/boot reads and does not establish completed real import, issuance or external presentation.

A hosted static preview cannot itself provide these issuer/verifier POST endpoints. For a real phone test, use an explicitly authorized reachable HTTPS server and correct CORS allowlisting for the selected consumer origin. Desktop loopback cannot be scanned into a different phone and treated as a reachable server.

## Evidence required before marking the backlog complete

1. Record actual consumer origin, running build/version and actual holder DID method.
2. Open the generated offer in the unmodified consumer; complete visible consent; confirm the signed OB3 credential appears there.
3. Open the generated presentation request; release the credential with explicit consent.
4. Retain redacted protocol requests and independent verifier outcome, with consumer/version and timestamps.
5. Demonstrate replay, wrong holder, altered credential, wrong nonce/audience, expired offer and revoked credential rejection.
6. Keep source-based compatibility, SDK integration tests, real consumer browser tests and physical-phone tests as separate evidence categories.

No hosted consumer login, account creation, source modification, issuance, import or presentation was performed in this research.

## Executable SDK acceptance harness

For a protocol-level test without the consumer's account/storage services, attach the unmodified published holder plugin to an existing synthetic LearnCard that already has DIDKit, did:key and VC methods. Its factory takes the card and optional configuration:

```js
import {getOpenID4VCPlugin} from '@learncard/openid4vc-plugin';

const holder = await holderCard.addPlugin(
    getOpenID4VCPlugin(holderCard, {fetch: globalThis.fetch})
);
const accepted = await holder.invoke.acceptCredentialOffer(offerUri);
const issued = accepted.credentials.find(entry => entry.format === 'ldp_vc');
if (!issued) throw new Error('No ldp_vc credential returned');
const credential = issued.credential;

// requestUri carries the PEX descriptor with this exact id.
const result = await holder.invoke.presentCredentials(
    requestUri,
    [{
        descriptorId: 'education',
        candidate: {id: credential.id, credential, format: 'ldp_vc'}
    }],
    {envelopeFormat: 'ldp_vp'}
);
// result.signed.vpToken is the actual signed JSON VP.
// result.prepared.submission is the generated PEX mapping.
// result.submitted reports the HTTP submission result.
```

The example assumes a server request with input descriptor id `education`; use the actual request's descriptor id. In a consumer UX the holder must first choose the credential and consent. Automated SDK calls represent a test harness, not that consent UI. The host card must provide Ed25519 keypair access, its DID, `didToVerificationMethod` and `issuePresentation`; the plugin derives a JOSE key-proof signer automatically. `acceptCredentialOffer` does not save anything to consumer LearnCloud. `acceptAndStoreCredentialOffer` adds that separate service requirement.

For callback decoding, use bounded `application/x-www-form-urlencoded` parsing, JSON-parse `vp_token` and `presentation_submission`, then validate their schemas and descriptor mapping before verifying the Data Integrity authentication proof. The JSON VP is not a JWT and should not be decoded as a compact JWS. Do not auto-follow `descriptor_map` arbitrary JSONPath expressions; implement the documented subset and reject unsupported expressions.

## Later executed SDK update

V2 now implements the chosen issuer/verifier protocol subset and passes an end-to-end test with unmodified npm `@learncard/openid4vc-plugin@0.3.11`: offer acceptance, holder proof, OB3 VC receipt, PEX presentation submission and independent verifier acceptance. See [protocol status](learncard-protocol-status.md) and `tests/learncard.test.mjs`. The consumer UI/storage/device gates remain unexecuted. Earlier source-only planning statements in this analysis describe its research stage.
