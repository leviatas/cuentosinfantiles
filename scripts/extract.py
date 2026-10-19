"""Convierte los HTML exportados de los artifacts en JSON para la app.

Uso: python3 scripts/extract.py amelia <archivo.html> <salida.json>
     python3 scripts/extract.py didi   <archivo.html> <salida.json>
"""
import json
import re
import sys

from bs4 import BeautifulSoup, NavigableString

ALLOWED = {"strong", "em", "br"}


def clean_html(node):
    """Devuelve el HTML interno dejando sólo <strong>, <em> y <br>."""
    out = []
    for child in node.children:
        if isinstance(child, NavigableString):
            out.append(str(child).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;"))
        elif child.name in ALLOWED:
            out.append("<br>" if child.name == "br" else f"<{child.name}>{clean_html(child)}</{child.name}>")
        elif child.get("aria-hidden") == "true":
            continue
        else:
            out.append(clean_html(child))
    return re.sub(r"\s+", " ", "".join(out)).strip()


def words(blocks):
    text = " ".join(re.sub(r"<[^>]+>", " ", b.get("html", "")) for b in blocks)
    return len(re.findall(r"\w+", text))


def amelia(soup):
    parts = []
    for tp in soup.select(".toc-part"):
        parts.append({"label": tp.select_one(".plabel").get_text(strip=True),
                      "name": tp.select_one(".pname").get_text(strip=True), "chapters": []})
    for sec in soup.select("section.chapter"):
        blocks = []
        for el in sec.select_one(".prose").children:
            if isinstance(el, NavigableString):
                continue
            cls = el.get("class") or []
            if "scene-break" in cls:
                blocks.append({"type": "break"})
            elif "nota" in cls:
                blocks.append({"type": "note", "html": clean_html(el)})
            elif el.name == "p":
                kind = "dialog" if "dlg" in cls else "aside" if "aparte" in cls else "p"
                blocks.append({"type": kind, "html": clean_html(el)})
        parts[int(sec["data-part"])]["chapters"].append(
            {"num": int(sec["data-num"]), "title": sec["data-title"], "words": words(blocks), "blocks": blocks})
    return {"id": "amelia", "title": "Súper Labubus", "parts": parts}


def didi(soup):
    parts = []
    main = soup.select_one("main")
    for el in main.children:
        if isinstance(el, NavigableString):
            continue
        cls = el.get("class") or []
        if "parte-sep" in cls:
            label, _, name = el.select_one(".parte-txt").get_text(strip=True).partition(" · ")
            parts.append({"label": label, "name": name, "chapters": []})
        elif el.name == "section":
            head = el.select_one(".cap-cabecera")
            h2 = head.select_one("h2")
            pal = h2.select_one(".cap-pal")
            if pal:
                pal.extract()
            blocks = []
            for p in el.find_all("p", recursive=False):
                pc = p.get("class") or []
                kind = "dialog" if "dialogo" in pc else "sign" if "cartel" in pc else "p"
                blocks.append({"type": kind, "html": clean_html(p)})
            motivo = head.select_one(".cap-motivo")
            parts[-1]["chapters"].append({
                "num": int(head.select_one(".cap-num").get_text(strip=True)),
                "title": h2.get_text(strip=True),
                "emoji": motivo.get_text(strip=True) if motivo else "",
                "words": words(blocks), "blocks": blocks})
    return {"id": "didi", "title": "Las Superlabubus", "parts": parts}


if __name__ == "__main__":
    which, src, dst = sys.argv[1:4]
    with open(src, encoding="utf-8") as f:
        soup = BeautifulSoup(f.read(), "html.parser")
    book = {"amelia": amelia, "didi": didi}[which](soup)
    with open(dst, "w", encoding="utf-8") as f:
        json.dump(book, f, ensure_ascii=False, separators=(",", ":"))
    n = sum(len(p["chapters"]) for p in book["parts"])
    print(f"{which}: {len(book['parts'])} partes, {n} capítulos")
