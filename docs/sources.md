# Source provenance and version scope

Retrieval date: 14 October 2026. Research snapshots are local evidence, not an assertion that every copied page is normative or final. SHA-256 hashes are in research/source-hashes.json.

| Source | Actual access and use |
| --- | --- |
| ITU LVC specification | MCP client initialization/tool discovery/search/getPage succeeded. All eight sections were retrieved, and exact requirements were extracted into the matrix. No numbered release; explicitly Phase 1 working draft. |
| LearnCard docs website/llms.txt | HTTP 403; the policy was respected. |
| LearnCard GitHub repository | https://github.com/learningeconomy/LearnCard at 1de9e4a8aed6a03b9428a6fa7895c9681e50ea7e; repository documentation, package source, CLI and holder-continuity docs inspected. |
| LearnCard npm packages | Published source and local WASM inspected; exact production versions in package-lock.json. Installed SDK stack is Core 9.4.38, DIDKit 1.10.3, DID Key 1.1.38, VC 1.6.4. Init 2.5.2, SD-JWT plugin 0.2.16 and holder-continuity 0.2.21 were researched but are not app-level dependency/capability claims. |
| ITU/iGrant knowledge product | Landing page, six chapters and annex retrieved through MCP. |
| iGrant marketplace | HTTP 403; no marketplace install or assurance claim. |
| L3-iGrant/skills | Accessible GitHub repository at 3a53b830b0fd7385e9af64fdbd1222460c13682e; overview/proxy/diploma skills and Apache-2.0 license/NOTICE inspected. |
| Official W3C sources | www.w3.org returned HTTP 403. Public w3c/vc-data-model, w3c/vc-bitstring-status-list and w3c/did-core GitHub sources were accessible and consulted. Their main branches are newer editor/candidate drafts (VC 2.1, status 1.1, DID 1.1), **not substituted for selected final VC 2.0 behavior**. |
| Independent libraries | Digital Bazaar npm docs/source inspected; selected cryptosuite/DID/VC/status APIs executed. Exact versions and integrity values pinned in lockfile. |

Selected standards references:
- W3C VC Data Model 2.0: https://www.w3.org/TR/vc-data-model-2.0/
- W3C Data Integrity EdDSA Cryptosuites (eddsa-rdfc-2022): https://www.w3.org/TR/vc-di-eddsa/
- W3C Bitstring Status List: https://www.w3.org/TR/vc-bitstring-status-list/
- W3C DID Core: https://www.w3.org/TR/did-core/
- did:key method, as implemented by independent resolver libraries: https://w3c-ccg.github.io/did-method-key/
- ITU source: https://experience-digital-transform.gitbook.io/experience-digital-transformation/dpi-for-education/learning-verifiable-credentials/specifications

The authoritative ITU material lists W3C VC 1.1/2.0 as alternatives, education models including OB3/CLR2/ELM, and exchange mechanisms including OpenID/VP/DC API. It does not prescribe this implementation’s local academic schema or JSON transport. Formal standards certification, final Phase 2 interoperability profiles and full OB3/CLR/ELM validation remain unclaimed.
