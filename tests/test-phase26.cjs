global.WebSocket = require('ws');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const TEST_ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL || 'admin@ferreroinnovare.com';
const TEST_ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD || 'admin123';
const TEST_STAFF_EMAIL = process.env.TEST_STAFF_EMAIL || 'staff@ferreroinnovare.com';
const TEST_STAFF_PASSWORD = process.env.TEST_STAFF_PASSWORD || 'staff123';

const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const adminClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const staffClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let stats = { total: 0, pass: 0, fail: 0 };

function assert(condition, message) {
    stats.total++;
    if (condition) {
        console.log(`✅ PASS: ${message}`);
        stats.pass++;
    } else {
        console.error(`❌ FAIL: ${message}`);
        stats.fail++;
    }
}

async function runTests() {
    console.log('=== INICIANDO TESTES DA FASE 2.6 (AGENDA) ===\n');

    // Autenticação
    const adminAuth = await adminClient.auth.signInWithPassword({ email: TEST_ADMIN_EMAIL, password: TEST_ADMIN_PASSWORD });
    const staffAuth = await staffClient.auth.signInWithPassword({ email: TEST_STAFF_EMAIL, password: TEST_STAFF_PASSWORD });

    if (adminAuth.error || staffAuth.error) {
        console.error('❌ FAIL: Falha na autenticação dos clientes de teste.');
        process.exit(1);
    }

    const adminId = adminAuth.data.user.id;
    const staffId = staffAuth.data.user.id;

    // Obter dados de teste válidos
    const { data: patient } = await adminClient.from('patients').select('id').limit(1).single();
    const { data: procedure } = await adminClient.from('procedures').select('id, title').limit(1).single();
    const { data: professional } = await adminClient.from('profiles').select('id, full_name').eq('active', true).limit(1).single();

    if (!patient || !professional) {
        console.error('❌ FAIL: Dados insuficientes no banco (pacientes ou profissionais).');
        process.exit(1);
    }

    const patientId = patient.id;
    const procedureId = procedure?.id || null;
    const professionalId = professional.id;
    
    // Limpar agendamentos futuros do teste para evitar sujeira
    await adminClient.from('appointments').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    const baseTime = new Date();
    // Add random days to avoid collision with previous test runs since we can't delete (RLS blocks it)
    const randomOffset = Math.floor(Math.random() * 10000) + 1; 
    baseTime.setHours(baseTime.getHours() + 24 + randomOffset * 24); 
    baseTime.setMinutes(0, 0, 0);
    const baseIso = baseTime.toISOString();

    console.log('--- 1. ANÔNIMO ---');
    const resAnonSel = await anonClient.from('appointments').select('*');
    assert(resAnonSel.error === null && resAnonSel.data.length === 0, 'SELECT appointments → DENIED');
    const resAnonIns = await anonClient.from('appointments').insert([{ patient_id: patientId, professional_id: professionalId, scheduled_at: baseIso }]);
    assert(resAnonIns.error !== null, 'INSERT direto → DENIED');
    const resAnonUpd = await anonClient.from('appointments').update({ notes: 'test' }).eq('patient_id', patientId).select();
    assert(resAnonUpd.error === null && resAnonUpd.data.length === 0, 'UPDATE direto → DENIED');
    const resAnonDel = await anonClient.from('appointments').delete().eq('patient_id', patientId).select();
    assert(resAnonDel.error === null && resAnonDel.data.length === 0, 'DELETE direto → DENIED');

    console.log('\n--- 2. STAFF ---');
    const resStaffSel = await staffClient.from('appointments').select('*');
    assert(resStaffSel.error === null, 'SELECT appointments → ALLOWED');
    const resStaffIns = await staffClient.from('appointments').insert([{ patient_id: patientId, professional_id: professionalId, scheduled_at: baseIso }]);
    assert(resStaffIns.error !== null, 'INSERT direto → DENIED');
    const resStaffUpd = await staffClient.from('appointments').update({ notes: 'test' }).eq('patient_id', patientId).select();
    assert(resStaffUpd.error === null && resStaffUpd.data.length === 0, 'UPDATE direto → DENIED');
    const resStaffDel = await staffClient.from('appointments').delete().eq('patient_id', patientId).select();
    assert(resStaffDel.error === null && resStaffDel.data.length === 0, 'DELETE → DENIED');

    console.log('\n--- 3. ADMIN ---');
    const resAdminSel = await adminClient.from('appointments').select('*');
    assert(resAdminSel.error === null, 'SELECT appointments → ALLOWED');
    const resAdminIns = await adminClient.from('appointments').insert([{ patient_id: patientId, professional_id: professionalId, scheduled_at: baseIso }]);
    assert(resAdminIns.error !== null, 'INSERT direto → DENIED');
    const resAdminUpd = await adminClient.from('appointments').update({ notes: 'test' }).eq('patient_id', patientId).select();
    assert(resAdminUpd.error === null && resAdminUpd.data.length === 0, 'UPDATE direto → DENIED');
    const resAdminDel = await adminClient.from('appointments').delete().eq('patient_id', patientId).select();
    assert(resAdminDel.error === null && resAdminDel.data.length === 0, 'DELETE → DENIED');

    console.log('\n--- 4. CREATE APPOINTMENT ---');
    const createRes1 = await staffClient.rpc('create_appointment', {
        p_patient_id: patientId,
        p_procedure_id: procedureId,
        p_professional_id: professionalId,
        p_scheduled_at: baseIso,
        p_duration_minutes: 60
    });
    assert(createRes1.error === null, 'Criação válida → PASS');
    if (createRes1.error) console.error("Detalhes do erro na criação:", createRes1.error);
    const app1_id = createRes1.data;

    const { data: app1 } = await adminClient.from('appointments').select('created_by').eq('id', app1_id).single();
    assert(app1 && app1.created_by === staffId, 'created_by deve ser auth.uid()');

    const fakeId = '11111111-1111-1111-1111-111111111111';
    const invalidProf = await staffClient.rpc('create_appointment', { p_patient_id: patientId, p_procedure_id: procedureId, p_professional_id: fakeId, p_scheduled_at: baseIso, p_duration_minutes: 60 });
    assert(invalidProf.error !== null, 'Profissional inválido → DENIED');

    const invalidPatient = await staffClient.rpc('create_appointment', { p_patient_id: fakeId, p_procedure_id: procedureId, p_professional_id: professionalId, p_scheduled_at: baseIso, p_duration_minutes: 60 });
    assert(invalidPatient.error !== null, 'Paciente inválido → DENIED');

    const invalidDuration = await staffClient.rpc('create_appointment', { p_patient_id: patientId, p_procedure_id: procedureId, p_professional_id: professionalId, p_scheduled_at: baseIso, p_duration_minutes: 0 });
    assert(invalidDuration.error !== null, 'Duração inválida → DENIED');

    console.log('\n--- 5. CONCORRÊNCIA ---');
    const timeOverlap = new Date(baseTime.getTime() + 30 * 60 * 1000).toISOString(); // 10:30 (overlaps with 10:00-11:00)
    const createOverlap = await staffClient.rpc('create_appointment', { p_patient_id: patientId, p_procedure_id: procedureId, p_professional_id: professionalId, p_scheduled_at: timeOverlap, p_duration_minutes: 60 });
    assert(createOverlap.error !== null && createOverlap.error.message.includes('prevent_overlapping_appointments'), 'Horários parcialmente sobrepostos → BLOQUEADOS pelo PostgreSQL');

    const timeConsecutive = new Date(baseTime.getTime() + 60 * 60 * 1000).toISOString(); // 11:00 (consecutive to 10:00-11:00)
    const createConsecutive = await staffClient.rpc('create_appointment', { p_patient_id: patientId, p_procedure_id: procedureId, p_professional_id: professionalId, p_scheduled_at: timeConsecutive, p_duration_minutes: 60 });
    assert(createConsecutive.error === null, 'Horários exatamente consecutivos → PERMITIDOS');
    const appConsecutive_id = createConsecutive.data;

    console.log('\n--- 6. CANCELAMENTO ---');
    const cancelNoReason = await staffClient.rpc('cancel_appointment', { p_appointment_id: appConsecutive_id, p_reason: '' });
    assert(cancelNoReason.error !== null, 'Cancelamento sem motivo → DENIED');

    const cancelOk = await staffClient.rpc('cancel_appointment', { p_appointment_id: appConsecutive_id, p_reason: 'Desistência' });
    assert(cancelOk.error === null, 'SCHEDULED → CANCELLED → PASS');

    const { data: cancelledApp } = await adminClient.from('appointments').select('*').eq('id', appConsecutive_id).single();
    assert(cancelledApp.status === 'CANCELLED' && cancelledApp.cancelled_by === staffId && cancelledApp.cancelled_at !== null, 'cancelled_by = auth.uid() e cancelled_at preenchido');
    
    // Tentar criar em horário de um cancelado
    const createOverCancelled = await staffClient.rpc('create_appointment', { p_patient_id: patientId, p_procedure_id: procedureId, p_professional_id: professionalId, p_scheduled_at: timeConsecutive, p_duration_minutes: 60 });
    assert(createOverCancelled.error === null, 'Appointments CANCELLED não devem bloquear novo horário → PASS');
    const appOverCancelled_id = createOverCancelled.data;

    console.log('\n--- 7. NO-SHOW ---');
    const noShowOk = await staffClient.rpc('mark_appointment_no_show', { p_appointment_id: appOverCancelled_id });
    assert(noShowOk.error === null, 'SCHEDULED → NO_SHOW → PASS');
    
    const { data: noShowRecord } = await adminClient.from('patient_records').select('*').eq('appointment_id', appOverCancelled_id);
    assert(noShowRecord.length === 0, 'No-Show não deve criar patient_record');

    console.log('\n--- 8. CONCLUSÃO ---');
    const timeToComplete = new Date(baseTime.getTime() + 120 * 60 * 1000).toISOString();
    const createForComplete = await staffClient.rpc('create_appointment', { p_patient_id: patientId, p_procedure_id: procedureId, p_professional_id: professionalId, p_scheduled_at: timeToComplete, p_duration_minutes: 60 });
    const appToCompleteId = createForComplete.data;

    const completeOk = await staffClient.rpc('complete_appointment', { p_appointment_id: appToCompleteId, p_evolution_notes: 'Tudo certo', p_internal_notes: 'Paciente VIP' });
    assert(completeOk.error === null, 'SCHEDULED → COMPLETED → PASS');
    const recordId = completeOk.data;

    const { data: completedApp } = await adminClient.from('appointments').select('*').eq('id', appToCompleteId).single();
    assert(completedApp.status === 'COMPLETED' && completedApp.completed_by === staffId && completedApp.completed_at !== null, 'completed_by = auth.uid() e completed_at preenchido');

    const { data: patientRecord } = await adminClient.from('patient_records').select('*').eq('id', recordId).single();
    assert(patientRecord.appointment_id === appToCompleteId, 'Criar exatamente um patient_record com appointment_id correto');
    assert(patientRecord.procedure_name === (procedure ? procedure.title : null) && patientRecord.professional_name === professional.full_name && patientRecord.evolution_notes === 'Tudo certo', 'Procedimento, profissional e evolução corretos');

    console.log('\n--- 9. PROTEÇÃO DE STATUS ---');
    // COMPLETED -> SCHEDULED
    const prot1 = await staffClient.rpc('reschedule_appointment', { p_appointment_id: appToCompleteId, p_new_scheduled_at: baseIso, p_new_duration_minutes: 60 });
    assert(prot1.error !== null, 'COMPLETED → SCHEDULED → DENIED');
    // COMPLETED -> CANCELLED
    const prot2 = await staffClient.rpc('cancel_appointment', { p_appointment_id: appToCompleteId, p_reason: 'Test' });
    assert(prot2.error !== null, 'COMPLETED → CANCELLED → DENIED');
    // CANCELLED -> SCHEDULED
    const prot3 = await staffClient.rpc('reschedule_appointment', { p_appointment_id: appConsecutive_id, p_new_scheduled_at: baseIso, p_new_duration_minutes: 60 });
    assert(prot3.error !== null, 'CANCELLED → SCHEDULED → DENIED');
    // NO_SHOW -> SCHEDULED
    const prot4 = await staffClient.rpc('reschedule_appointment', { p_appointment_id: appOverCancelled_id, p_new_scheduled_at: baseIso, p_new_duration_minutes: 60 });
    assert(prot4.error !== null, 'NO_SHOW → SCHEDULED → DENIED');
    
    console.log('\n--- 10. REAGENDAMENTO ---');
    const timeToResch = new Date(baseTime.getTime() + 180 * 60 * 1000).toISOString();
    const createForResch = await staffClient.rpc('create_appointment', { p_patient_id: patientId, p_procedure_id: procedureId, p_professional_id: professionalId, p_scheduled_at: timeToResch, p_duration_minutes: 60 });
    const appToReschId = createForResch.data;

    const newReschTime = new Date(baseTime.getTime() + 240 * 60 * 1000).toISOString();
    const reschOk = await staffClient.rpc('reschedule_appointment', { p_appointment_id: appToReschId, p_new_scheduled_at: newReschTime, p_new_duration_minutes: 60 });
    assert(reschOk.error === null, 'Reagendamento sem conflito → PASS');
    const newAppId = reschOk.data;

    const { data: oldReschApp } = await adminClient.from('appointments').select('*').eq('id', appToReschId).single();
    assert(oldReschApp.status === 'RESCHEDULED' && oldReschApp.rescheduled_to === newAppId, 'Original → RESCHEDULED, vínculo correto');
    const { data: newReschApp } = await adminClient.from('appointments').select('*').eq('id', newAppId).single();
    assert(newReschApp && newReschApp.status === 'SCHEDULED' && newReschApp.created_by === staffId, 'Novo → SCHEDULED e operação atômica');

    // RESCHEDULED -> SCHEDULED
    const prot5 = await staffClient.rpc('reschedule_appointment', { p_appointment_id: appToReschId, p_new_scheduled_at: baseIso, p_new_duration_minutes: 60 });
    assert(prot5.error !== null, 'RESCHEDULED → SCHEDULED → DENIED');

    console.log('\n--- 11. ROLLBACK ---');
    const timeToFailResch = new Date(baseTime.getTime() + 300 * 60 * 1000).toISOString();
    const createForFailResch = await staffClient.rpc('create_appointment', { p_patient_id: patientId, p_procedure_id: procedureId, p_professional_id: professionalId, p_scheduled_at: timeToFailResch, p_duration_minutes: 60 });
    const appToFailReschId = createForFailResch.data;

    // Try to reschedule to 'baseIso' which is occupied by app1_id
    const failResch = await staffClient.rpc('reschedule_appointment', { p_appointment_id: appToFailReschId, p_new_scheduled_at: baseIso, p_new_duration_minutes: 60 });
    assert(failResch.error !== null, 'Forçar falha durante o reagendamento por choque de horário → DENIED');
    
    const { data: failReschCheck } = await adminClient.from('appointments').select('*').eq('id', appToFailReschId).single();
    assert(failReschCheck.status === 'SCHEDULED', 'Nenhuma alteração parcial (Original continua SCHEDULED)');

    console.log(`\n=== FASE 2.6 RESULTADO: TOTAL ${stats.total} | PASS ${stats.pass} | FAIL ${stats.fail} ===`);
    if (stats.fail > 0) process.exit(1);
}

runTests();
