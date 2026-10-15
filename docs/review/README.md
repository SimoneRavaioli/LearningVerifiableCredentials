# Project review and next iteration

Review date: 15 October 2026. Baseline: GitHub commit `44d5045ccc0c7094d1a5f3201b3020b5be9caec3`, the deployed browser preview source, and recorded test evidence. ITU and LearnCard findings refer to the material retrieved on 14 October, not a fresh audit of upstream releases. This review changes documentation only.

**Recommendation: keep the real signing and independent verifier; redesign the demonstration around a mobile learner and a separately visible employer.** The current work is an executable engineering reference. A reliable, understandable showcase needs a focused UX iteration. A convincing interoperability proof of concept also needs an actual external wallet and a specified exchange profile.

Read these documents in order:

1. [Retrospective and prioritized improvement backlog](retrospective-and-backlog.md): criticisms, changes, owners, dependencies and acceptance criteria.
2. [ITU / LearnCard / application responsibility map](standards-and-capability-map.md): exactly what we used, what we built, what remains unproven.
3. [Showcase and test plan](showcase-and-test-plan.md): a short demonstration, realistic scenarios and separate release gates.
4. [Feedback proposals for ITU and LearnCard](upstream-feedback.md): distinct, actionable proposals with evidence and suggested acceptance criteria. These have not been sent upstream.

The word “spec” needs care: ITU LVC is a Phase 1 working draft. LearnCard is an SDK and platform implementing several public standards; this project did not establish conformance to a separate normative “LearnCard specification.” Its package APIs and documentation are the implementation contract assessed here.

The private Site was successfully deployed after explicit approval. The same production build passed a local Chromium journey; the final live-site browser probe was blocked by this environment’s network. The user opened the Site URL in the app, but that alone does not verify the complete deployed workflow on their device. Earlier evidence files describing “no external deployment” are historical snapshots, not current deployment state.
