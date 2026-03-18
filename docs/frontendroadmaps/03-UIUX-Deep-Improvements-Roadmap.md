# UI/UX Deep Improvements Roadmap — eSecom → secomvsaas

Análise profunda camada por camada. Cada item tem diagnóstico, gap e solução concreta.

---

## 1. Design Tokens

### Gap
| Token | secomvsaas | eSecom | Problema |
|-------|-----------|--------|---------|
| `--input-height-*` | Ausente | `2rem / 2.5rem / 3rem` | Inputs sem altura consistente |
| `--input-padding-*` | Ausente | `var(--space-4) / var(--space-2)` | Padding inline nos componentes |
| `--color-*-50/100/200` | Parcial | Completo (success/warning/error/info) | StatusBadge usa hex hardcoded |
| `--color-info-*` | Ausente | Completo | Toast info sem cor |
| `--color-success-*` | Parcial | Completo | Toast success sem escala |
| `--color-warning-*` | Parcial | Completo | Toast warning sem escala |
| `--color-error-*` | Parcial | Completo | FormField error sem escala |
| `--z-modal` | `50` (hardcoded) | `var(--z-modal)` | Modal com z-index errado |
| `--transition-colors` | Presente | Presente | OK |

### Solução
- Completar escala semântica de cores (success/warning/error/info 50→700)
- Adicionar tokens de input (`--input-height-*`, `--input-padding-*`)
- Corrigir z-index do modal para usar `var(--z-modal-backdrop)` / `var(--z-modal)`

---

## 2. Button

### Gap
| Aspecto | secomvsaas | eSecom |
|---------|-----------|--------|
| Variantes | `primary/secondary/danger/ghost` | + `success/outline/destructive` |
| Loading state | Spinner + texto oculto | `aria-busy`, spinner centralizado |
| `fullWidth` prop | Ausente | Presente |
| Disabled styles | `opacity: 0.5` | Cor explícita `neutral-300` |
| Hover shadow | Ausente | `::after` pseudo-element com shadow |
| `min-height` md | `3rem` | `2.75rem` (44px touch target) |

### Solução
- Adicionar variante `outline` e `success`
- Adicionar prop `fullWidth`
- Melhorar disabled com cor explícita
- Adicionar `::after` hover shadow
- Corrigir `min-height` para 44px (touch target WCAG)

---

## 3. Input / FormField

### Gap
| Aspecto | secomvsaas | eSecom |
|---------|-----------|--------|
| Componente Input | Inexistente (usa `<input>` raw) | Input rico com label, error, icons, clear, loading, success, floating label |
| `leftIcon` / `rightIcon` | Ausente | Presente |
| Estado `success` visual | Ausente | Ícone verde + borda |
| Estado `loading` | Ausente | Spinner animado |
| `showClearButton` | Ausente | Botão × com Escape key |
| Floating label | Ausente | Variante `floating` |
| `aria-describedby` | Ausente | Conecta label, helper, error |
| `aria-invalid` | Ausente | Presente |
| `inputMode` automático | Ausente | Derivado do `type` |
| `16px` mobile | Parcial (global.css) | Explícito no componente |

### Solução
- Criar `Input.tsx` completo portado do eSecom
- Atualizar `FormField` para usar o novo `Input`

---

## 4. Loading / Skeleton

### Gap
| Aspecto | secomvsaas | eSecom |
|---------|-----------|--------|
| Spinner | Border simples | SVG com `stroke-dasharray` animado |
| Skeleton variantes | `text/rectangular/circular` | + `card/avatar` |
| Skeleton animation | `wave` apenas | `pulse` e `wave` |
| Loading com texto | Ausente | `text` prop |
| `aria-live` | Presente | Presente |

### Solução
- Melhorar `Spinner` com SVG animado
- Adicionar variantes `card` e `avatar` ao Skeleton
- Adicionar prop `animation` ao Skeleton

---

## 5. Card

### Gap
| Aspecto | secomvsaas | eSecom |
|---------|-----------|--------|
| Variante `filled` | Ausente | `background: neutral-50` |
| `size` prop | Ausente | `sm/md/lg` (border-radius) |
| Hover shadow | `transform + shadow` | `::after` pseudo-element (sem layout shift) |
| Mobile hover | Sem override | `transform: none` em mobile |

### Solução
- Adicionar variante `filled`
- Adicionar prop `size`
- Migrar hover para `::after` (sem layout shift)

---

## 6. Modal

### Gap
| Aspecto | secomvsaas | eSecom |
|---------|-----------|--------|
| `footer` slot | Ausente | `footer?: ReactNode` |
| `description` prop | Ausente | Presente |
| `closeOnOverlayClick` | Hardcoded true | Prop configurável |
| `closeOnEscape` | Hardcoded true | Prop configurável |
| `body.overflow = hidden` | Ausente | Presente (evita scroll do body) |
| FocusTrap | Ausente | `focus-trap-react` |
| Tamanhos | `sm/md/lg` | + `xl/full` |
| z-index | `50` hardcoded | `var(--z-modal)` |
| Animação | CSS keyframes | Framer Motion (scale + y) |

### Solução
- Adicionar `footer`, `description`, `closeOnOverlayClick`, `closeOnEscape`
- Adicionar `body.style.overflow = 'hidden'` no open
- Adicionar tamanhos `xl` e `full`
- Corrigir z-index para tokens
- Adicionar FocusTrap nativo (sem lib externa)

---

## 7. Dashboard

### Gap
| Aspecto | secomvsaas | eSecom |
|---------|-----------|--------|
| Header banner | Ausente | Gradiente `primary-900→800` com título dourado |
| Stat cards | Emoji + número | Ícone SVG colorido + trend indicator + descrição |
| Widgets | Painéis simples | Header com "Ver todos", scroll interno, hover |
| Quick Actions | Ausente | Grid de botões outline |
| Loading skeleton | Cards genéricos | Skeleton específico por seção |
| Stat icon colors | Ausente | Gradiente por categoria |
| Trend indicators | Ausente | `+X%` positivo/negativo/neutro |
| Responsive | Parcial | Completo (1col mobile, 2col tablet, 4col desktop) |

### Solução
- Reescrever `DashboardPage` com header banner, stat cards com ícones SVG, widgets com header, quick actions

---

## 8. CrudPage

### Gap
| Aspecto | secomvsaas | eSecom |
|---------|-----------|--------|
| Page header | `page-header` simples | Sem equivalente direto |
| Botão criar | Sem ícone | Com ícone `+` |
| Contagem de resultados | Ausente | `X resultados` |
| Filtros ativos | Ausente | Chips de filtro |

### Solução
- Melhorar header do CrudPage com contagem de resultados
- Adicionar ícone `+` no botão criar

---

## 9. Acessibilidade

### Gap
| Aspecto | secomvsaas | eSecom |
|---------|-----------|--------|
| `aria-invalid` nos inputs | Ausente | Presente |
| `aria-describedby` | Ausente | Conecta error/helper |
| `aria-busy` nos botões | Ausente | Presente |
| `role="alert"` nos erros | Presente | Presente |
| FocusTrap no Modal | Ausente | Presente |
| `aria-current="page"` | Implementado | Presente |
| Touch targets 44px | Parcial | Explícito em todos |

---

## Ordem de Implementação

```
1. Tokens CSS (base para tudo)
2. Button (usado em todo lugar)
3. Input (novo componente)
4. Loading/Skeleton (melhorias)
5. Card (melhorias)
6. Modal (footer + FocusTrap + overflow)
7. Dashboard (reescrita)
8. CrudPage (melhorias)
```

---

## Status

| Item | Status |
|------|--------|
| Roadmap profundo | ✅ |
| Tokens CSS completos (escala semântica + input tokens) | ✅ |
| Button (variantes, fullWidth, hover shadow, disabled) | ✅ |
| Input rico (label, error, icons, clear, loading, success, floating) | ✅ |
| Loading SVG animado | ✅ |
| Skeleton (card/avatar + animation prop) | ✅ |
| Card (filled, size, hover sem layout shift) | ✅ |
| Modal (footer, description, FocusTrap, overflow, xl/full, z-index) | ✅ |
| Dashboard (banner, stat cards SVG, widgets, quick actions) | ✅ |
| CrudPage (contagem + ícone criar) | ✅ |
