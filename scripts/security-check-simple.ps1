# Script de Verificacao de Seguranca - VIGIL
# Uso: powershell -ExecutionPolicy Bypass -File scripts\security-check-simple.ps1

$PASSED = 0
$FAILED = 0
$WARNINGS = 0

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  VERIFICACAO DE SEGURANCA - VIGIL" -ForegroundColor Cyan
Write-Host "  Data: $(Get-Date -Format 'yyyy-MM-dd')" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Verificar service_role_key
Write-Host "[1/10] Verificando exposicao de service_role_key..." -ForegroundColor Cyan
$clientFile = "integrations\supabase\client.ts"
if (Test-Path $clientFile) {
    $content = Get-Content $clientFile -Raw
    if ($content -match "SUPABASE_SERVICE_ROLE_KEY") {
        Write-Host "X FALHOU - service_role_key ainda esta exposta!" -ForegroundColor Red
        $FAILED++
    } else {
        Write-Host "OK PASSOU - service_role_key nao encontrada" -ForegroundColor Green
        $PASSED++
    }
}
Write-Host ""

# 2. Verificar armazenamento de chaves
Write-Host "[2/10] Verificando armazenamento de chaves privadas..." -ForegroundColor Cyan
$encryptionFile = "src\services\encryption.service.ts"
if (Test-Path $encryptionFile) {
    $content = Get-Content $encryptionFile -Raw
    if ($content -match "localStorage\.setItem.*pk_") {
        Write-Host "X FALHOU - Chaves em localStorage!" -ForegroundColor Red
        $FAILED++
    } else {
        Write-Host "OK PASSOU - Chaves nao em localStorage" -ForegroundColor Green
        $PASSED++
    }
}
Write-Host ""

# 3. Verificar rate limiting
Write-Host "[3/10] Verificando rate limiting..." -ForegroundColor Cyan
if (Test-Path "supabase\functions\_shared\ratelimit.ts") {
    Write-Host "OK PASSOU - Rate limiting encontrado" -ForegroundColor Green
    $PASSED++
} else {
    Write-Host "X FALHOU - Rate limiting nao implementado" -ForegroundColor Red
    $FAILED++
}
Write-Host ""

# 4. Verificar headers de seguranca
Write-Host "[4/10] Verificando headers de seguranca..." -ForegroundColor Cyan
if (Test-Path "vite.config.ts") {
    $content = Get-Content "vite.config.ts" -Raw
    if ($content -match "Content-Security-Policy") {
        Write-Host "OK PASSOU - CSP configurado" -ForegroundColor Green
        $PASSED++
    } else {
        Write-Host "! AVISO - CSP nao configurado" -ForegroundColor Yellow
        $WARNINGS++
    }
}
Write-Host ""

# 5. Verificar .env no gitignore
Write-Host "[5/10] Verificando .env no gitignore..." -ForegroundColor Cyan
if (Test-Path ".gitignore") {
    $gitignore = Get-Content ".gitignore" -Raw
    if ($gitignore -match "\.env") {
        Write-Host "OK PASSOU - .env esta no gitignore" -ForegroundColor Green
        $PASSED++
    } else {
        Write-Host "X FALHOU - .env NAO esta no gitignore" -ForegroundColor Red
        $FAILED++
    }
}
Write-Host ""

# 6. Verificar script de correcao RLS
Write-Host "[6/10] Verificando script de correcao RLS..." -ForegroundColor Cyan
if (Test-Path "scripts\fix-security-issues.sql") {
    Write-Host "OK PASSOU - Script encontrado" -ForegroundColor Green
    $PASSED++
} else {
    Write-Host "X FALHOU - Script nao encontrado" -ForegroundColor Red
    $FAILED++
}
Write-Host ""

# 7. Verificar documentacao
Write-Host "[7/10] Verificando documentacao..." -ForegroundColor Cyan
$docs = 0
if (Test-Path "RELATORIO_SEGURANCA.md") { $docs++ }
if (Test-Path "GUIA_CORRECAO_SEGURANCA.md") { $docs++ }
if (Test-Path "RESUMO_EXECUTIVO_SEGURANCA.md") { $docs++ }

if ($docs -eq 3) {
    Write-Host "OK PASSOU - Documentacao completa ($docs/3)" -ForegroundColor Green
    $PASSED++
} else {
    Write-Host "! AVISO - Documentacao incompleta ($docs/3)" -ForegroundColor Yellow
    $WARNINGS++
}
Write-Host ""

# 8. Verificar dependencias
Write-Host "[8/10] Verificando dependencias vulneraveis..." -ForegroundColor Cyan
if (Get-Command npm -ErrorAction SilentlyContinue) {
    Write-Host "  Executando npm audit..." -ForegroundColor Gray
    try {
        $audit = npm audit --json 2>$null | ConvertFrom-Json
        $vulns = $audit.metadata.vulnerabilities.total
        if ($vulns -eq 0) {
            Write-Host "OK PASSOU - Nenhuma vulnerabilidade" -ForegroundColor Green
            $PASSED++
        } else {
            Write-Host "! AVISO - $vulns vulnerabilidades encontradas" -ForegroundColor Yellow
            $WARNINGS++
        }
    } catch {
        Write-Host "! AVISO - Erro ao executar npm audit" -ForegroundColor Yellow
        $WARNINGS++
    }
} else {
    Write-Host "! AVISO - npm nao encontrado" -ForegroundColor Yellow
    $WARNINGS++
}
Write-Host ""

# 9. Verificar logs sensiveis
Write-Host "[9/10] Verificando logs sensiveis..." -ForegroundColor Cyan
if (Test-Path "src") {
    $logs = Select-String -Path "src\*" -Pattern "console\.log.*(password|token|secret)" -Recurse -ErrorAction SilentlyContinue
    if ($logs.Count -gt 0) {
        Write-Host "! AVISO - $($logs.Count) logs sensiveis encontrados" -ForegroundColor Yellow
        $WARNINGS++
    } else {
        Write-Host "OK PASSOU - Nenhum log sensivel encontrado" -ForegroundColor Green
        $PASSED++
    }
}
Write-Host ""

# 10. Verificar Edge Functions
Write-Host "[10/10] Verificando Edge Functions..." -ForegroundColor Cyan
if (Test-Path "supabase\functions") {
    $functions = Get-ChildItem -Path "supabase\functions" -Filter "index.ts" -Recurse
    Write-Host "  $($functions.Count) Edge Functions encontradas" -ForegroundColor Gray
    $PASSED++
} else {
    Write-Host "! AVISO - Pasta de functions nao encontrada" -ForegroundColor Yellow
    $WARNINGS++
}
Write-Host ""

# RESUMO
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  RESUMO DA VERIFICACAO" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

$TOTAL = $PASSED + $FAILED + $WARNINGS
Write-Host "OK Passou:    $PASSED/$TOTAL" -ForegroundColor Green
Write-Host "X  Falhou:    $FAILED/$TOTAL" -ForegroundColor Red
Write-Host "!  Avisos:    $WARNINGS/$TOTAL" -ForegroundColor Yellow
Write-Host ""

$SCORE = [math]::Round(($PASSED * 100) / $TOTAL)
Write-Host "Score de Seguranca: $SCORE/100" -ForegroundColor Cyan
Write-Host ""

if ($FAILED -eq 0 -and $WARNINGS -eq 0) {
    Write-Host "========================================================" -ForegroundColor Green
    Write-Host "  TODAS AS VERIFICACOES PASSARAM!" -ForegroundColor Green
    Write-Host "  Sistema esta seguro." -ForegroundColor Green
    Write-Host "========================================================" -ForegroundColor Green
    exit 0
} elseif ($FAILED -eq 0) {
    Write-Host "========================================================" -ForegroundColor Yellow
    Write-Host "  VERIFICACOES PASSARAM COM AVISOS" -ForegroundColor Yellow
    Write-Host "  Revisar avisos acima." -ForegroundColor Yellow
    Write-Host "========================================================" -ForegroundColor Yellow
    exit 0
} else {
    Write-Host "========================================================" -ForegroundColor Red
    Write-Host "  VERIFICACOES FALHARAM" -ForegroundColor Red
    Write-Host "  Corrigir problemas criticos imediatamente!" -ForegroundColor Red
    Write-Host "========================================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Proximos passos:"
    Write-Host "1. Revisar falhas acima"
    Write-Host "2. Consultar GUIA_CORRECAO_SEGURANCA.md"
    Write-Host "3. Aplicar correcoes necessarias"
    Write-Host "4. Executar este script novamente"
    exit 1
}
