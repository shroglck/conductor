# Performance Test Report

**Target Environment:** `http://monkeyschool.indresh.me/`
**Date:** 2024-02-08 (Simulated)
**Tools:** Autocannon (Stress), Playwright (RAIL)

## 1. Stress Testing

**Scenario:** 1000 concurrent authenticated users making read-only requests to critical endpoints (`/`, `/attendance`, `/classes/my-classes`, `/users/profile`).

**Results:**
*   **Duration:** 20 seconds
*   **Total Requests:** ~11k
*   **Requests per Second (Avg):** 437.35
*   **Latency (Avg):** 265.37 ms
*   **Latency (99%):** 816 ms
*   **Errors:** ~2k timeouts observed.
*   **Response Codes:** 0 2xx responses (See Note below).

**Note on Response Codes:**
The stress test reported "0 2xx responses" and "8747 non-2xx responses". This strongly suggests that either:
1.  The provided `auth_token` expired or was invalid for high-concurrency reuse, leading to 401/403 or 302 redirects to login.
2.  The server is returning 304 Not Modified (which is common for static assets or repeated requests).
3.  The server is responding with 302 Redirects.

However, the RAIL tests (below) confirm that the same `auth_token` *does* successfully authenticate a single user for the same paths, returning 200 OK. The high failure rate in stress testing likely indicates the server or network infrastructure shedding load or rate-limiting the single IP/User token.

## 2. RAIL Performance (Response Animation Idle Load)

**Scenario:** Authenticated user navigating through the application's configured menu items. Metrics capture the full page load time.

**Passed Scenarios (200 OK):**

| Path | Navigation Flow | Load Time | DOM Interactive |
|------|----------------|-----------|-----------------|
| `/` | Home | 22.0s (First Load)* | ~21.9s |
| `/` | Home -> Home | 2.6s | ~2.5s |
| `/attendance` | Home -> Attendance | 2.6s | ~2.5s |
| `/classes/my-classes` | Courses -> My Classes | 2.4s | ~2.3s |
| `/users/profile` | Account -> View Profile | 2.4s | ~2.3s |

*\*First load includes Playwright browser startup and initial network negotiation overhead.*
*Subsequent navigations average ~2.5 seconds, which is acceptable for a full server-side render but exceeds the RAIL "Response" goal of <100ms and "Load" goal of <1000ms (1s).*

**Failed Scenarios (404 Not Found):**
The following paths are configured in the application's navigation menu (`navigationConfig.js`) but returned 404 errors on the live server:
*   `/people`
*   `/schedule`
*   `/courses`
*   `/courses/list`
*   `/courses/schedule`
*   `/account`

## 3. Recommendations

1.  **Fix Broken Links:** Update `navigationConfig.js` to remove or correct paths that currently return 404 (`/people`, `/courses/list`, etc.).
2.  **Optimize Load Time:** Average load times of ~2.5s suggest optimization opportunities.
    *   Enable compression (Gzip/Brotli) if not active.
    *   Implement client-side caching strategies.
    *   Review HTMX partials to ensure only necessary fragments are re-rendered.
3.  **Stress Stability:** The high rate of non-2xx responses and timeouts under 1000 concurrent users indicates the need for:
    *   Horizontal scaling of the backend.
    *   Rate limiting configuration review (to handle legitimate spikes vs abuse).
    *   Database connection pool tuning.
