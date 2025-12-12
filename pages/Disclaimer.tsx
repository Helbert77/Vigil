import React from 'react';
import Card from '../components/common/Card';
import { Icon } from '../components/icons/Icon';

const AlertTriangleIcon = () => <Icon className="h-16 w-16 text-red-500 mx-auto mb-4"><path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" x2="12" y1="9" y2="13"></line><line x1="12" x2="12.01" y1="17" y2="17"></line></Icon>;

const Disclaimer: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-xl md:text-3xl font-bold mb-6 text-gray-900 dark:text-white">Termos de Responsabilidade</h1>
      <Card>
        <div className="p-6">
          <div className="text-center mb-8">
            <AlertTriangleIcon />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Termos de Responsabilidade do Vigil</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Última atualização: 12 de dezembro de 2025
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
              Este documento estabelece as limitações de responsabilidade e isenções aplicáveis ao uso da plataforma Vigil. 
              Por favor, leia atentamente antes de usar nossos serviços.
            </p>
          </div>

          <div className="text-left space-y-6">
            <section>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">1. Natureza das Informações</h3>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p>As informações fornecidas no Vigil são apenas para fins de informação geral, discussão e entretenimento. Não garantimos a precisão, integridade, atualidade ou utilidade de qualquer informação na plataforma.</p>
                <p><strong>Importante:</strong> Qualquer confiança que você deposite em informações obtidas através do Vigil é estritamente por sua conta e risco.</p>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">2. Conteúdo Teórico e Especulativo</h3>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p>O Vigil é uma plataforma dedicada ao compartilhamento e discussão de teorias, especulações e análises. Reconhecemos expressamente que:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Teorias são por natureza especulativas e podem não refletir fatos verificados</li>
                  <li>Discussões podem incluir conteúdo controverso ou não comprovado</li>
                  <li>Diferentes usuários podem ter interpretações conflitantes dos mesmos eventos</li>
                  <li>O conteúdo pode evoluir à medida que novas informações se tornam disponíveis</li>
                </ul>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">3. Responsabilidade pelo Conteúdo do Usuário</h3>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p>As opiniões, teorias, análises e informações expressas pelos usuários são de sua exclusiva responsabilidade e não refletem necessariamente as opiniões, crenças ou posições do Vigil ou de seus operadores.</p>
                <p><strong>Não endossamos, verificamos ou garantimos:</strong></p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>A veracidade de qualquer teoria ou informação postada pelos usuários</li>
                  <li>A precisão de análises ou interpretações compartilhadas</li>
                  <li>A confiabilidade de fontes citadas pelos usuários</li>
                  <li>A adequação de qualquer conteúdo para fins específicos</li>
                </ul>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">4. Biblioteca de Conteúdo e Timeline Histórica</h3>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p>Nossos recursos de biblioteca e timeline histórica são fornecidos para fins educacionais e informativos:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>O conteúdo pode estar sujeito a direitos autorais de terceiros</li>
                  <li>Não garantimos a precisão histórica de todos os materiais</li>
                  <li>As interpretações históricas podem variar entre diferentes fontes</li>
                  <li>Alguns conteúdos podem estar desatualizados ou incompletos</li>
                </ul>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">5. Isenção de Aconselhamento Profissional</h3>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p>As informações no Vigil <strong>NÃO</strong> se destinam a ser, e não devem ser interpretadas como:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li><strong>Aconselhamento Legal:</strong> Não fornecemos orientação jurídica</li>
                  <li><strong>Aconselhamento Financeiro:</strong> Não oferecemos conselhos de investimento</li>
                  <li><strong>Aconselhamento Médico:</strong> Não fornecemos orientação médica ou de saúde</li>
                  <li><strong>Aconselhamento Psicológico:</strong> Não oferecemos terapia ou aconselhamento mental</li>
                  <li><strong>Aconselhamento Técnico:</strong> Não fornecemos orientação técnica profissional</li>
                </ul>
                <p><strong>Sempre procure o aconselhamento de profissionais qualificados</strong> para qualquer questão específica que possa ter.</p>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">6. Links Externos e Conteúdo de Terceiros</h3>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p>O Vigil pode conter links para sites externos e referências a conteúdo de terceiros:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Não controlamos nem endossamos o conteúdo de sites externos</li>
                  <li>Não somos responsáveis pela precisão ou confiabilidade de fontes externas</li>
                  <li>Links externos são fornecidos apenas para conveniência</li>
                  <li>O acesso a sites de terceiros é por sua própria conta e risco</li>
                </ul>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">7. Garantias de Disponibilidade do Serviço</h3>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p>Embora nos esforcemos para manter o Vigil disponível 24/7, não garantimos:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Disponibilidade ininterrupta dos serviços</li>
                  <li>Ausência de erros técnicos ou bugs</li>
                  <li>Compatibilidade com todos os dispositivos ou navegadores</li>
                  <li>Velocidade ou desempenho específicos</li>
                  <li>Backup ou recuperação de dados do usuário</li>
                </ul>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">8. Limitações de Responsabilidade</h3>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p>Na máxima extensão permitida por lei, o Vigil e seus operadores não serão responsáveis por:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li><strong>Danos Diretos:</strong> Perdas financeiras decorrentes do uso da plataforma</li>
                  <li><strong>Danos Indiretos:</strong> Perda de lucros, oportunidades ou dados</li>
                  <li><strong>Danos Consequenciais:</strong> Resultados de ações baseadas em conteúdo da plataforma</li>
                  <li><strong>Danos Punitivos:</strong> Penalidades ou multas relacionadas ao uso</li>
                  <li><strong>Danos Morais:</strong> Constrangimento ou danos à reputação</li>
                </ul>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">9. Indenização pelo Usuário</h3>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p>Você concorda em indenizar e isentar o Vigil, suas afiliadas, diretores, funcionários e agentes de quaisquer:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Reivindicações decorrentes do seu uso da plataforma</li>
                  <li>Violações destes Termos de Responsabilidade</li>
                  <li>Violações de direitos de terceiros</li>
                  <li>Conteúdo que você publica ou compartilha</li>
                  <li>Uso inadequado dos serviços Premium</li>
                </ul>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">10. Força Maior</h3>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p>Não seremos responsáveis por falhas ou atrasos no desempenho resultantes de circunstâncias além do nosso controle razoável, incluindo:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Desastres naturais, guerras, terrorismo</li>
                  <li>Falhas de infraestrutura de internet ou energia</li>
                  <li>Ações governamentais ou mudanças regulatórias</li>
                  <li>Ataques cibernéticos ou falhas de segurança de terceiros</li>
                  <li>Pandemias ou emergências de saúde pública</li>
                </ul>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">11. Modificações nos Serviços</h3>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p>Reservamo-nos o direito de:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Modificar, suspender ou descontinuar qualquer aspecto dos serviços</li>
                  <li>Alterar recursos disponíveis em diferentes planos</li>
                  <li>Implementar novas políticas ou procedimentos</li>
                  <li>Atualizar nossa infraestrutura técnica</li>
                </ul>
                <p>Faremos esforços razoáveis para notificar os usuários sobre mudanças significativas.</p>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">12. Jurisdição e Lei Aplicável</h3>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p>Estes Termos de Responsabilidade são regidos pelas leis do Brasil. Qualquer disputa relacionada a estes termos será submetida à jurisdição exclusiva dos tribunais brasileiros competentes.</p>
                <p>Se alguma disposição destes termos for considerada inválida, as disposições restantes permanecerão em pleno vigor.</p>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">13. Contato para Questões Legais</h3>
              <div className="space-y-2 text-gray-700 dark:text-gray-300">
                <p>Para questões relacionadas a estes Termos de Responsabilidade:</p>
                <p><strong>E-mail:</strong> legal@vigil.com</p>
                <p><strong>Empresa:</strong> Vigil Technologies Ltd.</p>
                <p><strong>Endereço:</strong> [Endereço da empresa a ser definido]</p>
              </div>
            </section>

            <div className="mt-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <Icon className="h-5 w-5 text-red-500">
                    <path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
                    <line x1="12" x2="12" y1="9" y2="13"></line>
                    <line x1="12" x2="12.01" y1="17" y2="17"></line>
                  </Icon>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-red-800 dark:text-red-200">Aviso Importante</h4>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                    Ao usar o Vigil, você reconhece que leu, compreendeu e concorda com todas as limitações de responsabilidade e isenções estabelecidas neste documento.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Disclaimer;