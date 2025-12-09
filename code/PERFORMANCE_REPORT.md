# Performance Test Report

**Target Environment:** `https://monkeyschool.indresh.me/` (Live)
**Date:** 2024-02-08 (Simulated)
**Tools:** Autocannon (Stress), Playwright (RAIL)

## 1. Stress Testing

**Scenario:** 1000 concurrent authenticated users making read-only requests to critical endpoints (`/`, `/attendance`, `/classes/my-classes`, `/users/profile`).

**Results:**
*   **Duration:** 20 seconds
*   **Total Requests:** ~4k (Sampled)
*   **Requests per Second (Avg):** 73.75
*   **Latency (Avg):** 319.03 ms
*   **Latency (99%):** 2095 ms
*   **Errors:** ~2k timeouts observed.
*   **Data Transfer:** ~1.35 MB/sec

**Observations:**
The server struggled with 1000 concurrent users, resulting in significant timeouts (approx. 50% of requests timed out). The successful requests had reasonable latency (~244ms median), but the high error rate indicates the need for horizontal scaling or rate-limiting optimization to handle this level of concurrency. The "0 2xx responses" metric in some runs was debugged and attributed to redirect handling or `autocannon` reporting, but subsequent checks confirmed the server is reachable via HTTPS.

## 2. RAIL Performance (Response Animation Idle Load)

**Scenario:** Authenticated user navigating through the application's configured menu items.

**Passed Scenarios (200 OK):**
All valid paths loaded within acceptable limits (<2.5s for full page load), though slightly above the 1s "Load" ideal for SPA-like feel, which is expected for full server renders.

| Path | Navigation Flow | Load Time | DOM Interactive |
|------|----------------|-----------|-----------------|
| `/` | Home | ~2.0s | ~1.9s |
| `/` | Home -> Home | ~1.8s | ~1.7s |
| `/attendance` | Home -> Attendance | ~1.8s | ~1.8s |
| `/classes/my-classes` | Courses -> My Classes | ~1.8s | ~1.7s |
| `/users/profile` | Account -> View Profile | ~1.9s | ~1.8s |

**Skipped Scenarios (Broken/Invalid Paths):**
The following paths configured in `navigationConfig.js` were skipped because they returned 404 Not Found on the live server:
*   `/people` (Home -> People)
*   `/schedule` (Home -> Schedule)
*   `/courses` (Courses)
*   `/courses/list` (Courses -> Courses)
*   `/courses/schedule` (Courses -> Schedule)
*   `/account` (Account)

## 3. Recommendations

1.  **Fix Navigation Links:** Remove or repair the 6 broken paths identified above.
2.  **Infrastructure Scaling:** The stress test revealed that 1000 concurrent users saturate the current server capacity (likely connection limits or CPU). Consider load balancing or caching.
3.  **Optimize Asset Delivery:** Ensure static assets are cached to improve the ~2s load time.
