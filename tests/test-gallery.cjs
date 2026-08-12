const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

// Create dummy image file for upload
const dummyImageContent = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');
fs.writeFileSync('test-image.png', dummyImageContent);

async function runTests() {
  console.log("=== INICIANDO VALIDAÇÃO DE STORAGE E GALERIA ===\n");
  
  let passCount = 0;
  let failCount = 0;
  let anonUploadBlocked = false;
  let staffUploadAllowed = false;
  let publicReadAllowed = false;
  let deleteAllowed = false;
  let cleanupSuccessful = false;

  const logResult = (name, success, errorMsg = '') => {
    if (success) {
      console.log(`✅ PASS: ${name}`);
      passCount++;
    } else {
      console.error(`❌ FAIL: ${name} - ${errorMsg}`);
      failCount++;
    }
  };

  try {
    // 1. Anon Client Test
    let ws;
    try { ws = require('ws'); } catch(e){}
    const clientOpts = ws ? { auth: { persistSession: false }, global: { fetch: fetch }, realtime: { transport: ws } } : { auth: { persistSession: false } };
    
    const anonClient = createClient(supabaseUrl, supabaseAnonKey, clientOpts);
    
    // Teste de Upload como anônimo
    const { error: anonUploadError } = await anonClient.storage
      .from('images')
      .upload('test-folder/anon.png', dummyImageContent, { contentType: 'image/png' });
    
    if (anonUploadError) {
      logResult('Anon upload blocked no Storage', true);
      anonUploadBlocked = true;
    } else {
      logResult('Anon upload blocked no Storage', false, 'Upload permitido para anônimo!');
    }

    // 2. Staff/Admin Client Test
    const authClient = createClient(supabaseUrl, supabaseAnonKey, clientOpts);
    const { error: signInError } = await authClient.auth.signInWithPassword({
      email: process.env.TEST_STAFF_EMAIL,
      password: process.env.TEST_STAFF_PASSWORD
    });

    if (signInError) throw new Error('Não foi possível fazer login como Staff');

    const fileName = `test-gallery/test-${Date.now()}.png`;

    // Teste de Upload como Staff
    const { data: uploadData, error: staffUploadError } = await authClient.storage
      .from('images')
      .upload(fileName, dummyImageContent, { contentType: 'image/png' });

    if (staffUploadError) {
      logResult('Staff upload allowed no Storage', false, staffUploadError.message);
    } else {
      logResult('Staff upload allowed no Storage', true);
      staffUploadAllowed = true;
    }

    // 3. Obter Public URL e inserir na tabela gallery
    const { data: publicUrlData } = authClient.storage.from('images').getPublicUrl(fileName);
    const publicUrl = publicUrlData.publicUrl;

    const { data: galleryInsertData, error: galleryInsertError } = await authClient
      .from('gallery')
      .insert([{ image_url: publicUrl }])
      .select()
      .single();

    if (galleryInsertError) {
      logResult('Staff insert em public.gallery', false, galleryInsertError.message);
    } else {
      logResult('Staff insert em public.gallery', true);
    }

    // 4. Teste de Leitura Pública
    const fetchRes = await fetch(publicUrl);
    if (fetchRes.ok) {
      logResult('Leitura pública do arquivo gerado', true);
      publicReadAllowed = true;
    } else {
      logResult('Leitura pública do arquivo gerado', false, `HTTP Status: ${fetchRes.status}`);
    }

    // Verifica leitura pública da tabela gallery
    const { data: gallerySelectData, error: gallerySelectError } = await anonClient
      .from('gallery')
      .select('*')
      .eq('id', galleryInsertData?.id);
    
    if (gallerySelectError || !gallerySelectData || gallerySelectData.length === 0) {
      logResult('Leitura pública na tabela gallery', false, gallerySelectError?.message);
    } else {
      logResult('Leitura pública na tabela gallery', true);
    }

    // 5. Teste de Exclusão e Cleanup
    let dbCleanup = false;
    let storageCleanup = false;

    if (galleryInsertData) {
      const { error: dbDelErr } = await authClient.from('gallery').delete().eq('id', galleryInsertData.id);
      dbCleanup = !dbDelErr;
    }

    if (uploadData) {
      const { error: storeDelErr } = await authClient.storage.from('images').remove([fileName]);
      storageCleanup = !storeDelErr;
    }

    if (dbCleanup && storageCleanup) {
      logResult('Exclusão e Cleanup executados com sucesso', true);
      deleteAllowed = true;
      cleanupSuccessful = true;
    } else {
      logResult('Exclusão e Cleanup', false, 'Erro ao limpar banco ou storage');
    }

  } catch (err) {
    console.error("ERRO INESPERADO:", err);
  } finally {
    // Remove local dummy image
    if (fs.existsSync('test-image.png')) {
      fs.unlinkSync('test-image.png');
    }

    console.log(`\n=== RESUMO GALERIA ===`);
    console.log(`- Gallery table: ${cleanupSuccessful ? 'PASS' : 'FAIL'}`); // Inferred from successful flow
    console.log(`- Storage bucket: ${staffUploadAllowed ? 'PASS' : 'FAIL'}`);
    console.log(`- Anon upload blocked: ${anonUploadBlocked ? 'PASS' : 'FAIL'}`);
    console.log(`- Staff/Admin upload: ${staffUploadAllowed ? 'PASS' : 'FAIL'}`);
    console.log(`- Public read: ${publicReadAllowed ? 'PASS' : 'FAIL'}`);
    console.log(`- Delete: ${deleteAllowed ? 'PASS' : 'FAIL'}`);
    console.log(`- Cleanup: ${cleanupSuccessful ? 'PASS' : 'FAIL'}`);
    console.log(`TOTAL: ${passCount} PASS, ${failCount} FAIL`);

    process.exit(failCount === 0 ? 0 : 1);
  }
}

runTests();
