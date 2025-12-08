# Performance Testing Results

## 1. Stress Testing (1000 Concurrent Users)
Simulated using `autocannon` hitting `GET /journal` and `POST /journal` for 10 seconds.
- **Concurrent Connections**: 1000
- **Average Latency**: ~290ms
- **Requests per Second**: ~593
- **Reliability**: ~6000 requests failed (mostly timeouts) due to hitting the connection limits of the local development environment (single Node process + Docker Postgres).
- **Conclusion**: The application handles high load by rate-limiting or timing out rather than crashing, but production deployment would require horizontal scaling (clusters/instances) and connection pooling optimization to handle 1000 concurrent active users.

## 2. RAIL Model Testing
Simulated using Playwright.

### Response (Input Latency)
- **Metric**: Time from clicking "Post Entry" to the new entry appearing in the DOM.
- **Result**: ~472ms
- **Analysis**: Exceeds the <100ms goal. This is expected for a server-side rendered interaction involving a database write.
- **Recommendation**: Optimistic UI updates (adding the card immediately via JS before server confirmation) could bring this under 100ms.

### Animation (Smoothness)
- **Metric**: Cumulative Layout Shift (CLS).
- **Result**: 0.008
- **Analysis**: Excellent score (Target < 0.1). The interface is stable with minimal shifting.

### Idle
- **Metric**: Not explicitly measured, but no long tasks observed during idle periods.

### Load (Initial Load)
- **Metric**: Navigation to `domInteractive`.
- **Result**: ~624ms
- **Analysis**: Excellent score (Target < 1000ms). The page is lightweight and renders quickly.
