"""Suma capítulos escritos en texto plano a un libro de src/data/.

Uso: python3 scripts/add_chapters.py amelia

Lee cuentos/<libro>/parte-*/ (cada carpeta es una parte nueva) y reemplaza
esas partes en src/data/<libro>.json, así se puede correr las veces que haga falta.

Cada carpeta tiene un parte.txt con dos líneas (etiqueta y nombre de la parte)
y un archivo por capítulo (NNN-titulo.txt). Formato del capítulo:
  # Título                → primera línea (# 🧸 Título para ponerle emoji)
  párrafos separados por una línea en blanco
  —Diálogo              → párrafo de diálogo
  ~ texto               → aparte (en cursiva)
  > texto               → nota pinchada (usar \\n\\n para cortar renglones)
  ---                   → separador de escena
  **negrita**, *cursiva*

Límite fijo: ningún capítulo puede pasar de MAX_WORDS palabras (contadas como
las muestra el lector). Rige desde LIMIT_FROM[libro] en adelante y para todos
los capítulos de un libro nuevo. Si alguno se pasa, el script avisa cuáles y
no toca el JSON: hay que recortar el .txt y volver a correrlo.
"""
import html
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

MAX_WORDS = 1000
# Primer capítulo de cada libro al que se le aplica el límite.
LIMIT_FROM = {"amelia": 152, "didi": 98}


def inline(text):
    text = html.escape(text, quote=False)
    text = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", text)
    text = re.sub(r"\*(.+?)\*", r"<em>\1</em>", text)
    return text.replace("\\n", "<br>")


def words(blocks):
    text = " ".join(re.sub(r"<[^>]+>", " ", b.get("html", "")) for b in blocks)
    return len(re.findall(r"\w+", text))


def parse_chapter(path):
    num = int(path.name.split("-")[0])
    raw = path.read_text(encoding="utf-8").strip()
    title_line, _, body = raw.partition("\n")
    blocks = []
    for para in re.split(r"\n\s*\n", body.strip()):
        para = " ".join(line.strip() for line in para.splitlines())
        if para == "---":
            blocks.append({"type": "break"})
        elif para.startswith(">"):
            blocks.append({"type": "note", "html": inline(para[1:].strip())})
        elif para.startswith("~"):
            blocks.append({"type": "aside", "html": inline(para[1:].strip())})
        elif para.startswith("—"):
            blocks.append({"type": "dialog", "html": inline(para)})
        else:
            blocks.append({"type": "p", "html": inline(para)})
    title = title_line.lstrip("# ").strip()
    chapter = {"num": num, "title": title}
    first, _, rest = title.partition(" ")
    if rest and not re.search(r"\w", first):
        chapter = {"num": num, "title": rest.strip(), "emoji": first}
    return {**chapter, "words": words(blocks), "blocks": blocks}


def main(book_id):
    data_path = ROOT / "src" / "data" / f"{book_id}.json"
    book = json.loads(data_path.read_text(encoding="utf-8"))
    for part_dir in sorted((ROOT / "cuentos" / book_id).glob("parte-*")):
        label, name = part_dir.joinpath("parte.txt").read_text(encoding="utf-8").strip().splitlines()[:2]
        chapters = [parse_chapter(p) for p in sorted(part_dir.glob("[0-9]*.txt"))]
        part = {"label": label.strip(), "name": name.strip(), "chapters": chapters}
        nums = {c["num"] for c in chapters}
        book["parts"] = [p for p in book["parts"] if not nums & {c["num"] for c in p["chapters"]}]
        book["parts"].append(part)
        print(f"{part['label']} · {part['name']}: " + ", ".join(f"{c['num']} ({c['words']} pal.)" for c in chapters))
    limit_from = LIMIT_FROM.get(book_id, 0)
    too_long = [c for p in book["parts"] for c in p["chapters"]
                if c["num"] >= limit_from and c["words"] > MAX_WORDS]
    if too_long:
        for c in too_long:
            print(f"ERROR: cap. {c['num']} «{c['title']}» tiene {c['words']} palabras "
                  f"(máximo {MAX_WORDS}, sobran {c['words'] - MAX_WORDS})", file=sys.stderr)
        sys.exit(f"No se guardó {data_path.name}: recortá esos capítulos y volvé a correr el script.")
    book["parts"].sort(key=lambda p: p["chapters"][0]["num"])
    data_path.write_text(json.dumps(book, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")


if __name__ == "__main__":
    main(sys.argv[1])
