# 🗑️ Pasta Lixo - Arquivos Obsoletos

Esta pasta contém arquivos que foram identificados como **não utilizados** no projeto e foram movidos para cá para manter o código limpo.

## 📋 Arquivos Movidos

### Data: 10/11/2025

| Arquivo | Origem | Motivo |
|---------|--------|--------|
| `ConfirmationModal.tsx` | `src/components/common/` | Duplicado - versão em `components/common/` está sendo usada |
| `SafeImage.tsx` | `components/common/` | Duplicado - versão em `src/components/common/` está sendo usada |
| `PostIcon.tsx` | `components/icons/` | Duplicado - versão em `src/components/icons/` está sendo usada |
| `Sidebar.tsx` | `src/components/layout/` | Duplicado - versão em `components/layout/` está sendo usada |
| `FileViewer.tsx` | `src/components/common/` | Duplicado - versão em `components/library/` está sendo usada |
| `SearchPopup.tsx` | `src/components/search/` | Duplicado - versão em `components/search/` está sendo usada |

### Arquivo Deletado Permanentemente:
- `CreatePost.tsx` (de `components/post/`) - Duplicado - versão em `src/components/post/` está sendo usada

## ⚠️ Importante

Estes arquivos foram movidos (não deletados) para permitir recuperação caso necessário. Se após um período de testes não houver problemas, estes arquivos podem ser deletados permanentemente.

## 🔍 Como Verificar se Pode Deletar

Execute uma busca no projeto para verificar se algum arquivo ainda referencia estes componentes:

```bash
# Exemplo para ConfirmationModal
grep -r "ConfirmationModal" --include="*.tsx" --include="*.ts" .
```

Se não houver referências, o arquivo pode ser deletado com segurança.

---

**Análise realizada em:** 10/11/2025  
**Ferramenta:** Análise automatizada de dependências

