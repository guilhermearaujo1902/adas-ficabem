# Fica Bem — Projeto Acadêmico

Aplicativo web mobile-first de rede de confiança e proteção para mulheres. Interface simulada em um **frame de celular centralizado** na tela do navegador.

## Estrutura de pastas

```
adas-ficabem/
├── index.html              # Entrada → login
├── css/
│   ├── variables.css       # Tokens de design (cores, fontes)
│   ├── base.css            # Reset e estilos globais
│   ├── layout.css          # Simulador de celular
│   ├── components.css      # Botões, cards, nav, formulários
│   ├── utilities.css       # Utilitários (gerado dos wireframes)
│   └── main.css            # Importa todos os módulos
├── js/
│   ├── storage.js          # Banco simulado (localStorage)
│   ├── navigation.js       # Rotas e proteção de login
│   ├── components/
│   │   └── bottom-nav.js   # Barra inferior compartilhada
│   └── pages/              # Um script por tela com lógica
├── pages/                  # Telas HTML integradas
├── scripts/
│   ├── build-pages.py      # Gera pages/ a partir dos wireframes
│   └── generate-utilities.py
├── legacy-wireframes/      # HTML originais exportados (referência)
└── roteiro.docx            # Especificação funcional
```

## Como executar

Abra com um servidor local (recomendado) ou diretamente o arquivo:

```bash
# Python
python3 -m http.server 8080
# Acesse http://localhost:8080
```

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

## Regenerar páginas

Após alterar wireframes em `legacy-wireframes/`:

```bash
python3 scripts/generate-utilities.py
python3 scripts/build-pages.py
```

## Créditos

Projeto acadêmico — ADS. Design baseado nos wireframes exportados (UX Pilot).
