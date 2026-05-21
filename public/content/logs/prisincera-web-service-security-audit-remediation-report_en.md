# Threats Backend Faces as Service Scales: PriSincera Web Service Security Precision Diagnosis and 5 Vulnerability Defeats

PriSincera has evolved beyond its former static SPA and simple GCS (Google Cloud Storage) JSON read-only structure, fully upgrading to an **Express backend multi-router architecture and Firestore-based stateful system** in May 2026.

The process of enriching service features and expanding business models is an exhilarating experience for a builder. However, as the architecture becomes more sophisticated and the number of integrated API endpoints increases, the **Attack Surface** expands proportionally.

We recently conducted a precise security audit across PriSincera's entire codebase. This article vividly shares the **engineering journey of defeating a total of 5 key security risks, ranging from critical vulnerabilities to minor but fatal runtime flaws** discovered during this process.

---

## 🏗️ Architectural Evolution and New Security Responsibilities

Before delving into the details of the security vulnerability measures, it's necessary to understand PriSincera's current multi-routing data architecture.

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

Subscription data, user-specific study progress (implicitly understood as 'streak' or 'progress visualization'), and Pace Note action plans are centrally stored in the Firestore database. The backend's responsibilities are physically isolated into `/admin/api`, `/api/study`, and `/api/pacenote` routers.

As each API route required different authentication levels and rate limits, we faced a new technical challenge: upgrading the existing flat security structure to a multidimensional, layered defense system.

---

## 🛠️ 5 Key Vulnerabilities We Defeated and Engineering Patches

Here are the details of the 5 defects discovered through static analysis and penetration simulation, along with specific troubleshooting steps to perfectly resolve them without service interruption.

### 1. Traces of Temporary Debugging APIs: Blocking PII Exposure (🔴 Critical)
*   **Problem Discovered**: Temporary debug APIs (`/api/env-check`, `/api/temp-check-subs`, `/api/temp-logs`), which were created in the past for convenient checking of email sending status or subscriber status in a local development environment, were exposed in the production environment.
*   **Security Threat**: Anyone could call these APIs to scrape the email address list (PII, personal identifiable information) of all subscribers, or steal sensitive infrastructure configuration values such as SMTP server account information for mail delivery. This constituted a very dangerous state under GDPR and personal information protection laws.
*   **Engineering Measures**:
    *   These debug endpoints were **permanently and completely deleted from the production code (`server.mjs`)**.
    *   Formal administrative functions requiring subscriber information lookup and log checking were **completely migrated to an admin-only secure router (`/admin/api/subscribers`)**, accessible only after full Firebase JWT Admin ID token verification and `super_admin` role comparison middleware.

### 2. Blog Slug Parameter Validation and NoSQL Injection Prevention (🟡 Medium)
*   **Problem Discovered**: In the `/api/builderslog/:slug/view` API, which increments the view count for each article in the technical blog Builder's Log, there were no format restrictions whatsoever on the `:slug` parameter.
*   **Security Threat**: An attacker could arbitrarily inject special characters or parent directory traversal characters (`../`) into the Slug value, potentially corrupting documents in other areas of the database or causing unexpected system malfunctions, posing a latent Injection risk.
*   **Engineering Measures**:
    *   A powerful **regex validation middleware** was placed at the entry point of the slug parameter, allowing only English letters (uppercase/lowercase), numbers, hyphens (`-`), and underscores (`_`).
    *   This established a defense mechanism where the API immediately rejects requests if even a single abnormal character is included.

```javascript
// Applied regex-based Slug sanitization
const slug = req.params.slug;
if (!/^[a-zA-Z0-9-_]+$/.test(slug)) {
  return res.status(400).json({ error: "Invalid slug format" });
}
```

### 3. Database Overload Defense via User Input Payload Length Limit (🟡 Medium)
*   **Problem Discovered**: In the `POST /api/pacenote/add` endpoint of the Pace Note feature, where users add their custom tasks, there was no character limit for the input `title` value.
*   **Security Threat**: If a malicious user were to send requests with megabytes of huge text or abnormal dummy payloads, Firestore's storage capacity could rapidly deplete, or server memory usage could skyrocket, leading to a complete service outage (DoS).
*   **Engineering Measures**:
    *   A defense logic was added at the custom task addition API level to **enforce a maximum character limit of 100 characters**.
    *   This established a boundary that fully satisfies business requirements (setting a to-do title) while intrinsically filtering out abnormal payload injection attacks.

### 4. Normalizing Firestore Security Rules Matching Errors (🟡 Medium)
*   **Problem Discovered**: Among the `firestore.rules` settings that securely control real-time data queries in Firestore, the permission matching path for the study progress collection (`study_progress`) was incorrectly designed.
    *   *Existing Rule*: `match /study_progress/{userId}/{document=**}`
*   **Security Threat**: The existing rule only protected the sub-collection tree under `{userId}`, but failed to properly protect direct client read/write access to the root document itself (`/study_progress/{userId}`) containing the user's progress information, potentially leading to integration errors or rule circumvention.
*   **Engineering Measures**:
    *   The security rules were meticulously rewritten as follows to ensure a one-to-one match between the user's progress information document itself and the entire sub-tree, thereby simultaneously securing integrity and client API call stability.

```javascript
// Revised and secure Firestore Rules
match /study_progress/{userId} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
  match /{document=**} {
    allow read, write: if request.auth != null && request.auth.uid == userId;
  }
}
```

### 5. Tracking 500 Internal Errors in PriStudy Progress API: Resolving Runtime ReferenceError (🟡 Medium)
*   **Problem Discovered**: A hidden bug was found within the `GET /api/study/progress` API that fetches study progress. When an exception handling logic, designed to automatically correct the email field for older subscribers with missing email data, was triggered, it referenced an undeclared variable `docRef`, causing a server crash and emitting a 500 error.
*   **Engineering Measures**:
    *   The variable `const docRef = db.collection(COLLECTIONS.STUDY_PROGRESS).doc(uid);` was clearly declared and instantiated within the function scope, completing the binding.
    *   The defect was completely removed to ensure asynchronous modification transactions operate smoothly without any exceptions under all circumstances.

---

## 🛡️ Fortifying the Entire Backend: Rate Limiting & CSP & CORS

Beyond resolving specific bugs, we have further solidified the defense system at the backend Express web server infrastructure level.

### 1. Granular API Request Throttling (Rate Limiting)
To protect the API server from brute-force and distributed denial-of-service (DDoS) attacks, we introduced the `express-rate-limit` module and meticulously deployed rate limiting layouts tailored to the nature of each router.
*   **Global Public API (`/api/`)**: Maximum 60 requests per minute (`apiLimiter`)
*   **Subscribe and Unsubscribe APIs (`/api/subscribe`, `/api/unsubscribe`)**: Maximum 5 requests per 15 minutes (`subscribeLimiter` - abuse prevention)
*   **Admin API (`/admin/api/`)**: Maximum 100 requests per 15 minutes (`adminLimiter` - unnecessary scan prevention)

### 2. Elimination of CORS Wildcard Policy
The existing loose CORS wildcard (`*`) setting, which was enabled for development convenience, was completely abolished. We now strictly restrict backend responses to only trusted HTTP requests originating from our designated official production domain (`https://www.prisincera.com`).

### 3. Implementation of Strict CSP (Content Security Policy) Based on Helmet
The `helmet` middleware, which controls security headers, was precisely tuned to establish strict modern CSP rules that intrinsically block Cross-Site Scripting (XSS) and clickjacking.

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

We also ensured **operational-level security enhancement** to prevent the entire host server from being compromised even if a container is hacked.

### 1. Transition to Docker Non-Root Account Execution Structure
Previously, lightweight Node containers ran processes with default root privileges. This posed a risk where, in the event of a container escape vulnerability, the entire host Linux server could be taken over.
To prevent this, we created a dedicated `prisincera` system account (UID 1001) and group inside the `Dockerfile` and modified the build pipeline settings to ensure that server startup processes are executed restrictively only under these non-root privileges.

### 2. Fully Non-Physical Credential Management via GCP Secret Manager
It is fundamental to ensure that API keys are never hardcoded in source code. Beyond this, we designed our deployment pipeline to dynamically inject sensitive external API credential tokens (`GEMINI_API_KEY`, `GITHUB_TOKEN`) at runtime via **Google Cloud Secret Manager**, rather than directly listing them in server startup environment variable text files. This completely blocked credential leakage paths.

---

## 📈 Final Comparison of Security Improvement Results

Here is an objective table comparing the major headers applied and the results of our intensive security improvement week.

| Security Item / Header | Before Measures (04-23) | After Measures & Current (05-21) | Security Assessment |
| :--- | :---: | :---: | :---: |
| **X-Content-Type-Options** | `nosniff` | `nosniff` | ✅ Secure (Prevents MIME sniffing) |
| **X-Frame-Options** | `DENY` | `DENY` | ✅ Secure (Prevents clickjacking) |
| **Content-Security-Policy** | ❌ Not set | 🌟 Strict CSP defined | ✅ Secure (External malicious scripts cannot execute) |
| **Strict-Transport-Security** | ❌ Not set | 🌟 `max-age=31536000; ...` | ✅ Secure (Enforced HTTPS encrypted connection) |
| **Referrer-Policy** | ❌ Not set | `strict-origin-when-cross-origin` | ✅ Secure (Prevents referrer header information leakage) |
| **PII Exposure Vulnerability** | 🔴 3 debug APIs exposed | 🌟 **Completely removed & Admin controlled** | ✅ Secure (Full protection of subscriber PII) |
| **API Runtime Reliability** | 🟡 500 ReferenceError present | 🌟 **Exception logic normalized** | ✅ Secure (Ensured API response reliability) |

---

## 💡 Concluding Thoughts: "Defending is as much engineering as building"

Transitioning a service from a static page-centric site to a large-scale learning management and action plan platform is an incredibly exhilarating joy as an engineer. However, through this precise security diagnosis and vulnerability patching work, I was once again acutely reminded that building a secure fence that users can trust and use is also entirely the responsibility of a builder.

Based on successful builds (Vite SPA compilation completed) and fully armed backend modifications, PriSincera is now more robust and secure than ever, ready to support your growth journey.

We will continue to build more safely and more wonderfully.

Keep Building! 🚀
