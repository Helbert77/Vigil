// Mapeamento de PRDs para seus conteúdos
// Em produção, isso poderia carregar os arquivos dinamicamente

export interface PRDContent {
  number: string;
  title: string;
  summary: string;
  fullContent?: string;
}

export const prdContents: Record<string, PRDContent> = {
  '01': {
    number: '01',
    title: 'Visão Geral do Sistema',
    summary: 'Arquitetura e funcionalidades principais do Vigil',
    fullContent: `O Vigil é uma plataforma social completa que combina recursos de rede social, comunicação em tempo real e conteúdo educacional. Aqui você pode criar posts, participar de comunidades, conversar com outros usuários e acessar conteúdo exclusivo.

O que você pode fazer no Vigil:

Publicar conteúdo: Crie posts com texto, imagens, vídeos, áudio, enquetes e quadros de evidências. Compartilhe suas ideias e interaja com a comunidade através de curtidas, comentários e compartilhamentos.

Participar de comunidades: Entre em comunidades temáticas sobre assuntos do seu interesse. Cada comunidade pode ter requisitos de acesso diferentes baseados no seu plano de assinatura.

Conversar em tempo real: Envie mensagens privadas para outros usuários ou participe de chat rooms públicas (disponível para assinantes Premium e Pro).

Explorar conteúdo histórico: Navegue pela timeline histórica interativa e aprenda sobre eventos importantes do passado.

Acessar biblioteca exclusiva: Assinantes têm acesso a e-books, artigos e documentos educacionais (disponível a partir do plano Basic).

Criar anúncios: Promova seu conteúdo ou negócio através do sistema de publicidade integrado.

Planos disponíveis:
- Free: Acesso básico a todas as funcionalidades principais
- Basic (R$ 9,90/mês): Comunidades Basic + Biblioteca básica
- Premium (R$ 19,90/mês): Chat Rooms + Biblioteca completa
- Pro (R$ 39,90/mês): Todos os recursos + Dashboard de publicidade

Para começar, explore o feed principal, participe de comunidades e personalize seu perfil nas configurações.`
  },
  '02': {
    number: '02',
    title: 'Autenticação e Conta',
    summary: 'Sistema de login, registro e recuperação de senha',
    fullContent: `Como criar sua conta e fazer login no Vigil:

Criar uma nova conta:
1. Clique em "Criar conta" na página inicial
2. Preencha seu email, escolha um nome de usuário único e crie uma senha forte
3. Você receberá um email de confirmação - clique no link para ativar sua conta
4. Pronto! Sua conta está criada e você já pode começar a usar o Vigil

Fazer login:
Digite seu email ou nome de usuário e sua senha. Sua sessão ficará ativa mesmo se você fechar o navegador, então você não precisará fazer login toda vez que acessar o Vigil.

Esqueceu sua senha?
1. Clique em "Esqueci minha senha" na tela de login
2. Digite seu email cadastrado
3. Você receberá um email com um link para redefinir sua senha
4. O link é válido por 1 hora - crie uma nova senha e faça login normalmente

Dicas de segurança:
- Use uma senha forte com letras, números e símbolos
- Não compartilhe sua senha com ninguém
- Se suspeitar que sua conta foi comprometida, altere sua senha imediatamente nas configurações

Sua conta e dados estão protegidos com criptografia de ponta. Todas as senhas são armazenadas de forma segura e nunca são compartilhadas.

Precisa de ajuda? Entre em contato com suporte@myvigil.co`
  },
  '03': {
    number: '03',
    title: 'Navegação e Interface',
    summary: 'Layout, menus e navegação do aplicativo',
    fullContent: `Como navegar pelo Vigil e encontrar o que você precisa:

No topo da página você encontra:
- Logo do Vigil (clique para voltar ao feed principal)
- Barra de busca para encontrar posts, pessoas e comunidades
- Ícone de notificações (sino) mostrando suas interações recentes
- Sua foto de perfil com menu de opções rápidas

Menu lateral esquerdo (Sidebar):
Aqui estão os principais atalhos para navegar pelo app:
- Home: Feed principal com posts de quem você segue
- Perfil: Seu perfil pessoal
- Comunidades: Todas as comunidades disponíveis
- Mensagens: Conversas privadas
- Chat Rooms: Salas de chat (Premium)
- Biblioteca: Conteúdo educacional (Basic+)
- Timeline: Linha do tempo histórica
- Configurações: Ajustes da sua conta

Barra lateral direita (Rightbar):
Mostra tópicos em alta no momento e sugestões de pessoas para seguir. É uma ótima forma de descobrir conteúdo novo e interessante.

No celular:
A navegação fica na parte inferior da tela para facilitar o acesso com uma mão. Os ícones principais ficam sempre visíveis enquanto você navega.

Temas:
Você pode alternar entre modo claro e escuro nas configurações. O modo escuro é o padrão e ajuda a reduzir o cansaço visual, especialmente à noite.

O Vigil foi projetado para funcionar perfeitamente em qualquer dispositivo - computador, tablet ou celular.`
  },
  '04': {
    number: '04',
    title: 'Sistema de Posts',
    summary: 'Criação e interação com posts',
    fullContent: `Como criar e interagir com posts no Vigil:

Criar um novo post:
1. Clique no botão "+" no topo do feed ou no campo "No que você está pensando?"
2. Escreva seu texto (até 5000 caracteres)
3. Adicione conteúdo extra se desejar:
   - Fotos: Clique no ícone de imagem para adicionar uma ou várias fotos
   - Vídeo: Adicione vídeos do seu dispositivo
   - Áudio: Grave ou envie arquivos de áudio
   - Enquete: Crie uma votação com até 4 opções e defina a duração
   - Quadro de Evidências: Organize informações em cards visuais
4. Clique em "Publicar"

Dica: Se começar a criar uma enquete ou quadro de evidências e mudar de ideia, use o botão "Cancelar" que aparece para voltar ao post normal.

Interagir com posts:
- Curtir: Clique no coração para mostrar que gostou
- Comentar: Compartilhe sua opinião ou responda ao post
- Compartilhar: Republique o post no seu perfil
- Salvar: Guarde o post para ler depois (ícone de marcador)
- Reportar: Denuncie conteúdo inadequado

Recursos especiais:
- Use # para criar hashtags e tornar seu post mais fácil de encontrar
- Use @ para mencionar outros usuários
- Marque conteúdo sensível para adicionar um aviso antes de exibir
- Você pode editar seus posts após publicar

Onde seu post aparece:
Escolha se seu post será público (todos veem), apenas para seguidores, ou em uma comunidade específica.

Seus posts são sua voz no Vigil - compartilhe ideias, opiniões e conteúdo que agregue valor à comunidade!`
  },
  '05': {
    number: '05',
    title: 'Comunidades',
    summary: 'Criação e participação em comunidades',
    fullContent: `Comunidades são espaços dedicados a temas específicos onde você pode se conectar com pessoas que compartilham seus interesses.

Como participar de uma comunidade:
1. Vá até a página "Comunidades" no menu lateral
2. Navegue pelas comunidades disponíveis ou use a busca
3. Clique em uma comunidade para ver mais detalhes
4. Clique em "Entrar" para se tornar membro
5. Agora você pode ver e criar posts nessa comunidade

Tipos de comunidades:
Algumas comunidades são públicas e abertas a todos. Outras requerem planos de assinatura específicos:
- Comunidades Free: Abertas para todos
- Comunidades Basic: Requerem plano Basic ou superior
- Comunidades Premium: Requerem plano Premium ou Pro
- Comunidades Pro: Apenas para assinantes Pro

Criar sua própria comunidade:
Se você tem um tema ou interesse específico, pode criar sua própria comunidade! Clique em "Criar Comunidade", escolha um nome, descrição e defina se ela será pública ou restrita a determinados planos.

Como moderador de comunidade você pode:
- Editar informações da comunidade
- Moderar posts e comentários
- Remover conteúdo inadequado
- Gerenciar membros

Dica: Administradores do Vigil têm acesso a todas as comunidades para garantir que as regras sejam seguidas.

Comunidades são o coração do Vigil - encontre a sua e faça parte de discussões significativas!`
  },
  '06': {
    number: '06',
    title: 'Mensagens Privadas',
    summary: 'Chat privado 1:1 em tempo real',
    fullContent: `Converse diretamente com outros usuários através de mensagens privadas.

Como enviar uma mensagem:
1. Clique no ícone de mensagens no menu lateral ou no header
2. Clique em "Nova mensagem" ou escolha uma conversa existente
3. Digite sua mensagem e pressione Enter ou clique em enviar
4. Você também pode enviar imagens clicando no ícone de imagem

As mensagens são entregues em tempo real - quando a outra pessoa estiver online, vocês podem conversar instantaneamente como em qualquer app de mensagens.

Recursos úteis:
- Veja quando a outra pessoa está digitando (aparece "digitando..." na conversa)
- Saiba se a pessoa está online ou quando foi vista pela última vez
- Todas as suas conversas ficam salvas no histórico
- Mensagens não lidas aparecem com um badge de notificação

Buscar conversas:
Use a barra de busca no topo da lista de mensagens para encontrar rapidamente uma conversa específica.

Privacidade e segurança:
- Se alguém estiver te incomodando, você pode bloquear o usuário nas configurações
- Você pode deletar conversas que não quer mais ver
- Reporte conversas inadequadas para nossa equipe de moderação

Notificações:
Você receberá notificações de novas mensagens mesmo quando não estiver usando o Vigil. Configure como quer receber essas notificações em Configurações > Notificações.

As mensagens privadas são perfeitas para conversas mais pessoais e diretas com outros membros da comunidade!`
  },
  '07': {
    number: '07',
    title: 'Chat Rooms',
    summary: 'Salas de chat públicas e privadas',
    fullContent: `Chat Rooms são salas de conversa em grupo onde você pode interagir com vários usuários ao mesmo tempo. Este recurso está disponível para assinantes Premium e Pro.

Como usar Chat Rooms:
1. Acesse "Chat Rooms" no menu lateral
2. Veja a lista de salas disponíveis
3. Clique em uma sala para entrar
4. Comece a conversar com os membros presentes

Tipos de salas:
- Salas Públicas: Qualquer assinante Premium ou Pro pode entrar
- Salas Privadas: Apenas membros convidados podem participar
- Salas Temporárias: Existem por 24 horas e depois desaparecem
- Salas Permanentes: Ficam sempre disponíveis

Indicadores especiais:
- 🌟 Nova: Salas criadas recentemente
- 🔥 Hot: Salas com muita atividade no momento

Recurso Radar (Geolocalização):
Se você permitir acesso à sua localização, poderá ver outros usuários próximos a você que também estão usando o Chat. É uma forma interessante de conectar com pessoas da sua região. Você pode ativar ou desativar isso a qualquer momento nas configurações de privacidade.

Membros online:
Veja quem está ativo na sala no momento. A lista de membros mostra todos os participantes presentes em tempo real.

Criar sua própria sala:
Assinantes Premium e Pro podem criar suas próprias salas de chat, públicas ou privadas, temporárias ou permanentes.

Moderação:
Moderadores de salas podem manter o ambiente saudável removendo mensagens inadequadas ou expulsando usuários que não seguem as regras.

Chat Rooms são perfeitos para discussões em grupo, eventos ao vivo e para conhecer novos membros da comunidade!`
  },
  '08': {
    number: '08',
    title: 'Notificações',
    summary: 'Sistema de notificações em tempo real',
    fullContent: `Fique por dentro de tudo que acontece no Vigil através do sistema de notificações.

O que você recebe notificações:
- Quando alguém curte seu post
- Quando alguém comenta em seu post
- Quando alguém te menciona usando @seunome
- Quando alguém começa a te seguir
- Quando você recebe uma mensagem privada
- Quando alguém responde seu comentário
- Quando há novos posts em comunidades que você segue

Como ver suas notificações:
Clique no ícone de sino no topo da página. Um número vermelho mostra quantas notificações não lidas você tem. A lista mostra todas as suas notificações mais recentes em ordem cronológica.

Tipos de notificação:
- No app: Você vê um badge com o número de notificações não lidas
- Push: Receba alertas no seu dispositivo mesmo quando não estiver usando o Vigil
- Email: Receba resumos por email (você escolhe a frequência)

Personalizar notificações:
Vá em Configurações > Notificações para escolher:
- Quais tipos de notificação você quer receber
- Se quer sons e vibrações
- Com que frequência quer emails
- Definir um horário silencioso (ex: não receber notificações à noite)

Gerenciar notificações:
- Clique em uma notificação para ver o conteúdo relacionado
- Marque notificações como lidas
- Use "Limpar todas" para remover notificações antigas

As notificações ajudam você a se manter conectado e não perder nenhuma interação importante na plataforma!`
  },
  '09': {
    number: '09',
    title: 'Perfil do Usuário',
    summary: 'Visualização e edição de perfis',
    fullContent: `Seu perfil é sua identidade no Vigil - é como outros usuários te conhecem e encontram seu conteúdo.

O que aparece no seu perfil:
- Foto de perfil e banner (imagem de capa)
- Seu nome de exibição e nome de usuário (@seunome)
- Bio: Uma breve descrição sobre você
- Localização (opcional)
- Link para seu site ou redes sociais (opcional)
- Data em que você entrou no Vigil
- Seus posts mais recentes
- Estatísticas: número de posts, seguidores e pessoas que você segue

Badges especiais:
Alguns perfis exibem badges que indicam status especial:
- ✓ Verificado: Conta autêntica de figura pública
- Moderador: Membro da equipe de moderação
- Premium/Pro: Mostra seu plano de assinatura

Editar seu perfil:
1. Clique na sua foto de perfil e selecione "Perfil"
2. Clique em "Editar perfil"
3. Altere sua foto, banner, bio e outras informações
4. Clique em "Salvar"

Ver perfis de outros usuários:
Clique no nome ou foto de qualquer usuário para ver o perfil dele. Lá você pode:
- Ver todos os posts públicos da pessoa
- Seguir ou deixar de seguir
- Enviar uma mensagem privada
- Bloquear (se necessário)
- Reportar (se houver conteúdo inadequado)

Privacidade:
Nas configurações você pode definir se seu perfil é público (qualquer um vê) ou privado (apenas seguidores aprovados veem seus posts).

Seu perfil é sua vitrine no Vigil - mantenha-o atualizado e interessante!`
  },
  '10': {
    number: '10',
    title: 'Busca Avançada',
    summary: 'Sistema de busca de posts, usuários e comunidades',
    fullContent: `Encontre rapidamente o que você procura no Vigil usando a busca avançada.

Como buscar:
Use a barra de busca no topo da página. Digite qualquer palavra-chave e pressione Enter. Você pode buscar por:
- Posts: Encontre posts que contenham determinadas palavras ou hashtags
- Usuários: Procure pessoas pelo nome ou nome de usuário
- Comunidades: Encontre comunidades por nome ou descrição
- Hashtags: Veja todas as hashtags populares

Refinar sua busca:
Depois de fazer uma busca, você pode usar filtros para encontrar exatamente o que precisa:
- Filtrar por data: Hoje, esta semana, este mês ou este ano
- Filtrar por tipo: Posts com imagens, vídeos, enquetes, etc.
- Filtrar por comunidade: Ver apenas resultados de uma comunidade específica
- Filtrar por usuário: Ver apenas posts de um usuário específico

Ordenar resultados:
Escolha se quer ver os resultados mais relevantes primeiro ou os mais recentes.

Recursos inteligentes:
- Autocomplete: Enquanto você digita, sugestões aparecem automaticamente
- Histórico: Suas buscas recentes ficam salvas para acesso rápido
- Sugestões de hashtags: Veja hashtags relacionadas ao que você está buscando

Dicas de busca:
- Use # antes de uma palavra para buscar apenas por hashtag (ex: #tecnologia)
- Use @ antes de um nome para buscar usuários (ex: @joao)
- Coloque frases entre aspas para buscar a frase exata (ex: "inteligência artificial")

A busca é atualizada constantemente, então você sempre encontrará o conteúdo mais recente!`
  },
  '11': {
    number: '11',
    title: 'Biblioteca de Conteúdo',
    summary: 'E-books, artigos e documentos exclusivos',
    fullContent: `A Biblioteca do Vigil oferece acesso a conteúdo educacional exclusivo para assinantes. É como ter uma biblioteca digital sempre à mão!

O que você encontra na biblioteca:
- E-books em PDF e EPUB sobre diversos temas
- Artigos longos e aprofundados
- Documentos técnicos e acadêmicos
- Vídeos educacionais
- Podcasts e audiobooks

Categorias disponíveis:
História, Política, Ciência, Tecnologia, Filosofia, Literatura e muito mais. Todo o conteúdo é cuidadosamente selecionado para agregar valor e conhecimento.

Como usar a biblioteca:
1. Acesse "Biblioteca" no menu lateral
2. Navegue pelas categorias ou use a busca
3. Clique em um item para ver detalhes
4. Leia online ou faça download para ler offline

Recursos úteis:
- Marque suas páginas favoritas com marcadores
- Faça anotações enquanto lê
- Seu progresso de leitura é salvo automaticamente
- Adicione itens aos favoritos para encontrar rapidamente depois

Acesso por plano:
- Plano Basic: Acesso à biblioteca básica com conteúdo essencial
- Plano Premium: Acesso completo a toda a biblioteca
- Plano Pro: Todo o conteúdo Premium + materiais exclusivos e acesso antecipado a novos lançamentos

A biblioteca é atualizada regularmente com novo conteúdo. É uma excelente ferramenta para aprendizado contínuo e desenvolvimento pessoal!

Disponível para assinantes Basic, Premium e Pro.`
  },
  '12': {
    number: '12',
    title: 'Timeline Histórica',
    summary: 'Linha do tempo interativa de eventos',
    fullContent: `A Timeline Histórica é uma linha do tempo interativa que apresenta eventos importantes da história de forma visual e cronológica.

Como funciona:
Acesse "Timeline" no menu lateral para ver uma linha do tempo com eventos históricos organizados cronologicamente. Cada evento mostra:
- Data do acontecimento
- Título e descrição do evento
- Imagens relacionadas
- Links para fontes e mais informações

Navegar pela timeline:
Role a página para viajar no tempo. Você pode avançar ou voltar para explorar diferentes períodos históricos. Use o zoom para ver mais ou menos eventos ao mesmo tempo.

Tipos de eventos:
A timeline inclui diversos tipos de acontecimentos:
- Eventos políticos (eleições, tratados, guerras)
- Marcos culturais (movimentos artísticos, publicações importantes)
- Descobertas científicas
- Avanços tecnológicos
- Movimentos sociais

Filtrar eventos:
Use os filtros para ver apenas eventos de um período específico ou de uma categoria particular. Isso ajuda a focar no que você está estudando ou pesquisando.

Buscar eventos:
Use a busca para encontrar eventos específicos rapidamente. Digite uma palavra-chave e veja todos os eventos relacionados.

Interagir com eventos:
- Comente eventos para compartilhar sua perspectiva ou fazer perguntas
- Compartilhe eventos interessantes com seus seguidores
- Adicione eventos aos favoritos para consultar depois
- Sugira correções se encontrar informações imprecisas

Ferramenta educacional:
A Timeline é perfeita para estudantes, professores e qualquer pessoa interessada em história. Use-a para aprender, ensinar e discutir eventos históricos importantes.

Novos eventos são adicionados regularmente por nossa equipe de moderadores e administradores.`
  },
  '14': {
    number: '14',
    title: 'Dashboard de Publicidade',
    summary: 'Criação e gerenciamento de anúncios',
    fullContent: `Promova seu conteúdo, produto ou serviço no Vigil através do sistema de publicidade integrado.

Como criar um anúncio:
1. Acesse "Publicidade" no menu ou vá em "Meus Anúncios"
2. Clique em "Criar Novo Anúncio"
3. Preencha as informações:
   - Título chamativo (até 100 caracteres)
   - Descrição do que você está promovendo
   - Adicione uma imagem ou vídeo atrativo
   - Insira o link para onde quer levar as pessoas
4. Defina seu orçamento:
   - Orçamento diário (quanto quer gastar por dia)
   - Duração da campanha (quantos dias o anúncio ficará ativo)
5. Envie para aprovação

Aprovação de anúncios:
Todos os anúncios passam por uma revisão da nossa equipe antes de serem publicados. Isso garante que o conteúdo está adequado e segue nossas diretrizes. Você receberá uma notificação quando seu anúncio for aprovado ou se precisar de ajustes.

Acompanhar performance:
No Dashboard de Publicidade você vê métricas detalhadas de cada anúncio:
- Impressões: Quantas vezes seu anúncio foi exibido
- Clicks: Quantas pessoas clicaram no seu anúncio
- Taxa de cliques (CTR): Porcentagem de pessoas que clicaram
- Engajamento: Interações totais com o anúncio
- Custo Total: Quanto você gastou até agora
- CPC Médio: Custo médio por cada clique

Filtrar resultados:
Escolha ver métricas de um anúncio específico ou de todos os seus anúncios juntos. Você também pode filtrar por período para ver a performance em dias específicos.

Gráfico de performance:
Um gráfico mostra a evolução diária das suas impressões e clicks, ajudando você a entender quando seu anúncio performa melhor.

Status dos anúncios:
- Pendente: Aguardando aprovação da equipe
- Ativo: Sendo exibido para usuários
- Pausado: Temporariamente parado (você pode reativar)
- Encerrado: Campanha finalizada
- Rejeitado: Não aprovado (veja o motivo e ajuste)

Gerenciar anúncios:
Você pode pausar, editar ou encerrar seus anúncios a qualquer momento. Ajuste sua estratégia baseado nos resultados que está vendo.

O sistema de publicidade está disponível para todos os usuários do Vigil!`
  },
  '15': {
    number: '15',
    title: 'Moderação',
    summary: 'Sistema de moderação e appeals',
    fullContent: `O Vigil mantém um ambiente saudável e seguro através de um sistema de moderação ativo.

Como reportar conteúdo inadequado:
Se você encontrar um post, comentário ou usuário que viole nossas regras:
1. Clique nos três pontos (...) no conteúdo
2. Selecione "Reportar"
3. Escolha o motivo do report
4. Adicione detalhes se necessário
5. Envie o report

Nossa equipe de moderação revisará o report em até 24 horas.

O que é considerado violação:
- Spam ou conteúdo repetitivo
- Discurso de ódio ou discriminação
- Assédio ou bullying
- Conteúdo adulto não marcado
- Desinformação deliberada
- Violação de direitos autorais
- Ameaças ou incitação à violência

Ações de moderação:
Dependendo da gravidade da violação, nossa equipe pode:
- Remover o conteúdo específico
- Enviar um aviso ao usuário
- Suspender a conta temporariamente
- Banir permanentemente em casos graves

Sistema de Appeals (Contestação):
Se você recebeu uma ação de moderação e acredita que foi um erro:
1. Acesse "Appeals" nas configurações
2. Selecione a ação que quer contestar
3. Explique por que acredita que foi injusto
4. Envie o appeal

Nossa equipe revisará seu caso e responderá em até 48 horas. Se o appeal for aceito, a ação será revertida.

Equipe de moderação:
- Administradores: Acesso total ao sistema de moderação
- Moderadores: Revisam reports e tomam ações
- Moderadores de comunidade: Moderam comunidades específicas

Transparência:
Você sempre receberá uma notificação explicando qualquer ação de moderação tomada em seu conteúdo ou conta, incluindo o motivo específico.

Ajude a manter o Vigil seguro reportando conteúdo inadequado quando encontrar!`
  },
  '17': {
    number: '17',
    title: 'Planos e Assinaturas',
    summary: 'Sistema de planos Premium, Pro e Basic',
    fullContent: `O Vigil oferece diferentes planos para atender suas necessidades. Escolha o que melhor se encaixa no seu uso!

Plano Free (Gratuito):
Perfeito para começar e conhecer a plataforma:
- Crie posts ilimitados
- Participe de comunidades públicas
- Envie mensagens privadas
- Use a busca básica
- Acesse o feed principal

Plano Basic - R$ 9,90/mês:
Para quem quer mais recursos:
- Tudo do plano Free
- Acesso a comunidades Basic
- Biblioteca básica de conteúdo
- Experiência sem anúncios
- Suporte prioritário

Plano Premium - R$ 19,90/mês:
Para usuários engajados:
- Tudo do plano Basic
- Acesso a Chat Rooms
- Biblioteca completa
- Badge Premium no perfil
- Suporte com resposta rápida
- Recursos exclusivos

Plano Pro - R$ 39,90/mês:
Para criadores e profissionais:
- Tudo do plano Premium
- Dashboard de publicidade completo
- Conteúdo exclusivo e early access
- Analytics avançado
- Badge Pro no perfil
- Suporte prioritário máximo

Como assinar:
1. Vá em Configurações > Premium
2. Escolha o plano desejado
3. Clique em "Assinar"
4. Preencha os dados do cartão de crédito
5. Confirme a assinatura

Pagamento seguro:
Usamos o Stripe, uma das plataformas de pagamento mais seguras do mundo. Seus dados de cartão são criptografados e nunca armazenados em nossos servidores.

Renovação automática:
Sua assinatura renova automaticamente todo mês. Você receberá um email alguns dias antes da renovação.

Cancelar assinatura:
Você pode cancelar a qualquer momento em Configurações > Premium > Gerenciar Assinatura. Você continuará tendo acesso aos recursos até o fim do período já pago.

Fazer upgrade ou downgrade:
Mudou de ideia? Você pode trocar de plano a qualquer momento. O upgrade é imediato. No downgrade, você mantém os benefícios até o fim do período atual.

Reembolso:
Se cancelar nos primeiros 7 dias, oferecemos reembolso proporcional. Entre em contato com suporte@myvigil.co

Experimente 7 dias grátis do plano Premium para conhecer todos os recursos!`
  },
  '18': {
    number: '18',
    title: 'Configurações',
    summary: 'Preferências, privacidade e bloqueios',
    fullContent: `Personalize sua experiência no Vigil através das configurações. Acesse pelo menu lateral ou clicando no seu avatar > Configurações.

Configurações de Conta:
- Editar perfil: Altere foto, banner, bio e outras informações
- Alterar senha: Mude sua senha a qualquer momento
- Email: Atualize seu email de contato
- Deletar conta: Remova permanentemente sua conta e dados

Privacidade:
Controle quem vê seu conteúdo e como interage com você:
- Perfil privado: Apenas seguidores aprovados veem seus posts
- Quem pode me seguir: Todos ou apenas quem você aprovar
- Quem pode me enviar mensagens: Todos, apenas seguidores, ou ninguém
- Compartilhamento de localização: Ative/desative para Chat Rooms

Notificações:
Escolha como e quando quer ser notificado:
- Push notifications: Alertas no dispositivo
- Email: Receba resumos por email (diário, semanal ou nunca)
- Sons e vibrações: Ative/desative feedback sonoro
- Horário silencioso: Defina um período sem notificações (ex: 22h às 7h)
- Por tipo: Escolha quais tipos de notificação quer receber

Aparência:
Personalize a interface:
- Tema: Escolha entre modo claro ou escuro
- Tamanho da fonte: Ajuste para melhor leitura
- Idioma: Selecione seu idioma preferido

Bloqueios e Filtros:
Controle o que você vê:
- Usuários bloqueados: Lista de pessoas que você bloqueou
- Palavras bloqueadas: Oculte posts com certas palavras
- Comunidades silenciadas: Não veja posts de comunidades específicas

Assinatura (se aplicável):
Gerencie seu plano:
- Veja seu plano atual e benefícios
- Histórico de pagamentos e faturas
- Fazer upgrade ou downgrade
- Cancelar assinatura

Segurança:
Monitore sua conta:
- Sessões ativas: Veja onde você está logado
- Atividade da conta: Histórico de logins
- Autenticação em dois fatores: Em breve para maior segurança

Dica: Revise suas configurações de privacidade regularmente para garantir que está compartilhando apenas o que deseja!`
  },
  '20': {
    number: '20',
    title: 'Sistema de Suporte',
    summary: 'Como criar tickets e obter ajuda',
    fullContent: `Precisa de ajuda? Nossa equipe de suporte está aqui para você!

Como abrir um ticket de suporte:
1. Clique no botão flutuante de suporte (ícone de fone de ouvido no canto inferior direito)
2. Preencha o formulário com:
   - Assunto: Resuma seu problema em poucas palavras
   - Descrição: Explique detalhadamente o que está acontecendo
   - Categoria: Escolha o tipo (Bug, Dúvida, Sugestão, Reclamação, etc.)
3. Clique em "Enviar Ticket"

Você receberá um email de confirmação com o número do seu ticket. Use esse número para acompanhar o status.

Tempo de resposta:
Nosso tempo de resposta varia de acordo com seu plano:
- Plano Free: Até 48 horas
- Plano Basic: Até 24 horas
- Plano Premium: Até 12 horas
- Plano Pro: Até 6 horas (prioridade máxima)

Acompanhar seu ticket:
Você receberá notificações quando nossa equipe responder. Você também pode acessar seus tickets abertos em Configurações > Suporte.

Outras formas de obter ajuda:
- Email direto: suporte@myvigil.co
- Central de Ajuda: Esta página com respostas para dúvidas comuns
- Comunidade: Faça perguntas na comunidade "Suporte Vigil"

Dicas para um atendimento mais rápido:
- Seja específico ao descrever o problema
- Inclua prints de tela se possível
- Mencione qual dispositivo e navegador você está usando
- Se for um bug, descreva os passos para reproduzir o problema
- Informe seu plano atual

Status do ticket:
- Aberto: Recebemos seu ticket
- Em análise: Nossa equipe está investigando
- Respondido: Enviamos uma resposta, aguardando seu retorno
- Resolvido: Problema solucionado
- Fechado: Ticket finalizado

Nossa equipe trabalha todos os dias para garantir que você tenha a melhor experiência no Vigil. Não hesite em nos contatar!`
  },
  '21': {
    number: '21',
    title: 'Políticas e Termos',
    summary: 'Privacidade, termos de serviço e cookies',
    fullContent: `Entenda como o Vigil funciona e como protegemos seus dados.

Termos de Serviço:
Define as regras de uso da plataforma, seus direitos e responsabilidades como usuário. Ao usar o Vigil, você concorda com estes termos. Principais pontos:
- Você é responsável pelo conteúdo que publica
- Você mantém os direitos sobre seu conteúdo, mas nos dá licença para exibi-lo
- Você deve ter pelo menos 13 anos para usar o Vigil
- Você não pode usar o Vigil para atividades ilegais
- Podemos remover conteúdo que viole nossas regras

Política de Privacidade:
Explica quais dados coletamos e como os usamos:
- Dados de cadastro: Email, nome, username
- Dados de uso: Posts, curtidas, comentários, comunidades
- Dados técnicos: IP, dispositivo, navegador
- Usamos seus dados apenas para melhorar sua experiência
- Nunca vendemos seus dados para terceiros
- Você pode solicitar uma cópia dos seus dados a qualquer momento
- Você pode deletar sua conta e todos os dados associados

Seus direitos (LGPD/GDPR):
- Direito de acessar seus dados
- Direito de corrigir dados incorretos
- Direito de deletar seus dados
- Direito de portar seus dados
- Direito de revogar consentimentos

Política de Cookies:
Usamos cookies para:
- Manter você logado
- Lembrar suas preferências
- Analisar como você usa o Vigil
- Melhorar sua experiência

Você pode desabilitar cookies no seu navegador, mas algumas funcionalidades podem não funcionar corretamente.

Política de Conteúdo:
Define o que é permitido e proibido no Vigil:
- Proibido: Spam, discurso de ódio, assédio, conteúdo ilegal
- Conteúdo adulto deve ser marcado apropriadamente
- Respeite direitos autorais
- Seja respeitoso com outros usuários

Acessibilidade:
Estamos comprometidos em tornar o Vigil acessível para todos. Se você encontrar barreiras de acessibilidade, entre em contato conosco.

Documentos completos:
Acesse os documentos legais completos através dos links no footer da página:
- Termos de Serviço
- Política de Privacidade
- Política de Cookies
- Política de Conteúdo
- Acessibilidade

Para questões legais específicas, entre em contato: legal@myvigil.co`
  },
  '22': {
    number: '22',
    title: 'Páginas Adicionais',
    summary: 'Posts salvos, tópicos em alta e outras funcionalidades',
    fullContent: `Descubra recursos adicionais que tornam sua experiência no Vigil ainda melhor!

Posts Salvos:
Encontrou um post interessante mas não tem tempo de ler agora? Salve para depois!
- Clique no ícone de marcador em qualquer post
- Acesse "Salvos" no menu lateral para ver todos os posts salvos
- Organize posts em coleções por tema
- Use a busca para encontrar posts salvos específicos
- Remova posts salvos quando não precisar mais

Tópicos em Alta:
Veja o que está sendo discutido agora no Vigil:
- Acesse "Tópicos em Alta" no menu ou na barra lateral direita
- Veja as hashtags mais populares do momento
- Filtre por período: última hora, hoje, esta semana
- Clique em qualquer hashtag para ver todos os posts relacionados
- Descubra novos conteúdos e participe das conversas do momento

Detalhes do Tópico:
Quando você clica em uma hashtag, vê:
- Todos os posts que usaram essa hashtag
- Estatísticas: quantos posts, quantas pessoas participando
- Opção de seguir o tópico para receber notificações de novos posts
- Ordenação por relevância ou data

Explorar Usuários:
Encontre pessoas interessantes para seguir:
- Sugestões baseadas em quem você já segue
- Usuários populares em categorias específicas
- Filtros por interesses
- Veja perfis e decida quem seguir

Sobre o Vigil:
Quer saber mais sobre a plataforma?
- História: Como o Vigil começou
- Missão e valores: O que nos motiva
- Equipe: Conheça quem faz o Vigil acontecer
- Contato: Formas de entrar em contato conosco

Splash Screen:
A tela de carregamento que você vê ao abrir o Vigil:
- Logo animado
- Carregamento dos seus dados
- Transição suave para o feed

Essas funcionalidades adicionais foram criadas para melhorar sua experiência e ajudar você a descobrir mais conteúdo relevante no Vigil!`
  }
};

export function getPRDContent(prdNumber: string): PRDContent | null {
  return prdContents[prdNumber] || null;
}

export function getAllPRDNumbers(): string[] {
  return Object.keys(prdContents);
}
