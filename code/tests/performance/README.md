# Performance Tests

This directory contains scripts for stress testing and RAIL (Response, Animation, Idle, Load) performance testing.

## Prerequisites

1.  **Node.js**: Ensure Node.js is installed.
2.  **Dependencies**: Run `npm install` in the `code/` directory to install `autocannon` and `playwright`.
3.  **Environment Variable**: You **must** set the `PERF_TEST_AUTH_TOKEN` environment variable with a valid JWT for authentication.

## Running Tests

### Stress Test
Uses `autocannon` to simulate 1000 concurrent users.

```bash
export PERF_TEST_AUTH_TOKEN="your_jwt_here"
npm run test:perf:stress
```

### RAIL/E2E Test
Uses `playwright` to measure page load times and verify critical paths.

```bash
export PERF_TEST_AUTH_TOKEN="your_jwt_here"
npm run test:perf:rail
```
