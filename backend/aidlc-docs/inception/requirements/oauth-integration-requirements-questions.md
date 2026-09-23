# OAuth Integration Requirements - Clarification Questions

Context: Current `IntegrationService` stores only a Slack/Google app `client_id` + `client_secret` and sends the `client_secret` directly as a Bearer token when calling the revoke APIs. This does not match how either provider actually authorizes admin-level token revocation, so it will fail against the real APIs. This cycle replaces that with a real, working authorization mechanism.

Please answer each question by filling in the letter after `[Answer]:`.

## Question 1
For **Slack**, employee offboarding needs an admin-level credential that can revoke/kill a user's sessions across the whole workspace (not a per-employee token — Slack does not hand out per-employee tokens to a third-party backend). Which credential-acquisition approach should we implement?

A) Slack App OAuth "Install to Workspace" flow (admin clicks "Add to Slack" once, backend receives a redirect callback with an authorization code, exchanges it for a long-lived bot token with `admin.users.session:write` scope, stores it encrypted)

B) Manual token entry (a workspace admin generates a token themselves in Slack's admin/app settings and pastes it into the existing "Configure Slack" form; backend just validates and stores it encrypted — no redirect/callback flow to build)

C) Other (please describe after [Answer]: tag below)

[Answer]: B

## Question 2
For **Google Workspace**, real user-token revocation requires either a Service Account with **domain-wide delegation** (Workspace admin authorizes it once in the Admin Console, backend then signs JWTs to call the Admin SDK Directory API for any user) or a redirect-based OAuth flow per admin. Which should we implement?

A) Service Account + domain-wide delegation (admin uploads/pastes a service account JSON key + the impersonated admin email once; backend signs its own JWTs — no OAuth redirect flow needed, no token refresh needed)

B) OAuth 2.0 Authorization Code flow with a Google admin (redirect to Google consent screen, exchange code for access+refresh token, refresh automatically when expired)

C) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 3
Should this feature cycle implement **both** Slack and Google Workspace credential handling, or just one first?

A) Both in this cycle

B) Slack only in this cycle (Google Workspace deferred)

C) Google Workspace only in this cycle (Slack deferred)

D) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 4
The existing `IntegrationConfig` table/entity currently has `client_id` + `encrypted_client_secret` columns designed for the old (incorrect) model. How should we evolve the data model?

A) Repurpose the existing columns generically (store whatever credential blob each provider needs — bot token for Slack, service account JSON for Google — in the existing encrypted secret column; add nullable provider-specific metadata columns as needed via a new Flyway migration)

B) Keep `IntegrationConfig` only for status/metadata and add a separate `oauth_credentials` table per provider

C) Other (please describe after [Answer]: tag below)

[Answer]: A (AI default — not asked directly in chat; simplest option consistent with "backend only, fast" preference from Question 5)

## Question 5
Should connecting Slack/Google **require re-entering credentials through the admin dashboard UI (frontend)** in this cycle, or is a backend-only API change (existing `POST /api/v1/integrations/slack` / `/google-workspace` endpoints, just with new field semantics) sufficient for now?

A) Backend API only for now (frontend "Configure" form can be updated in a later cycle)

B) Update both backend and the frontend Integrations UI in this cycle

C) Other (please describe after [Answer]: tag below)

[Answer]: A
