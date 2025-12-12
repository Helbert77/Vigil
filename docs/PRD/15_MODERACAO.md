# 15 - Sistema de Moderação

## 📋 Identificação

| Campo | Valor |
|-------|-------|
| **Nome** | Sistema de Moderação Vigil |
| **Versão** | 1.0.0 |
| **Data** | 12/12/2024 |
| **Responsável** | Equipe de Desenvolvimento Vigil |
| **Tipo** | PRD - Sistema Administrativo |

---

## 🎯 Visão Geral

### Descrição
Sistema completo de moderação que permite controle de qualidade do conteúdo através de ferramentas automatizadas e revisão manual, incluindo fila de moderação, sistema de appeals e ações administrativas.

### Objetivo e Propósito
- **Qualidade**: Manter alto padrão de conteúdo na plataforma
- **Segurança**: Proteger usuários de conteúdo inadequado
- **Compliance**: Aderência a termos de serviço e leis
- **Eficiência**: Ferramentas para moderação em escala
- **Transparência**: Processo claro e justo de moderação

---

## 🏗️ Arquitetura Técnica

### Componentes Principais
- **Moderation.tsx** - Página principal de moderação
- **Appeals.tsx** - Sistema de recursos/appeals
- **ModerationCard.tsx** - Card de item para moderação
- **useModerationData.ts** - Hook de gerenciamento

### Tipos de Conteúdo Moderado
- **Posts**: Texto, imagens, vídeos
- **Comentários**: Respostas e threads
- **Perfis**: Informações e imagens de perfil
- **Anúncios**: Campanhas publicitárias
- **Timeline**: Eventos históricos sugeridos

---

## ⚙️ Funcionalidades Detalhadas

### 1. Fila de Moderação
- **Priorização**: Conteúdo reportado tem prioridade
- **Filtros**: Por tipo, data, severidade
- **Ações Rápidas**: Aprovar, rejeitar, solicitar revisão
- **Contexto**: Informações completas sobre o item
- **Histórico**: Ações anteriores do usuário

### 2. Sistema de Reports
- **Categorias**: Spam, assédio, conteúdo inadequado, fake news
- **Múltiplos Reports**: Agregação de denúncias similares
- **Prioridade**: Baseada em número e tipo de reports
- **Feedback**: Retorno para quem reportou
- **Falsos Positivos**: Penalização para reports abusivos

### 3. Appeals (Recursos)
- **Processo Formal**: Usuários podem contestar decisões
- **Documentação**: Evidências e argumentos
- **Revisão**: Segunda análise por moderador diferente
- **Prazos**: Tempo limite para submissão e resposta
- **Transparência**: Histórico completo do processo

### 4. Ações Administrativas
```typescript
interface ModerationAction {
  type: 'approve' | 'reject' | 'warn' | 'suspend' | 'ban';
  reason: string;
  duration?: number; // Para suspensões temporárias
  evidence?: string[];
  moderator_id: string;
  created_at: string;
}
```

---

## 📏 Regras de Negócio

### Níveis de Severidade
- **Leve**: Warning, remoção de conteúdo
- **Moderada**: Suspensão temporária (1-7 dias)
- **Grave**: Suspensão longa (7-30 dias)
- **Crítica**: Banimento permanente

### Critérios de Moderação
- **Spam**: Conteúdo repetitivo ou promocional excessivo
- **Assédio**: Ataques pessoais ou intimidação
- **Fake News**: Informações falsas ou enganosas
- **Conteúdo Inadequado**: Violência, nudez, drogas
- **Violação de Direitos**: Copyright, marca registrada

### Processo de Escalação
1. **Auto-moderação**: Algoritmos detectam violações óbvias
2. **Moderação Manual**: Revisão por moderadores
3. **Appeals**: Recurso por usuários
4. **Supervisão**: Revisão por administradores
5. **Auditoria**: Análise periódica de decisões

---

## 💡 Casos de Uso Práticos

### Cenário 1: Post reportado por spam
1. **Usuários** reportam post como spam
2. **Sistema** agrega reports e prioriza na fila
3. **Moderador** revisa post e contexto
4. **Moderador** confirma violação e remove post
5. **Sistema** notifica autor sobre remoção
6. **Autor** pode fazer appeal da decisão

### Cenário 2: Appeal de usuário suspenso
1. **Usuário** recebe suspensão de 7 dias
2. **Usuário** submete appeal com argumentos
3. **Sistema** encaminha para moderador diferente
4. **Moderador** revisa caso e evidências
5. **Decisão** é mantida ou revertida
6. **Usuário** é notificado sobre resultado final

### Cenário 3: Moderação de anúncio
1. **Anunciante** submete campanha publicitária
2. **Sistema** coloca na fila de aprovação
3. **Moderador** revisa conteúdo e targeting
4. **Anúncio** é aprovado com restrições menores
5. **Sistema** notifica anunciante sobre status
6. **Campanha** entra no ar com limitações

---

## 🚀 Roadmap e Melhorias Futuras

### Automação e IA
- **Machine Learning**: Detecção automática mais precisa
- **NLP**: Análise de sentimento e contexto
- **Computer Vision**: Detecção de conteúdo visual inadequado
- **Behavioral Analysis**: Padrões de comportamento suspeito

### Ferramentas Avançadas
- **Bulk Actions**: Operações em massa
- **Templates**: Respostas padronizadas
- **Workflows**: Processos automatizados
- **Integration**: APIs para ferramentas externas
- **Analytics**: Métricas de eficácia da moderação

---

**Próximo Documento**: [16 - Painel Administrativo](16_ADMINISTRACAO.md)
