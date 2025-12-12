import React from 'react';
import Card from '../components/common/Card';
import { Icon } from '../components/icons/Icon';

const AccessibilityIcon = () => <Icon className="h-16 w-16 text-primary mx-auto mb-4"><path d="M12 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"></path><path d="M12 14v7"></path><path d="M5 11v1a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-1"></path><path d="M18.5 18.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"></path><path d="M5.5 18.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"></path></Icon>;

const Accessibility: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-xl md:text-3xl font-bold mb-6 text-gray-900 dark:text-white">Política de Acessibilidade</h1>
      <Card>
        <div className="p-6">
          <div className="text-center mb-8">
            <AccessibilityIcon />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Compromisso do Vigil com a Acessibilidade</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Última atualização: 12 de dezembro de 2025
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
              No Vigil, estamos empenhados em tornar nossa plataforma acessível a todos, 
              independentemente de suas habilidades ou deficiências. Acreditamos que todos 
              devem ter a oportunidade de explorar teorias e se conectar com a comunidade.
            </p>
          </div>

          <div className="text-left space-y-6">
            <section>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">1. Nosso Compromisso</h3>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p>O Vigil está comprometido em garantir acessibilidade digital para pessoas com deficiências. Estamos continuamente melhorando a experiência do usuário para todos e aplicando os padrões de acessibilidade relevantes.</p>
                <p>Nosso objetivo é tornar o Vigil acessível para o maior número possível de usuários, independentemente de tecnologia ou habilidade.</p>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">2. Conformidade com Padrões</h3>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p>Estamos trabalhando para estar em conformidade com:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li><strong>WCAG 2.1 Nível AA:</strong> Web Content Accessibility Guidelines</li>
                  <li><strong>Seção 508:</strong> Padrões de acessibilidade do governo americano</li>
                  <li><strong>EN 301 549:</strong> Padrão europeu de acessibilidade</li>
                  <li><strong>Lei Brasileira de Inclusão (LBI):</strong> Estatuto da Pessoa com Deficiência</li>
                </ul>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">3. Recursos de Acessibilidade Implementados</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">3.1 Navegação por Teclado</h4>
                  <ul className="list-disc list-inside ml-4 space-y-1 text-gray-700 dark:text-gray-300">
                    <li>Todos os elementos interativos são acessíveis via teclado</li>
                    <li>Ordem lógica de navegação com Tab</li>
                    <li>Indicadores visuais claros de foco</li>
                    <li>Atalhos de teclado para funções principais</li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">3.2 Suporte a Leitores de Tela</h4>
                  <ul className="list-disc list-inside ml-4 space-y-1 text-gray-700 dark:text-gray-300">
                    <li>Marcação semântica adequada (HTML5)</li>
                    <li>Atributos ARIA para elementos complexos</li>
                    <li>Texto alternativo descritivo para imagens</li>
                    <li>Rótulos claros para formulários e controles</li>
                    <li>Anúncios de mudanças dinâmicas de conteúdo</li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">3.3 Design Visual Acessível</h4>
                  <ul className="list-disc list-inside ml-4 space-y-1 text-gray-700 dark:text-gray-300">
                    <li>Contraste de cores conforme WCAG AA (4.5:1 para texto normal)</li>
                    <li>Texto redimensionável até 200% sem perda de funcionalidade</li>
                    <li>Não dependência apenas de cor para transmitir informações</li>
                    <li>Modo escuro para reduzir fadiga visual</li>
                    <li>Fontes legíveis e espaçamento adequado</li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">3.4 Conteúdo Multimídia</h4>
                  <ul className="list-disc list-inside ml-4 space-y-1 text-gray-700 dark:text-gray-300">
                    <li>Legendas para vídeos (quando aplicável)</li>
                    <li>Transcrições para conteúdo de áudio</li>
                    <li>Controles de reprodução acessíveis</li>
                    <li>Alternativas textuais para gráficos e infográficos</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">4. Tecnologias Assistivas Suportadas</h3>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p>O Vigil foi testado e é compatível com:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li><strong>Leitores de Tela:</strong> NVDA, JAWS, VoiceOver, TalkBack</li>
                  <li><strong>Navegação por Voz:</strong> Dragon NaturallySpeaking</li>
                  <li><strong>Magnificadores de Tela:</strong> ZoomText, MAGic</li>
                  <li><strong>Navegadores com Alto Contraste:</strong> Modo de alto contraste do Windows</li>
                  <li><strong>Dispositivos Móveis:</strong> Recursos de acessibilidade do iOS e Android</li>
                </ul>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">5. Funcionalidades Específicas do Vigil</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">5.1 Posts e Interações</h4>
                  <ul className="list-disc list-inside ml-4 space-y-1 text-gray-700 dark:text-gray-300">
                    <li>Botões de like, comentar e compartilhar com rótulos descritivos</li>
                    <li>Contadores de interação anunciados por leitores de tela</li>
                    <li>Formulários de criação de posts totalmente acessíveis</li>
                    <li>Navegação clara entre posts e comentários</li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">5.2 Comunidades e Navegação</h4>
                  <ul className="list-disc list-inside ml-4 space-y-1 text-gray-700 dark:text-gray-300">
                    <li>Estrutura de navegação consistente e previsível</li>
                    <li>Breadcrumbs para orientação de localização</li>
                    <li>Filtros e busca acessíveis por teclado</li>
                    <li>Indicadores claros de status de comunidade (pública/privada)</li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">5.3 Chat e Mensagens</h4>
                  <ul className="list-disc list-inside ml-4 space-y-1 text-gray-700 dark:text-gray-300">
                    <li>Notificações de novas mensagens para leitores de tela</li>
                    <li>Navegação por teclado em conversas</li>
                    <li>Indicadores de status de mensagem (enviada, lida)</li>
                    <li>Campos de entrada com rótulos claros</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">6. Processo de Melhoria Contínua</h3>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p>Nosso compromisso com a acessibilidade é contínuo:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li><strong>Auditorias Regulares:</strong> Avaliações trimestrais de acessibilidade</li>
                  <li><strong>Testes com Usuários:</strong> Feedback de usuários com deficiências</li>
                  <li><strong>Treinamento da Equipe:</strong> Capacitação contínua em acessibilidade</li>
                  <li><strong>Atualizações Incrementais:</strong> Melhorias baseadas em feedback e novos padrões</li>
                </ul>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">7. Cronograma de Melhorias</h3>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p><strong>Curto Prazo (próximos 3 meses):</strong></p>
                <ul className="list-disc list-inside ml-4 space-y-1 mb-3">
                  <li>Implementação completa de ARIA labels em todos os componentes</li>
                  <li>Melhoria dos indicadores de foco visual</li>
                  <li>Otimização para leitores de tela móveis</li>
                </ul>
                
                <p><strong>Médio Prazo (próximos 6 meses):</strong></p>
                <ul className="list-disc list-inside ml-4 space-y-1 mb-3">
                  <li>Implementação de modo de alto contraste personalizado</li>
                  <li>Adição de atalhos de teclado avançados</li>
                  <li>Suporte aprimorado para magnificadores de tela</li>
                </ul>

                <p><strong>Longo Prazo (próximo ano):</strong></p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Certificação WCAG 2.1 AA completa</li>
                  <li>Implementação de recursos de acessibilidade cognitiva</li>
                  <li>Suporte para tecnologias assistivas emergentes</li>
                </ul>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">8. Alternativas para Conteúdo Inacessível</h3>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p>Quando o conteúdo não puder ser totalmente acessível, fornecemos:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Descrições textuais detalhadas para elementos visuais complexos</li>
                  <li>Formatos alternativos para documentos (texto simples, áudio)</li>
                  <li>Resumos de conteúdo multimídia</li>
                  <li>Contato direto para assistência personalizada</li>
                </ul>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">9. Feedback e Suporte</h3>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p>Valorizamos seu feedback sobre a acessibilidade do Vigil:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li><strong>E-mail:</strong> accessibility@vigil.com</li>
                  <li><strong>Formulário de Feedback:</strong> Disponível nas configurações da conta</li>
                  <li><strong>Telefone:</strong> [Número a ser definido] (horário comercial)</li>
                  <li><strong>Chat de Suporte:</strong> Disponível 24/7 com suporte a tecnologias assistivas</li>
                </ul>
                <p>Responderemos a todas as consultas de acessibilidade em até 48 horas.</p>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">10. Conformidade Legal</h3>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p>Estamos comprometidos em cumprir todas as leis de acessibilidade aplicáveis:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li><strong>Brasil:</strong> Lei Brasileira de Inclusão (Lei 13.146/2015)</li>
                  <li><strong>Estados Unidos:</strong> Americans with Disabilities Act (ADA)</li>
                  <li><strong>União Europeia:</strong> European Accessibility Act</li>
                  <li><strong>Internacional:</strong> Convenção da ONU sobre os Direitos das Pessoas com Deficiência</li>
                </ul>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">11. Recursos Adicionais</h3>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p>Para ajudá-lo a usar o Vigil de forma mais eficaz:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li><strong>Guia de Acessibilidade:</strong> Tutorial detalhado sobre recursos acessíveis</li>
                  <li><strong>Atalhos de Teclado:</strong> Lista completa disponível pressionando Ctrl+?</li>
                  <li><strong>Configurações de Acessibilidade:</strong> Painel dedicado nas configurações da conta</li>
                  <li><strong>Documentação Técnica:</strong> Para desenvolvedores de tecnologias assistivas</li>
                </ul>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">12. Contato</h3>
              <div className="space-y-2 text-gray-700 dark:text-gray-300">
                <p><strong>Coordenador de Acessibilidade:</strong> accessibility@vigil.com</p>
                <p><strong>Empresa:</strong> Vigil Technologies Ltd.</p>
                <p><strong>Endereço:</strong> [Endereço da empresa a ser definido]</p>
                <p><strong>Telefone:</strong> [Número a ser definido]</p>
              </div>
            </section>

            <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <AccessibilityIcon />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200">Compromisso Contínuo</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    A acessibilidade é uma jornada contínua. Estamos comprometidos em melhorar constantemente 
                    a experiência para todos os usuários. Se você encontrar alguma barreira ou tiver sugestões, 
                    por favor, entre em contato conosco.
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

export default Accessibility;