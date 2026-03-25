const targetURL = 'https://skeeme.com/api/v1/student/register';
const CONCURRENT_USERS = 100;

console.log(`🚀 Starting Load Test...`);
console.log(`Target: ${targetURL}`);
console.log(`Virtual Users: ${CONCURRENT_USERS}\n`);

const startTime = Date.now();
const promises = [];

for (let i = 0; i < CONCURRENT_USERS; i++) {
    // We send a valid JSON payload but use a random email so it doesn't fail the "email already exists" validation
    const payload = JSON.stringify({
        first_name: `TestLoad`,
        last_name: `User${i}`,
        email: `loadtest+${i}+${Date.now()}@skeeme.com`,
        password: 'password123',
        password_confirmation: 'password123',
        device_name: 'load_tester'
    });

    const requestPromise = fetch(targetURL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            // CRITICAL: Tells Laravel we want JSON back, no matter what!
            'Accept': 'application/json',
            // CRITICAL: Helps bypass basic Cloudflare Bot Fight Mode checks
            'User-Agent': 'SkeemeMobileApp/1.0 LoadTester'
        },
        body: payload
    })
    .then(async (res) => {
        // Only read the first 300 chars of the response to save memory
        const text = await res.text();
        return { 
            status: res.status, 
            ok: res.ok, 
            sampleText: text.substring(0, 300) 
        };
    })
    .catch(err => {
        return { 
            status: 'NETWORK_ERROR', 
            ok: false, 
            sampleText: err.message 
        };
    });

    promises.push(requestPromise);
}

// Fire them all at once!
const results = await Promise.all(promises);
const endTime = Date.now();
const totalSeconds = (endTime - startTime) / 1000;

// Tally the results
let successCount = 0;
let failCount = 0;
const statusCodes = {};

results.forEach(res => {
    if (res.ok) successCount++;
    else failCount++;

    statusCodes[res.status] = (statusCodes[res.status] || 0) + 1;
});

// Print Report
console.log(`\n📊 --- LOAD TEST RESULTS ---`);
console.log(`Total Time Takes:  ${totalSeconds.toFixed(2)} seconds`);
console.log(`Requests/Second:   ${(CONCURRENT_USERS / totalSeconds).toFixed(2)} req/sec`);
console.log(`✅ Successes:       ${successCount}`);
console.log(`❌ Failures:        ${failCount}\n`);

console.log(`HTTP Status Breakdown:`);
for (const [code, count] of Object.entries(statusCodes)) {
    console.log(` - Status ${code}: ${count} times`);
}

// Print a sample of why it failed so we can see if it was Rate Limiting (429) or Cloudflare (403, 520)
if (failCount > 0) {
    const firstFailure = results.find(r => !r.ok && r.status !== 'NETWORK_ERROR');
    if (firstFailure) {
        console.log(`\n🔍 Sample Failure Response (Status ${firstFailure.status}):`);
        console.log(firstFailure.sampleText);
    }
}
