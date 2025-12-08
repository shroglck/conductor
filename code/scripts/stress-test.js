
import autocannon from 'autocannon';
import { execSync } from 'child_process';

// Get token
// Assumes .env.test is available or environment variables are set
const tokenCmd = 'export $(grep -v \'^#\' .env.test | xargs) && node scripts/generate-token.js';
let token;

try {
    console.log('Generating auth token...');
    token = execSync(tokenCmd).toString().trim();
    console.log('Token generated.');
} catch (e) {
    console.error('Failed to generate token. Make sure .env.test exists and scripts/generate-token.js works.');
    process.exit(1);
}

console.log('Starting Stress Test with 1000 connections...');

const instance = autocannon({
  url: 'http://localhost:3000/journal',
  connections: 1000, // Concurrent connections
  pipelining: 1,
  duration: 10, // seconds
  headers: {
    'Cookie': `auth_token=${token}`
  }
}, (err, result) => {
    if (err) {
        console.error(err);
    } else {
        console.log(autocannon.printResult(result));
    }
});

autocannon.track(instance, {renderProgressBar: true});
