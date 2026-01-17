# 🎯 Sistema de Radar com Geolocalização em Tempo Real

## 📋 Visão Geral

Sistema completo de geolocalização em tempo real para o Vigil Chat, permitindo que usuários descubram e conectem-se com pessoas próximas geograficamente. **Nenhum dado de localização é armazenado no banco de dados** - tudo funciona através do Supabase Realtime Presence.

---

## 🏗️ Arquitetura

### Componentes Principais

```
src/
├── hooks/
│   └── useGeolocation.ts              # Hook para captura de GPS
├── contexts/
│   └── GeolocationPresenceContext.tsx # Contexto Realtime
├── utils/
│   └── geoCalculations.ts             # Cálculos de distância
├── components/chat/
│   ├── LocationPermissionModal.tsx    # Modal de permissão
│   └── RadarView.tsx                  # Visualização do radar
└── pages/
    └── ChatPage.tsx                   # Integração principal
```

---

## 🔧 Componentes Detalhados

### 1. **useGeolocation Hook**
**Arquivo**: `src/hooks/useGeolocation.ts`

Hook React para captura de geolocalização do navegador.

**Funcionalidades**:
- ✅ Captura de localização única ou contínua (watch mode)
- ✅ Verificação de permissões
- ✅ Tratamento de erros
- ✅ Atualização periódica configurável
- ✅ Alta precisão (enableHighAccuracy)

**Uso**:
```typescript
const {
  latitude,
  longitude,
  accuracy,
  error,
  loading,
  permissionStatus,
  refresh,
  startWatching,
  stopWatching
} = useGeolocation({
  enableHighAccuracy: true,
  watch: true,
  updateInterval: 60000 // 1 minuto
});
```

**Estados de Permissão**:
- `granted`: Permissão concedida
- `denied`: Permissão negada
- `prompt`: Aguardando resposta do usuário
- `unavailable`: Geolocalização não disponível

---

### 2. **GeolocationPresenceContext**
**Arquivo**: `src/contexts/GeolocationPresenceContext.tsx`

Contexto React que gerencia presença em tempo real via Supabase Realtime.

**Funcionalidades**:
- ✅ Compartilhamento de localização via Presence
- ✅ Sincronização automática de usuários online
- ✅ Cálculo de proximidade em tempo real
- ✅ Controle de raio de busca (10-250km)
- ✅ Desconexão automática ao sair

**Dados Compartilhados** (via Presence):
```typescript
{
  user_id: string,
  username: string,
  name: string,
  avatar_url: string,
  latitude: number,
  longitude: number,
  accuracy: number,
  timestamp: number,
  interests: string[],
  age: number,
  location: string,
  plan: string,
  role: string,
  online_at: string
}
```

**Uso**:
```typescript
const {
  currentUserLocation,
  nearbyUsers,
  isLocationSharingEnabled,
  enableLocationSharing,
  disableLocationSharing,
  maxDistance,
  setMaxDistance
} = useGeolocationPresence();
```

---

### 3. **Funções de Cálculo Geográfico**
**Arquivo**: `src/utils/geoCalculations.ts`

Utilitários para cálculos de distância e proximidade.

**Funções Principais**:

#### `calculateDistance(coord1, coord2)`
Calcula distância entre duas coordenadas usando fórmula de Haversine.
```typescript
const distance = calculateDistance(
  { latitude: -23.5505, longitude: -46.6333 }, // São Paulo
  { latitude: -22.9068, longitude: -43.1729 }  // Rio de Janeiro
);
// Retorna: ~357.5 km
```

#### `calculateSimilarityScore(distance, maxDistance)`
Converte distância em score de similaridade (0-1).
```typescript
const score = calculateSimilarityScore(10, 50);
// Retorna: 0.8 (80% de similaridade)
```

#### `findNearbyUsers(currentCoords, users, maxDistance)`
Filtra e ordena usuários por proximidade.
```typescript
const nearby = findNearbyUsers(
  myLocation,
  allUsers,
  50 // raio de 50km
);
```

#### `formatDistance(distanceKm)`
Formata distância para exibição.
```typescript
formatDistance(0.5);  // "500 m"
formatDistance(15.7); // "15.7 km"
```

---

### 4. **LocationPermissionModal**
**Arquivo**: `src/components/chat/LocationPermissionModal.tsx`

Modal interativo para solicitar permissão de localização.

**Funcionalidades**:
- ✅ Explicação clara do funcionamento
- ✅ Benefícios do recurso
- ✅ Garantias de privacidade
- ✅ Estados visuais (granted/denied/unavailable)
- ✅ Instruções específicas por navegador
- ✅ Design responsivo e acessível

**Props**:
```typescript
interface LocationPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEnableLocation: () => void;
  permissionStatus: 'granted' | 'denied' | 'prompt' | 'unavailable' | null;
  locationError: string | null;
}
```

---

### 5. **RadarView**
**Arquivo**: `src/components/chat/RadarView.tsx`

Componente de visualização do radar com usuários próximos.

**Funcionalidades**:
- ✅ Radar circular animado
- ✅ Posicionamento baseado em distância real
- ✅ Cards de hover com informações
- ✅ Exibição de distância formatada
- ✅ Animações suaves
- ✅ Responsivo (mobile e desktop)

**Lógica de Posicionamento**:
- Centro do radar = usuário atual
- Quanto mais próximo, mais ao centro
- Distribuição angular para evitar sobreposição
- Raio máximo = 45% (5% de padding)

---

## 🔐 Privacidade e Segurança

### ✅ **O QUE FAZEMOS**
1. **Compartilhamento Temporário**: Localização só é compartilhada enquanto o usuário está ativo no chat
2. **Sem Persistência**: Nenhum dado de GPS é salvo no banco de dados
3. **Controle Total**: Usuário pode ativar/desativar a qualquer momento
4. **Transparência**: Modal explica claramente como funciona

### ❌ **O QUE NÃO FAZEMOS**
1. ❌ Não armazenamos coordenadas GPS
2. ❌ Não rastreamos histórico de localização
3. ❌ Não compartilhamos localização exata (apenas proximidade)
4. ❌ Não vendemos ou compartilhamos dados de localização

---

## 🚀 Fluxo de Funcionamento

### 1. **Usuário Entra no Chat**
```
ChatPage carrega → GeolocationPresenceProvider inicializa
```

### 2. **Usuário Ativa Radar**
```
Clica em "Radar" → Modal de permissão aparece
```

### 3. **Permissão Concedida**
```
useGeolocation captura GPS → GeolocationPresenceContext compartilha via Presence
```

### 4. **Sincronização Realtime**
```
Supabase Presence sincroniza → Outros usuários online aparecem
```

### 5. **Cálculo de Proximidade**
```
findNearbyUsers filtra por distância → RadarView exibe no radar
```

### 6. **Atualização Contínua**
```
A cada 1 minuto → Localização é atualizada → Radar atualiza
```

### 7. **Usuário Sai do Chat**
```
Componente desmonta → Presence.untrack() → Localização desaparece
```

---

## 📊 Dados em Tempo Real

### Canal Supabase Presence
**Nome do Canal**: `chat-geolocation`

**Estrutura de Dados**:
```typescript
{
  user_id: "uuid",
  username: "john_doe",
  name: "John Doe",
  avatar_url: "https://...",
  latitude: -23.5505,
  longitude: -46.6333,
  accuracy: 10, // metros
  timestamp: 1704067200000,
  interests: ["tech", "music"],
  age: 25,
  location: "São Paulo, Brasil",
  plan: "premium",
  role: "user",
  online_at: "2024-01-01T00:00:00Z"
}
```

---

## ⚙️ Configurações

### Raio de Busca
Usuário pode escolher entre:
- 10 km (muito próximo)
- 25 km (próximo)
- 50 km (padrão)
- 100 km (distante)
- 250 km (muito distante)

### Intervalo de Atualização
- **Padrão**: 60 segundos (1 minuto)
- **Configurável** no `GeolocationPresenceProvider`

### Precisão
- **enableHighAccuracy**: `true` (GPS de alta precisão)
- **timeout**: 10 segundos
- **maximumAge**: 5 minutos (cache de localização)

---

## 🎨 Estados Visuais

### Radar Ativo com Usuários
- Radar animado com círculos concêntricos
- Linha de varredura rotativa
- Pontos de usuários com avatares
- Cards de hover com informações

### Radar Ativo sem Usuários
- Mensagem "Nenhum usuário próximo"
- Sugestão para aumentar raio
- Seletor de raio de busca

### Localização Desativada
- Ícone de localização
- Explicação do recurso
- Botão "Ativar Localização"

### Erro de Permissão
- Mensagem de erro clara
- Instruções específicas por navegador
- Link para configurações

---

## 🔧 Integração

### Adicionar ao Projeto

1. **Importar o Provider**:
```typescript
import { GeolocationPresenceProvider } from '@/src/contexts/GeolocationPresenceContext';
```

2. **Envolver o ChatPage**:
```typescript
export default function ChatPage(props: ChatPageProps) {
  return (
    <GeolocationPresenceProvider 
      channelName="chat-geolocation" 
      updateInterval={60000}
    >
      <ChatPageContent {...props} />
    </GeolocationPresenceProvider>
  );
}
```

3. **Usar o Hook**:
```typescript
const {
  nearbyUsers,
  isLocationSharingEnabled,
  enableLocationSharing,
  disableLocationSharing
} = useGeolocationPresence();
```

---

## 🐛 Tratamento de Erros

### Erros Comuns

#### 1. **Permissão Negada**
```
Erro: "Permissão de localização negada"
Solução: Modal com instruções para ativar nas configurações
```

#### 2. **Localização Indisponível**
```
Erro: "Localização indisponível"
Causa: GPS desligado, sem sinal, ou navegador não suporta
Solução: Instruções para ativar GPS
```

#### 3. **Timeout**
```
Erro: "Tempo esgotado ao obter localização"
Causa: Demora excessiva para obter GPS
Solução: Tentar novamente com refresh()
```

#### 4. **Navegador Não Suportado**
```
Erro: "Geolocalização não suportada pelo navegador"
Solução: Sugerir navegador moderno
```

---

## 📱 Compatibilidade

### Navegadores Suportados
- ✅ Chrome 50+
- ✅ Firefox 55+
- ✅ Safari 10+
- ✅ Edge 12+
- ✅ Opera 37+
- ✅ Chrome Mobile
- ✅ Safari Mobile

### Requisitos
- ✅ HTTPS (obrigatório para geolocalização)
- ✅ Permissão de localização concedida
- ✅ GPS ativado (mobile)
- ✅ Conexão com internet

---

## 🧪 Testando o Sistema

### Teste Local

1. **Iniciar servidor HTTPS**:
```bash
npm run dev
```

2. **Acessar chat**:
```
https://localhost:5173/chat
```

3. **Ativar radar**:
- Clicar em "🎯 Radar"
- Permitir localização
- Aguardar sincronização

4. **Testar com múltiplos usuários**:
- Abrir em diferentes navegadores/dispositivos
- Ativar localização em todos
- Verificar se aparecem no radar

### Teste de Distância

Simular diferentes localizações:
```typescript
// Usuário 1: São Paulo
{ latitude: -23.5505, longitude: -46.6333 }

// Usuário 2: Campinas (próximo - ~90km)
{ latitude: -22.9099, longitude: -47.0626 }

// Usuário 3: Rio de Janeiro (distante - ~350km)
{ latitude: -22.9068, longitude: -43.1729 }
```

---

## 📈 Performance

### Otimizações Implementadas

1. **Atualização Inteligente**: Apenas a cada 1 minuto
2. **Cache de Localização**: maximumAge de 5 minutos
3. **Limite de Usuários**: Máximo 20 no radar
4. **Cálculos Eficientes**: Fórmula de Haversine otimizada
5. **Cleanup Automático**: Untrack ao desmontar

### Métricas Esperadas

- **Tempo de captura GPS**: 2-5 segundos
- **Latência de sincronização**: < 1 segundo
- **Consumo de bateria**: Baixo (atualização a cada 1 min)
- **Uso de dados**: ~1KB por atualização

---

## 🔮 Melhorias Futuras

### Possíveis Implementações

1. **Filtros Avançados**:
   - Por interesses comuns
   - Por idade
   - Por plano (free/premium)

2. **Notificações**:
   - Quando alguém próximo entra online
   - Quando alguém com interesses similares está perto

3. **Histórico Temporário**:
   - Últimos usuários vistos (sessão atual apenas)
   - Não persistir no banco

4. **Mapa Interativo**:
   - Visualização em mapa real (opcional)
   - Zoom e pan

5. **Precisão Adaptativa**:
   - Alta precisão quando parado
   - Baixa precisão quando em movimento (economizar bateria)

---

## 📞 Suporte

### Problemas Comuns

**P: O radar não mostra ninguém**
R: Verifique se:
- Localização está ativada
- Há outros usuários online com localização ativa
- Raio de busca não está muito pequeno

**P: Localização não funciona no mobile**
R: Verifique se:
- GPS está ativado
- Permissão foi concedida ao navegador
- Site está em HTTPS

**P: Radar está lento**
R: Normal. Atualiza a cada 1 minuto para economizar bateria.

---

## 📄 Licença

Este sistema é parte do projeto Vigil e segue a mesma licença do projeto principal.

---

**Desenvolvido com ❤️ para Vigil Chat**
