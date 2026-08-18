import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { CLINIC_WHATSAPP } from '../../config/constants';

export const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-clinic-bg pt-24 pb-24 px-6 sm:px-8 lg:px-12">
      <div className="max-w-3xl mx-auto">
        
        {/* Back Link */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-[10px] md:text-xs font-semibold tracking-[0.2em] uppercase text-clinic-textSecondary hover:text-clinic-goldDark transition-colors duration-300 group mb-12"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform duration-300" />
          Voltar para o início
        </Link>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-16"
        >
          <span className="block text-[10px] font-semibold tracking-[0.3em] uppercase text-clinic-goldDark mb-4">
            Informações Legais
          </span>
          <h1 className="font-serif text-3xl md:text-5xl text-clinic-textPrimary leading-tight">
            Política de Privacidade
          </h1>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
          className="text-clinic-textSecondary font-light leading-relaxed text-[15px] md:text-[16px] space-y-6"
        >
          <p>
            A Ferrer Innovare Clinic valoriza a privacidade de seus pacientes e visitantes. Esta Política de Privacidade explica como coletamos, usamos, protegemos e tratamos as informações pessoais inseridas em nosso site, em conformidade com as diretrizes de proteção de dados.
          </p>

          <h2 className="font-serif text-2xl md:text-3xl text-clinic-textPrimary mt-12 mb-6">1. Dados Coletados</h2>
          <p>
            Coletamos apenas as informações estritamente necessárias para a prestação de nossos serviços de saúde e estética. Os dados são coletados exclusivamente quando você os fornece de forma voluntária ao:
          </p>
          <ul className="list-disc pl-6 space-y-3 mt-4 mb-8">
            <li>Preencher o formulário de contato para agendamento (nome, e-mail, telefone e mensagem).</li>
            <li>Preencher a ficha de anamnese digital (dados pessoais, histórico de saúde e clínico).</li>
            <li>Entrar em contato via WhatsApp.</li>
          </ul>

          <h2 className="font-serif text-2xl md:text-3xl text-clinic-textPrimary mt-12 mb-6">2. Uso das Informações</h2>
          <p>
            Os dados coletados são utilizados para os seguintes fins:
          </p>
          <ul className="list-disc pl-6 space-y-3 mt-4 mb-8">
            <li>Viabilizar e gerenciar o agendamento de consultas e procedimentos.</li>
            <li>Permitir uma avaliação clínica precisa, garantindo a sua saúde e segurança durante os tratamentos propostos.</li>
            <li>Estabelecer comunicação direta sobre seu atendimento.</li>
          </ul>
          <p>
            <strong className="font-semibold text-clinic-textPrimary">Nenhum dado é utilizado para envio de spam, marketing não autorizado ou comercializado com terceiros.</strong>
          </p>

          <h2 className="font-serif text-2xl md:text-3xl text-clinic-textPrimary mt-12 mb-6">3. Armazenamento e Segurança</h2>
          <p>
            As informações fornecidas através de nossos formulários são armazenadas de forma segura em banco de dados protegido. O acesso a essas informações é estritamente restrito à Dra. Patrícia Santana e à equipe administrativa e clínica diretamente envolvida no seu atendimento, que tratam as informações sob sigilo profissional.
          </p>

          <h2 className="font-serif text-2xl md:text-3xl text-clinic-textPrimary mt-12 mb-6">4. Compartilhamento de Dados</h2>
          <p>
            A Ferrer Innovare Clinic não compartilha, vende ou cede seus dados pessoais a terceiros, exceto quando exigido por determinação legal, judicial ou regulatória.
          </p>

          <h2 className="font-serif text-2xl md:text-3xl text-clinic-textPrimary mt-12 mb-6">5. Cookies e Tecnologias de Rastreamento</h2>
          <p>
            Nosso site pode utilizar cookies essenciais para garantir o funcionamento técnico da plataforma (como manutenção de sessões seguras). Não utilizamos cookies intrusivos de publicidade ou rastreamento comportamental de terceiros.
          </p>

          <h2 className="font-serif text-2xl md:text-3xl text-clinic-textPrimary mt-12 mb-6">6. Seus Direitos</h2>
          <p>
            Você tem o direito de solicitar o acesso, a correção ou a exclusão dos seus dados pessoais mantidos por nós. Para exercer esses direitos, basta entrar em contato através dos nossos canais de atendimento. Note que certos dados clínicos podem precisar ser mantidos arquivados por determinação de conselhos profissionais de saúde.
          </p>

          <h2 className="font-serif text-2xl md:text-3xl text-clinic-textPrimary mt-12 mb-6">7. Contato</h2>
          <p>
            Caso tenha dúvidas sobre esta Política de Privacidade ou sobre como tratamos seus dados, entre em contato diretamente através do nosso WhatsApp oficial:
          </p>
          <p className="mt-6 mb-12">
            <a 
              href={`https://wa.me/${CLINIC_WHATSAPP}`}
              target="_blank" 
              rel="noopener noreferrer"
              className="text-clinic-goldDark hover:text-clinic-textPrimary transition-colors font-semibold"
            >
              WhatsApp: (11) 94274-9623
            </a>
          </p>
          
          <div className="mt-16 pt-8 border-t border-clinic-border/60 text-xs text-clinic-textSecondary/70 font-light">
            Última atualização: {new Date().toLocaleDateString('pt-BR')}
          </div>
        </motion.div>

      </div>
    </div>
  );
};
