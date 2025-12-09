import autocannon from 'autocannon';

const targetUrl = process.env.PERF_TEST_URL || 'https://monkeyschool.indresh.me/'; // Default to HTTPS
const authToken = process.env.PERF_TEST_AUTH_TOKEN;

if (!authToken) {
  console.error('Error: PERF_TEST_AUTH_TOKEN environment variable is not set.');
  process.exit(1);
}

console.log('Starting stress test on ' + targetUrl);

const instance = autocannon({
  url: targetUrl,
  connections: 1000,
  duration: 20,
  headers: {
    'Cookie': `auth_token=${authToken}`
  },
  requests: [
    { method: 'GET', path: '/' },
    { method: 'GET', path: '/attendance' },
    { method: 'GET', path: '/classes/my-classes' },
    { method: 'GET', path: '/users/profile' }
  ]
}, (err, result) => {
  if (err) {
    console.error('Stress test error:', err);
    process.exit(1);
  }
  console.log('Stress test complete.');
  console.log(autocannon.printResult(result));
});

process.once('SIGINT', () => {
  instance.stop();
});

autocannon.track(instance, { renderProgressBar: true });
