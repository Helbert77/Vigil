import React from 'react';
import Card from '../components/common/Card';
import { Icon } from '../components/icons/Icon';

const ShieldCheckIcon = () => <Icon className="h-16 w-16 text-primary mx-auto mb-4"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="m9 12 2 2 4-4"></path></Icon>;

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-xl md:text-3xl font-bold mb-6 text-gray-900 dark:text-white">Política de Privacidade</h1>
      <Card>
        <div className="p-6">
          <div className="text-center mb-8">
            <ShieldCheckIcon />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Política de Privacidade do Vigil</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Última atualização: 12 de dezembro de 2025
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
              No Vigil, levamos sua privacidade a sério. Esta Política de Privacidade descreve como 
              coletamos, usamos e protegemos suas informações pessoais em conformidade com a LGPD, GDPR e CCPA.
            </p>
          </div>

          <div className="text-left space-y-6">
            <section>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">1. Informações que Coletamos</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">1.1 Informações Fornecidas Diretamente</h4>
                  <ul className="list-disc list-inside ml-4 space-y-1 text-gray-700 dark:text-gray-300">
                    <li>Dados de registro: nome de usuário, e-mail, senha (criptografada), data de nascimento</li>
                    <li>Informações de perfil: biografia, foto de perfil, localização (opcional)</li>
                    <li>Conteúdo: posts, comentários, mensagens privadas, uploads de mídia</li>
                    <li>Dados de pagamento: informações processadas pelo Stripe para assinaturas Premium</li>
                    <li>Comunicações: mensagens enviadas para nosso suporte</li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">1.2 Informações Coletadas Automaticamente</h4>
                  <ul className="list-disc list-inside ml-4 space-y-1 text-gray-700 dark:text-gray-300">
                    <li>Dados de uso: interações com posts, tempo gasto na plataforma, recursos utilizados</li>
                    <li>Informações técnicas: endereço IP, tipo de navegador, sistema operacional, dispositivo</li>
                    <li>Dados de localização: localização aproximada baseada no IP (se permitido)</li>
                    <li>Cookies e tecnologias similares: preferências, sessões, análise de uso</li>
                    <li>Logs de atividade: horários de acesso, ações realizadas na plataforma</li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">1.3 Informações de Terceiros</h4>
                  <ul className="list-disc list-inside ml-4 space-y-1 text-gray-700 dark:text-gray-300">
                    <li>Dados de autenticação social (se você optar por login com Google/Facebook)</li>
                    <li>Informações de pagamento do Stripe para processamento de assinaturas</li>
                    <li>Dados analíticos de provedores de serviços (Google Analytics, etc.)</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">2. Base Legal para Processamento (LGPD/GDPR)</h3>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p><strong>Consentimento:</strong> Para marketing, cookies não essenciais e dados opcionais</p>
                <p><strong>Execução de contrato:</strong> Para fornecer nossos serviços e processar pagamentos</p>
                <p><strong>Interesse legítimo:</strong> Para segurança, prevenção de fraudes e melhorias do serviço</p>
                <p><strong>Obrigação legal:</strong> Para cumprimento de leis aplicáveis</p>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">3. Como Usamos Suas Informações</h3>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p><strong>Operação dos Serviços:</strong> Fornecer funcionalidades do Vigil, processar transações, gerenciar contas</p>
                <p><strong>Personalização:</strong> Customizar sua experiência, recomendar conteúdo relevante, ajustar configurações</p>
                <p><strong>Comunicação:</strong> Enviar notificações, atualizações de serviço, suporte ao cliente</p>
                <p><strong>Segurança:</strong> Detectar fraudes, prevenir abuso, proteger a integridade da plataforma</p>
                <p><strong>Análise:</strong> Entender como os usuários interagem com a plataforma, melhorar recursos</p>
                <p><strong>Marketing:</strong> Enviar comunicações promocionais (apenas com consentimento)</p>
                <p><strong>Conformidade Legal:</strong> Cumprir obrigações legais e regulamentares</p>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">4. Compartilhamento de Informações</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">4.1 Não Vendemos Seus Dados</h4>
                  <p className="text-gray-700 dark:text-gray-300">Nunca vendemos suas informações pessoais a terceiros para fins comerciais.</p>
                </div>

                <div>
                  <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">4.2 Compartilhamento Autorizado</h4>
                  <ul className="list-disc list-inside ml-4 space-y-1 text-gray-700 dark:text-gray-300">
                    <li><strong>Provedores de Serviço:</strong> Stripe (pagamentos), Supabase (banco de dados), Google (analytics)</li>
                    <li><strong>Parceiros Publicitários:</strong> Dados agregados e anonimizados para anúncios relevantes</li>
                    <li><strong>Autoridades:</strong> Quando exigido por lei ou para proteger direitos legais</li>
                    <li><strong>Transferências Corporativas:</strong> Em caso de fusão, aquisição ou venda de ativos</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">5. Transferências Internacionais de Dados</h3>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p>Seus dados podem ser transferidos e processados em países fora do Brasil/UE. Garantimos proteção adequada através de:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Cláusulas contratuais padrão aprovadas pela Comissão Europeia</li>
                  <li>Certificações de adequação (Privacy Shield, etc.)</li>
                  <li>Medidas de segurança técnicas e organizacionais apropriadas</li>
                </ul>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">6. Retenção de Dados</h3>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p><strong>Dados de Conta:</strong> Mantidos enquanto sua conta estiver ativa</p>
                <p><strong>Conteúdo Público:</strong> Mantido indefinidamente, a menos que você solicite remoção</p>
                <p><strong>Dados de Pagamento:</strong> Mantidos conforme exigências fiscais (até 7 anos)</p>
                <p><strong>Logs de Segurança:</strong> Mantidos por até 2 anos para fins de segurança</p>
                <p><strong>Dados de Marketing:</strong> Mantidos até você retirar o consentimento</p>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">7. Seus Direitos de Privacidade</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">7.1 Direitos Universais</h4>
                  <ul className="list-disc list-inside ml-4 space-y-1 text-gray-700 dark:text-gray-300">
                    <li><strong>Acesso:</strong> Solicitar cópia dos seus dados pessoais</li>
                    <li><strong>Retificação:</strong> Corrigir dados imprecisos ou incompletos</li>
                    <li><strong>Exclusão:</strong> Solicitar remoção dos seus dados ("direito ao esquecimento")</li>
                    <li><strong>Portabilidade:</strong> Receber seus dados em formato estruturado</li>
                    <li><strong>Oposição:</strong> Opor-se ao processamento baseado em interesse legítimo</li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">7.2 Direitos Específicos por Jurisdição</h4>
                  <div className="space-y-2 text-gray-700 dark:text-gray-300">
                    <p><strong>GDPR (UE):</strong> Direito à limitação do processamento, direito de não ser sujeito a decisões automatizadas</p>
                    <p><strong>CCPA (Califórnia):</strong> Direito de saber, direito de deletar, direito de opt-out da venda</p>
                    <p><strong>LGPD (Brasil):</strong> Direito de confirmação, acesso, correção, anonimização, portabilidade</p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">8. Como Exercer Seus Direitos</h3>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p><strong>Configurações da Conta:</strong> Muitas opções estão disponíveis diretamente nas configurações</p>
                <p><strong>E-mail:</strong> Entre em contato conosco em privacy@vigil.com</p>
                <p><strong>Formulário Online:</strong> Use nosso formulário de solicitação de privacidade (em desenvolvimento)</p>
                <p><strong>Prazo de Resposta:</strong> Responderemos em até 30 dias (LGPD) ou 1 mês (GDPR)</p>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">9. Cookies e Tecnologias de Rastreamento</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">9.1 Tipos de Cookies</h4>
                  <ul className="list-disc list-inside ml-4 space-y-1 text-gray-700 dark:text-gray-300">
                    <li><strong>Essenciais:</strong> Necessários para o funcionamento básico da plataforma</li>
                    <li><strong>Funcionais:</strong> Lembram suas preferências e configurações</li>
                    <li><strong>Analíticos:</strong> Ajudam-nos a entender como você usa o Vigil</li>
                    <li><strong>Publicitários:</strong> Personalizam anúncios baseados em seus interesses</li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">9.2 Gerenciamento de Cookies</h4>
                  <p className="text-gray-700 dark:text-gray-300">Você pode gerenciar cookies através das configurações do seu navegador ou nossas configurações de privacidade.</p>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">10. Segurança dos Dados</h3>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p>Implementamos medidas técnicas e organizacionais para proteger seus dados:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Criptografia em trânsito (HTTPS/TLS) e em repouso</li>
                  <li>Controles de acesso rigorosos e autenticação multifator</li>
                  <li>Monitoramento contínuo de segurança e detecção de ameaças</li>
                  <li>Auditorias regulares de segurança e testes de penetração</li>
                  <li>Treinamento de funcionários em práticas de segurança</li>
                </ul>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">11. Notificação de Violação de Dados</h3>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p>Em caso de violação de dados que possa resultar em risco para seus direitos e liberdades:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Notificaremos as autoridades competentes em até 72 horas</li>
                  <li>Informaremos os usuários afetados sem demora desnecessária</li>
                  <li>Tomaremos medidas imediatas para conter e remediar a violação</li>
                  <li>Forneceremos orientações sobre medidas de proteção</li>
                </ul>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">12. Privacidade de Menores</h3>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p>Nossos serviços são destinados a usuários com 13 anos ou mais. Se descobrirmos que coletamos dados de menores de 13 anos sem consentimento parental adequado, tomaremos medidas para excluir essas informações.</p>
                <p>Para usuários entre 13-18 anos, implementamos proteções adicionais conforme exigido pelas leis aplicáveis.</p>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">13. Alterações nesta Política</h3>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p>Podemos atualizar esta Política periodicamente. Quando fizermos alterações significativas:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Notificaremos você através da plataforma ou por e-mail</li>
                  <li>Forneceremos um resumo das principais alterações</li>
                  <li>Solicitaremos novo consentimento quando exigido por lei</li>
                  <li>Manteremos versões anteriores disponíveis para consulta</li>
                </ul>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">14. Contato e Encarregado de Proteção de Dados</h3>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p><strong>Encarregado de Proteção de Dados (DPO):</strong> dpo@vigil.com</p>
                <p><strong>Questões de Privacidade:</strong> privacy@vigil.com</p>
                <p><strong>Empresa:</strong> Vigil Technologies Ltd.</p>
                <p><strong>Endereço:</strong> [Endereço da empresa a ser definido]</p>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">15. Autoridades de Supervisão</h3>
              <div className="space-y-2 text-gray-700 dark:text-gray-300">
                <p>Você tem o direito de apresentar reclamações às autoridades de proteção de dados:</p>
                <p><strong>Brasil:</strong> Autoridade Nacional de Proteção de Dados (ANPD)</p>
                <p><strong>União Europeia:</strong> Autoridade de proteção de dados do seu país</p>
                <p><strong>Califórnia:</strong> California Attorney General's Office</p>
              </div>
            </section>

            <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                Esta Política de Privacidade foi elaborada para garantir transparência sobre nossas práticas de dados e seu cumprimento com as leis de proteção de dados aplicáveis.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PrivacyPolicy;