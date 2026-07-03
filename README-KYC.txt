================================================================================
  EKOXCHANGE — SUMSUB KYC INTEGRATION GUIDE
================================================================================

This document explains how Sumsub KYC verification works in this project:
  1. Backend setup (env vars, route registration)
  2. Frontend integration (how the mobile/web client uses it)
  3. Webhook flow (how Sumsub pushes status updates back to us)
  4. Sumsub dashboard configuration (what to enable in the Sumsub panel)
  5. End-to-end user flow diagram
  6. Testing locally
  7. Common errors & troubleshooting
================================================================================
1. BACKEND SETUP
================================================================================
1.1  Environment variables
   Add these to your .env file (suffix matches the env loader convention):
   _DEV for development, _STAGING for staging, none for production.

   SUMSUB_APP_TOKEN_DEV=...
   SUMSUB_SECRET_KEY_DEV=...
   SUMSUB_BASE_URL_DEV=https://api.sumsub.com
   SUMSUB_WEBHOOK_SECRET_DEV=...

   Where to get them:
   - SUMSUB_APP_TOKEN, SUMSUB_SECRET_KEY
       Sumsub Dashboard -> Developer -> API credentials
   - SUMSUB_BASE_URL
       https://api.sumsub.com (production)
       https://api.sumsubstage.com (sandbox/staging)
   - SUMSUB_WEBHOOK_SECRET
       Sumsub Dashboard -> Developer -> Webhooks -> "Secret" (you set it
       when you register the webhook URL)



================================================================================
2. ROUTES EXPOSED BY THE BACKEND
================================================================================

  POST  /kyc/applicant         (auth required)
        -> Creates a Sumsub applicant (or reuses an existing one) and
           returns an SDK access token the client must use to launch
           the Sumsub SDK.

        Response 201:
        {
          "status": "success",
          "response": "Created successfully",
          "data": {
            "data": {
              "applicantId": "68a1234...",
              "token": "eyJhbGciOiJSUzI1NiIs...",
              "userId": "user_abc123"
            }
          }
        }

  GET   /kyc/status            (auth required)
        -> Returns the current KYC status of the authenticated user.
           The frontend should poll this endpoint after the SDK closes
           until isKycVerified is true (or kycStatus is "rejected").

        Response 200:
        {
          "status": "success",
          "response": "Action was successful",
          "data": {
            "data": {
              "kycStatus": "in_progress" | "pending" | "approved" | "rejected",
              "isKycVerified": false,
              "kycReviewAnswer": "GREEN" | "RED" | null,
              "kycRejectedReason": null,
              "kycCompletedAt": null
            }
          }
        }

  POST  /webhooks/sumsub       (NO auth, signature verified)
        -> Sumsub posts to this URL whenever an applicant is created,
           reviewed, put on hold, or pending. We verify the signature,
           then update the user's kycStatus in our DB.

        Body: Sumsub's standard applicant webhook payload.
        Always responds 200 { "status": "ok" } on success.
        The URL to this webhook should be added to sumsub.
        E.G https://ekoxchange.com/webhooks/sumsub


================================================================================
3. FRONTEND INTEGRATION
================================================================================

The frontend never talks to Sumsub directly. It only talks to OUR backend.
Our backend mints short-lived tokens (1 hour TTL) that the Sumsub SDK accepts.

3.1  Step-by-step for the frontend
  (a) Make sure the user is authenticated and has a valid JWT.
  (b) Call our backend to start KYC:
        POST /kyc/applicant
        Headers: { Authorization: "Bearer <jwt>" }
        Response data:
          {
            applicantId: "68a1234...",   // Sumsub's applicant id
            token: "eyJhbGciOi...",      // SDK access token (1h TTL)
            userId: "user_abc123"
          }

  (c) Launch the Sumsub SDK with that token. Sumsub provides official
      SDKs for:
         - Web    (JavaScript)        https://docs.sumsub.com/docs/websdk-getting-started
         - iOS    (Swift / Objective-C)
         - Android (Kotlin / Java)

      Web SDK example:
        // On your "Verify Identity" button click
        const res = await fetch("/kyc/applicant", {
          method: "POST",
          headers: { Authorization: `Bearer ${userJwt}` }
        });
        const { data: { data: { token, applicantId } } } = await res.json();

        // Launch the SDK
        const snsWebSdkInstance = snsWebSdk
          .init(
            token,                       // access token from our backend
            () => launchHandler()        // called when token expires
          )
          .withConf({
            lang: "en",
            theme: "light",
          })
          .on("idCheck.onStepCompleted", (payload) => {
            console.log("step completed", payload);
          })
          .on("idCheck.onError", (error) => {
            console.error("sdk error", error);
          })
          .build();

        snsWebSdkInstance.launch("#sumsub-cta-container");

      Mobile SDKs follow the same idea: pass the token, listen for
      completion events, then close the SDK view.

  (d) When the SDK closes (user completed or cancelled), poll our backend:
        GET /kyc/status
        Headers: { Authorization: "Bearer <jwt>" }

        Repeat every 3 seconds until:
          isKycVerified === true     -> show "Verified"
          kycStatus === "rejected"   -> show the rejection reason

      NOTE: The status may NOT update immediately. Sumsub sometimes takes
      a few seconds to a few minutes to do the review (especially with
      manual review). The webhook is the source of truth.

3.2  Frontend checklist
   [ ] User is logged in (JWT available)
   [ ] Call POST /kyc/applicant on "Verify" button click
   [ ] If the user already has an applicantId, the response is fast
       (no new Sumsub applicant is created)
   [ ] Launch Sumsub SDK with the returned token
   [ ] When SDK closes, poll GET /kyc/status every 3s (max 60s)
   [ ] Show "Pending review" if still in_progress after polling
   [ ] Show "Verified" on isKycVerified === true
   [ ] Show error reason on kycStatus === "rejected"
   [ ] DO NOT trust the SDK's onComplete callback alone for the final
       status — the review can be async. Always poll the backend.

3.3  Frontend token refresh
   The Sumsub SDK token expires after 1 hour (our backend sets
   ttlInSecs: 3600). If the user keeps the SDK open for >1 hour, the
   SDK calls launchHandler() — at that point, just call
   POST /kyc/applicant again to get a fresh token, then re-init the SDK.


================================================================================
4. WEBHOOK FLOW (SUMSUB -> US)
================================================================================
Sumsub sends POST requests to https://<your-api-domain>/webhooks/sumsub
whenever something changes about an applicant.

4.1  Events we listen for
   - applicantCreated       -> mark kycStatus = "in_progress"
   - applicantReviewed      -> mark kycStatus = "approved" | "rejected"
   - applicantPending       -> mark kycStatus = "pending"
   - applicantOnHold        -> mark kycStatus = "pending" (manual review)

4.2  What we do on each event
   1. Verify the X-Payload-Digest header using HMAC-SHA256 with our
      SUMSUB_WEBHOOK_SECRET. If invalid, return 400 (and log).
   2. Parse the JSON body.
   3. Call GET https://api.sumsub.com/resources/applicants/<id>/status
      to get the latest state (Sumsub is the source of truth).
   4. Update the user's record in MongoDB:
        kycStatus, isKycVerified, kycReviewAnswer,
        kycRejectedReason, kycCompletedAt

4.3  Webhook payload (example from Sumsub)
   {
     "applicantId": "68a1234...",
     "externalUserId": "user_abc123",
     "type": "applicantReviewed",
     "reviewResult": {
       "reviewAnswer": "GREEN",
       "rejectLabels": []
     },
     "createdAt": "2026-07-03T12:34:56Z",
     "sandboxMode": false
   }

4.4  Signature verification
   Sumsub sends two headers:
     X-Payload-Digest-Alg: HMAC_SHA256_HEX
     X-Payload-Digest:     <hex sha256 hmac of raw body>

   We recompute the HMAC with our SUMSUB_WEBHOOK_SECRET and compare
   using crypto.timingSafeEqual() to prevent timing attacks.

4.5  Webhook security checklist
   [ ] Webhook URL is HTTPS in production
   [ ] Webhook URL is registered in Sumsub dashboard (not guessable)
   [ ] Raw body is preserved (use fastify-raw-body) so signature works
   [ ] Signature is verified BEFORE parsing the body
   [ ] timingSafeEqual is used, not === (prevents timing attacks)
   [ ] On any 4xx/5xx response, Sumsub will retry — log and let it retry


================================================================================
5. SUMSUB DASHBOARD CONFIGURATION
================================================================================

Before going live, configure these in the Sumsub dashboard:

5.1  Create a verification level
   - Dashboard -> Levels -> Create level
   - Name: "basic-kyc-level"   (must match the levelName in our code)
   - Add the steps you want: ID document, selfie, liveness, address, etc.
   - Save

5.2  Create API credentials
   - Dashboard -> Developer -> API credentials
   - Copy the App Token and Secret Key into your .env
   - Make sure the credentials have access to the "basic-kyc-level" level

5.3  Register the webhook
   - Dashboard -> Developer -> Webhooks -> Add webhook
   - URL: https://<your-api-domain>/webhooks/sumsub
   - Events: applicantCreated, applicantReviewed, applicantPending,
             applicantOnHold
   - Set a secret (or use the auto-generated one) -> put it in
     SUMSUB_WEBHOOK_SECRET
   - Save

5.4  Get the level ID
   The level name "basic-kyc-level" must EXACTLY match what you set in
   the dashboard. The code is hard-coded to that name. If you want a
   different name, change it in BOTH the dashboard AND:
     - src/apis/sumsub/createApplicant.sumsub.api.ts
     - src/apis/sumsub/createAccessToken.sumsub.api.ts

5.5  Test mode
   - Sumsub has a sandbox environment at https://api.sumsubstage.com
   - Use the sandbox credentials (different from production) in your
     staging env vars
   - Test applicants in sandbox do NOT count toward production quota


================================================================================
6. END-TO-END USER FLOW
================================================================================

  USER TAPS "VERIFY IDENTITY"
            |
            v
  POST /kyc/applicant  (authenticated)
            |
            v
  +----------------------------------+
  | CreateApplicantService           |
  |   1. Look up user in MongoDB     |
  |   2. If no applicantId:          |
  |        POST to Sumsub to create  |
  |        Save applicantId to user  |
  |   3. POST to Sumsub for SDK token|
  |   4. Return { applicantId, token}|
  +----------------------------------+
            |
            v
  BACKEND RESPONDS:
  { applicantId, token, userId }
            |
            v
  FRONTEND LAUNCHES SUMSUB SDK
  (Web SDK / iOS SDK / Android SDK)
            |
            v
  USER UPLOADS ID + SELFIES
            |
            v
  SDK CLOSES  -----AND-----   SUMSUB REVIEWS DOCUMENTS
            |                              |
            v                              v
  Frontend polls                   Sumsub POSTs to
  GET /kyc/status                 /webhooks/sumsub
  every 3 seconds                          |
            |                              v
            |                    +-------------------------------+
            |                    | HandleSumsubReviewService     |
            |                    |   1. Verify signature         |
            |                    |   2. GET status from Sumsub   |
            |                    |   3. Update user's kycStatus |
            |                    +-------------------------------+
            |                              |
            +--------------+---------------+
                           v
              isKycVerified = true
              kycStatus = "approved"
                           |
                           v
              Frontend shows "Verified"
              and unlocks withdrawals/trading


================================================================================
7. TESTING LOCALLY
================================================================================

7.1  Use Sumsub's sandbox
   Set SUMSUB_BASE_URL to https://api.sumsubstage.com and use sandbox
   credentials. Test applicants you create will not affect production.

7.2  Test the create-applicant endpoint
   # 1. Login to get a JWT
   TOKEN=$(curl -s -X POST http://localhost:3000/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password123","deviceID":"abc"}' \
     | jq -r '.data.token')

   # 2. Create applicant
   curl -X POST http://localhost:3000/kyc/applicant \
     -H "Authorization: Bearer $TOKEN"

7.3  Test the status endpoint
   curl http://localhost:3000/kyc/status \
     -H "Authorization: Bearer $TOKEN"

7.4  Test the webhook locally
   Sumsub cannot reach http://localhost:3000. Use a tunnel:
     - ngrok http 3000         (https://ngrok.com)
     - cloudflared tunnel      (free)
     - localtunnel
   Then set the Sumsub dashboard webhook URL to:
     https://<your-tunnel>.ngrok.io/webhooks/sumsub

7.5  Replay a test webhook with curl
   # Simulate Sumsub calling us (use the real signature):
   BODY='{"applicantId":"...","externalUserId":"...","type":"applicantReviewed"}'
   SIG=$(echo -n "$BODY" | openssl dgst -sha256 -hmac "$SUMSUB_WEBHOOK_SECRET" \
     -hex | awk '{print $2}')

   curl -X POST http://localhost:3000/webhooks/sumsub \
     -H "Content-Type: application/json" \
     -H "X-Payload-Digest-Alg: HMAC_SHA256_HEX" \
     -H "X-Payload-Digest: $SIG" \
     --data "$BODY"


================================================================================
8. COMMON ERRORS & TROUBLESHOOTING
================================================================================

8.1  "Invalid Sumsub webhook signature"
   - Make sure fastify-raw-body is registered BEFORE the webhook route
   - Check SUMSUB_WEBHOOK_SECRET matches the dashboard
   - Body MUST be the raw bytes (no JSON.stringify reformat)

8.2  "Sumsub POST /resources/applicants failed (401)"
   - Wrong SUMSUB_APP_TOKEN or SUMSUB_SECRET_KEY
   - Check you're using the right env (DEV/STAGING/production)

8.3  "Sumsub POST /resources/applicants failed (400)"
   - Check the payload — usually a missing required field
   - Make sure "basic-kyc-level" exists in the Sumsub dashboard
   - Country must be a valid ISO-3166-1 alpha-3 code (e.g. "NGA", "USA")

8.4  Frontend: SDK closes immediately
   - Token may be expired. Re-call POST /kyc/applicant to get a fresh one
   - The token is bound to (applicantId, levelName) — both must match
     what you sent when creating the applicant

8.5  "User is not verified" but Sumsub says GREEN
   - Check the webhook was actually received:
       server logs -> "POST /webhooks/sumsub"
   - Check the user record in MongoDB:
       db.users.findOne({ email: "..." }, { kycStatus: 1, isKycVerified: 1 })
   - If kycStatus is still "in_progress", the webhook was lost.
     Re-fire it from the Sumsub dashboard (Applicant -> "Resend webhook")

8.6  Rate-limit error on /kyc/applicant
   - Your ansofraRateLimit(5, "1 minute") allows 5 calls per minute.
     If the SDK re-initializes many times, you can hit this.
   - Either raise the limit, or cache the token in the frontend until
     it expires (1 hour).


================================================================================
9. SECURITY NOTES
================================================================================

  - Never expose SUMSUB_SECRET_KEY to the frontend.
  - The /kyc/applicant endpoint MUST be authenticated — anyone with a
    valid JWT can mint a Sumsub SDK token. If you skip auth, attackers
    can spam Sumsub and rack up your bill.
  - The /webhooks/sumsub endpoint MUST verify the signature — without
    it, anyone can POST a fake "approved" payload and bypass KYC.
  - The access token returned by /kyc/applicant is bound to a single
    applicantId. Do not log it.
  - HTTPS is required in production. Sumsub will reject webhook URLs
    that are not HTTPS.


================================================================================
10. QUICK REFERENCE
================================================================================

  Backend routes:
    POST /kyc/applicant       - mint SDK token (auth required)
    GET  /kyc/status          - read KYC status (auth required)
    POST /webhooks/sumsub     - Sumsub callback (signature required)

  Sumsub API endpoints we call:
    POST /resources/applicants?levelName=basic-kyc-level
    POST /resources/accessTokens/sdk
    GET  /resources/applicants/:id/status

  Env vars:
    SUMSUB_APP_TOKEN
    SUMSUB_SECRET_KEY
    SUMSUB_BASE_URL
    SUMSUB_WEBHOOK_SECRET

  User model fields (Prisma / MongoDB):
    sumsubApplicantId         String?   @unique
    kycStatus                 String?   @default("pending")
    kycReviewAnswer           String?
    kycRejectedReason         String?
    kycCompletedAt            DateTime?
    isKycVerified             Boolean   @default(false)
