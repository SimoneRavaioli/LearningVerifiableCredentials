# Learning Passport — Wallet v2

A separate mobile-first learner wallet with real LearnCard signing, independent Digital Bazaar verification, readable consent, two synthetic issuers, clean-browser holder recovery and an isolated local service PoC. **The original application and its published preview remain v1.** V2 uses a different database, local launch port and private Site.

## Open the previews

- V2: https://learning-passport-wallet-v2.wellanole256.chatgpt.site (private; publication status in release evidence).
- Original v1: https://learning-passport-wallet-preview.wellanole256.chatgpt.site

Receive the pending credential, open Requests, review the information, approve, then open the employer result. Demo tools expose university and employer controls. All browser-demo identities are synthetic and co-located; these controls are not institutional authentication.

## Build and test from a fresh clone

Node.js 24 and npm, with no secrets or hosted LearnCard account required:

```sh
cd v2
npm ci
npm test
node profiles/validate-fixture.mjs
npm run build
npm run package
npm run dev
```

The dev server prints its local address. A cloud host's localhost is not your device. For the production browser suite, serve `dist` at `http://127.0.0.1:4182`, then run `npm run test:browser` and `node tests/services-browser.mjs`. Set `CHROMIUM_PATH` to your Chromium executable or install Playwright Chromium and set it to its executable path. CI config is in the repository's `.github/workflows/wallet-v2.yml`. Recorded Linux test results are in `evidence/`.

`npm run build` compiles the pinned schema into a CSP-compatible standalone validator, builds all three entries, pins app-shell assets for offline reload and emits a build manifest. `npm run package` creates source/local ZIPs and launch instructions under `dist/downloads`. Packaging uses only paths relative to this checkout; set `OUTPUT_DIR` to export elsewhere. No dependency symlink or installed node_modules belongs in source control.

## Separate-service PoC

Build first. Set `OPERATOR_PASSWORD` to your own 16+ character secret, then `npm start`. It does not automatically read `.env`; use `node --env-file=.env server/launch.mjs` if desired. The supplied `.env.example` is a template, not a deployed credential.

- Wallet/holder: http://127.0.0.1:4520/poc.html
- Issuer operator: http://127.0.0.1:4521
- Authority operator: http://127.0.0.1:4522
- Employer operator: http://127.0.0.1:4523

Copy the holder's public identifier into the issuer form, receive the one-use offer URL in the holder page, create an employer request, review it in the holder and approve. The issuer, authority and verifier have separate process key stores. The holder key exists only in that browser's isolated-holder database. Verifier trust comes from the launcher's configured authority DID and allowlisted evidence endpoints, never a trust anchor supplied by the presentation.

The manual holder page uses an application JSON exchange. Separate operator buttons also expose a limited OpenID issuance/presentation profile tested with unmodified LearnCard OpenID plugin 0.3.11; see [LearnCard protocol status](docs/learncard-protocol-status.md). The actual consumer UI and mobile app have not been tested. QR request links render, but loopback links do not work across devices. Remote/mobile use requires configured HTTPS origins, independently trusted requester identity and a pinned interoperable wallet/format profile. The hosted static demo does not run these Node services.

## Recovery and privacy

Backup v2 includes the holder seed, received signed credentials and public verification evidence. It excludes issuer/authority seeds. Export, restore into a clean browser and answer a new request is tested. Restored evidence can expire and needs renewal from the original public services; importing a credential never makes its issuer trusted. The original v1 backup and LearnCard holder-continuity ZIP are different formats and are not silently accepted.

Browser storage uses AES-GCM with a nonextractable same-origin key; backups use PBKDF2-SHA256/600000 and AES-GCM. Malicious code served from the origin can use that key. Keep real student data out of this demonstration. Presentations are transient; downloaded backups/exports remain on the user's device. Cached app assets contain no wallet data. Offline reload works only after a successful initial load and cache installation.

## Standards and scope

See [education profile](docs/education-profile.md), [security and operations](docs/security-and-operations.md), [exchange profile](docs/exchange-profile.md), [acceptance status](docs/backlog-status.md), [backlog JSON](docs/backlog-status.json), and [evidence manifest](evidence/release.json).

ITU LVC Phase 1 draft alignment is scoped, not certified. The Open Badges 3.0.3 context/model are pinned; the schema validator is an explicitly declared application subset, not the full official certification schema. The experimental SD-JWT module has JOSE-based selective-disclosure tests, but is not the main UI credential format or an external-verifier compatibility result. No claim is made for a completed real-device usability study, institutional accreditation, native secure hardware, or decades-long operational proof.
