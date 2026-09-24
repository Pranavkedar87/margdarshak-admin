import fs from 'fs';
import dns from 'dns/promises';
import https from 'https';

async function diagnose() {
  console.log("==================================================");
  console.log("STEP 1 — VERIFY SUPABASE CONFIGURATION");
  console.log("==================================================");
  
  let envFile = '';
  try {
    envFile = fs.readFileSync('.env', 'utf-8');
  } catch (e) {
    console.log("Could not read .env");
  }

  const parseEnv = (content) => {
    const lines = content.split('\n');
    const result = {};
    for (const line of lines) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        let value = match[2] || '';
        value = value.trim().replace(/^['"](.*)['"]$/, '$1');
        result[match[1]] = value;
      }
    }
    return result;
  };

  const env = parseEnv(envFile);
  const url = env.VITE_SUPABASE_URL || 'https://jcinxlylijhteujzxyow.supabase.co';
  const anonKey = env.VITE_SUPABASE_ANON_KEY;

  console.log("VITE_SUPABASE_URL:", url);
  console.log("VITE_SUPABASE_ANON_KEY:", anonKey ? `Found (Length: ${anonKey.length}, Prefix: ${anonKey.substring(0, 12)}...)` : "MISSING");
  console.log("VITE_PUBLIC_APP_URL:", env.VITE_PUBLIC_APP_URL || "MISSING");

  console.log("\n==================================================");
  console.log("STEP 2 — VERIFY THE REAL PROJECT URL");
  console.log("==================================================");
  let hostname;
  try {
    hostname = new URL(url).hostname;
  } catch (e) {
    console.error("Invalid URL:", url);
    return;
  }
  
  console.log("Target Hostname:", hostname);

  console.log("\n1. DNS Resolution Check:");
  try {
    const addresses = await dns.resolve(hostname);
    console.log("  [SUCCESS] Resolved IP addresses:", addresses);
  } catch (error) {
    console.log(`  [FAILED] DNS resolution error: ${error.code} (${error.message})`);
  }

  console.log("\n2. Root HTTPS Reachability:");
  await new Promise((resolve) => {
    const req = https.get(url, { timeout: 5000 }, (res) => {
      console.log(`  [STATUS] HTTP ${res.statusCode} ${res.statusMessage}`);
      resolve();
    });
    req.on('error', (e) => {
      console.log(`  [FAILED] Connection error: ${e.message}`);
      resolve();
    });
    req.on('timeout', () => {
      console.log(`  [FAILED] Connection timed out after 5000ms`);
      req.destroy();
      resolve();
    });
  });

  console.log("\n3. REST API Endpoint Check (/rest/v1/):");
  await new Promise((resolve) => {
    const req = https.request({
      hostname: hostname,
      path: '/rest/v1/',
      method: 'GET',
      headers: {
        'apikey': anonKey || '',
        'Authorization': `Bearer ${anonKey || ''}`
      },
      timeout: 5000
    }, (res) => {
      console.log(`  [STATUS] HTTP ${res.statusCode} ${res.statusMessage}`);
      resolve();
    });
    req.on('error', (e) => {
      console.log(`  [FAILED] REST API error: ${e.message}`);
      resolve();
    });
    req.on('timeout', () => {
      console.log(`  [FAILED] REST API timed out after 5000ms`);
      req.destroy();
      resolve();
    });
    req.end();
  });
}

diagnose();
