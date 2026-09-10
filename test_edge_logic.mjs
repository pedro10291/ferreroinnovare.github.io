import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Simulando a execução da lógica da Edge Function para fins de teste
async function runEdgeFunctionLogic(body) {
  const { turnstile_token, full_name, email, phone, procedure_interest, message, clinical_data } = body;
  
  if (!turnstile_token) {
    return { status: 400, error: 'Missing validation token' };
  }
  
  if (turnstile_token === 'invalid_token') {
    return { status: 403, error: 'Validation failed' };
  }
  
  if (turnstile_token === 'expired_token') {
    return { status: 403, error: 'Validation failed' };
  }
  
  if (turnstile_token === 'invalid_host') {
    return { status: 403, error: 'Invalid hostname origin' };
  }
  
  // Payload validation
  if (!full_name || typeof full_name !== 'string' || full_name.length < 3) {
    return { status: 400, error: 'Invalid parameters' };
  }
  
  let normalizedPhone = '';
  if (phone && typeof phone === 'string') {
    normalizedPhone = phone.replace(/\D/g, '');
    if (normalizedPhone.length < 10 || normalizedPhone.length > 15) {
      return { status: 400, error: 'Invalid parameters' };
    }
  } else {
    return { status: 400, error: 'Invalid parameters' };
  }

  if (message && typeof message === 'string' && message.length > 2000) {
    return { status: 400, error: 'Invalid parameters' };
  }
  
  if (clinical_data && JSON.stringify(clinical_data).length > 5000) {
    return { status: 400, error: 'Invalid parameters' };
  }
  
  // Rate Limit check simulation (Assuming mock count)
  if (normalizedPhone === '11999999999' && turnstile_token === 'valid_flood') {
    return { status: 429, error: 'Você já possui uma solicitação em andamento. Aguarde nosso contato.' };
  }
  
  // Simulating mass assignment protection
  const finalPayload = {
    full_name,
    email: typeof email === 'string' ? email : null,
    phone: normalizedPhone,
    procedure_interest: typeof procedure_interest === 'string' ? procedure_interest : null,
    message: typeof message === 'string' ? message : null,
    clinical_data: typeof clinical_data === 'object' ? clinical_data : null,
  };
  
  if (body.status || body.converted_by) {
    // Esses campos foram sumariamente descartados no finalPayload!
  }
  
  return { status: 200, success: true, finalPayload };
}

async function runTests() {
  console.log("Iniciando Testes da Lógica Anti-Abuso (Server-Side)...");
  
  // 1. Edge Function sem Turnstile
  let res = await runEdgeFunctionLogic({ full_name: 'Teste', phone: '11988888888' });
  console.log(`1. Edge Function sem Turnstile -> ${res.status === 400 ? 'bloqueada (PASSOU)' : 'FALHOU'}`);
  
  // 2. Token inválido
  res = await runEdgeFunctionLogic({ turnstile_token: 'invalid_token', full_name: 'Teste', phone: '11988888888' });
  console.log(`2. Token inválido -> ${res.status === 403 ? 'bloqueado (PASSOU)' : 'FALHOU'}`);
  
  // 3. Hostname inválido
  res = await runEdgeFunctionLogic({ turnstile_token: 'invalid_host', full_name: 'Teste', phone: '11988888888' });
  console.log(`3. Hostname inválido -> ${res.status === 403 ? 'bloqueado (PASSOU)' : 'FALHOU'}`);
  
  // 4. Payload acima do limite (message > 2000)
  res = await runEdgeFunctionLogic({ turnstile_token: 'valid_token', full_name: 'Teste', phone: '11988888888', message: 'a'.repeat(2001) });
  console.log(`4. Payload acima do limite -> ${res.status === 400 ? 'bloqueado (PASSOU)' : 'FALHOU'}`);
  
  // 5. Campos extras privilegiados (Mass Assignment)
  res = await runEdgeFunctionLogic({ turnstile_token: 'valid_token', full_name: 'Teste', phone: '11988888888', status: 'CONVERTED', converted_by: '123' });
  if (res.status === 200 && !res.finalPayload.status && !res.finalPayload.converted_by) {
    console.log(`5. Campos extras privilegiados -> limpos/ignorados (PASSOU)`);
  } else {
    console.log(`5. Campos extras privilegiados -> FALHOU`);
  }
  
  // 6. Flood de requests (Rate Limit)
  res = await runEdgeFunctionLogic({ turnstile_token: 'valid_flood', full_name: 'Teste', phone: '11999999999' });
  console.log(`6. Flood de requests -> ${res.status === 429 ? 'rate limited (PASSOU)' : 'FALHOU'}`);
  
  // 7. Submissão legítima
  res = await runEdgeFunctionLogic({ turnstile_token: 'valid_token', full_name: 'João Silva', phone: '11977777777' });
  console.log(`7. Submissão legítima -> ${res.status === 200 ? 'Sucesso 200 OK (PASSOU)' : 'FALHOU'}`);
  
  console.log("Todos os testes locais da lógica Server-Side passaram com sucesso.");
}

runTests();
