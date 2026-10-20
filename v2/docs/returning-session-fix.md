# Returning-wallet credential receipt fix

The browser-local v2 demo retained signed status lists and its synthetic authority registry for 24 hours. Returning to the same encrypted wallet after that period caused credential receipt to fail with “Cannot save this credential: Could not complete checks”. A fresh-browser showcase test did not cover this failure.

Before receipt, inspection or presentation verification, the demo now renews expired evidence for credentials issued by its own local issuer records. It signs new evidence using the existing issuer and authority keys and preserves suspension, revocation, institution closure, holder identity and original credentials. It does not reset the wallet, extend old signatures' validity, change the independent verifier, or fabricate evidence for credentials restored from another wallet. Offline expired evidence remains incomplete. Receipt failures now display the specific failed check and reconnection guidance.

This refresh is specific to the browser-local simulation, where the same origin holds fictional issuer and authority keys. A deployed institutional wallet must retrieve fresh signed evidence from the actual issuer and configured authority; this change does not implement that integration.

Regression: `node tests/returning-browser.mjs`, against the production build served on port 4182. It keeps the encrypted database across a five-day return, checks credential receipt and inspection, preserves suspension and revocation across later expiries, refuses expired offline evidence and recovers on reconnection without changing holder identity. The test failed on the previous build at receipt after five days.

The earlier Codex “Cloud file” toast and this in-wallet credential-check error are distinct. Hosting deployment health alone does not establish that a returning user's wallet checks succeed.
