import React from 'react';
import Card from '../components/common/Card';
import { Icon } from '../components/icons/Icon';

const FileTextIcon = () => <Icon className="h-16 w-16 text-primary mx-auto mb-4"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path><path d="M14 2v4a2 2 0 0 0 2 2h4"></path><path d="M10 9H8"></path><path d="M16 13H8"></path><path d="M16 17H8"></path></Icon>;

const TermsOfService: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-xl md:text-3xl font-bold mb-6 text-gray-900 dark:text-white">Termos de Serviço</h1>
      <Card>
        <div className="p-6">
          <div className="text-center mb-8">
            <FileTextIcon />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Termos de Serviço do Vigil</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Última atualização: 12 de dezembro de 2025
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
              Ao acessar ou usar o Vigil, você concorda em cumprir e estar vinculado a estes Termos de Serviço. 
              Por favor, leia-os atentamente antes de usar nossa plataforma.
            </p>
          </div>

          <div className="text-left space-y-6">
            <section>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">1. Definições</h3>
              <div className="space-y-2 text-gray-700 dark:text-gray-300">
                <p><strong>"Vigil"</strong> refere-se à plataforma de mídia social operada pela Vigil Technologies Ltd.</p>
                <p><strong>"Usuário"</strong> refere-se a qualquer pessoa que acesse ou use os serviços do Vigil.</p>
                <p><strong>"Conteúdo"</strong> inclui posts, comentários, imagens, vídeos, áudios, enquetes e qualquer outro material compartilhado na plataforma.</p>
                <p><strong>"Serviços Premium"</strong> refere-se aos planos pagos Basic ($3.99), Pro ($8.99) e Premium ($19.99).</p>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">2. Aceitação dos Termos</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Estes Termos de Serviço ("Termos") regem seu acesso e uso do aplicativo Vigil e de todos os serviços, 
                recursos, conteúdo e funcionalidades oferecidos por nós. Se você não concordar com estes Termos, 
                não use o Vigil. Você deve ter pelo menos 13 anos para usar nossos serviços.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">3. Descrição dos Serviços</h3>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p><strong>Posts e Interações:</strong> Criação de posts com texto (280-25.000 caracteres dependendo do plano), imagens, vídeos, áudio, enquetes e quadros de evidência para teorias. Sistema de likes, comentários e compartilhamentos.</p>
                <p><strong>Comunidades:</strong> Criação e participação em comunidades temáticas (disponível para usuários Pro e Premium).</p>
                <p><strong>Biblioteca:</strong> Acesso a e-books e documentos (disponível para usuários Pro e Premium).</p>
                <p><strong>Chat Rooms:</strong> Salas de chat em tempo real (disponível apenas para usuários Premium).</p>
                <p><strong>Timeline Histórica:</strong> Visualização interativa de eventos históricos.</p>
                <p><strong>Mensagens Privadas:</strong> Sistema de mensagens diretas entre usuários.</p>
                <p><strong>Notificações:</strong> Sistema de notificações em tempo real.</p>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">4. Planos e Assinaturas</h3>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p><strong>Free:</strong> 280 caracteres por post, com anúncios.</p>
                <p><strong>Basic ($3.99/mês):</strong> 1.000 caracteres, edição de posts.</p>
                <p><strong>Pro ($8.99/mês):</strong> 5.000 caracteres, acesso a comunidades e biblioteca, anúncios reduzidos.</p>
                <p><strong>Premium ($19.99/mês):</strong> 25.000 caracteres, criação de comunidades, chat rooms, sem anúncios.</p>
                <p>Os pagamentos são processados através do Stripe. As assinaturas são renovadas automaticamente e podem ser canceladas a qualquer momento.</p>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">5. Regras de Conduta</h3>
              <div className="space-y-2 text-gray-700 dark:text-gray-300">
                <p>Você concorda em não:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Publicar conteúdo ilegal, difamatório, obsceno, ameaçador ou que viole direitos de terceiros</li>
                  <li>Assediar, intimidar ou ameaçar outros usuários</li>
                  <li>Compartilhar informações falsas ou enganosas deliberadamente</li>
                  <li>Usar a plataforma para spam ou atividades comerciais não autorizadas</li>
                  <li>Tentar acessar contas de outros usuários ou comprometer a segurança da plataforma</li>
                  <li>Publicar teorias que incitem violência ou ódio contra grupos específicos</li>
                </ul>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">6. Conteúdo do Usuário e Propriedade Intelectual</h3>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p>Você mantém a propriedade de todo o conteúdo que publica no Vigil. No entanto, ao publicar conteúdo, você nos concede uma licença mundial, não exclusiva, livre de royalties para usar, reproduzir, modificar, adaptar, publicar, traduzir, distribuir e exibir tal conteúdo em conexão com nossos serviços.</p>
                <p>Você é responsável por garantir que possui todos os direitos necessários sobre o conteúdo que publica e que tal conteúdo não viola direitos de propriedade intelectual de terceiros.</p>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">7. Moderação e Remoção de Conteúdo</h3>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p>Reservamo-nos o direito de revisar, moderar e remover qualquer conteúdo que viole estes Termos ou nossas diretrizes da comunidade. Nosso sistema de moderação inclui:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Moderação automatizada para detectar conteúdo inadequado</li>
                  <li>Revisão manual por nossa equipe de moderação</li>
                  <li>Sistema de denúncias pelos usuários</li>
                  <li>Processo de apelação para decisões de moderação</li>
                </ul>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">8. Suspensão e Encerramento de Contas</h3>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p>Podemos suspender ou encerrar sua conta se você:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Violar repetidamente estes Termos ou nossas diretrizes</li>
                  <li>Envolver-se em atividades que comprometam a segurança da plataforma</li>
                  <li>Usar a plataforma para atividades ilegais</li>
                </ul>
                <p>Você pode encerrar sua conta a qualquer momento através das configurações da conta. Após o encerramento, seus dados serão tratados conforme nossa Política de Privacidade.</p>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">9. Limitações de Responsabilidade</h3>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p>O Vigil é fornecido "como está" e "conforme disponível". Não garantimos que o serviço será ininterrupto, seguro ou livre de erros. Na máxima extensão permitida por lei, não seremos responsáveis por:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Danos indiretos, incidentais, especiais ou consequenciais</li>
                  <li>Perda de lucros, dados ou oportunidades de negócio</li>
                  <li>Conteúdo publicado por outros usuários</li>
                  <li>Interrupções temporárias do serviço</li>
                </ul>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">10. Indenização</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Você concorda em indenizar e isentar o Vigil, suas afiliadas, diretores, funcionários e agentes de quaisquer reivindicações, responsabilidades, danos, perdas e despesas (incluindo honorários advocatícios) decorrentes do seu uso da plataforma ou violação destes Termos.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">11. Resolução de Disputas</h3>
              <div className="space-y-3 text-gray-700 dark:text-gray-300">
                <p>Qualquer disputa decorrente destes Termos será resolvida através de:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Negociação direta entre as partes</li>
                  <li>Mediação, se necessário</li>
                  <li>Arbitragem vinculante como último recurso</li>
                </ul>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">12. Alterações nos Termos</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Reservamo-nos o direito de modificar estes Termos a qualquer momento. Notificaremos você sobre alterações significativas através da plataforma ou por e-mail. O uso continuado dos serviços após as alterações constitui aceitação dos novos Termos.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">13. Lei Aplicável e Jurisdição</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Estes Termos são regidos pelas leis do Brasil, sem considerar conflitos de disposições legais. Qualquer ação legal relacionada a estes Termos será submetida à jurisdição exclusiva dos tribunais brasileiros.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">14. Contato</h3>
              <div className="space-y-2 text-gray-700 dark:text-gray-300">
                <p>Para questões relacionadas a estes Termos, entre em contato conosco:</p>
                <p><strong>E-mail:</strong> legal@vigil.com</p>
                <p><strong>Empresa:</strong> Vigil Technologies Ltd.</p>
                <p><strong>Endereço:</strong> [Endereço da empresa a ser definido]</p>
              </div>
            </section>

            <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                Ao usar o Vigil, você reconhece que leu, compreendeu e concorda em estar vinculado a estes Termos de Serviço.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TermsOfService;