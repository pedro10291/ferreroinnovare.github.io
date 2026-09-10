import fs from 'fs';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, ...value] = line.split('=');
  if (key && value) env[key.trim()] = value.join('=').trim();
});

const supabaseUrl = env['VITE_SUPABASE_URL'];
const supabaseKey = env['VITE_SUPABASE_ANON_KEY'];

async function testSpoof() {
  const payload = {
    full_name: 'Test Spoof',
    phone: '11999999999',
    procedure_interest: 'Avaliação Geral',
    message: null,
    status: 'PENDING'
  };
  
  const res = await fetch(`${supabaseUrl}/rest/v1/contact_requests`, {
    method: 'POST',
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      'X-Forwarded-For': '8.8.8.8'
    },
    body: JSON.stringify(payload)
  });
  
  console.log("Status X-Forwarded-For Spoof:", res.status);
}

testSpoof();
