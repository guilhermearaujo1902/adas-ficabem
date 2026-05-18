#!/usr/bin/env python3
"""Extrai estilos inline dos wireframes legados para css/legacy-compat.css"""
import html
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "css" / "legacy-compat.css"

def main():
    blocks = []
    seen = set()

    for f in sorted((ROOT / "legacy-wireframes").glob("*.html")):
        text = f.read_text(encoding="utf-8")
        m = re.search(r'srcdoc="([^"]*)"', text, re.DOTALL)
        if not m:
            continue
        content = html.unescape(m.group(1))
        page = f.stem.replace("fedd", "feed").replace("avalicao1", "avaliacao-1")
        page = page.replace("avaliacao", "avaliacao").replace("criarperfil", "criar-perfil")

        for sm in re.finditer(r"<style>([\s\S]*?)</style>", content, re.I):
            css = sm.group(1).strip()
            css = re.sub(r"\bbody\b", ".phone-screen-inner", css)
            key = css[:200]
            if key in seen:
                continue
            seen.add(key)
            blocks.append(f"/* --- {f.name} --- */\n{css}\n")

    header = """/**
 * Estilos extraídos dos wireframes legados (inline <style>).
 * Escopo: .phone-screen-inner substitui body do legado.
 */
"""
    OUT.write_text(header + "\n".join(blocks), encoding="utf-8")
    print(f"Wrote {len(blocks)} blocks -> {OUT}")

if __name__ == "__main__":
    main()
