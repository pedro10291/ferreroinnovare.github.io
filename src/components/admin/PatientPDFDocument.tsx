import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { Patient, Anamnesis, PatientRecord } from '../../types/patient';
import { Appointment } from '../../services/appointmentsService';

// Registrando fonte para evitar problemas de caracteres
Font.register({
  family: 'Open Sans',
  src: 'https://fonts.gstatic.com/s/opensans/v18/mem8YaGs126MiZpBA-UFVZ0e.ttf'
});

// Formatação de Dados
const formatPhone = (phone: string | null | undefined): string => {
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

const formatText = (value: any): string => {
  if (!value) return 'Não informado.';
  
  let text = '';
  // Trata arrays não semânticos (ex: ["fumo"])
  if (Array.isArray(value)) {
    if (value.length === 0) return 'Não informado.';
    text = value.join(', ');
  } else if (typeof value === 'string') {
    text = value.trim();
  } else {
    text = String(value);
  }

  if (text.length === 0) return 'Não informado.';
  
  // Capitaliza a primeira letra e adiciona ponto final se não houver
  let formatted = text.charAt(0).toUpperCase() + text.slice(1);
  if (!formatted.endsWith('.')) {
    formatted += '.';
  }
  return formatted;
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingBottom: 65,
    paddingHorizontal: 40,
    fontFamily: 'Open Sans',
    backgroundColor: '#FCFBF9'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#B69A54',
    paddingBottom: 15,
    marginBottom: 30
  },
  headerLeft: {
    flex: 1
  },
  headerRight: {
    alignItems: 'flex-end'
  },
  documentType: {
    fontFamily: 'Times-Roman',
    fontSize: 10,
    color: '#B69A54',
    textTransform: 'uppercase',
    letterSpacing: 1
  },
  documentSubtitle: {
    fontSize: 8,
    color: '#999999',
    marginTop: 2
  },
  patientNameBlock: {
    marginBottom: 30,
    alignItems: 'center'
  },
  patientName: {
    fontFamily: 'Times-Roman',
    fontSize: 24,
    color: '#2C363F',
    marginBottom: 8,
    textAlign: 'center'
  },
  patientMeta: {
    fontSize: 9,
    color: '#666666',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap'
  },
  patientMetaItem: {
    marginHorizontal: 4
  },
  section: {
    marginBottom: 25,
    wrap: true
  },
  sectionTitle: {
    fontFamily: 'Times-Roman',
    fontSize: 14,
    color: '#B69A54',
    borderBottomWidth: 0.5,
    borderBottomColor: '#E6DFD3',
    paddingBottom: 4,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1
  },
  block: {
    marginBottom: 10,
    wrap: false
  },
  blockLabel: {
    fontSize: 9,
    color: '#999999',
    textTransform: 'uppercase',
    marginBottom: 2,
    fontWeight: 'bold'
  },
  blockValue: {
    fontSize: 10,
    color: '#2C363F',
    lineHeight: 1.5
  },
  // Tabela Histórico
  table: {
    width: '100%',
    marginTop: 5
  },
  tableHeaderRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#B69A54',
    paddingBottom: 5,
    marginBottom: 8
  },
  tableHeaderCell: {
    fontSize: 8,
    color: '#B69A54',
    fontWeight: 'bold',
    textTransform: 'uppercase'
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#E6DFD3',
    paddingVertical: 8,
    wrap: false
  },
  tableCellDate: { width: '15%', fontSize: 9, color: '#666666' },
  tableCellProc: { width: '25%', fontSize: 9, color: '#2C363F', fontWeight: 'bold' },
  tableCellProf: { width: '20%', fontSize: 9, color: '#666666' },
  tableCellObs: { width: '40%', fontSize: 9, color: '#2C363F', lineHeight: 1.4 },
  
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 0.5,
    borderTopColor: '#E6DFD3',
    paddingTop: 10
  },
  footerText: {
    fontSize: 8,
    color: '#999999'
  }
});

interface PatientPDFProps {
  patient: Patient;
  anamnesis: Anamnesis | null;
  records: PatientRecord[];
  appointments: Appointment[];
}

export const PatientPDFDocument: React.FC<PatientPDFProps> = ({ patient, anamnesis, records, appointments }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        
        {/* CABEÇALHO (Repetido em todas as páginas nativamente pelo react-pdf se fixado ou simplesmente no topo da primeira) */}
        {/* Usamos fixed para o header aparecer em todas as páginas, caso desejado. Como a instrução era "repetir quando necessário", colocar fixed no header pode ser útil. Mas para manter o design flexível, deixaremos fixo apenas o footer, e o header no topo. */}
        <View style={styles.header} fixed>
          <View style={styles.headerLeft}>
            <Text style={styles.documentType}>Ficha do Paciente</Text>
            <Text style={styles.documentSubtitle}>Ferrer Innovare Clinic</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.documentSubtitle}>Documento Clínico Interno</Text>
          </View>
        </View>

        {/* IDENTIFICAÇÃO DO PACIENTE */}
        <View style={styles.patientNameBlock}>
          <Text style={styles.patientName}>{patient.full_name}</Text>
          <View style={styles.patientMeta}>
            <Text style={styles.patientMetaItem}>{formatPhone(patient.phone)}</Text>
            <Text style={styles.patientMetaItem}> • </Text>
            <Text style={styles.patientMetaItem}>{patient.email || 'E-mail não informado'}</Text>
            <Text style={styles.patientMetaItem}> • </Text>
            <Text style={styles.patientMetaItem}>Nasc: {patient.birth_date ? new Date(patient.birth_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'Não informado'}</Text>
            <Text style={styles.patientMetaItem}> • </Text>
            <Text style={styles.patientMetaItem}>CPF: {patient.cpf || 'Não informado'}</Text>
          </View>
        </View>

        {/* ANAMNESE */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Anamnese Atual</Text>
          {anamnesis ? (
            <>
              <View style={styles.block}>
                <Text style={styles.blockLabel}>Doenças Relevantes</Text>
                <Text style={styles.blockValue}>{formatText(anamnesis.relevant_diseases)}</Text>
              </View>
              <View style={styles.block}>
                <Text style={styles.blockLabel}>Alergias</Text>
                <Text style={styles.blockValue}>{formatText(anamnesis.allergies)}</Text>
              </View>
              <View style={styles.block}>
                <Text style={styles.blockLabel}>Medicamentos em Uso</Text>
                <Text style={styles.blockValue}>{formatText(anamnesis.medications)}</Text>
              </View>
              <View style={styles.block}>
                <Text style={styles.blockLabel}>Procedimentos Anteriores</Text>
                <Text style={styles.blockValue}>{formatText(anamnesis.previous_procedures)}</Text>
              </View>
              {anamnesis.professional_notes && (
                <View style={styles.block}>
                  <Text style={styles.blockLabel}>Observações Profissionais</Text>
                  <Text style={styles.blockValue}>{formatText(anamnesis.professional_notes)}</Text>
                </View>
              )}
            </>
          ) : (
            <Text style={styles.blockValue}>Nenhuma anamnese preenchida até o momento.</Text>
          )}
        </View>

        {/* HISTÓRICO DE ATENDIMENTOS (Tabela) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Histórico de Atendimentos</Text>
          
          {records.length > 0 ? (
            <View style={styles.table}>
              <View style={styles.tableHeaderRow} fixed>
                <Text style={[styles.tableHeaderCell, { width: '15%' }]}>Data</Text>
                <Text style={[styles.tableHeaderCell, { width: '25%' }]}>Procedimento</Text>
                <Text style={[styles.tableHeaderCell, { width: '20%' }]}>Profissional</Text>
                <Text style={[styles.tableHeaderCell, { width: '40%' }]}>Observações</Text>
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

        {/* RODAPÉ DINÂMICO (Em todas as páginas) */}
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
