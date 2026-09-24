import fs from 'fs';
import dns from 'dns/promises';
import https from 'https';
import { createClient } from '@supabase/supabase-js';

async function runReadOnlyDiagnostics() {
  console.log("==================================================");
  console.log("MARGDARSHAK READ-ONLY SUPABASE DIAGNOSTICS");
  console.log("==================================================");

  let envFile = '';
  try {
    envFile = fs.readFileSync('.env', 'utf-8');
  } catch (e) {
    console.error("Could not read .env");
    return;
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
  const targetUrl = env.VITE_SUPABASE_URL || 'https://jcinlxylijhteujzxyow.supabase.co';
  const anonKey = env.VITE_SUPABASE_ANON_KEY || '';

  console.log(`Target URL: ${targetUrl}`);
  console.log(`Anon/Publishable Key: ${anonKey ? `${anonKey.substring(0, 15)}... (len: ${anonKey.length})` : 'MISSING'}`);

  const hostname = new URL(targetUrl).hostname;

  // 1. DNS Resolution
  console.log("\n--- [1] DNS Resolution ---");
  let dnsResolved = false;
  try {
    const addresses = await dns.resolve(hostname);
    console.log(`[PASS] Resolved IP addresses for ${hostname}:`, addresses);
    dnsResolved = true;
  } catch (err) {
    console.log(`[FAIL] DNS resolution failed for ${hostname}: ${err.code} (${err.message})`);
  }

  // 2. HTTPS Reachability
  console.log("\n--- [2] HTTPS Reachability ---");
  await new Promise((resolve) => {
    const req = https.get(targetUrl, { timeout: 7000 }, (res) => {
      console.log(`[PASS] HTTPS root responded: Status ${res.statusCode} ${res.statusMessage}`);
      resolve();
    });
    req.on('error', (e) => {
      console.log(`[FAIL] HTTPS root connection error: ${e.message}`);
      resolve();
    });
    req.on('timeout', () => {
      console.log(`[FAIL] HTTPS root timed out after 7000ms`);
      req.destroy();
      resolve();
    });
  });

  // 3. /rest/v1/ Endpoint Reachability
  console.log("\n--- [3] /rest/v1/ Endpoint Reachability ---");
  await new Promise((resolve) => {
    const req = https.request({
      hostname: hostname,
      path: '/rest/v1/',
      method: 'GET',
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`
      },
      timeout: 7000
    }, (res) => {
      console.log(`[PASS] /rest/v1/ responded: Status ${res.statusCode} ${res.statusMessage}`);
      resolve();
    });
    req.on('error', (e) => {
      console.log(`[FAIL] /rest/v1/ request error: ${e.message}`);
      resolve();
    });
    req.on('timeout', () => {
      console.log(`[FAIL] /rest/v1/ request timed out after 7000ms`);
      req.destroy();
      resolve();
    });
    req.end();
  });

  // 4. Supabase Client Initialization
  console.log("\n--- [4] Supabase Client Initialization ---");
  let client;
  try {
    client = createClient(targetUrl, anonKey);
    console.log("[PASS] createClient initialized successfully.");
  } catch (err) {
    console.log(`[FAIL] createClient initialization error: ${err.message}`);
    return;
  }

  // Read Tests
  const tables = [
    'safety_profiles',
    'family_safety_profiles',
    'safety_accessories',
    'qr_codes',
    'qr_scan_events'
  ];

  console.log("\n--- [5-9] Read Tests Against Existing Tables ---");
  for (const table of tables) {
    try {
      const { data, error, count, status, statusText } = await client
        .from(table)
        .select('*', { count: 'exact', head: false })
        .limit(2);

      if (error) {
        console.log(`[FAIL] Table '${table}': HTTP ${status} ${statusText} - Error: ${error.message} (Code: ${error.code})`);
      } else {
        console.log(`[PASS] Table '${table}': Successfully queried. Rows accessible: ${count !== null ? count : (data ? data.length : 0)} (Preview rows returned: ${data?.length || 0})`);
        if (data && data.length > 0 && table === 'safety_profiles') {
          console.log(`       Sample Record: ID=${data[0].id}, SafetyID=${data[0].safety_id}, Status=${data[0].status}, QRStatus=${data[0].qr_status}`);
        }
      }
    } catch (e) {
      console.log(`[FAIL] Table '${table}': Network/Runtime Exception: ${e.message}`);
    }
  }

  console.log("\n==================================================");
  console.log("DIAGNOSTIC COMPLETED");
  console.log("==================================================");
}

runReadOnlyDiagnostics();
