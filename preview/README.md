# LCV Passport - Wallet v1

Browser-local UX preview using real LearnCard signing and independent Digital Bazaar verification. Synthetic university, learner and employer roles share this browser for demonstration. This does not represent institutional role isolation or ITU certification. Signed status and trust artifacts remain local to the demonstration.

Run npm ci, then npm run dev. Build using npm run build. Owner-private Sites hosting serves dist using .openai/hosting.json. The original Node application is included as a separate source download, with its assessment and verification summary. No private keys, saved wallet data, or environment secrets are included.

A local launch package is also provided, requiring Node.js or Python, without npm installation or a build. Its browser flow supports offline use after loading. Browser-local storage persists on the same local address.

Source publishing uses scripts/sync-private-source.mjs with a short-lived credential through hidden stdin and process-only Git headers. The Sites plugin helper was unavailable in this executor; this equivalent workflow verifies the pushed commit before packaging its build. Credentials are never written to Git configuration or project files.
