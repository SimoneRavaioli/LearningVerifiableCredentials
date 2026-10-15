# Learning Passport — LearnCard × ITU LVC reference wallet

A working browser application with a fictional university, a learner wallet, and an employer verifier. Real LearnCard signatures are independently verified using Digital Bazaar. The selected target is **demonstrated alignment with a subset of the ITU LVC-3 working draft**, not certification or complete production conformance.

## Run locally

Requires Node.js 22.12+ (tested with 24.19.0), npm, and a browser. No paid account, hosted LearnCard service, Docker, or blockchain is required.

```sh
npm ci
npm run build
npm start
```

On the machine running Node, open **http://localhost:3000**. In a remote cloud environment, this is not your desktop localhost; an authenticated platform-forwarded URL is required. The server binds to 127.0.0.1. Signing and verification work offline after dependencies are installed. Use the role tabs and development passwords:

| Role | Development password |
| --- | --- |
| University | university-demo-change-me |
| Learner | learner-demo-change-me |
| Employer | employer-demo-change-me |

To configure the application, copy .env.example to .env, replace the passwords, and run `node --env-file=.env server/index.mjs`. The normal npm start command uses inherited environment variables; it does not automatically read .env.

## Demonstrate the journey

1. **Issue:** sign in as University and click “Sign & deliver diploma.”
2. **Verify:** sign in as Employer and click “Request evidence.”
3. **Hold:** sign in as Learner, receive the diploma, select it, and review the employer’s request.
4. Inspect the complete credential and purpose. The “Authorize & present” button stays disabled until you approve.
5. **Verify:** sign in as Employer again and click “Verify presentation.” Inspect separate results for holder signature/binding, technical validity, status, issuer authorization, and qualification recognition.
6. Change credential status in Issue to suspended or revoked; create a new request and repeat. Revocation is permanent.
7. In Hold, export the original signed JSON, or download/restore an encrypted backup with a password of at least 12 characters.

Refresh each role to see changes made by another browser. Requests expire in five minutes and can be verified once. A server restart invalidates pending requests and login sessions; credentials and keys persist.

## Tests and portable verification

```sh
npm test
npm run lint
npm run build
npm run test:browser
npm run verify -- examples/diploma.json examples/snapshots.json examples/trusted-authority.json
npm run verify -- examples/presentation.json examples/snapshots.json examples/trusted-authority.json examples/request.json
```

The browser test uses /usr/bin/chromium; set CHROMIUM_PATH to a compatible executable on other systems. Tests generate fresh synthetic examples. Status/trust snapshots expire after 24 hours; requests after five minutes. Re-run tests before independently checking old examples. Expired evidence is supposed to fail closed.

The independent CLI imports Digital Bazaar packages, not LearnCard. Choose its authority file through an independent governance process; never trust an authority identifier merely because it arrived alongside a credential.

## Security and deployment boundaries

This is a **single-machine, custodial development reference**. The server holds the learner key. AES-256-GCM encrypts the local vault; its random master key is a separate owner-readable file in .data. A host administrator can access both. A password-protected backup contains the full learner identity and credentials; possession of the password and file permits identity recovery. It is a documented local envelope, not LearnCard’s hosted ZIP backup.

The standard development install retains five high-severity audit entries in an optional, unused React Native chain beneath LearnCard’s isomorphic-webcrypto dependency. Direct Ajv/Vite advisories were fixed. A clean Node-only production dependency install and all 20 tests passed; the audit excluding optional/peer packages reports zero. This does not establish absence of vulnerabilities.

For a Node-only runtime, first build with development dependencies, preserve dist, then install runtime dependencies with:

```sh
npm ci --omit=dev --omit=optional --omit=peer
npm start
```

To build again, restore development dependencies with npm ci. Do not expose the default development passwords. No public deployment, production identity registration, or external repository publication was performed.

## Deliverables

- [Executive and experiment assessment](docs/assessment.md)
- [Requirements matrix, with exact section 6.4 row numbers](docs/requirements.json) · [CSV](docs/requirements.csv) · [Human-readable assessment](docs/conformance.md)
- [Architecture and security boundaries](docs/architecture.md)
- [Interoperability report](docs/interoperability.md)
- [LearnCard capability inventory](docs/capabilities.json) · [Gap analysis](docs/gap-analysis.md)
- [AI development and iGrant comparison protocol](docs/ai-experiment.md)
- [Reusable agent instructions](assets/skills/itu-lvc-reference/SKILL.md)
- [Executable evidence](evidence/) · [Synthetic credentials and caches](examples/)
- [Pre-implementation analysis](docs/research.md) · [Source provenance](docs/sources.md)

Original application code is MIT licensed. See NOTICE for research snapshots and dependency licenses.

## Cloud preview access and file delivery

The internal preview adapter preserves the original Node wallet and exposes it to a supported cloud forwarding service:

```sh
# Terminal 1
npm start
# Terminal 2
npm run preview:cloud
```

The adapter listens on 0.0.0.0:4173 inside the cloud environment. It rejects cross-origin writes before forwarding accepted same-origin requests to the wallet, and retains the original role/CSRF checks. Its exact download allowlist is:

- /downloads/source.zip
- /downloads/README.md
- /downloads/Assessment.md
- /downloads/Verification-summary.json

Default download files are in /workspace/library-files/lvc-delivery; set PREVIEW_DOWNLOADS_DIR for another installation.

**An all-interface listener is not a public URL.** Device access requires the platform's authenticated port-forwarding/preview bridge. No external tunnel or hosted Site was created. The current Codex file-opening requests return queued and the user reports that the Cloud-file viewer fails. Cloud-side tests prove HTTP access, the original credential journey, and downloaded ZIP byte integrity; they do not prove desktop access. File mode changes did not resolve the viewer error.

Evidence: evidence/cloud-preview.json, evidence/cloud-preview-log.txt, and evidence/preview-adapter.txt. Run npm run test:cloud-preview only with both servers running in a synthetic test environment; it exercises issuance and changes local demonstration state.

## Interactive browser preview

The browser-local version is in `preview/`. Run `cd preview`, `npm ci`, then `npm run dev`. The full Node application remains at the repository root.

Live owner-private preview: https://learning-passport-wallet-preview.wellanole256.chatgpt.site

Generated source ZIPs and local launch packages are available on the deployed preview and are excluded from source control.
