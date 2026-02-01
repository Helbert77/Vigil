# ============================================
# SCRIPT DE VERIFICAÇÃO DE SEGURANÇA - VIGIL
# ============================================
# Este script verifica se as correções de segurança foram aplicadas
# Uso: powershell -ExecutionPolicy Bypass -File scripts\security-check.ps1
# ============================================

$ErrorActionPreference = "Continue"

# Contadores
$PASSED = 0
$FAILED = 0
$WARNINGS = 0

# Função para escrever com cores
function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

Write-ColorOutput "========================================================" "Cyan"
Write-ColorOutput "  VERIFICACAO DE SEGURANCA - VIGIL                      " "Cyan"
Write-ColorOutput "  Data: $(Get-Date -Format 'yyyy-MM-dd')                " "Cyan"
Write-ColorOutput "========================================================" "Cyan"
Write-Host ""

# ============================================
# 1. VERIFICAR SE SERVICE_ROLE_KEY FOI REMOVIDA
# ============================================
Write-ColorOutput "[1/10] Verificando exposição de service_role_key..." "Cyan"

$clientFile = "integrations\supabase\client.ts"
if (Test-Path $clientFile) {
    $content = Get-Content $clientFile -Raw
    if ($content -match "SUPABASE_SERVICE_ROLE_KEY") {
        Write-ColorOutput "✗ FALHOU - service_role_key ainda está exposta no código cliente!" "Red"
        Write-Host "  Arquivo: $clientFile"
        Write-Host "  Ação: Remover linhas que exportam SUPABASE_SERVICE_ROLE_KEY"
        $FAILED++
    } else {
        Write-ColorOutput "✓ PASSOU - service_role_key não encontrada no código cliente" "Green"
        $PASSED++
    }
    
    if ($content -match "createServiceClient") {
        Write-ColorOutput "⚠ AVISO - Função createServiceClient ainda existe" "Yellow"
        Write-Host "  Considere remover se não for usada em ambiente seguro"
        $WARNINGS++
    }
} else {
    Write-ColorOutput "⚠ AVISO - Arquivo client.ts não encontrado" "Yellow"
    $WARNINGS++
}

Write-Host ""

# ============================================
# 2. VERIFICAR ARMAZENAMENTO DE CHAVES PRIVADAS
# ============================================
Write-ColorOutput "[2/10] Verificando armazenamento de chaves privadas..." "Cyan"

$encryptionFile = "src\services\encryption.service.ts"
if (Test-Path $encryptionFile) {
    $content = Get-Content $encryptionFile -Raw
    if ($content -match "localStorage\.setItem.*pk_") {
        Write-ColorOutput "✗ FALHOU - Chaves privadas ainda são armazenadas em localStorage!" "Red"
        Write-Host "  Arquivo: $encryptionFile"
        Write-Host "  Ação: Migrar para IndexedDB com criptografia"
        $FAILED++
    } else {
        Write-ColorOutput "✓ PASSOU - Chaves privadas não são armazenadas em localStorage" "Green"
        $PASSED++
    }
} else {
    Write-ColorOutput "⚠ AVISO - Arquivo encryption.service.ts não encontrado" "Yellow"
    $WARNINGS++
}

Write-Host ""

# ============================================
# 3. VERIFICAR VALIDAÇÃO DE ENTRADA
# ============================================
Write-ColorOutput "[3/10] Verificando validação de entrada em Edge Functions..." "Cyan"

$functionsPath = "supabase\functions"
if (Test-Path $functionsPath) {
    $functionsWithoutValidation = 0
    $functionFiles = Get-ChildItem -Path $functionsPath -Filter "index.ts" -Recurse
    
    foreach ($file in $functionFiles) {
        $content = Get-Content $file.FullName -Raw
        if (-not ($content -match "z\." -or $content -match "schema")) {
            Write-ColorOutput "⚠ AVISO - $($file.FullName) pode não ter validação de entrada" "Yellow"
            $functionsWithoutValidation++
        }
    }
    
    if ($functionsWithoutValidation -gt 0) {
        Write-ColorOutput "⚠ AVISO - $functionsWithoutValidation Edge Functions podem não ter validação adequada" "Yellow"
        $WARNINGS++
    } else {
        Write-ColorOutput "✓ PASSOU - Todas as Edge Functions parecem ter validação" "Green"
        $PASSED++
    }
} else {
    Write-ColorOutput "⚠ AVISO - Pasta de Edge Functions não encontrada" "Yellow"
    $WARNINGS++
}

Write-Host ""

# ============================================
# 4. VERIFICAR RATE LIMITING
# ============================================
Write-ColorOutput "[4/10] Verificando implementação de rate limiting..." "Cyan"

$rateLimitFile = "supabase\functions\_shared\ratelimit.ts"
if (Test-Path $rateLimitFile) {
    Write-ColorOutput "✓ PASSOU - Módulo de rate limiting encontrado" "Green"
    $PASSED++
    
    # Verificar se está sendo usado
    $functionsWithRateLimit = 0
    $functionFiles = Get-ChildItem -Path "supabase\functions" -Filter "index.ts" -Recurse
    
    foreach ($file in $functionFiles) {
        $content = Get-Content $file.FullName -Raw
        if ($content -match "ratelimit" -or $content -match "checkRateLimit") {
            $functionsWithRateLimit++
        }
    }
    
    Write-Host "  $functionsWithRateLimit Edge Functions usando rate limiting"
} else {
    Write-ColorOutput "✗ FALHOU - Rate limiting não implementado" "Red"
    Write-Host "  Ação: Criar supabase\functions\_shared\ratelimit.ts"
    $FAILED++
}

Write-Host ""

# ============================================
# 5. VERIFICAR HEADERS DE SEGURANÇA
# ============================================
Write-ColorOutput "[5/10] Verificando headers de segurança..." "Cyan"

$viteConfig = "vite.config.ts"
if (Test-Path $viteConfig) {
    $content = Get-Content $viteConfig -Raw
    
    if ($content -match "Content-Security-Policy") {
        Write-ColorOutput "✓ PASSOU - CSP configurado" "Green"
        $PASSED++
    } else {
        Write-ColorOutput "⚠ AVISO - Content-Security-Policy não configurado" "Yellow"
        Write-Host "  Ação: Adicionar CSP headers no vite.config.ts"
        $WARNINGS++
    }
    
    if ($content -match "X-Frame-Options") {
        Write-ColorOutput "✓ PASSOU - X-Frame-Options configurado" "Green"
    } else {
        Write-ColorOutput "⚠ AVISO - X-Frame-Options não configurado" "Yellow"
        $WARNINGS++
    }
} else {
    Write-ColorOutput "⚠ AVISO - vite.config.ts não encontrado" "Yellow"
    $WARNINGS++
}

Write-Host ""

# ============================================
# 6. VERIFICAR LOGS SENSÍVEIS
# ============================================
Write-ColorOutput "[6/10] Verificando logs sensíveis..." "Cyan"

$srcPath = "src"
if (Test-Path $srcPath) {
    $sensitiveLogs = Select-String -Path "$srcPath\*" -Pattern "console\.log.*(password|token|secret)" -Recurse -ErrorAction SilentlyContinue
    
    if ($sensitiveLogs.Count -gt 0) {
        Write-ColorOutput "⚠ AVISO - Encontrados $($sensitiveLogs.Count) possíveis logs de dados sensíveis" "Yellow"
        Write-Host "  Ação: Revisar e remover logs de passwords, tokens, etc."
        $WARNINGS++
    } else {
        Write-ColorOutput "✓ PASSOU - Nenhum log sensível óbvio encontrado" "Green"
        $PASSED++
    }
} else {
    Write-ColorOutput "⚠ AVISO - Pasta src não encontrada" "Yellow"
    $WARNINGS++
}

Write-Host ""

# ============================================
# 7. VERIFICAR DEPENDÊNCIAS VULNERÁVEIS
# ============================================
Write-ColorOutput "[7/10] Verificando dependências vulneráveis..." "Cyan"

if (Get-Command npm -ErrorAction SilentlyContinue) {
    Write-Host "  Executando npm audit..."
    $auditOutput = npm audit --json 2>$null | ConvertFrom-Json
    
    if ($auditOutput.metadata.vulnerabilities.total -eq 0) {
        Write-ColorOutput "✓ PASSOU - Nenhuma vulnerabilidade conhecida encontrada" "Green"
        $PASSED++
    } elseif ($auditOutput.metadata.vulnerabilities.total -lt 5) {
        Write-ColorOutput "⚠ AVISO - $($auditOutput.metadata.vulnerabilities.total) vulnerabilidades encontradas" "Yellow"
        Write-Host "  Ação: Executar 'npm audit fix' para corrigir"
        $WARNINGS++
    } else {
        Write-ColorOutput "✗ FALHOU - $($auditOutput.metadata.vulnerabilities.total) vulnerabilidades encontradas" "Red"
        Write-Host "  Ação: Executar 'npm audit fix' e revisar manualmente"
        $FAILED++
    }
} else {
    Write-ColorOutput "⚠ AVISO - npm não encontrado, pulando verificação" "Yellow"
    $WARNINGS++
}

Write-Host ""

# ============================================
# 8. VERIFICAR VARIÁVEIS DE AMBIENTE
# ============================================
Write-ColorOutput "[8/10] Verificando variáveis de ambiente..." "Cyan"

if (Test-Path ".env") {
    Write-ColorOutput "⚠ AVISO - Arquivo .env encontrado" "Yellow"
    Write-Host "  Certifique-se de que está no .gitignore"
    
    if (Test-Path ".gitignore") {
        $gitignore = Get-Content ".gitignore" -Raw
        if ($gitignore -match "\.env") {
            Write-ColorOutput "✓ .env está no .gitignore" "Green"
        } else {
            Write-ColorOutput "✗ FALHOU - .env NÃO está no .gitignore!" "Red"
            $FAILED++
        }
    }
    
    # Verificar se há chaves expostas no .env
    $envContent = Get-Content ".env" -Raw
    if ($envContent -match "service_role") {
        Write-ColorOutput "⚠ AVISO - service_role_key encontrada no .env" "Yellow"
        Write-Host "  Certifique-se de que não está commitada"
    }
}

$PASSED++
Write-Host ""

# ============================================
# 9. VERIFICAR POLÍTICAS RLS
# ============================================
Write-ColorOutput "[9/10] Verificando políticas RLS..." "Cyan"

if (Test-Path "scripts\fix-security-issues.sql") {
    Write-ColorOutput "✓ PASSOU - Script de correção RLS encontrado" "Green"
    Write-Host "  Ação: Executar script no Supabase se ainda não foi feito"
    $PASSED++
} else {
    Write-ColorOutput "✗ FALHOU - Script de correção RLS não encontrado" "Red"
    $FAILED++
}

Write-Host ""

# ============================================
# 10. VERIFICAR DOCUMENTAÇÃO
# ============================================
Write-ColorOutput "[10/10] Verificando documentação de segurança..." "Cyan"

$docsFound = 0

if (Test-Path "RELATORIO_SEGURANCA.md") { $docsFound++ }
if (Test-Path "GUIA_CORRECAO_SEGURANCA.md") { $docsFound++ }
if (Test-Path "RESUMO_EXECUTIVO_SEGURANCA.md") { $docsFound++ }

if ($docsFound -eq 3) {
    Write-ColorOutput "✓ PASSOU - Toda documentação de segurança encontrada" "Green"
    $PASSED++
} else {
    Write-ColorOutput "⚠ AVISO - Documentação incompleta ($docsFound/3 arquivos)" "Yellow"
    $WARNINGS++
}

Write-Host ""

# ============================================
# RESUMO FINAL
# ============================================
Write-ColorOutput "========================================================" "Cyan"
Write-ColorOutput "  RESUMO DA VERIFICACAO                                 " "Cyan"
Write-ColorOutput "========================================================" "Cyan"
Write-Host ""

$TOTAL = $PASSED + $FAILED + $WARNINGS
Write-ColorOutput "✓ Passou:    $PASSED/$TOTAL" "Green"
Write-ColorOutput "✗ Falhou:    $FAILED/$TOTAL" "Red"
Write-ColorOutput "⚠ Avisos:    $WARNINGS/$TOTAL" "Yellow"
Write-Host ""

# Calcular score
$SCORE = [math]::Round(($PASSED * 100) / $TOTAL)
Write-ColorOutput "Score de Segurança: $SCORE/100" "Cyan"
Write-Host ""

# Status final
if ($FAILED -eq 0 -and $WARNINGS -eq 0) {
    Write-ColorOutput "========================================================" "Green"
    Write-ColorOutput "  TODAS AS VERIFICACOES PASSARAM!                      " "Green"
    Write-ColorOutput "  Sistema esta seguro.                                 " "Green"
    Write-ColorOutput "========================================================" "Green"
    exit 0
} elseif ($FAILED -eq 0) {
    Write-ColorOutput "========================================================" "Yellow"
    Write-ColorOutput "  VERIFICACOES PASSARAM COM AVISOS                     " "Yellow"
    Write-ColorOutput "  Revisar avisos acima.                                " "Yellow"
    Write-ColorOutput "========================================================" "Yellow"
    exit 0
} else {
    Write-ColorOutput "========================================================" "Red"
    Write-ColorOutput "  VERIFICACOES FALHARAM                                " "Red"
    Write-ColorOutput "  Corrigir problemas criticos imediatamente!           " "Red"
    Write-ColorOutput "========================================================" "Red"
    Write-Host ""
    Write-Host "Próximos passos:"
    Write-Host "1. Revisar falhas acima"
    Write-Host "2. Consultar GUIA_CORRECAO_SEGURANCA.md"
    Write-Host "3. Aplicar correções necessárias"
    Write-Host "4. Executar este script novamente"
    exit 1
}
