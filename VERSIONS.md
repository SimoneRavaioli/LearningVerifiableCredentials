# Wallet versions

| | LCV Passport - Wallet v1 | LCV Passport - Wallet v2 |
|---|---|---|
| Source | Repository root and `preview/` | [`v2/`](v2/) |
| Preview | [LCV Passport - Wallet v1](https://learning-passport-wallet-preview.wellanole256.chatgpt.site/) | [Mobile learner wallet](https://learning-passport-wallet-v2.wellanole256.chatgpt.site/) |
| Browser data | Original preview database | Separate `learning-passport-v2` database |
| Local launch | Original package/port | Separate package on port 8766 |
| Main purpose | Engineering reference / three-role workflow | Mobile UX, recovery, multi-issuer workflow and isolated-service PoC |

V1 is preserved. V2 has its own identity, source folder, encrypted browser data and private Site. Its Node PoC also uses a separate `.data` directory.

V2 includes a limited OpenID issuance/presentation profile exercised with unmodified LearnCard OpenID plugin 0.3.11 and independent Digital Bazaar verification. The complete LearnCard consumer app and physical-device flow remain separate acceptance gates.

See [v2 run instructions](v2/README.md), [backlog acceptance status](v2/docs/backlog-status.md), [LearnCard integration](v2/docs/learncard-protocol-status.md) and [release evidence](v2/evidence/release.json). “Addressed” backlog items are not all reported complete: human/device, external service and institutional governance prerequisites are listed explicitly.
