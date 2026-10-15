# AI development experiment and iGrant evaluation

## Observed run

Environment: Codex desktop in a managed cloud workspace, Node.js 24.19.0, npm 11.9.0, Chromium and Python’s official MCP SDK. The system identifies the agent as GPT-6 family; the exact serving snapshot/model identifier is not exposed by the available tools. No model comparison or token/cost measurement was instrumented.

The agent used ITU GitBook MCP search/getPage, a full eight-section specification snapshot, LearnCard’s GitHub repository documentation, published npm source/packages, local signing probes, Digital Bazaar libraries, Node test runner, ESLint, Vite and Playwright. The managed-runtime skill was read earlier at environment startup for network/proxy checks. No subagents were used.

There were no additional human interventions after the master prompt. The user’s prior GitBook domain configuration/publishing was a prerequisite supplied before this experiment, not an autonomous agent action. No account creation, support email, external publishing, payment or production registration was performed.

The requirements matrix and pre-implementation analysis were written before wallet functionality. Identity/signing probes selected a working Data Integrity route; the JWT wrapper defect was reproduced instead of bypassing verification. Package docs contained stale imports/storage references; current source and executable probes resolved uncertainty. Initial credential-context equality failed because the signer reordered object members; structural equality fixed the check without relaxing context restrictions. A browser-test lint error involving browser globals was fixed. Concurrent mutations were serialized and tested. Native role, consent, replay, backup and independent verification checks were executed.

Measured evidence includes test durations in evidence/tests.txt, browser results in evidence/browser.json, build/lint logs, independent CLI output, and a clean runtime installation/test log. Total development effort, human review time and comparative productivity were not instrumented. No numbers are invented for them.

## iGrant assets actually inspected

ITU’s AI-wallet landing page, all six chapters and annex were retrieved through MCP. The marketplace hostname returned HTTP 403 under the current destination policy; no bypass was attempted. The chapters identify the public repository **https://github.com/L3-iGrant/skills**, which was successfully cloned at commit **3a53b830b0fd7385e9af64fdbd1222460c13682e**. LICENSE and NOTICE confirm Apache-2.0 and iGrant Technologies AB attribution.

Reviewed skills:
- ows/igrantio-ows-overview/SKILL.md — OWS architecture, API surface, issuer/verifier roles and prerequisites.
- ows/igrantio-backend-proxy/SKILL.md — API keys stay server-side; endpoints are allow-listed and tenant scoped.
- credential-schemas/igrantio-credential-schema-diploma/SKILL.md — an OWS dc+sd-jwt diploma profile with nine mandatory selectively disclosable claims.

These are real downloadable instruction bundles, not merely presentation slides. Their native workflow needs an iGrant OWS API key, provider endpoints and certificate/trust-list onboarding. No suitable provider credential or production registration is configured here. Their diploma schema is dc+sd-jwt, not the LearnCard Data Integrity academic credential selected for this implementation. No provider skill was executed as an OWS integration and none was silently reinterpreted as a LearnCard API.

The modular skill structure, explicit prerequisite/version/validation criteria and backend trust boundaries informed the packaged reusable instructions and future integration protocol. No provider implementation code was transplanted into the application. Reviewed original skill files are retained with their license/notice for reproducible inspection.

## Comparative result

| Dimension | LearnCard reference run | Independent iGrant-assisted run |
| --- | --- | --- |
| Development effort | Not instrumented end-to-end; actual test/build logs retained | Not executed |
| Human interventions | Zero additional after master prompt | Not measured |
| Functional completeness | Lifecycle tested; documented transport/custody/schema gaps | Not measured |
| ITU coverage | Four required rows scoped; recommended row/ecosystem receipt partial | Not measured |
| Interoperability | Digital Bazaar verifier/holder toolkit demonstrated | Not measured |
| Security/quality | Role/CSRF/replay/encryption tests; audit results and limits retained | Not measured |
| Reusability | Local code/schema/tests/agent instructions packaged | Skills are available and licensed; integration compatibility not established |

**No controlled A/B comparison was performed.** Reviewing skills after implementing the reference is not an independent comparable trial and does not establish that skills reduce effort.

## Reproducible comparison protocol

1. Pin this repository, the ITU snapshot, LearnCard versions, iGrant skill commit and the same agent/model/context budget.
2. Use two clean workspaces with identical acceptance criteria and synthetic fixtures; prohibit cross-run code reuse and provide equal documentation access.
3. Obtain authorized OWS demo credentials and provider trust/test environment before the iGrant arm; record onboarding time separately. Do not assume a provider-hosted product and a local library have the same architectural scope.
4. Arm A receives LearnCard documentation/source only. Arm B additionally receives selected pinned iGrant guidance that has been reviewed for compatibility. If Arm B changes provider/format, report that as a different-system trial, not a pure skills productivity effect.
5. Instrument start/end times, commands/tool calls, token/cost usage where available, human interventions, implementation failures and security decisions.
6. Run identical independent tests for proof/status/trust/consent/privacy/replay and a real third-party wallet. Map each result to exact ITU requirements; keep “not executed” distinct from failure.
7. Perform independent engineering/security review and repeat with several seeds/runs. Publish only with authorization and valid source licenses.

This protocol is supplied because the external provider arm cannot be meaningfully executed with the available authorized credentials and scope.
