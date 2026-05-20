# Fica Bem — Projeto Acadêmico

Aplicativo web mobile-first de rede de confiança e proteção para mulheres. Interface simulada em um **frame de celular centralizado** na tela do navegador.

Stack: **HTML**, **CSS** e **JavaScript** (sem backend; persistência em `localStorage`).

## Estrutura de pastas

```
adas-ficabem/
├── index.html              # Entrada → login
├── css/
│   ├── variables.css       # Tokens de design (cores, fontes)
│   ├── base.css            # Reset e estilos globais
│   ├── layout.css          # Simulador de celular
│   ├── components.css      # Botões, cards, nav, formulários
│   ├── utilities.css       # Utilitários de layout (Tailwind-like)
│   └── main.css            # Importa todos os módulos
├── js/
│   ├── storage.js          # Banco simulado (localStorage)
│   ├── navigation.js       # Rotas e proteção de login
│   ├── app-core.js         # Utilitários compartilhados
│   ├── components/
│   │   └── bottom-nav.js   # Barra inferior compartilhada
│   └── pages/              # Um script por tela com lógica
├── pages/                  # Telas HTML integradas
├── legacy-wireframes/      # HTML originais exportados (referência visual)
└── roteiro.txt             # Especificação funcional resumida
```

## Como executar

Use um servidor local estático (recomendado para `localStorage` e imports relativos):

```bash
npx --yes serve .
# Acesse a URL exibida no terminal (ex.: http://localhost:3000)
```

Alternativa: abra `index.html` diretamente no navegador (alguns recursos podem variar conforme o browser).

## Fluxo principal (roteiro)

1. **Login** → Entrar (sessão demo) → Feed | Tenho convite → Convite  
2. **Convite** → Validar código `FICABEM2025` → Criar perfil  
3. **Criar perfil** → Criar conta → Feed  
4. **Feed** → Filtros, Rota segura, Explorar, Perfil  
5. **Explorar** → Detalhe do local → Avaliar / Iniciar rota  
6. **Avaliação** (7 etapas) → Publicar → Feed  
7. Em qualquer etapa 1–6: **Pular** → Revisão final (etapa 7)

## localStorage

Chave: `ficabem_app_v1`

Armazena usuárias, locais, avaliações, convites e rascunho da avaliação em andamento. API global: `FicaBemDB` (ver comentários em `js/storage.js`).

## Wireframes legados

A pasta `legacy-wireframes/` guarda os HTML exportados originais. As telas ativas ficam em `pages/` e são editadas manualmente em HTML/CSS/JS.

## Créditos

Projeto acadêmico — ADS. Design baseado nos wireframes exportados (UX Pilot).
