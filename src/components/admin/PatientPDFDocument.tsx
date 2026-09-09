import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { Patient, Anamnesis, PatientRecord } from '../../types/patient';
import { Appointment } from '../../services/appointmentsService';

const formatPhone = (phone: string | null): string => {
  if (!phone) return 'Não informado';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 7)}-${cleaned.substring(7, 11)}`;
  }
  if (cleaned.length === 10) {
    return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 6)}-${cleaned.substring(6, 10)}`;
  }
  return phone;
};

// Formata e limpa os valores de texto vindos do banco
const formatText = (value: any): string => {
  if (value === null || value === undefined) return '';
  
  let parsedValue = value;
  
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        parsedValue = JSON.parse(trimmed);
      } catch (e) {
        parsedValue = value;
      }
    }
  }

  const formatObject = (obj: any): string => {
    if (Array.isArray(obj)) {
      return obj.length > 0 ? obj.join(', ') : '';
    }
    if (obj && typeof obj === 'object' && 'answer' in obj) {
      const ans = obj.answer;
      if (ans === 'Não' || ans === 'Nunca') {
        return obj.details ? `${ans} (${obj.details})` : (ans === 'Não' ? 'Não possui' : 'Nunca realizou');
      }
      if (ans === 'Sim' || ans === 'Sim, recentemente' || ans === 'Sim, há algum tempo') {
        return obj.details ? `${ans}: ${obj.details}` : ans;
      }
      return ans;
    }
    return typeof obj === 'object' ? JSON.stringify(obj) : String(obj);
  };

  let text = '';
  if (typeof parsedValue === 'object') {
    text = formatObject(parsedValue);
  } else {
    text = String(parsedValue).trim();
  }

  // Remove rótulos sujos legados
  text = text.replace(/^Resultado desejado:\s*/i, '');
  text = text.replace(/^Expectativa:\s*/i, '');
  text = text.replace(/^Hábitos:\s*/i, '');
  text = text.replace(/^Doença Autoimune:\s*/i, '');
  
  if (text.length === 0 || text === 'null' || text === 'undefined' || text === 'Não informado.' || text === 'Não informado') return '';
  
  let formatted = text.charAt(0).toUpperCase() + text.slice(1);
  if (!formatted.endsWith('.') && formatted.length > 3) {
    formatted += '.';
  }
  return formatted;
};

// Combina dados do formulário e da avaliação profissional de forma inteligente
const combineData = (val1: any, val2: any): string => {
  const t1 = formatText(val1);
  const t2 = formatText(val2);
  
  if (!t1 && !t2) return '';
  if (t1 && !t2) return t1;
  if (!t1 && t2) return t2;
  
  // Se forem muito parecidos, retorna o mais detalhado
  if (t1.toLowerCase().includes(t2.toLowerCase())) return t1;
  if (t2.toLowerCase().includes(t1.toLowerCase())) return t2;
  
  // Se forem diferentes, combina de forma elegante
  return `${t1} | ${t2}`;
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingBottom: 60,
    paddingHorizontal: 45,
    fontFamily: 'Helvetica',
    backgroundColor: '#FFFFFF', // Fundo claro e limpo
  },
  watermarkContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: -1,
  },
  watermarkImage: {
    width: 250,
    opacity: 0.05,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 0.5,
    borderBottomColor: '#B69A54',
    paddingBottom: 15,
    marginBottom: 25
  },
  headerLeft: {
    flex: 1
  },
  headerRight: {
    alignItems: 'flex-end'
  },
  documentType: {
    fontFamily: 'Times-Roman',
    fontSize: 12,
    color: '#B69A54',
    textTransform: 'uppercase',
    letterSpacing: 2
  },
  documentSubtitle: {
    fontSize: 9,
    color: '#666666',
    marginTop: 4,
    letterSpacing: 0.5
  },
  patientNameBlock: {
    marginBottom: 25,
  },
  patientName: {
    fontFamily: 'Times-Roman',
    fontSize: 22,
    color: '#2C363F',
    marginBottom: 6,
  },
  patientMeta: {
    fontSize: 9,
    color: '#666666',
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    lineHeight: 1.5
  },
  patientMetaItem: {
    marginRight: 6
  },
  section: {
    marginBottom: 15,
    wrap: false
  },
  sectionTitle: {
    fontFamily: 'Times-Roman',
    fontSize: 11,
    color: '#B69A54',
    borderBottomWidth: 0.5,
    borderBottomColor: '#E6DFD3',
    paddingBottom: 4,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 1
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  block: {
    marginBottom: 8,
    marginRight: 15,
    flex: 1,
    minWidth: '45%',
    wrap: false
  },
  blockFull: {
    marginBottom: 8,
    width: '100%',
    wrap: false
  },
  blockLabel: {
    fontSize: 8,
    color: '#999999',
    textTransform: 'uppercase',
    marginBottom: 2,
    fontWeight: 'bold',
    letterSpacing: 0.5
  },
  blockValue: {
    fontSize: 10,
    color: '#2C363F',
    lineHeight: 1.4
  },
  // Tabela Histórico
  table: {
    width: '100%',
    marginTop: 5
  },
  tableHeaderRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#B69A54',
    paddingBottom: 4,
    marginBottom: 6
  },
  tableHeaderCell: {
    fontSize: 8,
    color: '#B69A54',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#F0EBE1',
    paddingVertical: 6,
    wrap: false
  },
  tableCellDate: { width: '15%', fontSize: 9, color: '#666666' },
  tableCellProc: { width: '30%', fontSize: 9, color: '#2C363F', fontWeight: 'bold' },
  tableCellProf: { width: '20%', fontSize: 9, color: '#666666' },
  tableCellObs: { width: '35%', fontSize: 9, color: '#2C363F', lineHeight: 1.4 },
  
  footer: {
    position: 'absolute',
    bottom: 25,
    left: 45,
    right: 45,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 0.5,
    borderTopColor: '#E6DFD3',
    paddingTop: 8
  },
  footerText: {
    fontSize: 8,
    color: '#999999',
    fontFamily: 'Helvetica',
  }
});

interface PatientPDFProps {
  patient: Patient;
  anamnesis: Anamnesis | null;
  records: PatientRecord[];
  appointments: Appointment[];
  originRequest?: any | null;
}

const Block = ({ label, value, fullWidth = false }: { label: string, value: string, fullWidth?: boolean }) => {
  if (!value) return null;
  return (
    <View style={fullWidth ? styles.blockFull : styles.block}>
      <Text style={styles.blockLabel}>{label}</Text>
      <Text style={styles.blockValue}>{value}</Text>
    </View>
  );
};

export const PatientPDFDocument: React.FC<PatientPDFProps> = ({ 
  patient, 
  anamnesis, 
  records, 
  appointments, 
  originRequest 
}) => {
  const cData = originRequest?.clinical_data || {};
  
  const vObjective = formatText(cData.desired_procedures || originRequest?.procedure_interest);
  const vConcerns = formatText(
    cData.main_concerns?.map((item: string) => 
      item === 'Outro' && cData.main_concerns_other 
        ? `Outro: ${cData.main_concerns_other}` 
        : item
    )
  );
  
  // Os labels podem estar sujos no campo, usamos fallback para a chave de expectativa 
  const vResult = formatText(cData.desired_result) || formatText(cData.habits); 
  const vExpectation = formatText(cData.consultation_expectation) || formatText(cData.habits);
  
  const vHealth = combineData(anamnesis?.relevant_diseases, cData.health_conditions?.map((item: string) => 
    item === 'Outra' && cData.health_condition_other ? `Outra: ${cData.health_condition_other}` : item
  ));
  const vAllergies = combineData(anamnesis?.allergies, cData.allergies);
  const vMeds = combineData(anamnesis?.medications, cData.continuous_medication);
  const vPregnancy = formatText(cData.pregnancy_breastfeeding);
  
  const vPrevProc = combineData(anamnesis?.previous_procedures, cData.previous_procedures);
  const vFillers = formatText(cData.existing_fillers);
  
  const vNotes = formatText(anamnesis?.professional_notes);

  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        
        {/* MARCA D'ÁGUA DE FUNDO (todas as páginas) */}
        <View style={styles.watermarkContainer} fixed>
          <Image src="/logo.png" style={styles.watermarkImage} />
        </View>
        
        {/* CABEÇALHO */}
        <View style={styles.header} fixed>
          <View style={styles.headerLeft}>
            <Text style={styles.documentType}>Ficha do Paciente</Text>
            <Text style={styles.documentSubtitle}>Ferrer Innovare Clinic</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.documentSubtitle}>Documento Clínico Interno</Text>
          </View>
        </View>

        {/* 1. DADOS DO PACIENTE */}
        <View style={styles.patientNameBlock}>
          <Text style={styles.patientName}>{patient.full_name}</Text>
          <View style={styles.patientMeta}>
            <Text style={styles.patientMetaItem}>Tel: {formatPhone(patient.phone)} • </Text>
            {patient.email && <Text style={styles.patientMetaItem}>E-mail: {patient.email} • </Text>}
            {patient.birth_date && <Text style={styles.patientMetaItem}>Nasc: {new Date(patient.birth_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })} • </Text>}
            {patient.cpf && <Text style={styles.patientMetaItem}>CPF: {patient.cpf}</Text>}
          </View>
        </View>

        {/* 2. PRÉ-CONSULTA */}
        {(vObjective || vConcerns || vResult || vExpectation) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pré-Consulta</Text>
            <View style={styles.row}>
              <Block label="Objetivo / Procedimento de Interesse" value={vObjective} fullWidth />
              <Block label="Principais Incômodos" value={vConcerns} fullWidth />
              <Block label="Resultado Desejado" value={vResult} />
              <Block label="Expectativa da Avaliação" value={vExpectation} />
            </View>
          </View>
        )}

        {/* 3. HISTÓRICO CLÍNICO */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Histórico Clínico</Text>
          <View style={styles.row}>
            <Block label="Condições de Saúde" value={vHealth || 'Não informado'} fullWidth />
            <Block label="Alergias" value={vAllergies || 'Não possui alergias registradas'} fullWidth />
            <Block label="Medicamentos de Uso Contínuo" value={vMeds || 'Não utiliza medicamentos'} fullWidth />
            <Block label="Gestação / Amamentação" value={vPregnancy || 'Não'} />
          </View>
        </View>

        {/* 4. HISTÓRICO ESTÉTICO */}
        {(vPrevProc || vFillers) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Histórico Estético</Text>
            <View style={styles.row}>
              <Block label="Procedimentos Anteriores" value={vPrevProc} fullWidth />
              <Block label="Preenchimentos / Produtos Existentes" value={vFillers} fullWidth />
            </View>
          </View>
        )}

        {/* 5. OBSERVAÇÕES */}
        {vNotes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Observações Profissionais</Text>
            <Block label="Anotações" value={vNotes} fullWidth />
          </View>
        )}

        {/* 6. HISTÓRICO DE ATENDIMENTOS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Histórico de Atendimentos</Text>
          
          {records.length > 0 ? (
            <View style={styles.table}>
              <View style={styles.tableHeaderRow} fixed>
                <Text style={[styles.tableHeaderCell, { width: '15%' }]}>Data</Text>
                <Text style={[styles.tableHeaderCell, { width: '30%' }]}>Procedimento</Text>
                <Text style={[styles.tableHeaderCell, { width: '20%' }]}>Profissional</Text>
                <Text style={[styles.tableHeaderCell, { width: '35%' }]}>Observações</Text>
              </View>
              
              {records.map(record => (
                <View key={record.id} style={styles.tableRow}>
                  <Text style={styles.tableCellDate}>
                    {new Date(record.record_date).toLocaleDateString('pt-BR')}
                  </Text>
                  <Text style={styles.tableCellProc}>
                    {record.procedure_name || 'Atendimento Geral'}
                  </Text>
                  <Text style={styles.tableCellProf}>
                    {record.professional_name || '-'}
                  </Text>
                  <Text style={styles.tableCellObs}>
                    {record.evolution_notes || '-'}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.blockValue}>Nenhum atendimento realizado até o momento.</Text>
          )}
        </View>

        {/* RODAPÉ DINÂMICO */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            Ferrer Innovare | Documento de uso interno | Gerado em {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}
          </Text>
          <Text style={styles.footerText} render={({ pageNumber, totalPages }) => (
            `Página ${pageNumber} de ${totalPages}`
          )} />
        </View>

      </Page>
    </Document>
  );
};
