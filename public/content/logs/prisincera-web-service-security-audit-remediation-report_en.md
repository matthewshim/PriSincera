# Threats Backend Faces as Service Scales: PriSincera Web Service Security Deep Dive and 5 Vulnerability Countermeasures

PriSincera has evolved from its former static SPA and simple GCS (Google Cloud Storage) JSON read-only structure, and in May 2026, it was fully advanced into an **Express backend multi-router architecture and Firestore-based stateful system**.

The process of enriching service features and expanding business models is an exhilarating experience for a builder. However, as the architecture becomes more sophisticated and the number of integrated API endpoints increases, the **attack surface** expands proportionally.

Recently, a meticulous security audit was conducted across PriSincera's entire codebase. This article vividly shares the **engineering journey of combating a total of five critical security risks, ranging from critical vulnerabilities to minor but fatal runtime defects** discovered during this process.

---

## 🏗️ Architectural Evolution and New Security Responsibilities

Before diving into the details of the security vulnerability countermeasures, it's essential to understand PriSincera's current multi-routing data architecture.

```text
                        [ React SPA Frontend ]
                                   |
                                   | (Firebase ID Token)
                                   v
                          [ Express Server ]
           +-----------------------v-----------------------+
           |                       |                       |
           v                       v                       v
     [ Admin API Router ]    [ Study API Router ]    [ PaceNote  Router ]
     (Firebase Admin Auth)   (Authentication)        (Authentication)
           |                       |                       |
           +-----------------------v-----------------------+
           |                                               |
           v                                               v
     [ Firestore Database ] <--------------------- [ GCS Storage Fallback ]
     (subscribers, pacenotes,                      (daily_signals, index.json)
     study_progress, email_logs)
```

Subscription data, user-specific study progress ("grass"), and Pace Note action plans are integrated and stored in the Firestore database. The backend has physically isolated responsibilities into `/admin/api`, `/api/study`, and `/api/pacenote` routers.

As each API route required different authentication levels and rate limits, we faced the new technical challenge of upgrading the existing flat security structure to a multidimensional, multi-layered defense system.

---

## 🛠️ 5 Core Vulnerabilities We Defeated and Engineering Patches

Here are the five defects discovered through static analysis and penetration simulations, along with the detailed troubleshooting history of how they were perfectly remedied without service interruption.

### 1. Traces Left by Temporary Debugging APIs: Blocking Personal Identifiable Information (PII) Exposure (🔴 Critical)
*   **Problem Discovered**: Temporary debug APIs (`/api/env-check`, `/api/temp-check-subs`, `/api/temp-logs`), which were created in a local development environment for convenient checking of email sending status or subscriber status, were exposed in the production environment.
*   **Security Threat**: Anyone could call these APIs to scrape the email address list (PII, personal information) of all subscribers, or hijack sensitive infrastructure configuration values such as SMTP server account information for mail delivery. This posed an extremely dangerous situation under GDPR and personal information protection laws.
*   **Engineering Action**:
  - These debug endpoints were **permanently and completely deleted from the production code (`server.mjs`)**.
  - Formal administration functions requiring subscriber information lookup and log verification were **fully migrated to a dedicated admin-only secure router (`/admin/api/subscribers`)**, accessible only after passing Firebase JWT Admin ID token verification and `super_admin` role comparison middleware.

### 2. Blog Slug Parameter Validation and NoSQL Injection Prevention (🟡 Medium)
*   **Problem Discovered**: In the `/api/builderslog/:slug/view` API, which increments the view count for articles in the Builder's Log tech blog, no format restrictions were placed on the `:slug` parameter.
*   **Security Threat**: There was a potential injection risk where an attacker could arbitrarily inject special characters or path traversal characters (`../`) into the Slug value, potentially corrupting documents in other areas of the database or causing unexpected system malfunctions.
*   **Engineering Action**:
  - A robust **regular expression validation middleware** was placed at the entry point where the slug parameter is received, allowing only English uppercase and lowercase letters, numbers, hyphens (`-`), and underscores (`_`).
  - This established a defense mechanism where the API immediately rejects requests if even a single abnormal character is included.

```javascript
// Actual regular expression-based Slug safe filtering applied
const slug = req.params.slug;
if (!/^[a-zA-Z0-9-_]+$/.test(slug)) {
  return res.status(400).json({ error: "Invalid slug format" });
}
```

### 3. Defending Against Database Overload with User Input Payload Length Limit (🟡 Medium)
*   **Problem Discovered**: In the `POST /api/pacenote/add` endpoint, where users add their custom tasks within the Pace Note feature, there was no character limit for the incoming `title` value.
*   **Security Threat**: If a malicious user were to send a flood of requests with enormous texts in megabytes or abnormal dummy payloads, there was a risk that Firestore's storage capacity would rapidly deplete, or server memory usage would spike, potentially causing the entire service to crash (DoS).
*   **Engineering Action**:
  - A defense logic was added at the custom task addition API to **enforce a maximum character limit of 100 for the title**.
  - This established a boundary that fully satisfied business requirements (setting task titles) while fundamentally filtering out abnormal payload injection attacks.

### 4. Normalizing Matching Errors in Firestore Security Rules (🟡 Medium)
*   **Problem Discovered**: Within the `firestore.rules` configuration, which securely controls real-time data queries for Firestore, the permission matching path for the study progress collection (`study_progress`) was incorrectly designed.
  - *Existing Rule*: `match /study_progress/{userId}/{document=**}`
*   **Security Threat**: The existing rule only protected the sub-collection tree under `{userId}` and failed to adequately protect the client's direct read/write permissions for the root document itself (`/study_progress/{userId}`) containing the user's progress information, potentially leading to integration errors or rule circumvention.
*   **Engineering Action**:
  - The security rules were meticulously rewritten as follows to achieve a one-to-one match between the user's own progress information document and its entire sub-tree, thereby ensuring both security integrity and client API call stability.

```javascript
// Safely modified Firestore rules
match /study_progress/{userId} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
  match /{document=**} {
    allow read, write: if request.auth != null && request.auth.uid == userId;
  }
}
```

### 5. Tracing 500 Internal Errors in PriStudy Progress API: Resolving Runtime ReferenceError (🟡 Medium)
*   **Problem Discovered**: An hidden bug was found within the `GET /api/study/progress` API that fetches study progress. When an exception handling logic, designed to automatically correct the email field for older subscribers with missing email data, was triggered, it referenced an undeclared variable `docRef`, causing a server crash and emitting a 500 error.
*   **Engineering Action**:
  - The `const docRef = db.collection(COLLECTIONS.STUDY_PROGRESS).doc(uid);` variable was explicitly declared and instantiated within the function scope to complete the binding.
  - The defect was completely removed, ensuring that asynchronous modification transactions operate smoothly without exception handling in any situation.

---

## 🛡️ Fortifying the Entire Backend Security: Rate Limiting & CSP & CORS

Beyond resolving specific bugs, we have further fortified the defense system at the backend Express web server infrastructure level.

### 1. Granular API Request Throttling (Rate Limiting)
To protect the API server from brute-force and distributed denial-of-service (DDoS) attacks, we introduced the `express-rate-limit` module and precisely configured rate limit layouts according to the nature of each router.
*   **Global Public API (`/api/`)**: Max 60 requests per minute (`apiLimiter`)
*   **Subscribe and Unsubscribe APIs (`/api/subscribe`, `/api/unsubscribe`)**: Max 5 requests per 15 minutes (`subscribeLimiter` - to prevent abuse)
*   **Admin API (`/admin/api/`)**: Max 100 requests per 15 minutes (`adminLimiter` - to prevent unnecessary scanning)

### 2. Abolition of CORS Wildcard Policy
We completely abolished the loosely configured CORS wildcard (`*`) setting, which was previously enabled for development convenience. Instead, we securely restricted the backend to accept responses only from trusted HTTP requests originating from our specified official production domain (`https://www.prisincera.com`).

### 3. Implementation of Strict CSP (Content Security Policy) Based on Helmet
We meticulously tuned the `helmet` middleware, which controls security headers, to establish strict modern CSP rules that fundamentally block cross-site scripting (XSS) and clickjacking.

```javascript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://apis.google.com", "https://www.gstatic.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://identitytoolkit.googleapis.com", "https://securetoken.googleapis.com"],
      frameSrc: ["'self'", "https://*.firebaseapp.com", "https://prisincera.firebaseapp.com"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"]
    }
  },
  strictTransportSecurity: { maxAge: 31536000, includeSubDomains: true, preload: true }
}));
```

---

## 🐳 Infrastructure and Container Deployment Level Security

We also ensured **operational security enhancement** to prevent the entire host server's privileges from being compromised even if a container is hacked.

### 1. Transition to Docker Non-Root Account Execution Structure
Previously, lightweight Node containers ran processes with default root privileges, posing a risk that the entire host Linux server could be compromised in the event of a container escape vulnerability.
To prevent this, we created a dedicated `prisincera` system account (UID 1001) and group within the `Dockerfile`, and modified the build pipeline settings to ensure that server startup processes are executed restrictively under these non-root privileges.

### 2. Fully Non-Physical Credential Management via GCP Secret Manager
Ensuring API keys are never hardcoded into the source code is fundamental. In addition, we designed sensitive external API credentials (`GEMINI_API_KEY`, `GITHUB_TOKEN`) to not be directly written into server environment variable text files. Instead, they are dynamically injected at runtime via **Google Cloud Secret Manager** in the deployment pipeline, thereby completely blocking credential leakage paths.

---

## 📈 Final Comparison of Security Improvement Achievements

Here are the results of an objective table comparing the main headers and response achievements applied during this intensive security improvement week.

| Security Item / Header | Before Measures (04-23) | After Measures & Current (05-21) | Security Assessment |
| :--- | :---: | :---: | :---: |
| **X-Content-Type-Options** | `nosniff` | `nosniff` | ✅ Safe (Prevents MIME sniffing) |
| **X-Frame-Options** | `DENY` | `DENY` | ✅ Safe (Prevents clickjacking) |
| **Content-Security-Policy** | ❌ Not set | 🌟 Strict CSP defined | ✅ Safe (External malicious scripts cannot run) |
| **Strict-Transport-Security** | ❌ Not set | 🌟 `max-age=31536000; ...` | ✅ Safe (Enforced HTTPS encrypted connection) |
| **Referrer-Policy** | ❌ Not set | `strict-origin-when-cross-origin` | ✅ Safe (Prevents referrer header information leakage) |
| **PII Exposure Vulnerability** | 🔴 3 Debug APIs exposed | 🌟 **Completely removed & Admin controlled** | ✅ Safe (Full PII protection for subscribers) |
| **API Runtime Reliability** | 🟡 500 ReferenceError present | 🌟 **Exception logic normalized** | ✅ Safe (Ensured API response reliability) |

---

## 💡 Concluding Thoughts: "Protecting is as much engineering as building"

Transitioning a service from a static page-centric site to a large-scale learning management and action plan platform is an incredibly exhilarating joy for an engineer. However, through this meticulous security diagnostic and vulnerability patching work, I profoundly realized once again that building a safe enclosure that users can trust and use is also entirely the builder's responsibility.

Based on successful builds (Vite SPA compilation completed) and fully armed backend modifications, PriSincera is now more robust and secure than ever, ready to support your growth journey.

We will continue to build even more securely and splendidly in the future.

Keep Building! 🚀