#!/usr/bin/env python3
"""
Extrai o conteúdo dos wireframes (iframe srcdoc) e gera páginas HTML
integradas ao template mobile do projeto Fica Bem.
"""
import html
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PAGES_DIR = ROOT / "pages"

FILE_MAP = {
    "login.html": "login.html",
    "fedd.html": "feed.html",
    "convite.html": "convite.html",
    "criarperfil.html": "criar-perfil.html",
    "explorar.html": "explorar.html",
    "detalhe.html": "detalhe.html",
    "rota.html": "rota.html",
    "perfil.html": "perfil.html",
    "avalicao1.html": "avaliacao-1.html",
    "avaliacao2.html": "avaliacao-2.html",
    "avaliacao3.html": "avaliacao-3.html",
    "avaliacao4.html": "avaliacao-4.html",
    "avaliacao5.html": "avaliacao-5.html",
    "avaliacao6.html": "avaliacao-6.html",
    "avaliacao7.html": "avaliacao-7.html",
    "filtro.html": "filtro.html",
}

SCRIPT_MAP = {
    "login.html": "login.js",
    "feed.html": "feed.js",
    "convite.html": "convite.js",
    "criar-perfil.html": "criar-perfil.js",
    "explorar.html": "explorar.js",
    "detalhe.html": "detalhe.js",
    "rota.html": "rota.js",
    "perfil.html": "perfil.js",
    "avaliacao-1.html": "avaliacao-1.js",
    "avaliacao-2.html": "avaliacao-2.js",
    "avaliacao-3.html": "avaliacao-3.js",
    "avaliacao-4.html": "avaliacao-4.js",
    "avaliacao-5.html": "avaliacao-5.js",
    "avaliacao-6.html": "avaliacao-6.js",
    "avaliacao-7.html": "avaliacao-7.js",
    "filtro.html": "filtro.js",
}

TEMPLATE = """<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" crossorigin="anonymous">
  <link rel="stylesheet" href="../css/main.css">
</head>
<body class="app-body" data-page="{page_id}">
  <div class="phone-device" aria-label="Simulador de aplicativo mobile">
    <div class="phone-notch" aria-hidden="true"></div>
    <div class="phone-screen">
{body}
    </div>
    <div class="phone-home-indicator" aria-hidden="true"></div>
  </div>
  <script src="../js/storage.js"></script>
  <script src="../js/navigation.js"></script>
{extra_scripts}
</body>
</html>
"""


def extract_srcdoc(path):
    text = path.read_text(encoding="utf-8")
    m = re.search(r'srcdoc="([^"]*)"', text, re.DOTALL)
    if not m:
        return None
    return html.unescape(m.group(1))


def clean_body(content):
    content = re.sub(r"<script[\s\S]*?</script>", "", content, flags=re.I)
    title_m = re.search(r"<title>([^<]+)</title>", content, re.I)
    title = title_m.group(1).strip() if title_m else "Fica Bem"
    body_tag = re.search(r"<body([^>]*)>", content, re.I)
    body_class = ""
    if body_tag:
        cm = re.search(r'class="([^"]*)"', body_tag.group(1))
        if cm:
            body_class = cm.group(1).strip()
    body_m = re.search(r"<body[^>]*>([\s\S]*)</body>", content, re.I)
    if not body_m:
        return title, "", body_class
    body = body_m.group(1).strip()
    body = re.sub(
        r'<nav id="bottom-nav"[\s\S]*?</nav>',
        '<nav id="bottom-nav" class="bottom-nav" data-component="bottom-nav"></nav>',
        body,
        count=1,
    )
    body = body.replace('href="#"', 'href="javascript:void(0)"')
    wrapped = f'<div class="phone-screen-inner {body_class}">\n{body}\n</div>'
    return title, wrapped, body_class


def main():
    PAGES_DIR.mkdir(parents=True, exist_ok=True)
    for src_name, dest_name in FILE_MAP.items():
        src = ROOT / "legacy-wireframes" / src_name
        if not src.exists():
            src = ROOT / src_name
        if not src.exists():
            print(f"SKIP missing: {src_name}")
            continue
        raw = extract_srcdoc(src)
        if not raw:
            print(f"SKIP no srcdoc: {src_name}")
            continue
        title, body, _body_class = clean_body(raw)
        page_id = dest_name.replace(".html", "")
        scripts = ['  <script src="../js/components/bottom-nav.js"></script>']
        if dest_name.startswith("avaliacao-"):
            scripts.insert(0, '  <script src="../js/pages/avaliacao-shared.js"></script>')
        if dest_name in SCRIPT_MAP:
            scripts.append(f'  <script src="../js/pages/{SCRIPT_MAP[dest_name]}"></script>')
        out = TEMPLATE.format(
            title=title,
            page_id=page_id,
            body="      " + body.replace("\n", "\n      "),
            extra_scripts="\n".join(scripts),
        )
        dest = PAGES_DIR / dest_name
        dest.write_text(out, encoding="utf-8")
        print(f"OK {dest_name}")


if __name__ == "__main__":
    main()
