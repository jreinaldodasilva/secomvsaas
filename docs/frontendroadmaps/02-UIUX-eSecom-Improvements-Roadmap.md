# UI/UX Improvements Roadmap — eSecom → secomvsaas

Análise comparativa do frontend do **eSecom** aplicada ao **secomvsaas**.

---

## Diagnóstico

| Área | secomvsaas (atual) | eSecom (referência) | Gap |
|------|-------------------|---------------------|-----|
| Layout principal | Sidebar fixa, sem header | Header fixo + nav horizontal + mobile drawer | Alto |
| Tabela | Sem responsividade mobile | Card-view em mobile, keyboard nav, skeleton | Alto |
| Toast | `react-hot-toast` (lib externa) | Toast próprio com animação, tipos visuais, título | Médio |
| EmptyState | Sem ícone SVG, sem action | Ícones SVG por contexto, botão de ação | Médio |
| StatusBadge | Cores hardcoded em hex | Tokens semânticos, labels traduzidos | Baixo |
| Modal | Funcional, sem animação | Sem diferença significativa | Baixo |
| Breadcrumbs | Funcional, com schema.org | Idêntico | Nenhum |
| Header | Inexistente no dashboard | Header fixo com user menu, notificações, nav | Alto |
| Mobile nav | Sem drawer/overlay | Drawer animado com FocusTrap, swipe gesture | Alto |
| TopLoadingBar | Existe | Existe | Nenhum |

---

## Roadmap de Implementação

### Fase 1 — Layout & Navegação (impacto alto, base para tudo)

- [ ] **1.1** Adicionar `padding-top` ao `mainContent` para compensar header fixo
- [ ] **1.2** Melhorar sidebar: active indicator com borda esquerda colorida, hover state mais visível
- [ ] **1.3** Adicionar `TopLoadingBar` ao `DashboardLayout` (já existe o componente)
- [ ] **1.4** Sidebar collapsed: mostrar apenas ícones com tooltip

### Fase 2 — Tabela responsiva (impacto alto)

- [ ] **2.1** `DataTable`: card-view em mobile (ocultar `<thead>`, exibir `td::before` com `data-label`)
- [ ] **2.2** `DataTable`: skeleton rows durante loading (substituir `<Spinner />`)
- [ ] **2.3** `DataTable`: keyboard navigation (Arrow Up/Down, Enter para ação)
- [ ] **2.4** `DataTable`: header com background `primary-50`, uppercase, letter-spacing

### Fase 3 — Componentes UI (impacto médio)

- [ ] **3.1** `EmptyState`: adicionar ícones SVG por contexto (inbox, document, calendar…)
- [ ] **3.2** `EmptyState`: suporte a `action` prop (botão CTA)
- [ ] **3.3** `StatusBadge`: usar tokens CSS em vez de hex hardcoded; adicionar labels PT-BR
- [ ] **3.4** `Toast`: substituir `react-hot-toast` por toast próprio com título, ícone, animação slide-in

### Fase 4 — Polish & Acessibilidade (impacto baixo-médio)

- [ ] **4.1** `Modal`: animação `scaleIn` na abertura
- [ ] **4.2** `DashboardLayout`: `SessionTimeoutModal` já existe — garantir que está conectado
- [ ] **4.3** Sidebar: `aria-current="page"` nos NavLinks ativos
- [ ] **4.4** Tabela: `role="button"` + `tabIndex` nas linhas clicáveis

---

## Ordem de Implementação

```
Fase 2.1 → 2.2 → 2.3 → 2.4   (DataTable responsiva)
Fase 3.1 → 3.2                 (EmptyState com ícones)
Fase 3.3                       (StatusBadge tokens)
Fase 1.2 → 1.3                 (Sidebar polish + TopLoadingBar)
Fase 3.4                       (Toast próprio)
Fase 4.x                       (Polish final)
```

---

## Status

| Item | Status |
|------|--------|
| Roadmap criado | ✅ |
| DataTable responsiva (2.1–2.4) | ✅ Implementado |
| EmptyState com ícones (3.1–3.2) | ✅ Implementado |
| StatusBadge tokens (3.3) | ✅ Implementado |
| Sidebar polish + TopLoadingBar (1.2–1.3) | ✅ Implementado |
| Toast próprio (3.4) | ✅ Implementado |
| Modal animação scaleIn (4.1) | ✅ Implementado |
| aria-current nos NavLinks (4.3) | ✅ Implementado |
| Sidebar collapsed icon-only (1.4) | ✅ Implementado |
