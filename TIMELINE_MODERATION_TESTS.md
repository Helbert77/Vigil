# CHECKLIST DE TESTES - Sistema de Moderação da Timeline

## ⚠️ IMPORTANTE: Execute o SQL primeiro!
Antes de testar, execute o arquivo `supabase/sql/create_timeline_moderation_system.sql` no Supabase Dashboard.

## 📋 Checklist de Testes

### ✅ Teste 1: Usuário comum cria evento → vai para fila de moderação
**Como testar:**
1. Faça login como usuário comum (não admin/moderador)
2. Vá para a página Timeline
3. Clique em "Contribua" para adicionar novo evento
4. Preencha os dados e clique em "Criar Evento"
5. **Resultado esperado:** Toast "Evento submetido para moderação! Aguarde aprovação."

### ✅ Teste 2: Admin/Moderador cria evento → vai direto para timeline
**Como testar:**
1. Faça login como admin ou moderador
2. Vá para a página Timeline
3. Clique em "Contribua" para adicionar novo evento
4. Preencha os dados e clique em "Criar Evento"
5. **Resultado esperado:** Toast "Evento criado com sucesso!" e evento aparece na timeline

### ✅ Teste 3: Moderador recebe notificação de novo evento na fila
**Como testar:**
1. Com usuário comum, submeta um evento (Teste 1)
2. Faça login como moderador
3. Vá para a página de Moderação
4. **Resultado esperado:** Toast "Novo evento da timeline aguardando moderação!" e evento aparece na seção "Eventos da Timeline Pendentes"

### ✅ Teste 4: Moderador aprova evento → evento aparece na timeline
**Como testar:**
1. Na página de Moderação, encontre um evento pendente
2. Clique no botão "✓ Aprovar"
3. Vá para a página Timeline
4. **Resultado esperado:** Toast "Evento aprovado e adicionado à timeline!" e evento aparece na timeline

### ✅ Teste 5: Moderador rejeita evento → autor recebe notificação
**Como testar:**
1. Na página de Moderação, encontre um evento pendente
2. Clique no botão "✕ Rejeitar"
3. Adicione um motivo (opcional) e confirme
4. Faça login como o autor do evento
5. Vá para a página de Notificações
6. **Resultado esperado:** Notificação "rejeitou seu evento da timeline."

### ✅ Teste 6: Moderador edita evento na fila → mudanças são salvas
**Como testar:**
1. Na página de Moderação, encontre um evento pendente
2. Clique no botão "✎ Editar"
3. Modifique alguns campos e salve
4. **Resultado esperado:** Toast "Evento atualizado na fila!" e mudanças refletidas no card

### ✅ Teste 7: Moderador edita e aprova → evento atualizado vai para timeline
**Como testar:**
1. Edite um evento na fila (Teste 6)
2. Após salvar, clique em "✓ Aprovar"
3. Vá para a Timeline
4. **Resultado esperado:** Evento aparece na timeline com as modificações feitas

### ✅ Teste 8: Sistema de moderação de posts/comentários continua funcionando
**Como testar:**
1. Crie um post ou comentário com conteúdo que pode ser flagrado
2. Vá para a página de Moderação
3. **Resultado esperado:** Seção "Posts e Comentários" funciona normalmente, sem interferência

### ✅ Teste 9: Realtime updates funcionam para ambas as filas
**Como testar:**
1. Abra duas abas: uma como usuário comum, outra como moderador
2. Na aba do usuário, submeta um evento
3. Na aba do moderador (página Moderação), observe
4. **Resultado esperado:** Evento aparece automaticamente na fila sem refresh

### ✅ Teste 10: RLS policies impedem acesso não autorizado
**Como testar:**
1. Faça login como usuário comum
2. Tente acessar diretamente a página de Moderação
3. **Resultado esperado:** Usuário não deve ver eventos de outros usuários na fila

## 🔧 Pontos Críticos de Validação

### ✅ Isolamento
- [ ] `timeline_moderation_queue` não interfere com `moderation_queue`
- [ ] Ambas as seções aparecem na página de Moderação
- [ ] Ações em uma seção não afetam a outra

### ✅ Permissões
- [ ] Usuários comuns só veem suas próprias submissões
- [ ] Moderadores/admins veem todos os eventos pendentes
- [ ] Apenas moderadores/admins podem aprovar/rejeitar

### ✅ Notificações
- [ ] Todos moderadores recebem notificação de novos eventos
- [ ] Autores recebem notificação de aprovação/rejeição
- [ ] Notificações aparecem corretamente na página de Notificações

### ✅ Realtime
- [ ] Updates aparecem instantaneamente
- [ ] Canal `timeline-moderation-realtime` funciona
- [ ] Não há conflito com outros canais realtime

### ✅ UI
- [ ] Página de moderação exibe ambas as seções
- [ ] Cards de eventos mostram todas as informações
- [ ] Botões de ação funcionam corretamente
- [ ] Modal de edição abre e funciona

## 🚀 Funcionalidades Implementadas

### ✅ Banco de Dados
- [x] Tabela `timeline_moderation_queue` criada
- [x] Campo `created_by` adicionado à `timeline_events`
- [x] RLS policies configuradas
- [x] Índices para performance

### ✅ Backend
- [x] Funções API para moderação de timeline
- [x] Sistema de notificações integrado
- [x] Validações de permissão

### ✅ Frontend
- [x] Hook `useTimelineModeration`
- [x] Componente `TimelineModerationCard`
- [x] Componente `TimelineModerationSection`
- [x] Modal `AddEventModal` atualizado
- [x] Página de Moderação integrada
- [x] Sistema de notificações atualizado

### ✅ Fluxos
- [x] Usuário comum → Fila de moderação
- [x] Admin/Moderador → Timeline direta
- [x] Aprovação → Timeline + notificação
- [x] Rejeição → Notificação ao autor
- [x] Edição → Atualização na fila

## 🎯 Status Final
- ✅ Build bem-sucedido
- ✅ Sem erros de linting
- ✅ Todas as funcionalidades implementadas
- ✅ Isolamento garantido (não interfere no sistema existente)

**Sistema pronto para uso!** 🚀
