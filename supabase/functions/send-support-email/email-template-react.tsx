import {
  Body,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Row,
  Section,
  Tailwind,
  Text,
} from '@react-email/components';

interface SupportTicketEmailProps {
  ticketNumber?: string;
  userName?: string;
  userEmail?: string;
  userPlan?: 'free' | 'basic' | 'pro' | 'premium';
  priority?: 'low' | 'medium' | 'high';
  category?: 'technical' | 'billing' | 'feature' | 'other';
  subject?: string;
  description?: string;
  userId?: string;
  userAgent?: string;
  timestamp?: string;
  attachments?: Array<{ name: string }>;
}

export default function SupportTicketEmail({
  ticketNumber = 'A1B2C3D4',
  userName = 'Helbert Rosa',
  userEmail = 'helbert@example.com',
  userPlan = 'premium',
  priority = 'high',
  category = 'technical',
  subject = 'Erro ao fazer upload de imagem',
  description = 'Descrição detalhada do problema...',
  userId = 'uuid-123',
  userAgent = 'Mozilla/5.0...',
  timestamp = new Date().toISOString(),
  attachments = [],
}: SupportTicketEmailProps) {
  // Configurações de cores por plano
  const planConfig = {
    premium: {
      bg: 'bg-red-50',
      gradient: 'bg-[radial-gradient(circle_at_bottom_right,#dc2626_0%,transparent_60%)]',
      text: 'text-red-900',
      badge: 'bg-gradient-to-r from-red-500 to-red-600',
      border: 'border-red-500',
      emoji: '💎',
    },
    pro: {
      bg: 'bg-yellow-50',
      gradient: 'bg-[radial-gradient(circle_at_bottom_right,#f59e0b_0%,transparent_60%)]',
      text: 'text-yellow-900',
      badge: 'bg-gradient-to-r from-yellow-500 to-yellow-600',
      border: 'border-yellow-500',
      emoji: '⭐',
    },
    basic: {
      bg: 'bg-green-50',
      gradient: 'bg-[radial-gradient(circle_at_bottom_right,#10b981_0%,transparent_60%)]',
      text: 'text-green-900',
      badge: 'bg-gradient-to-r from-green-500 to-green-600',
      border: 'border-green-500',
      emoji: '✓',
    },
    free: {
      bg: 'bg-gray-50',
      gradient: 'bg-[radial-gradient(circle_at_bottom_right,#6b7280_0%,transparent_60%)]',
      text: 'text-gray-900',
      badge: 'bg-gradient-to-r from-gray-500 to-gray-600',
      border: 'border-gray-500',
      emoji: '○',
    },
  };

  const priorityConfig = {
    high: { emoji: '🔴', text: 'ALTA', color: 'text-red-600' },
    medium: { emoji: '🟡', text: 'MÉDIA', color: 'text-yellow-600' },
    low: { emoji: '🟢', text: 'BAIXA', color: 'text-green-600' },
  };

  const categoryConfig = {
    technical: { emoji: '🔧', text: 'Suporte Técnico' },
    billing: { emoji: '💳', text: 'Faturamento' },
    feature: { emoji: '💡', text: 'Sugestão de Feature' },
    other: { emoji: '📝', text: 'Outros' },
  };

  const plan = planConfig[userPlan];
  const priorityInfo = priorityConfig[priority];
  const categoryInfo = categoryConfig[category];

  // Iniciais do usuário
  const userInitials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Html>
      <Head />
      <Preview>Novo Ticket de Suporte #{ticketNumber} - {subject}</Preview>
      <Tailwind>
        <Body className="bg-gray-100 font-sans">
          <Container className="mx-auto w-full max-w-[680px] p-0">
            {/* Header */}
            <Section className="bg-gradient-to-br from-purple-600 to-purple-800 p-12 text-center">
              <Text className="m-0 text-6xl">🎫</Text>
              <Heading className="my-4 font-bold text-white text-4xl leading-tight">
                Novo Ticket de Suporte
              </Heading>
              <Text className="inline-block rounded-full bg-white/20 px-6 py-2 font-bold text-sm text-white tracking-wider backdrop-blur-sm">
                #{ticketNumber}
              </Text>
            </Section>

            {/* Status Badge */}
            <Section className="px-8 pt-8">
              <Text className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-green-500 to-green-600 px-5 py-2 font-semibold text-sm text-white shadow-lg">
                <span className="inline-block h-2 w-2 rounded-full bg-white"></span>
                Ticket Recebido
              </Text>
            </Section>

            {/* User Card */}
            <Section className={`mx-8 my-6 rounded-2xl ${plan.bg} ${plan.gradient} p-8`}>
              <Row className="mb-6 border-b-2 pb-6" style={{ borderColor: plan.border.replace('border-', '#') }}>
                <Column className="w-16">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-purple-800 font-bold text-2xl text-white shadow-lg">
                    {userInitials}
                  </div>
                </Column>
                <Column className="pl-4">
                  <Heading className="m-0 mb-1 font-bold text-gray-900 text-2xl">
                    {userName}
                  </Heading>
                  <Text className="m-0 text-gray-600 text-sm">{userEmail}</Text>
                </Column>
              </Row>

              <Row className="mt-6">
                <Column className="w-1/2 pr-2">
                  <Text className="m-0 mb-1 font-semibold text-gray-600 text-xs uppercase tracking-wider">
                    Plano
                  </Text>
                  <Text className={`inline-block rounded-xl ${plan.badge} px-4 py-2 font-bold text-sm text-white shadow-md`}>
                    {plan.emoji} {userPlan.toUpperCase()}
                  </Text>
                </Column>
                <Column className="w-1/2 pl-2">
                  <Text className="m-0 mb-1 font-semibold text-gray-600 text-xs uppercase tracking-wider">
                    Prioridade
                  </Text>
                  <Text className={`m-0 font-bold text-lg ${priorityInfo.color}`}>
                    {priorityInfo.emoji} {priorityInfo.text}
                  </Text>
                </Column>
              </Row>

              <Row className="mt-4">
                <Column className="w-1/2 pr-2">
                  <Text className="m-0 mb-1 font-semibold text-gray-600 text-xs uppercase tracking-wider">
                    Categoria
                  </Text>
                  <Text className="m-0 font-semibold text-gray-900 text-base">
                    {categoryInfo.emoji} {categoryInfo.text}
                  </Text>
                </Column>
                <Column className="w-1/2 pl-2">
                  <Text className="m-0 mb-1 font-semibold text-gray-600 text-xs uppercase tracking-wider">
                    Data/Hora
                  </Text>
                  <Text className="m-0 font-semibold text-gray-900 text-sm">
                    {new Date(timestamp).toLocaleString('pt-BR')}
                  </Text>
                </Column>
              </Row>
            </Section>

            {/* Subject Section */}
            <Section className="mx-8 my-6 rounded-2xl bg-gradient-to-br from-purple-600 to-purple-800 p-8 text-center shadow-lg">
              <Heading className="m-0 mb-2 font-semibold text-purple-200 text-sm uppercase tracking-wider">
                📋 Assunto
              </Heading>
              <Text className="m-0 font-bold text-2xl text-white leading-relaxed">
                {subject}
              </Text>
            </Section>

            {/* Description Section */}
            <Section className="mx-8 my-6 rounded-2xl border-2 border-gray-200 bg-white p-8">
              <Heading className="m-0 mb-4 font-bold text-gray-900 text-xl">
                💬 Descrição Detalhada
              </Heading>
              <Text className="m-0 whitespace-pre-wrap text-gray-700 text-base leading-relaxed">
                {description}
              </Text>
            </Section>

            {/* Attachments Section */}
            {attachments && attachments.length > 0 && (
              <Section className="mx-8 my-6 rounded-2xl bg-blue-50 p-8">
                <Heading className="m-0 mb-4 font-bold text-blue-900 text-xl">
                  📎 Anexos ({attachments.length})
                </Heading>
                {attachments.map((attachment, index) => (
                  <Row key={index} className="mb-3 rounded-xl border-2 border-blue-200 bg-white p-4">
                    <Column className="w-12">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-purple-800 text-xl text-white">
                        📄
                      </div>
                    </Column>
                    <Column className="pl-3">
                      <Text className="m-0 font-semibold text-gray-900 text-sm">
                        {attachment.name}
                      </Text>
                    </Column>
                  </Row>
                ))}
              </Section>
            )}

            {/* Technical Info Section */}
            <Section className="mx-8 my-6 rounded-2xl bg-gray-900 p-8">
              <Heading className="m-0 mb-4 font-bold text-gray-300 text-xl">
                🖥️ Informações Técnicas
              </Heading>
              <Text className="m-0 mb-2 font-mono text-gray-400 text-xs">
                <span className="font-semibold text-gray-200">User ID:</span> {userId}
              </Text>
              <Text className="m-0 mb-2 font-mono text-gray-400 text-xs">
                <span className="font-semibold text-gray-200">User Agent:</span> {userAgent}
              </Text>
              <Text className="m-0 font-mono text-gray-400 text-xs">
                <span className="font-semibold text-gray-200">Timestamp:</span> {timestamp}
              </Text>
            </Section>

            {/* Footer */}
            <Section className="border-t-2 border-gray-200 bg-gray-50 p-8 text-center">
              <Text className="mb-4 text-3xl">⚡</Text>
              <Text className="m-0 mb-2 font-bold text-gray-900 text-lg">
                Vigil Support System
              </Text>
              <Text className="m-0 mb-1 text-gray-600 text-sm leading-relaxed">
                Este é um email automático do sistema de suporte.
              </Text>
              <Text className="m-0 text-gray-600 text-sm leading-relaxed">
                Para responder, envie um email diretamente para{' '}
                <Link href={`mailto:${userEmail}`} className="font-semibold text-purple-600 underline">
                  {userEmail}
                </Link>
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

SupportTicketEmail.PreviewProps = {
  ticketNumber: 'A1B2C3D4',
  userName: 'Helbert Rosa',
  userEmail: 'helbert@example.com',
  userPlan: 'premium',
  priority: 'high',
  category: 'technical',
  subject: 'Erro ao fazer upload de imagem no perfil',
  description: `Olá equipe de suporte,

Estou enfrentando um problema ao tentar fazer upload de uma imagem no meu perfil. Quando clico no botão "Upload", a página carrega mas a imagem não aparece.

Passos para reproduzir:
1. Ir em Configurações > Perfil
2. Clicar em "Alterar foto"
3. Selecionar uma imagem (PNG, 2MB)
4. Clicar em "Salvar"

Resultado esperado: Imagem deve aparecer no perfil
Resultado atual: Página recarrega mas imagem não muda

Agradeço a ajuda!`,
  userId: 'e98e65a3-94ea-4bff-ac7a-a97dc60ad666',
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  timestamp: '2025-11-09T10:30:45.123Z',
  attachments: [
    { name: 'screenshot-error.png' },
    { name: 'console-log.txt' },
  ],
} satisfies SupportTicketEmailProps;

