# SM Library UI

Uma biblioteca de componentes Vue reutilizáveis para aplicações no ecossistema SM.

# 🚀 Get Started:

## Instalação

```bash
npm install sm-click-library-ui
# ou
pnpm install sm-click-library-ui
```

## Uso

```javascript
import { MeuComponente } from "sm-click-library-ui";

export default {
  components: {
    MeuComponente,
  },
};
```

---

# 📦 Publicando um Componente

## 1. Preparar o Componente

- Crie o componente em `src/components/` com a estrutura apropriada
- Escreva testes unitários (se aplicável)
- Documente as props, eventos e slots
- Certifique-se de que o componente segue as convenções de estilo do projeto (Tailwind CSS)

## 2. Exportar o Componente

Adicione o componente ao arquivo de exportação principal ou ao module.exports:

```javascript
// src/index.js
export { default as MeuComponente } from "./components/meu-componente/MeuComponente.vue";
```

## 3. Atualizar a Versão do NPM

Siga o [Semantic Versioning (SemVer)](https://semver.org/lang/pt_BR/):

- **MAJOR** (X.0.0): quebra de compatibilidade
- **MINOR** (0.X.0): novas funcionalidades (compatível com versões anteriores)
- **PATCH** (0.0.X): correção de bugs

### Opção A: Atualização Manual

Edite o `package.json`:

```json
{
  "name": "sm-click-library-ui",
  "version": "1.2.3"
}
```

### Opção B: Usando npm (recomendado)

```bash
# Para incrementar PATCH (1.2.3 → 1.2.4)
npm version patch

# Para incrementar MINOR (1.2.3 → 1.3.0)
npm version minor

# Para incrementar MAJOR (1.2.3 → 2.0.0)
npm version major

# Para versão específica
npm version 2.0.0
```

## 4. Build da Biblioteca

```bash
npm run build
# ou
pnpm build
```

## 5. Publicar no NPM

```bash
# Login (primeira vez)
npm login

# Publicar
npm publish

# Publicar com tag específica (ex: beta)
npm publish --tag beta
```

## 6. Verificar a Publicação

```bash
# Ver informações do pacote
npm view sm-click-library-ui

# Ver todas as versões publicadas
npm view sm-click-library-ui versions

# Ver a versão instalada
npm list sm-click-library-ui
```

---

## Exemplo Completo de Workflow

```bash
# 1. Criar e testar o componente localmente
npm run dev

# 2. Fazer commit das mudanças
git add .
git commit -m "feat: adiciona novo componente X"

# 3. Atualizar versão
npm version minor

# 4. Build
npm run build

# 5. Publicar
npm publish

# 6. Push para o repositório
git push origin main --tags
```

---

## ⚠️ Checklist Antes de Publicar

- [ ] Componente funciona corretamente em desenvolvimento
- [ ] Testes passando
- [ ] Sem console errors ou warnings
- [ ] Documentação atualizada
- [ ] Versão foi incrementada no package.json
- [ ] Build foi executado com sucesso
- [ ] Autenticado no npm (`npm whoami`)
- [ ] Sem conflitos de versão (verificar `npm view`)
