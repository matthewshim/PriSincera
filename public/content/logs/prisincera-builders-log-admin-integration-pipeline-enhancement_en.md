# Achieving Perfect Control over Static Blogs (Static CMS) in Serverless Environments: Where GitHub API Meets AI

The **'Builder's Log'** of the personal branding site I currently operate adopts a **static rendering (Static Asset) structure** that is deployed via local file systems (`.md`, `.json`) and Git commits, without going through databases (e.g., Firestore).

While static sites boast excellent speed and optimal SEO performance, content updates require the cumbersome process of launching a local development environment and directly committing/pushing. This article details the architecture and troubleshooting methods implemented to **safely and automatically control** this unique static content publishing model from the existing administrator dashboard web interface, **overcoming the limitations of serverless environments**.

---

## 🏗️ Architecture Design: Overcoming Serverless Limitations

Admin backends deployed in **serverless container environments** such as Vercel or Google Cloud Run typically have **read-only** disks. Even if writing is possible, modified local files are immediately lost when the temporary container session ends. This means that permanently creating `.md` files directly on the local disk within the server, like a traditional CMS, is not possible.

To solve this problem, instead of introducing a database to the backend, we utilized **GitHub REST API (Octokit)** to build a **remote automation pipeline** that allows the Admin backend to remotely push commits directly to the `main` branch (Git-less Commit).

### 🔄 Full Operation Pipeline (Data Flow)

```text
+------------------------+
|    Admin Dashboard     |  --> (Publish Article Request)
+-----------+------------+
            |
            v
+------------------------+
|    Express Backend     |  --> (Secret Masking & AI Core Polish)
+-----------+------------+
            |
            +----------------> +---------------------+
            |                  |  GitHub REST API    |  --> (In-Memory Tree/Blob)
            |                  +----------+----------+
            |                             |
            |                             v
            |                  +---------------------+
            |                  |  Git Commit & Push  |  --> (Git-less Remote Push)
            |                  +---------------------+
            v
+------------------------+
|     GitHub Webhook     |  --> (Instant Trigger Payload)
+-----------+------------+
            |
            v
+------------------------+
|      CI/CD Build       |  --> (Google Cloud Build System)
+-----------+------------+
            |
            v
+------------------------+
|    Live Deployment     |  --> (Google Cloud Run Live Container)
+------------------------+
```

> 💡 **Step-by-Step Data Flow Summary (Data Flow Steps)**
> *   **Admin Dashboard:** The administrator initiates the pipeline by clicking the `Publish` button for a post in the web browser.
> *   **Express Backend:** Performs secret information masking and AI engine-based automatic contextual correction for the incoming article.
> *   **GitHub REST API & Commit/Push:** Directly integrates the GitHub API in-memory to push Git-less remote commits, bypassing local disk file writing.
> *   **GitHub Webhook & CI/CD Build:** As soon as the commit is reflected in the repository, a webhook triggers Google Cloud Build to compile the source code and create the latest Docker image.
> *   **Live Deployment:** The final lightweight container is quickly and seamlessly deployed via Google Cloud Run, serving the latest content to users.

---

## 💻 Frontend: Intuitive Integrated Editor UI/UX in the Browser

To enable control of all static articles directly from the browser without needing to open a development environment (IDE), we significantly expanded the existing Admin Panel to implement an **integrated editor modal**.

### 🌟 Key Component Features

*   **Metadata Integrated Viewer:** Manages Chapter numbers, Title, Slug, and Date information of currently published articles at a glance, allowing for intuitive addition and modification.
*   **Markdown Draft Auto-Analyzer (AI Metadata Extractor):** Simply drag and drop an `.md` markdown draft file created locally, and AI (Gemini) automatically comprehends the entire context to **extract and fill metadata forms** such as `Title`, `Subtitle`, `Slug`, and `Tags`.
*   **WYSIWYG Markdown Editor:** Provides a flexible editing space where the results meticulously polished by AI to the optimal tone and manner can be viewed in real-time in the browser and fine-tuned manually as needed.
*   **Real-time Status Interaction Feedback:** Presents high-quality UX by rendering **real-time status gauges and toast pop-ups** like `"AI Analyzing..."` ──► `"Committing to GitHub..."` to ensure users clearly understand the background integration steps during a publishing request.

---

## ⚙️ Backend: Secure Remote Git-less Commit API Specification

A backend-specific API endpoint, strongly protected by administrator authentication middleware (`requireAdmin`), is designed to handle actual data manipulation.

### 📌 API Endpoint Specification

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/builderslog/meta` | `GET` | Safely parses and returns the latest metadata JSON (`buildersLogMeta.json`) |
| `/api/builderslog/content/:slug` | `GET` | Reads a specific markdown source file (`.md`) and injects it into the editor |
| `/api/builderslog/analyze` | `POST` | Draft correction based on Gemini API, secret masking, and automatic metadata extraction |
| `/api/builderslog/publish` | `POST` | Remote Git-less Commit and final deployment push, linked with GitHub API Git Data service |

---

## 🔒 Security and Quality Management (AI & Security Workflow)

To ensure the stability of the static CMS and prevent source code leakage, a **Human-in-the-Loop (HITL) automated verification system** combining automated scanners with human intuition was designed.

```text
[Draft Upload] --> [AI Scan & Redaction] --> [Human Review (HITL)] --> [Regex Secret Scan] --> [GitHub Security Scanning]
```

1.  **Phase 1 (AI Tone & Manner Correction & Context Curation):** When a draft is uploaded, AI refines the body content to PriSincera's unique premium tech tone. At this stage, security-sensitive items such as internal IP addresses or actual user personal information hidden within the body are contextually identified and immediately `[REDACTED]`.
2.  **Phase 2 (Human Review):** The administrator meticulously reviews the markdown output and JSON metadata information extracted by the AI visually through the browser UI.
3.  **Phase 3 (Regex-based Local Secret Scanner):** Just before publishing, a powerful regular expression engine is activated on the backend server to conduct a **secondary inspection for critical hardcoded sensitive information patterns** such as API Key, AWS Secret, and GitHub Access Token within the body. If detected, the publishing process is immediately `Abort`ed.
4.  **Phase 4 (GitHub Advanced Security):** Immediately after the final push, GitHub's own Secret Scanning feature operates threefold, establishing complete security trustworthiness.

> 🛡️ **Security Guide: Examples of Key Defense Filter Patterns for Regex Secret Scanner**

```javascript
const secretPatterns = [
  /AIza[0-9A-Za-z-_]{35}/,        // GCP/Firebase API Key
  /ghp_[a-zA-Z0-9]{36}/,          // GitHub Personal Access Token
  /xox[baprs]-[a-zA-Z0-9]{10,48}/ // Slack OAuth Token
];
```

---

## 🚀 Further Enhancement and Troubleshooting Resolution Process

We didn't just stop at completing the basic publishing pipeline but diligently resolved the limitations and bottlenecks encountered in a production traffic environment.

### 1. Multi-Fallback Design to Prevent AI API Quota Exceedance

We fundamentally resolved the phenomenon where article publishing was blocked due to API traffic limits (Quota Limits) or temporary failures of specific high-performance AI models. A **graceful degradation fallback model** was implemented in the AI core analysis loop.

> 💡 **AI Fallback Workflow Architecture**
> 
> `[gemini-2.5-flash]` ──(On Failure)──► `[gemini-2.0-flash]` ──(On Failure)──► `[gemini-1.5-flash-latest]` ──(On Complete Failure)──► `[Manual Recovery Mode]`

Even if all latest models exceed their limits and become completely unresponsive, the system is designed to safely bypass this by preserving the original draft content in a **manual publishing mode** instead of a complete system crash, thereby saving the deployment step.

### 2. Physical Isolation of API Quotas (200% Quota Secured)

When background automated collection/Composer pipelines, which handle large-scale web traffic daily, shared a single API Key with the article publishing function of the administrator dashboard, API quotas would be exhausted during the data collection phase around midnight, paralyzing article uploads.

To resolve this, we **physically separated the Google Cloud Platform (GCP) projects** of these two core services and assigned each independent API quotas, thereby doubling the overall AI computation capacity of the system and completely eliminating interference.

### 3. Overcoming Read-Only File System Limitations in Cloud Environments (`EACCES` Error Resolution)

Serverless Docker environments like Cloud Run typically have a **Read-Only file system** as their default setting, where file writing is blocked. This caused `EACCES: permission denied` system errors when attempts were made to temporarily save files physically on the backend file server before committing.

This was permanently resolved by completely switching to a **low-level Git data workflow of the GitHub REST API that operates 100% in memory**, without using any physical disk.

> 🛠️ **Engineering Tip: Core 100% Remote Git-less Implementation Code Actually Applied**

```javascript
// 1. Remotely retrieve the latest Commit SHA and Base Tree SHA of the current branch (main)
const ref = await octokit.rest.git.getRef({ owner, repo, ref: `heads/${branch}` });
const commitSha = ref.data.object.sha;
const commit = await octokit.rest.git.getCommit({ owner, repo, commit_sha: commitSha });
const treeSha = commit.data.tree.sha;

// 2. Create Git Blob data for the two files to be saved in memory (bypassing file system writes)
const metaBlob = await octokit.rest.git.createBlob({
  owner, repo, content: JSON.stringify(metaArray, null, 2), encoding: 'utf-8'
});
const markdownBlob = await octokit.rest.git.createBlob({
  owner, repo, content: finalMarkdown, encoding: 'utf-8'
});

// 3. Create a new Tree object mapped to file paths in the remote repository based on the Base Tree
const newTree = await octokit.rest.git.createTree({
  owner, repo, base_tree: treeSha,
  tree: [
    { path: 'src/data/buildersLogMeta.json', mode: '100644', type: 'blob', sha: metaBlob.data.sha },
    { path: `public/content/logs/${currentSlug}.md`, mode: '100644', type: 'blob', sha: markdownBlob.data.sha }
  ]
});

// 4. Create a Git Commit with the generated Tree and update the Branch Reference
const newCommit = await octokit.rest.git.createCommit({
  owner, repo, message: `feat(builders-log): publish ${currentSlug} via Admin`,
  tree: newTree.data.sha, parents: [commitSha]
});
await octokit.rest.git.updateRef({
  owner, repo, ref: `heads/${branch}`, sha: newCommit.data.sha
});
```

### 4. Advanced Firestore-based Daily/Cumulative View Count Tracker

The existing article view count increment was a simple single counter method. To enhance statistical analysis, we designed a split data schema: **`totalViews` (cumulative sum)** and **`dailyViews` (map for daily statistics)**.

```text
builderslog_stats (Collection)
   |
   +-- [article_slug] (Document)
         |
         +-- totalViews: 1420
         |
         +-- dailyViews (Map)
               |
               +-- 2026-05-18: 45
               +-- 2026-05-19: 78
               +-- 2026-05-20: 32  <-- KST timezone synchronization applied
```

By managing a daily traffic map based on Korea Standard Time (KST), we secured data valuable for immediately and precisely understanding not only cumulative trends but also short-term traffic fluctuations of new articles deployed today, visible on the administrator dashboard graphs.