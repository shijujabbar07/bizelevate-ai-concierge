// Patches Supabase placeholder URLs in the live n8n Concierge workflow
// Run: node scripts/patch-supabase-nodes.js

const fs = require('fs');
const https = require('https');

const SUPABASE_URL = 'https://gdzpgimyjgfzhnwyojmz.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdkenBnaW15amdmemhud3lvam16Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjY5NTE4MywiZXhwIjoyMDg4MjcxMTgzfQ.Ht06SV8_5ePdN54CB_jYiOhAFpvLxxN45NNe5LJV0pw';
const N8N_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyNTc5NDU1Mi1hYzVlLTQ5MDgtOTYyOC03MDI4Mjc0MTk0MjMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzcxMjIyNzY0LCJleHAiOjE3NzYzNDgwMDB9.CnoY38OgP-bDfK4J9Fj0KcQIQxVucQauTIU0cxwskfM';
const WORKFLOW_ID = 'HKHwb6mpWdvGcR070E8or';
const N8N_HOST = 'bizelevate1.app.n8n.cloud';

const filePath = require('path').join(__dirname, '..', 'appointment-concierge', 'n8n', 'workflow-live.json');

async function request(method, path, body) {
  return new Promise((resolve, reject) => {
    const bodyStr = body ? JSON.stringify(body) : undefined;
    const req = https.request(
      { hostname: N8N_HOST, path, method, headers: {
        'X-N8N-API-KEY': N8N_API_KEY,
        'Content-Type': 'application/json',
        ...(bodyStr ? { 'Content-Length': Buffer.byteLength(bodyStr) } : {})
      }},
      res => {
        let data = '';
        res.on('data', c => data += c);
        res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(data) }));
      }
    );
    req.on('error', reject);
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

async function main() {
  // 1. Load live workflow from file
  const wf = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  // 2. Find and patch Supabase nodes
  let patched = 0;
  wf.nodes = wf.nodes.map(node => {
    const nodeStr = JSON.stringify(node);
    if (!nodeStr.includes('<SUPABASE_URL>') && !nodeStr.includes('<SUPABASE_SERVICE_KEY>')) {
      return node;
    }
    const fixed = JSON.parse(
      nodeStr
        .replace(/<SUPABASE_URL>/g, SUPABASE_URL)
        .replace(/<SUPABASE_SERVICE_KEY>/g, SUPABASE_SERVICE_KEY)
    );
    console.log(`  Patched node: ${node.name}`);
    patched++;
    return fixed;
  });

  if (patched === 0) {
    console.log('No placeholder nodes found — workflow may already be patched.');
    return;
  }

  // 3. Strip fields n8n API rejects on PUT
  const { tags, triggerCount, versionId, id, active, ...payload } = wf;

  // 4. PUT back to n8n
  const result = await request('PUT', `/api/v1/workflows/${WORKFLOW_ID}`, payload);
  if (result.status === 200) {
    console.log(`Done. Patched ${patched} node(s). Workflow updated.`);
  } else {
    console.error('PUT failed:', result.status, JSON.stringify(result.body));
  }
}

main().catch(console.error);
