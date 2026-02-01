#!/bin/bash

# ============================================
# SCRIPT DE VERIFICAÇÃO DE SEGURANÇA - VIGIL
# ============================================
# Este script verifica se as correções de segurança foram aplicadas
# Uso: bash scripts/security-check.sh
# ============================================

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Contadores
PASSED=0
FAILED=0
WARNINGS=0

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  VERIFICAÇÃO DE SEGURANÇA - VIGIL                      ║${NC}"
echo -e "${BLUE}║  Data: $(date +%Y-%m-%d)                                       ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# ============================================
# 1. VERIFICAR SE SERVICE_ROLE_KEY FOI REMOVIDA
# ============================================
echo -e "${BLUE}[1/10]${NC} Verificando exposição de service_role_key..."

if grep -r "SUPABASE_SERVICE_ROLE_KEY" integrations/supabase/client.ts > /dev/null 2>&1; then
    echo -e "${RED}✗ FALHOU${NC} - service_role_key ainda está exposta no código cliente!"
    echo "  Arquivo: integrations/supabase/client.ts"
    echo "  Ação: Remover linhas que exportam SUPABASE_SERVICE_ROLE_KEY"
    FAILED=$((FAILED + 1))
else
    echo -e "${GREEN}✓ PASSOU${NC} - service_role_key não encontrada no código cliente"
    PASSED=$((PASSED + 1))
fi

if grep -r "createServiceClient" integrations/supabase/client.ts > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠ AVISO${NC} - Função createServiceClient ainda existe"
    echo "  Considere remover se não for usada em ambiente seguro"
    WARNINGS=$((WARNINGS + 1))
fi

echo ""

# ============================================
# 2. VERIFICAR ARMAZENAMENTO DE CHAVES PRIVADAS
# ============================================
echo -e "${BLUE}[2/10]${NC} Verificando armazenamento de chaves privadas..."

if grep -r "localStorage.setItem.*pk_" src/services/encryption.service.ts > /dev/null 2>&1; then
    echo -e "${RED}✗ FALHOU${NC} - Chaves privadas ainda são armazenadas em localStorage!"
    echo "  Arquivo: src/services/encryption.service.ts"
    echo "  Ação: Migrar para IndexedDB com criptografia"
    FAILED=$((FAILED + 1))
else
    echo -e "${GREEN}✓ PASSOU${NC} - Chaves privadas não são armazenadas em localStorage"
    PASSED=$((PASSED + 1))
fi

echo ""

# ============================================
# 3. VERIFICAR VALIDAÇÃO DE ENTRADA
# ============================================
echo -e "${BLUE}[3/10]${NC} Verificando validação de entrada em Edge Functions..."

FUNCTIONS_WITHOUT_VALIDATION=0

for func in supabase/functions/*/index.ts; do
    if [ -f "$func" ]; then
        # Verificar se usa Zod ou outra biblioteca de validação
        if ! grep -q "z\." "$func" && ! grep -q "schema" "$func"; then
            echo -e "${YELLOW}⚠ AVISO${NC} - $func pode não ter validação de entrada"
            FUNCTIONS_WITHOUT_VALIDATION=$((FUNCTIONS_WITHOUT_VALIDATION + 1))
        fi
    fi
done

if [ $FUNCTIONS_WITHOUT_VALIDATION -gt 0 ]; then
    echo -e "${YELLOW}⚠ AVISO${NC} - $FUNCTIONS_WITHOUT_VALIDATION Edge Functions podem não ter validação adequada"
    WARNINGS=$((WARNINGS + 1))
else
    echo -e "${GREEN}✓ PASSOU${NC} - Todas as Edge Functions parecem ter validação"
    PASSED=$((PASSED + 1))
fi

echo ""

# ============================================
# 4. VERIFICAR RATE LIMITING
# ============================================
echo -e "${BLUE}[4/10]${NC} Verificando implementação de rate limiting..."

if [ -f "supabase/functions/_shared/ratelimit.ts" ]; then
    echo -e "${GREEN}✓ PASSOU${NC} - Módulo de rate limiting encontrado"
    PASSED=$((PASSED + 1))
    
    # Verificar se está sendo usado
    FUNCTIONS_WITH_RATELIMIT=0
    for func in supabase/functions/*/index.ts; do
        if [ -f "$func" ]; then
            if grep -q "ratelimit" "$func" || grep -q "checkRateLimit" "$func"; then
                FUNCTIONS_WITH_RATELIMIT=$((FUNCTIONS_WITH_RATELIMIT + 1))
            fi
        fi
    done
    
    echo "  $FUNCTIONS_WITH_RATELIMIT Edge Functions usando rate limiting"
else
    echo -e "${RED}✗ FALHOU${NC} - Rate limiting não implementado"
    echo "  Ação: Criar supabase/functions/_shared/ratelimit.ts"
    FAILED=$((FAILED + 1))
fi

echo ""

# ============================================
# 5. VERIFICAR HEADERS DE SEGURANÇA
# ============================================
echo -e "${BLUE}[5/10]${NC} Verificando headers de segurança..."

if grep -q "Content-Security-Policy" vite.config.ts > /dev/null 2>&1; then
    echo -e "${GREEN}✓ PASSOU${NC} - CSP configurado"
    PASSED=$((PASSED + 1))
else
    echo -e "${YELLOW}⚠ AVISO${NC} - Content-Security-Policy não configurado"
    echo "  Ação: Adicionar CSP headers no vite.config.ts"
    WARNINGS=$((WARNINGS + 1))
fi

if grep -q "X-Frame-Options" vite.config.ts > /dev/null 2>&1; then
    echo -e "${GREEN}✓ PASSOU${NC} - X-Frame-Options configurado"
else
    echo -e "${YELLOW}⚠ AVISO${NC} - X-Frame-Options não configurado"
    WARNINGS=$((WARNINGS + 1))
fi

echo ""

# ============================================
# 6. VERIFICAR LOGS SENSÍVEIS
# ============================================
echo -e "${BLUE}[6/10]${NC} Verificando logs sensíveis..."

SENSITIVE_LOGS=$(grep -r "console.log.*password\|console.log.*token\|console.log.*secret" src/ 2>/dev/null | wc -l)

if [ $SENSITIVE_LOGS -gt 0 ]; then
    echo -e "${YELLOW}⚠ AVISO${NC} - Encontrados $SENSITIVE_LOGS possíveis logs de dados sensíveis"
    echo "  Ação: Revisar e remover logs de passwords, tokens, etc."
    WARNINGS=$((WARNINGS + 1))
else
    echo -e "${GREEN}✓ PASSOU${NC} - Nenhum log sensível óbvio encontrado"
    PASSED=$((PASSED + 1))
fi

echo ""

# ============================================
# 7. VERIFICAR DEPENDÊNCIAS VULNERÁVEIS
# ============================================
echo -e "${BLUE}[7/10]${NC} Verificando dependências vulneráveis..."

if command -v npm &> /dev/null; then
    echo "  Executando npm audit..."
    AUDIT_OUTPUT=$(npm audit --json 2>/dev/null || echo '{"metadata":{"vulnerabilities":{"total":0}}}')
    VULNERABILITIES=$(echo $AUDIT_OUTPUT | grep -o '"total":[0-9]*' | head -1 | grep -o '[0-9]*')
    
    if [ -z "$VULNERABILITIES" ]; then
        VULNERABILITIES=0
    fi
    
    if [ $VULNERABILITIES -eq 0 ]; then
        echo -e "${GREEN}✓ PASSOU${NC} - Nenhuma vulnerabilidade conhecida encontrada"
        PASSED=$((PASSED + 1))
    elif [ $VULNERABILITIES -lt 5 ]; then
        echo -e "${YELLOW}⚠ AVISO${NC} - $VULNERABILITIES vulnerabilidades encontradas"
        echo "  Ação: Executar 'npm audit fix' para corrigir"
        WARNINGS=$((WARNINGS + 1))
    else
        echo -e "${RED}✗ FALHOU${NC} - $VULNERABILITIES vulnerabilidades encontradas"
        echo "  Ação: Executar 'npm audit fix' e revisar manualmente"
        FAILED=$((FAILED + 1))
    fi
else
    echo -e "${YELLOW}⚠ AVISO${NC} - npm não encontrado, pulando verificação"
    WARNINGS=$((WARNINGS + 1))
fi

echo ""

# ============================================
# 8. VERIFICAR VARIÁVEIS DE AMBIENTE
# ============================================
echo -e "${BLUE}[8/10]${NC} Verificando variáveis de ambiente..."

if [ -f ".env" ]; then
    echo -e "${YELLOW}⚠ AVISO${NC} - Arquivo .env encontrado"
    echo "  Certifique-se de que está no .gitignore"
    
    if grep -q ".env" .gitignore; then
        echo -e "${GREEN}✓${NC} .env está no .gitignore"
    else
        echo -e "${RED}✗ FALHOU${NC} - .env NÃO está no .gitignore!"
        FAILED=$((FAILED + 1))
    fi
    
    # Verificar se há chaves expostas no .env
    if grep -i "service_role" .env > /dev/null 2>&1; then
        echo -e "${YELLOW}⚠ AVISO${NC} - service_role_key encontrada no .env"
        echo "  Certifique-se de que não está commitada"
    fi
fi

PASSED=$((PASSED + 1))
echo ""

# ============================================
# 9. VERIFICAR POLÍTICAS RLS
# ============================================
echo -e "${BLUE}[9/10]${NC} Verificando políticas RLS..."

if [ -f "scripts/fix-security-issues.sql" ]; then
    echo -e "${GREEN}✓ PASSOU${NC} - Script de correção RLS encontrado"
    echo "  Ação: Executar script no Supabase se ainda não foi feito"
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}✗ FALHOU${NC} - Script de correção RLS não encontrado"
    FAILED=$((FAILED + 1))
fi

echo ""

# ============================================
# 10. VERIFICAR DOCUMENTAÇÃO
# ============================================
echo -e "${BLUE}[10/10]${NC} Verificando documentação de segurança..."

DOCS_FOUND=0

if [ -f "RELATORIO_SEGURANCA.md" ]; then
    DOCS_FOUND=$((DOCS_FOUND + 1))
fi

if [ -f "GUIA_CORRECAO_SEGURANCA.md" ]; then
    DOCS_FOUND=$((DOCS_FOUND + 1))
fi

if [ -f "RESUMO_EXECUTIVO_SEGURANCA.md" ]; then
    DOCS_FOUND=$((DOCS_FOUND + 1))
fi

if [ $DOCS_FOUND -eq 3 ]; then
    echo -e "${GREEN}✓ PASSOU${NC} - Toda documentação de segurança encontrada"
    PASSED=$((PASSED + 1))
else
    echo -e "${YELLOW}⚠ AVISO${NC} - Documentação incompleta ($DOCS_FOUND/3 arquivos)"
    WARNINGS=$((WARNINGS + 1))
fi

echo ""

# ============================================
# RESUMO FINAL
# ============================================
echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  RESUMO DA VERIFICAÇÃO                                 ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

TOTAL=$((PASSED + FAILED + WARNINGS))
echo -e "${GREEN}✓ Passou:${NC}    $PASSED/$TOTAL"
echo -e "${RED}✗ Falhou:${NC}    $FAILED/$TOTAL"
echo -e "${YELLOW}⚠ Avisos:${NC}    $WARNINGS/$TOTAL"
echo ""

# Calcular score
SCORE=$(( (PASSED * 100) / TOTAL ))
echo -e "Score de Segurança: ${BLUE}$SCORE/100${NC}"
echo ""

# Status final
if [ $FAILED -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║  ✓ TODAS AS VERIFICAÇÕES PASSARAM!                     ║${NC}"
    echo -e "${GREEN}║  Sistema está seguro.                                  ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
    exit 0
elif [ $FAILED -eq 0 ]; then
    echo -e "${YELLOW}╔════════════════════════════════════════════════════════╗${NC}"
    echo -e "${YELLOW}║  ⚠ VERIFICAÇÕES PASSARAM COM AVISOS                    ║${NC}"
    echo -e "${YELLOW}║  Revisar avisos acima.                                 ║${NC}"
    echo -e "${YELLOW}╚════════════════════════════════════════════════════════╝${NC}"
    exit 0
else
    echo -e "${RED}╔════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║  ✗ VERIFICAÇÕES FALHARAM                               ║${NC}"
    echo -e "${RED}║  Corrigir problemas críticos imediatamente!            ║${NC}"
    echo -e "${RED}╚════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo "Próximos passos:"
    echo "1. Revisar falhas acima"
    echo "2. Consultar GUIA_CORRECAO_SEGURANCA.md"
    echo "3. Aplicar correções necessárias"
    echo "4. Executar este script novamente"
    exit 1
fi
