global.WebSocket = require('ws');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

// Admin e Staff keys (iremos simular logando com as contas)
const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD;
const STAFF_EMAIL = process.env.TEST_STAFF_EMAIL;
const STAFF_PASSWORD = process.env.TEST_STAFF_PASSWORD;

const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const staffClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const adminClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let totalTests = 0;
let passedTests = 0;

function assert(condition, message, err) {
    totalTests++;
    if (condition) {
        passedTests++;
        console.log(`✅ PASS: ${message}`);
    } else {
        console.error(`❌ FAIL: ${message}`);
        if (err) console.error("   Error details:", err);
    }
}

async function runTests() {
    console.log("=== INICIANDO TESTES DA FASE 2.2 ===");

    // 1. Setup Auth
    await staffClient.auth.signInWithPassword({ email: STAFF_EMAIL, password: STAFF_PASSWORD });
    await adminClient.auth.signInWithPassword({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });

    let createdRequestId = null;
    
    console.log("\n--- TESTES ANON ---");
    
    // ANON: INSERT válido
    const { error: err1 } = await anonClient.from('contact_requests').insert([{
        full_name: 'Test Anon', email: 'anon@test.com', phone: '1199999999', procedure_interest: 'Botox', clinical_data: { birthDate: '1990-01-01' }
    }]);
    assert(!err1, "ANON: INSERT válido em contact_requests = ALLOWED", err1);
    
    // We must use staffClient to retrieve the ID because anon cannot SELECT
    const { data: req1 } = await staffClient.from('contact_requests').select('id').eq('full_name', 'Test Anon').order('created_at', { ascending: false }).limit(1).single();
    if (req1) createdRequestId = req1.id;

    // ANON: SELECT
    const { data: sel1, error: err2 } = await anonClient.from('contact_requests').select('*');
    assert(sel1 && sel1.length === 0, "ANON: SELECT = DENIED (Não consegue ler a tabela)");

    // ANON: UPDATE
    if (createdRequestId) {
        await anonClient.from('contact_requests').update({ full_name: 'Hacked' }).eq('id', createdRequestId);
        const { data: checkUpd } = await staffClient.from('contact_requests').select('full_name').eq('id', createdRequestId).single();
        assert(checkUpd && checkUpd.full_name !== 'Hacked', "ANON: UPDATE = DENIED");
    }

    // ANON: DELETE
    if (createdRequestId) {
        await anonClient.from('contact_requests').delete().eq('id', createdRequestId);
        const { data: checkDel } = await staffClient.from('contact_requests').select('id').eq('id', createdRequestId).single();
        assert(checkDel !== null, "ANON: DELETE = DENIED");
    }

    // ANON: Tentativa de status diferente
    const { error: err5 } = await anonClient.from('contact_requests').insert([{
        full_name: 'Test', status: 'CONVERTED'
    }]);
    assert(err5, "ANON: Tentativa de inserir status CONVERTED = DENIED");

    // ANON: Tentativa de converted_patient_id
    const { error: err6 } = await anonClient.from('contact_requests').insert([{
        full_name: 'Test', converted_patient_id: '00000000-0000-0000-0000-000000000000'
    }]);
    assert(err6, "ANON: Tentativa de inserir converted_patient_id = DENIED");


    console.log("\n--- TESTES STAFF ---");

    if (createdRequestId) {
        // STAFF: SELECT
        const { data: staffSel, error: staffErr1 } = await staffClient.from('contact_requests').select('*').eq('id', createdRequestId);
        assert(!staffErr1 && staffSel && staffSel.length === 1, "STAFF: SELECT = ALLOWED", staffErr1);

        // STAFF: UPDATE operacional
        const { error: staffErr2 } = await staffClient.from('contact_requests').update({ status: 'IN_CONTACT' }).eq('id', createdRequestId);
        assert(!staffErr2, "STAFF: UPDATE operacional permitido = ALLOWED", staffErr2);
    } else {
        console.error("Skipping STAFF SELECT/UPDATE because createdRequestId is null");
    }

    // STAFF: Tentativa de forjar conversão manualmente (trigger)
    const { error: staffErr3 } = await staffClient.from('contact_requests').update({ status: 'CONVERTED' }).eq('id', createdRequestId);
    assert(staffErr3, "STAFF: Tentativa de marcar CONVERTED manualmente = DENIED");

    // STAFF: Tentativa de alterar converted_patient_id
    const { error: staffErr4 } = await staffClient.from('contact_requests').update({ converted_patient_id: '00000000-0000-0000-0000-000000000000' }).eq('id', createdRequestId);
    assert(staffErr4, "STAFF: Tentativa de alterar converted_patient_id = DENIED");

    // STAFF: DELETE
    if (createdRequestId) {
        await staffClient.from('contact_requests').delete().eq('id', createdRequestId);
        const { data: checkDel2 } = await staffClient.from('contact_requests').select('id').eq('id', createdRequestId).single();
        assert(checkDel2 !== null, "STAFF: DELETE = DENIED");
    }


    console.log("\n--- TESTES ADMIN ---");

    if (createdRequestId) {
        // ADMIN: SELECT
        const { data: adminSel, error: adminErr1 } = await adminClient.from('contact_requests').select('*').eq('id', createdRequestId);
        assert(!adminErr1 && adminSel && adminSel.length === 1, "ADMIN: SELECT = ALLOWED", adminErr1);
    }

    // ADMIN: DELETE (Vamos criar um mock para deletar)
    await anonClient.from('contact_requests').insert([{ full_name: 'To Delete' }]);
    const { data: mockDel } = await staffClient.from('contact_requests').select('id').eq('full_name', 'To Delete').order('created_at', { ascending: false }).limit(1).single();
    if (mockDel) {
        const { error: adminErr2 } = await adminClient.from('contact_requests').delete().eq('id', mockDel.id);
        assert(!adminErr2, "ADMIN: DELETE = ALLOWED", adminErr2);
    }


    console.log("\n--- TESTES RPC CONVERSÃO & ATOMICIDADE ---");

    // ANON executar RPC = DENIED
    const { error: rpcErr1 } = await anonClient.rpc('convert_contact_request_to_patient', { p_request_id: createdRequestId });
    assert(rpcErr1, "RPC: anon executar RPC = DENIED");

    // TESTE ATOMICIDADE (birthDate inválido)
    await anonClient.from('contact_requests').insert([{ full_name: 'Bad Date', clinical_data: { birthDate: 'nao-sou-data' } }]);
    const { data: badReq } = await staffClient.from('contact_requests').select('id').eq('full_name', 'Bad Date').order('created_at', { ascending: false }).limit(1).single();
    
    if (badReq) {
        const { error: rpcErrAtomic } = await staffClient.rpc('convert_contact_request_to_patient', { p_request_id: badReq.id });
        assert(rpcErrAtomic, "ATOMICIDADE: birthDate inválido deve provocar erro", null);
        
        // Verifica se a solicitação continuou intacta
        const { data: checkBad } = await staffClient.from('contact_requests').select('status').eq('id', badReq.id).single();
        assert(checkBad && checkBad.status === 'PENDING', "ATOMICIDADE: request deve permanecer no estado original");
    }

    // STAFF converte com sucesso
    let patientId = null;
    const { data: rpcRes, error: rpcErr2 } = await staffClient.rpc('convert_contact_request_to_patient', { p_request_id: createdRequestId });
    assert(!rpcErr2 && rpcRes, "RPC: conversão (IN_CONTACT) = sucesso", rpcErr2);
    patientId = rpcRes;

    // Verificar se paciente e anamnese foram criados
    if (patientId) {
        const { data: pData } = await staffClient.from('patients').select('*').eq('id', patientId).single();
        assert(pData && pData.full_name === 'Test Anon', "ATOMICIDADE: paciente criado corretamente");

        const { data: aData } = await staffClient.from('anamnesis').select('*').eq('patient_id', patientId);
        assert(aData && aData.length === 1, "ATOMICIDADE: anamnese criada corretamente");
    }

    // STAFF tentativa de alterar clinical_data após CONVERTED
    const { error: staffErr6 } = await staffClient.from('contact_requests').update({ clinical_data: { changed: true } }).eq('id', createdRequestId);
    assert(staffErr6, "STAFF: tentativa de alterar clinical_data de solicitação CONVERTED = DENIED");

    // Tentar converter novamente (CONVERTED = DENIED)
    const { error: rpcErr3 } = await staffClient.rpc('convert_contact_request_to_patient', { p_request_id: createdRequestId });
    assert(rpcErr3, "RPC: conversão de requisição já CONVERTED = DENIED");

    console.log(`\n=== RESULTADO: ${passedTests}/${totalTests} PASSOS ===`);
    process.exit(totalTests === passedTests ? 0 : 1);
}

runTests();
