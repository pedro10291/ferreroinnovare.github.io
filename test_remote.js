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

async function testValid() {
  for (let i = 1; i <= 6; i++) {
    const payload = {
      full_name: `Test Rate Limit ${i}`,
      phone: '11999999999',
      procedure_interest: 'Avaliação Geral',
      message: null
    };
    
    const res = await fetch(`${supabaseUrl}/rest/v1/contact_requests`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    if (res.status === 201) {
      console.log(`${i}º envio -> permitido`);
    } else {
      console.log(`${i}º envio -> bloqueado (${res.status})`, await res.text());
    }
  }
}

testValid();
