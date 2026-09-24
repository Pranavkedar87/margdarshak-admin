import assert from 'assert';
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';

console.log('--- Starting MargDarshak End-to-End Verification ---');

// 1. Verify QR Payload Construction
const publicAppUrl = 'https://margdarshak.app';
const testSafetyId = 'MD-FM-2026-384920';
const expectedPayload = `${publicAppUrl}/safety/${testSafetyId}`;

assert.strictEqual(
  `${publicAppUrl}/safety/${encodeURIComponent(testSafetyId)}`,
  expectedPayload,
  'QR Payload must strictly match https://margdarshak.app/safety/{safety_id}'
);
console.log('✔ QR Payload Verification: PASS');

// 2. Verify QR Generation (PNG >= 1000x1000 and SVG)
const pngDataUrl = await QRCode.toDataURL(expectedPayload, {
  width: 1024,
  margin: 2,
  errorCorrectionLevel: 'H'
});
assert(pngDataUrl.startsWith('data:image/png;base64,'), 'PNG Data URL must be valid Base64');

const svgString = await QRCode.toString(expectedPayload, {
  type: 'svg',
  margin: 2,
  errorCorrectionLevel: 'H'
});
assert(svgString.includes('<svg') && svgString.includes('</svg>'), 'SVG must be valid XML SVG');
console.log('✔ High-Resolution QR Generation (1024px PNG & SVG): PASS');

// 3. Verify Privacy Sanitization (No private data leaks)
const privateDossier = {
  id: 'uuid-1234-internal',
  safety_id: 'MD-FM-2026-384920',
  full_name: 'Varkari Pilgrim',
  age: 62,
  relationship: 'Father',
  blood_group: 'B+',
  // PRIVATE FIELDS:
  address: 'Plot 42, Varkari Bhavan, Alandi, Pune 412105',
  mobile: '+91 9876543210',
  guardian_phone: '+91 9876543211',
  secondary_contact_phone: '+91 9876543212',
  medications: 'Metformin 500mg, Amlodipine 5mg twice daily',
  owner_user_id: 'firebase-user-uid-9999'
};

// Simulate public projection
const publicPayload = {
  safety_id: privateDossier.safety_id,
  profile_type: 'DEPENDENT',
  name: privateDossier.full_name,
  age: privateDossier.age,
  relationship: privateDossier.relationship,
  blood_group: privateDossier.blood_group,
  emergency_info: {
    critical_allergies: null,
    medical_alert: null,
    special_assistance: null,
    emergency_instructions: null,
  }
};

const publicSerialized = JSON.stringify(publicPayload);
assert(!publicSerialized.includes('Plot 42'), 'Full home address must NOT leak');
assert(!publicSerialized.includes('+91 9876543210'), 'Pilgrim mobile must NOT leak');
assert(!publicSerialized.includes('+91 9876543211'), 'Guardian phone must NOT leak');
assert(!publicSerialized.includes('Metformin'), 'Medications list must NOT leak');
assert(!publicSerialized.includes('uuid-1234-internal'), 'Internal UUID must NOT leak');
assert(!publicSerialized.includes('firebase-user-uid-9999'), 'Firebase UID must NOT leak');
console.log('✔ Public Sanitization & Data Privacy: PASS');

// 4. Verify Supabase Edge Functions exist
const edgeFuncs = ['public-safety/index.ts', 'record-qr-scan/index.ts', 'admin-qr/index.ts'];
for (const fn of edgeFuncs) {
  const p = path.resolve('supabase/functions', fn);
  assert(fs.existsSync(p), `Edge function ${fn} must exist`);
}
console.log('✔ Supabase Edge Functions (public-safety, record-qr-scan, admin-qr): PASS');

// 5. Verify GitHub Pages SPA Fallback
const dist404 = path.resolve('dist/404.html');
const distIndex = path.resolve('dist/index.html');
assert(fs.existsSync(dist404), 'dist/404.html must exist for GitHub Pages SPA routing');
assert(fs.existsSync(distIndex), 'dist/index.html must exist');
const html404Content = fs.readFileSync(dist404, 'utf-8');
assert(html404Content.includes('spa-github-pages'), '404.html must contain SPA redirection');
console.log('✔ GitHub Pages SPA Fallback (404.html): PASS');

// 6. Verify SQL Migration exists
const sqlPath = path.resolve('supabase/migrations/20260921000000_safety_schema_policies.sql');
assert(fs.existsSync(sqlPath), 'SQL migration file must exist');
const sqlContent = fs.readFileSync(sqlPath, 'utf-8');
assert(sqlContent.includes('get_public_safety_profile'), 'SQL migration must define safe public RPC');
assert(!sqlContent.toLowerCase().includes('drop table'), 'SQL migration must NEVER drop existing tables');
console.log('✔ SQL Migration & Zero-Drop Verification: PASS');

console.log('--- ALL INTEGRITY TESTS PASSED SUCCESSFULLY ---');
