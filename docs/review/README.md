# Project review and next iteration

Updated after Wallet v2 implementation and deployment on 15 October 2026. Original review date: 15 October 2026. Baseline: GitHub commit `44d5045ccc0c7094d1a5f3201b3020b5be9caec3`, the deployed browser preview source, and recorded test evidence. ITU and LearnCard findings refer to the material retrieved on 14 October, not a fresh audit of upstream releases. The four review documents now distinguish Wallet v1 historical findings from delivered v2 capabilities and remaining acceptance criteria.

**Current position: Wallet v2 is implemented and deployed privately; Wallet v1 is retained under its new display name.** The original v1 URLs/stores remain unchanged. The backlog records 11 implemented items, 13 partial and one external-validation item. V2's seven Node tests, production mobile/desktop scenarios, clean-browser recovery and LearnCard OpenID SDK round trip pass; consumer-app, physical-device, human study and institutional acceptance remain open.

Read these documents in order:

1. [Retrospective and prioritized improvement backlog](retrospective-and-backlog.md): criticisms, changes, owners, dependencies and acceptance criteria.
2. [ITU / LearnCard / application responsibility map](standards-and-capability-map.md): exactly what we used, what we built, what remains unproven.
3. [Showcase and test plan](showcase-and-test-plan.md): a short demonstration, realistic scenarios and separate release gates.
4. [Feedback proposals for ITU and LearnCard](upstream-feedback.md): distinct, actionable proposals with evidence and suggested acceptance criteria. These have not been sent upstream.

The word “spec” needs care: ITU LVC is a Phase 1 working draft. LearnCard is an SDK and platform implementing several public standards; this project did not establish conformance to a separate normative “LearnCard specification.” Its package APIs and documentation are the implementation contract assessed here.

[Wallet v1](https://learning-passport-wallet-preview.wellanole256.chatgpt.site/) and [Wallet v2](https://learning-passport-wallet-v2.wellanole256.chatgpt.site/) are separate owner-private Sites. V2 deployment is recorded in [deployment.json](../../v2/evidence/deployment.json); [release.json](../../v2/evidence/release.json) records its tested build. The hosted v2 demo does not run its separate Node/OpenID services. Historical v1 reports are not rewritten as v2 evidence.
