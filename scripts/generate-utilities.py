#!/usr/bin/env python3
"""
Gera css/utilities.css com cobertura completa das classes Tailwind
usadas nos wireframes legados (paridade visual).
"""
import html
import re
import glob
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

BRAND = {
    "50": "#f0fdf4", "100": "#dcfce7", "200": "#bbf7d0", "300": "#86efac",
    "400": "#4ade80", "500": "#5f927d", "600": "#2f6759", "700": "#15803d",
    "800": "#166534", "900": "#14532d",
    "dark": "#2f6759", "light": "#5f927d", "accent": "#4e9983",
}

SPACING = {
    "0": "0", "0.5": "0.125rem", "1": "0.25rem", "1.5": "0.375rem",
    "2": "0.5rem", "2.5": "0.625rem", "3": "0.75rem", "3.5": "0.875rem",
    "4": "1rem", "5": "1.25rem", "6": "1.5rem", "8": "2rem", "10": "2.5rem",
    "12": "3rem", "16": "4rem", "20": "5rem", "24": "6rem",
}

SKIP = {"glass-panel", "glass-effect", "glass-card", "soft-shadow", "no-scrollbar"}


def esc(cls):
    return (
        cls.replace("\\", "\\\\")
        .replace("/", "\\/")
        .replace("[", "\\[")
        .replace("]", "\\]")
        .replace(":", "\\:")
        .replace(".", "\\.")
    )


def collect_classes():
    found = set()
    patterns = [
        str(ROOT / "legacy-wireframes" / "*.html"),
        str(ROOT / "pages" / "*.html"),
    ]
    files = []
    for p in patterns:
        files.extend(glob.glob(p))
    for f in sorted(set(files)):
        text = Path(f).read_text(encoding="utf-8")
        if "srcdoc=" in text:
            m = re.search(r'srcdoc="([^"]*)"', text, re.DOTALL)
            if m:
                text = html.unescape(m.group(1))
        for c in re.findall(r'class="([^"]*)"', text):
            for cls in c.split():
                if cls.startswith("fa-"):
                    continue
                found.add(cls)
    return found


def color_value(token):
    if token in BRAND:
        return BRAND[token]
    if token.startswith("brand-"):
        k = token.replace("brand-", "")
        if k in BRAND:
            return BRAND[k]
        return f"var(--color-brand-{k})"
    if token.startswith("[#") and token.endswith("]"):
        return token[1:-1]
    if token == "white":
        return "#fff"
    if token == "transparent":
        return "transparent"
    if token.startswith("red-") or token.startswith("yellow-"):
        palette = {
            "red-200": "#fecaca", "red-400": "#f87171", "red-500": "#ef4444",
            "yellow-200": "#fef08a", "yellow-400": "#facc15", "yellow-500": "#eab308",
        }
        return palette.get(token)
    return None


def with_alpha(base, alpha_token):
    try:
        if alpha_token.endswith("%"):
            a = int(alpha_token[:-1]) / 100
        else:
            a = int(alpha_token) / 100
    except ValueError:
        a = 0.5
    if base.startswith("#") and len(base) == 7:
        r, g, b = int(base[1:3], 16), int(base[3:5], 16), int(base[5:7], 16)
        return f"rgba({r},{g},{b},{a})"
    return f"color-mix(in srgb, {base} {int(a * 100)}%, transparent)"


def resolve_token(token):
    if "/" in token:
        base, alpha = token.split("/", 1)
        c = color_value(base)
        if c:
            return with_alpha(c, alpha)
        if base == "white":
            return with_alpha("#ffffff", alpha)
    return color_value(token)


def rule_for(cls):
    if cls in SKIP:
        return None

    # hover / active / focus / group / peer
    for prefix in ("hover:", "active:", "focus:", "group-hover:", "peer-focus:"):
        if cls.startswith(prefix):
            inner = cls[len(prefix):]
            inner_rule = rule_for(inner)
            if not inner_rule:
                return None
            prop_block = inner_rule.split("{", 1)[1].rsplit("}", 1)[0]
            selector = f".{esc(cls)}{prefix[:-1]},{prefix[:-1]} .{esc(inner)}"
            if prefix == "hover:":
                return f".{esc(cls)}:hover{{{prop_block}}}"
            if prefix == "active:":
                return f".{esc(cls)}:active{{{prop_block}}}"
            if prefix == "focus:":
                return f".{esc(cls)}:focus{{{prop_block}}}"
            return None

    static = {
        "flex": "display:flex", "inline-flex": "display:inline-flex", "grid": "display:grid",
        "hidden": "display:none", "block": "display:block", "inline-block": "display:inline-block",
        "flex-col": "flex-direction:column", "flex-row": "flex-direction:row",
        "flex-1": "flex:1 1 0%", "flex-wrap": "flex-wrap:wrap", "shrink-0": "flex-shrink:0",
        "grow": "flex-grow:1", "items-center": "align-items:center",
        "items-start": "align-items:flex-start", "items-end": "align-items:flex-end",
        "items-baseline": "align-items:baseline", "justify-center": "justify-content:center",
        "justify-between": "justify-content:space-between",
        "justify-around": "justify-content:space-around", "justify-start": "justify-content:flex-start",
        "self-center": "align-self:center", "self-start": "align-self:flex-start",
        "self-end": "align-self:flex-end",
        "relative": "position:relative", "absolute": "position:absolute",
        "fixed": "position:fixed", "sticky": "position:sticky", "static": "position:static",
        "inset-0": "inset:0", "top-0": "top:0", "left-0": "left:0", "right-0": "right:0",
        "bottom-0": "bottom:0",
        "overflow-hidden": "overflow:hidden", "overflow-y-auto": "overflow-y:auto",
        "overflow-x-auto": "overflow-x:auto", "overflow-x-hidden": "overflow-x:hidden",
        "pointer-events-none": "pointer-events:none", "cursor-pointer": "cursor:pointer",
        "select-none": "user-select:none", "uppercase": "text-transform:uppercase",
        "italic": "font-style:italic", "underline": "text-decoration:underline",
        "line-through": "text-decoration:line-through",
        "truncate": "overflow:hidden;text-overflow:ellipsis;white-space:nowrap",
        "whitespace-nowrap": "white-space:nowrap", "text-center": "text-align:center",
        "text-left": "text-align:left", "text-right": "text-align:right",
        "object-cover": "object-fit:cover", "object-contain": "object-fit:contain",
        "aspect-square": "aspect-ratio:1/1", "mx-auto": "margin-left:auto;margin-right:auto",
        "bg-transparent": "background-color:transparent", "border-none": "border:none",
        "outline-none": "outline:none", "transform": "transform:translateZ(0)",
        "snap-start": "scroll-snap-align:start", "group": "position:relative",
        "peer": "position:relative", "sr-only": "position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0",
        "animate-pulse": "animation:pulse 2s cubic-bezier(0.4,0,0.6,1) infinite",
        "animate-fade-in": "animation:fadeIn 0.5s ease-out",
        "transition-colors": "transition-property:color,background-color,border-color,text-decoration-color,fill,stroke;transition-timing-function:cubic-bezier(0.4,0,0.2,1);transition-duration:150ms",
        "transition-all": "transition-property:all;transition-timing-function:cubic-bezier(0.4,0,0.2,1);transition-duration:150ms",
        "transition-transform": "transition-property:transform;transition-timing-function:cubic-bezier(0.4,0,0.2,1);transition-duration:150ms",
        "w-full": "width:100%", "h-full": "height:100%", "min-w-0": "min-width:0",
        "blur-2xl": "filter:blur(40px)", "blur-3xl": "filter:blur(64px)",
        "backdrop-blur-sm": "backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px)",
        "backdrop-blur-md": "backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px)",
        "backdrop-blur-lg": "backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px)",
        "backdrop-blur-xl": "backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px)",
        "drop-shadow-2xl": "filter:drop-shadow(0 25px 25px rgb(0 0 0 / 0.15))",
        "no-scrollbar": "-ms-overflow-style:none;scrollbar-width:none",
        "hide-scrollbar": "-ms-overflow-style:none;scrollbar-width:none",
        "custom-scrollbar": "-ms-overflow-style:none;scrollbar-width:none",
    }
    if cls in static:
        extra = ""
        if cls in ("no-scrollbar", "hide-scrollbar", "custom-scrollbar"):
            e = esc(cls)
            extra = f".{e}::-webkit-scrollbar{{display:none}}"
        return f".{esc(cls)}{{{static[cls]}}}{extra}"

    m = re.match(r"^duration-(\d+)$", cls)
    if m:
        return f".{esc(cls)}{{transition-duration:{int(m.group(1))*100}ms}}"

    m = re.match(r"^delay-(\d+)$", cls)
    if m:
        return f".{esc(cls)}{{transition-delay:{int(m.group(1))*100}ms}}"

    m = re.match(r"^space-y-([\d.]+)$", cls)
    if m and m.group(1) in SPACING:
        gap = SPACING[m.group(1)]
        e = esc(cls)
        return f".{e}>*+*{{margin-top:{gap}}}"

    m = re.match(r"^space-x-([\d.]+)$", cls)
    if m and m.group(1) in SPACING:
        gap = SPACING[m.group(1)]
        e = esc(cls)
        return f".{e}>*+*{{margin-left:{gap}}}"

    for prefix, prop in [
        ("gap", "gap"), ("p", "padding"), ("px", "padding-left;padding-right"),
        ("py", "padding-top;padding-bottom"), ("pt", "padding-top"), ("pb", "padding-bottom"),
        ("pl", "padding-left"), ("pr", "padding-right"),
        ("m", "margin"), ("mx", "margin-left;margin-right"),
        ("my", "margin-top;margin-bottom"), ("mt", "margin-top"), ("mb", "margin-bottom"),
        ("ml", "margin-left"), ("mr", "margin-right"),
    ]:
        m = re.match(rf"^{prefix}-([\d.]+)$", cls)
        if m and m.group(1) in SPACING:
            val = SPACING[m.group(1)]
            if ";" in prop:
                return f".{esc(cls)}{{{prop.replace(';', f':{val};')}}}"
            return f".{esc(cls)}{{{prop}:{val}}}"

    m = re.match(r"^w-([\d.]+)$", cls)
    if m and m.group(1) in SPACING:
        return f".{esc(cls)}{{width:{SPACING[m.group(1)]}}}"
    elif re.match(r"^w-(\d+)$", cls):
        m = re.match(r"^w-(\d+)$", cls)
        return f".{esc(cls)}{{width:{int(m.group(1))*0.25}rem}}"

    m = re.match(r"^h-([\d.]+)$", cls)
    if m and m.group(1) in SPACING:
        return f".{esc(cls)}{{height:{SPACING[m.group(1)]}}}"
    elif re.match(r"^h-(\d+)$", cls):
        m = re.match(r"^h-(\d+)$", cls)
        return f".{esc(cls)}{{height:{int(m.group(1))*0.25}rem}}"
    m = re.match(r"^min-w-(\d+)$", cls)
    if m:
        return f".{esc(cls)}{{min-width:{int(m.group(1))*0.25}rem}}"
    m = re.match(r"^max-w-(\d+)$", cls)
    if m:
        return f".{esc(cls)}{{max-width:{int(m.group(1))*0.25}rem}}"

    m = re.match(r"^(w|h|min-w|max-w|min-h|max-h|top|left|right|bottom)-\[(.+)\]$", cls)
    if m:
        prop_map = {
            "w": "width", "h": "height", "min-w": "min-width", "max-w": "max-width",
            "min-h": "min-height", "max-h": "max-height",
            "top": "top", "left": "left", "right": "right", "bottom": "bottom",
        }
        return f".{esc(cls)}{{{prop_map[m.group(1)]}:{m.group(2)}}}"

    m = re.match(r"^(-?)top-\[(.+)\]$", cls)
    if m:
        return f".{esc(cls)}{{top:{m.group(1)}{m.group(2)}}}"
    for side in ("top", "left", "right", "bottom"):
        m = re.match(rf"^{side}-\[(.+)\]$", cls)
        if m:
            return f".{esc(cls)}{{{side}:{m.group(1)}}}"

    m = re.match(r"^rounded(-full|-2xl|-3xl|-xl|-lg|-md|-sm)?$", cls)
    if m:
        radii = {"": "0.25rem", "-sm": "0.125rem", "-md": "0.375rem", "-lg": "0.5rem",
                 "-xl": "0.75rem", "-2xl": "1rem", "-3xl": "1.5rem", "-full": "9999px"}
        return f".{esc(cls)}{{border-radius:{radii.get(m.group(1) or '', '0.25rem')}}}"

    m = re.match(r"^rounded-\[(.+)\]$", cls)
    if m:
        return f".{esc(cls)}{{border-radius:{m.group(1)}}}"

    m = re.match(r"^rounded-([a-z]+)$", cls)
    if m:
        map_r = {"t": "top-left-radius:0.25rem;top-right-radius:0.25rem",
                 "b": "bottom-left-radius:0.25rem;bottom-right-radius:0.25rem",
                 "l": "border-top-left-radius:0.25rem;border-bottom-left-radius:0.25rem",
                 "r": "border-top-right-radius:0.25rem;border-bottom-right-radius:0.25rem",
                 "tl": "border-top-left-radius:0.25rem", "tr": "border-top-right-radius:0.25rem",
                 "bl": "border-bottom-left-radius:0.25rem", "br": "border-bottom-right-radius:0.25rem"}
        if m.group(1) in map_r:
            return f".{esc(cls)}{{{map_r[m.group(1)]}}}"

    m = re.match(r"^font-(sans|serif|light|normal|medium|semibold|bold)$", cls)
    if m:
        fonts = {
            "sans": "font-family:var(--font-sans)", "serif": "font-family:var(--font-serif)",
            "light": "font-weight:300", "normal": "font-weight:400", "medium": "font-weight:500",
            "semibold": "font-weight:600", "bold": "font-weight:700",
        }
        return f".{esc(cls)}{{{fonts[m.group(1)]}}}"

    m = re.match(r"^text-(xs|sm|base|lg|xl|2xl|3xl)$", cls)
    if m:
        sizes = {"xs": "0.75rem", "sm": "0.875rem", "base": "1rem", "lg": "1.125rem",
                 "xl": "1.25rem", "2xl": "1.5rem", "3xl": "1.875rem"}
        return f".{esc(cls)}{{font-size:{sizes[m.group(1)]}}}"

    m = re.match(r"^text-\[(.+)\]$", cls)
    if m:
        v = m.group(1)
        if re.match(r"^[\d.]+$", v):
            return f".{esc(cls)}{{font-size:{v}rem}}"
        return f".{esc(cls)}{{font-size:{v}}}"

    m = re.match(r"^leading-\[(.+)\]$", cls)
    if m:
        return f".{esc(cls)}{{line-height:{m.group(1)}}}"

    m = re.match(r"^leading-(none|tight|snug|normal|relaxed|loose)$", cls)
    if m:
        lh = {"none": "1", "tight": "1.25", "snug": "1.375", "normal": "1.5",
              "relaxed": "1.625", "loose": "2"}
        return f".{esc(cls)}{{line-height:{lh[m.group(1)]}}}"

    m = re.match(r"^tracking-(tight|wide|wider|tighter)$", cls)
    if m:
        tr = {"tighter": "-0.05em", "tight": "-0.025em", "wide": "0.025em", "wider": "0.05em"}
        return f".{esc(cls)}{{letter-spacing:{tr[m.group(1)]}}}"

    m = re.match(r"^z-(\d+)$", cls)
    if m:
        return f".{esc(cls)}{{z-index:{m.group(1)}}}"

    m = re.match(r"^opacity-(\d+)$", cls)
    if m:
        return f".{esc(cls)}{{opacity:{int(m.group(1))/100}}}"

    m = re.match(r"^border(-[tblr])?(-\d+)?$", cls)
    if m:
        if m.group(2):
            w = int(m.group(2)[1:])
            sides = {"": "border", "-t": "border-top", "-b": "border-bottom",
                     "-l": "border-left", "-r": "border-right"}
            return f".{esc(cls)}{{{sides.get(m.group(1) or '', 'border')}-width:{w}px}}"
        sides = {"": "border-width:1px", "-t": "border-top-width:1px",
                 "-b": "border-bottom-width:1px", "-l": "border-left-width:1px",
                 "-r": "border-right-width:1px"}
        return f".{esc(cls)}{{{sides.get(m.group(1) or '', 'border-width:1px')}}}"

    m = re.match(r"^border-(.+)$", cls)
    if m:
        c = resolve_token(m.group(1))
        if c:
            return f".{esc(cls)}{{border-color:{c}}}"

    m = re.match(r"^bg-(.+)$", cls)
    if m:
        if cls.startswith("bg-gradient-to-"):
            direction = cls.replace("bg-gradient-to-", "")
            deg = {"t": "0deg", "b": "180deg", "l": "270deg", "r": "90deg",
                   "tr": "45deg", "br": "135deg"}.get(direction, "180deg")
            return f".{esc(cls)}{{background-image:linear-gradient({deg},var(--tw-gradient-stops))}}"
        c = resolve_token(m.group(1))
        if c:
            return f".{esc(cls)}{{background-color:{c}}}"

    m = re.match(r"^from-(.+)$", cls)
    if m:
        c = resolve_token(m.group(1))
        if c:
            return f".{esc(cls)}{{--tw-gradient-from:{c};--tw-gradient-stops:var(--tw-gradient-from),var(--tw-gradient-to,transparent)}}"

    m = re.match(r"^to-(.+)$", cls)
    if m:
        c = resolve_token(m.group(1))
        if c:
            return f".{esc(cls)}{{--tw-gradient-to:{c}}}"

    m = re.match(r"^text-(.+)$", cls)
    if m:
        c = resolve_token(m.group(1))
        if c:
            return f".{esc(cls)}{{color:{c}}}"

    m = re.match(r"^shadow(\[.+\]|-sm|-lg|-xl|-md)?$", cls)
    if m:
        if cls.startswith("shadow-[") and cls.endswith("]"):
            val = cls[7:-1].replace("_", " ")
            return f".{esc(cls)}{{box-shadow:{val}}}"
        shadows = {"shadow": "0 1px 3px rgba(0,0,0,.1)", "shadow-sm": "0 1px 2px rgba(0,0,0,.05)",
                   "shadow-md": "0 4px 6px rgba(0,0,0,.1)", "shadow-lg": "0 10px 15px rgba(0,0,0,.1)",
                   "shadow-xl": "0 20px 25px rgba(0,0,0,.1)"}
        return f".{esc(cls)}{{{shadows.get(cls, shadows['shadow'])}}}"

    m = re.match(r"^ring(-\d+)?$", cls)
    if m:
        w = m.group(1)[1:] if m.group(1) else "2"
        return f".{esc(cls)}{{box-shadow:0 0 0 {w}px currentColor}}"

    m = re.match(r"^scale-\[(.+)\]$", cls)
    if m:
        return f".{esc(cls)}{{transform:scale({m.group(1)})}}"

    m = re.match(r"^-(top|left|right|bottom)-([\d.]+)$", cls)
    if m and m.group(2) in SPACING:
        val = SPACING[m.group(2)]
        return f".{esc(cls)}{{{m.group(1)}:-{val}}}"

    m = re.match(r"^-(top|left|right|bottom)-\[([^\]]+)\]$", cls)
    if m:
        return f".{esc(cls)}{{{m.group(1)}:-{m.group(2)}}}"

    m = re.match(r"^-translate-x-1\/2$", cls)
    if m:
        return f".{esc(cls)}{{transform:translateX(-50%)}}"
    m = re.match(r"^-translate-y-1\/2$", cls)
    if m:
        return f".{esc(cls)}{{transform:translateY(-50%)}}"
    m = re.match(r"^-translate-y-full$", cls)
    if m:
        return f".{esc(cls)}{{transform:translateY(-100%)}}"

    m = re.match(r"^-mx-([\d.]+)$", cls)
    if m and m.group(1) in SPACING:
        val = SPACING[m.group(1)]
        return f".{esc(cls)}{{margin-left:-{val};margin-right:-{val}}}"

    m = re.match(r"^-mt-([\d.]+)$", cls)
    if m and m.group(1) in SPACING:
        val = SPACING[m.group(1)]
        return f".{esc(cls)}{{margin-top:-{val}}}"

    m = re.match(r"^-z-(\d+)$", cls)
    if m:
        return f".{esc(cls)}{{z-index:-{m.group(1)}}}"

    m = re.match(r"^placeholder-(.+)$", cls)
    if m:
        c = resolve_token(m.group(1))
        if c:
            return f".{esc(cls)}::placeholder{{color:{c}}}"

    m = re.match(r"^selection:(.+)$", cls)
    if m:
        return None

    if cls.startswith("selection:"):
        return None

    return None


def main():
    classes = collect_classes()
    rules = []
    seen_css = set()
    missing = []

    for cls in sorted(classes):
        r = rule_for(cls)
        if r:
            if r not in seen_css:
                seen_css.add(r)
                rules.append(r)
        elif cls not in SKIP and not cls.startswith("selection:"):
            missing.append(cls)

    out = ROOT / "css" / "utilities.css"
    header = "/* Utilitários — paridade com Tailwind dos wireframes legados */\n\n"
    out.write_text(header + "\n".join(rules) + "\n", encoding="utf-8")
    print(f"Rules: {len(rules)}, classes: {len(classes)}, still missing: {len(missing)}")
    if missing[:30]:
        print("Sample missing:", ", ".join(missing[:30]))


if __name__ == "__main__":
    main()
