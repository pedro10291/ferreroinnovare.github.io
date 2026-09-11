import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const allowedOrigins = [
  'https://ferreroinnovare-github-io.vercel.app',
  'https://pedro10291.github.io',
  'https://ferreroinnovare.github.io',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173'
]

serve(async (req) => {
  const origin = req.headers.get('Origin')
  const isAllowedOrigin = origin && allowedOrigins.includes(origin)

  const corsHeaders: Record<string, string> = {
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Vary': 'Origin',
  }
  
  if (isAllowedOrigin) {
    corsHeaders['Access-Control-Allow-Origin'] = origin
  }
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Apenas POST permitido
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  try {
    const rawBody = await req.text()
    if (rawBody.length > 20000) { 
      // Proteção física de payload na borda
      throw new Error('Payload too large')
    }
    
    const body = JSON.parse(rawBody)
    const { turnstile_token, full_name, email, phone, procedure_interest, message, clinical_data } = body

    if (!turnstile_token) {
      return new Response(JSON.stringify({ error: 'Missing validation token' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Identificação do ambiente baseado na Origem
    const isDev = origin && origin.startsWith('http://localhost');
    
    // Validação Server-Side do Turnstile
    const turnstileSecret = isDev
      ? (Deno.env.get('TURNSTILE_SECRET_KEY_DEV') || '1x0000000000000000000000000000000AA')
      : Deno.env.get('TURNSTILE_SECRET_KEY');

    if (!turnstileSecret) {
      console.error('Missing TURNSTILE_SECRET_KEY environment variable.')
      throw new Error('Server configuration error')
    }

    const formData = new FormData()
    formData.append('secret', turnstileSecret)
    formData.append('response', turnstile_token)
    
    const clientIp = req.headers.get('cf-connecting-ip')
    if (clientIp) {
      formData.append('remoteip', clientIp)
    }

    const cfResult = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
    })

    const cfOutcome = await cfResult.json()
    if (!cfOutcome.success) {
      console.log('Turnstile Validation Failed:', cfOutcome)
      return new Response(JSON.stringify({ 
        error: 'Validation failed',
        debug: isDev ? cfOutcome['error-codes'] : undefined
      }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    
    // Validação estrita de Hostname (DEV vs PROD)
    const expectedHostnames = [
      'localhost',
      'ferreroinnovare-github-io.vercel.app',
      'pedro10291.github.io',
      'ferreroinnovare.github.io'
    ];
    
    if (!isDev && !expectedHostnames.includes(cfOutcome.hostname)) {
       console.log('Turnstile Hostname Mismatch:', cfOutcome.hostname)
       return new Response(JSON.stringify({ error: 'Invalid hostname origin' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Validação Autoritativa do Payload
    if (!full_name || typeof full_name !== 'string' || full_name.length < 3) {
      return new Response(JSON.stringify({ error: 'Invalid parameters' }), { status: 400, headers: corsHeaders })
    }
    
    let normalizedPhone = ''
    if (phone && typeof phone === 'string') {
      normalizedPhone = phone.replace(/\D/g, '')
      if (normalizedPhone.length < 10 || normalizedPhone.length > 15) {
        return new Response(JSON.stringify({ error: 'Invalid parameters' }), { status: 400, headers: corsHeaders })
      }
    } else {
      return new Response(JSON.stringify({ error: 'Invalid parameters' }), { status: 400, headers: corsHeaders })
    }

    if (message && typeof message === 'string' && message.length > 2000) {
      return new Response(JSON.stringify({ error: 'Invalid parameters' }), { status: 400, headers: corsHeaders })
    }
    
    if (clinical_data && JSON.stringify(clinical_data).length > 5000) {
      return new Response(JSON.stringify({ error: 'Invalid parameters' }), { status: 400, headers: corsHeaders })
    }

    // Rate Limit Simplificado Server-Side
    // Uma Edge Function Deno não possui armazenamento persistente nativo além do DB.
    // Como RLS de anon será desligado, validamos apenas se o mesmo telefone não possui muitos pendentes (Exemplo).
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Anti-Spam: Não permite inserir se já existirem 2 ou mais contatos PENDING para este mesmo número
    const { count, error: countError } = await supabase
      .from('contact_requests')
      .select('*', { count: 'exact', head: true })
      .eq('phone', normalizedPhone)
      .eq('status', 'PENDING')

    if (countError) {
      throw countError
    }

    if (count !== null && count >= 2) {
      return new Response(JSON.stringify({ error: 'Você já possui uma solicitação em andamento. Aguarde nosso contato.' }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Allowlist Explícita de campos (proteção contra Mass Assignment)
    const { error: insertError } = await supabase
      .from('contact_requests')
      .insert({
        full_name,
        email: typeof email === 'string' ? email : null,
        phone: normalizedPhone,
        procedure_interest: typeof procedure_interest === 'string' ? procedure_interest : null,
        message: typeof message === 'string' ? message : null,
        clinical_data: typeof clinical_data === 'object' ? clinical_data : null,
      })

    if (insertError) {
      console.error('Database insertion error') // Logs limpos, sem expor SQL
      return new Response(JSON.stringify({ error: 'Failed to process request' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    // Esconder detalhes internos
    console.error('Edge Function Exception')
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
