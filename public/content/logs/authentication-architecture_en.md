# The Hidden Pitfall of Google One-Click Login: Perfectly Isolating User and Admin Sessions

One of the most powerful cards for dramatically boosting signup conversion rates (Conversion Rate) when operating a service is undeniably **"Google One-Click Login (Google OAuth)"**.

To eliminate all troublesome barriers (Friction) preventing users from setting and achieving their goals, PriSincera boldly abolished the previous email/password-based signup system from its PriStudy era and underwent a complete generational shift to single Google authentication.

Users seamlessly onboarded with a single click, and our growth flywheel seemed to be operating perfectly. However, right behind this elegant entrance lurked a fatal pitfall that threatened service growth: **"security session conflicts"**.

---

## 🚨 The Problem Encountered: A Power Struggle in LocalStorage

During the process of unifying our authentication system, our architectural Achilles' heel emerged as the **Admin Backend (`AdminDashboard`)**.

For security reasons, this backend possesses powerful privileges to view and manage all user data. Therefore, it required login only through a **pre-approved secure administrator account (email/password)**, rather than a general Google login.

However, the Firebase Auth module, operating in a browser environment, inherently maintains sessions as a **single instance**. This means there was a physical limitation: only one session information could be stored in the browser's local storage.

This led to a peculiar bug:
1. A regular user completes Google login with their own account.
2. While in this state, they attempt to access the administrator (admin) dashboard and log in with an admin account via email.
3. The Google session token in local storage is forcibly overwritten by the admin session token.
4. Upon returning to the user's browser tab, sessions became corrupted, leading to the account being mistakenly recognized with admin privileges, or frequent forced logouts (kicks) due to lack of authorization.

This was a severe session entanglement where two completely distinct roles, 'regular user' and 'secure administrator,' could not coexist in isolation within a single browser.

---

## 🏗️ Session Isolation Architecture

To perfectly isolate session tokens at the browser level, we adopted Firebase's multi-application initialization technique and designed a **dual-security track that physically separates sessions**.

```text
  +-------------------------------------------------------------------------+
  |                      [ Client Browser LocalStorage ]                    |
  |                                                                         |
  |  Default App Session (Google Login) ----> ID Token ----> User API       |
  |  Admin App Session (Email / PW) --------> Admin Token -> Admin API      |
  +-------------------------------------------------------------------------+
                                       |
                                       v
  +-------------------------------------------------------------------------+
  |                      [ Backend Security Gateway ]                       |
  |                                                                         |
  |  User API (/api/study) ---------> firebase-admin.verifyIdToken()        |
  |  Admin API (/admin/api) --------> Super Admin Role Verification         |
  +-------------------------------------------------------------------------+
```

### 1. Multi-Firebase App Initialization (Separating `ADMIN_APP`)
On all screens accessed by regular users, we confined the Google social authentication session to be maintained through the existing `[DEFAULT]` Firebase instance.
When entering the secure area, `AdminDashboard.jsx`, we instantly launched multiple independent instances specifically for administrators, each with a distinct label.

```javascript
// Session isolation initialization inside AdminDashboard.jsx
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = { /* ... */ };

// Explicitly secure the isolated ADMIN_APP namespace to avoid conflicts with the DEFAULT instance
const adminApp = getApps().find(app => app.name === 'ADMIN_APP') 
  || initializeApp(firebaseConfig, 'ADMIN_APP');

const adminAuth = getAuth(adminApp);
```

Through this advanced isolation technique, Firebase **physically separates and preserves** the `firebase:authUser:...:[DEFAULT]` key and the `firebase:authUser:...:ADMIN_APP` key as **completely independent, unique records** in the browser's local storage. This was the moment when the back-office administrator session could peacefully and robustly coexist without being overwritten, even while a regular user maintained their Google login.

### 2. Fortifying Backend Security Middleware
With authentication sessions intricately isolated on the client side, the backend API gateway also activated a corresponding multi-layered defense system.

*   **User-Specific Routers (`pacenote-api.mjs`, `study-api.mjs`):**
    When frontend API calls are made, the integrity of the Google authentication-based Firebase ID Token received in the header is verified in real-time using `verifyIdToken()`.
    ```javascript
const decodedToken = await admin.auth().verifyIdToken(idToken);
req.user = { uid: decodedToken.uid };
    ```
    This verification ensures data isolation, preventing queries from accessing user data other than the unique `uid` obtained.

*   **Admin-Specific Router (`admin-api.mjs`):**
    Only special administrator tokens verified by the `ADMIN_APP` instance are allowed. Furthermore, the incoming session must successfully pass through a database `super_admin` role-matching filtering middleware to be granted sensitive write permissions within the dashboard.

---

## 💡 Lesson Learned: Session Design from a Builder's Perspective

Simply "using the default login functions supported by a library" is very easy. However, as service architectures gradually evolve and various permission levels become intertwined – such as **back-office, cron pipelines, and third-party integrations** – the security responsibility to deeply control even a single local session storage follows.

This design pattern, which seamlessly controls Google logins across the entire domain through AuthContext centralization and successfully physically isolates admin sessions via multiple instances, provides a **flexible, non-disruptive, and highly-isolated security foundation** that can be extended without code changes when adding future Apple logins or new B2B collaboration sessions.