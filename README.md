# Cuentos infantiles

Los cuentos para dormir de **Amelia** (*Súper Labubus*, 140 capítulos) y de
**Didi** (*Las Superlabubus*, 94 capítulos). El inicio deja elegir de quién son
los cuentos de hoy; cada libro tiene índice con buscador, modo día/noche,
tamaño de letra, mayúsculas, botón para copiar el cuento y recuerda el último
capítulo leído.

React + Vite para el front, Express (Node) para servirlo, Docker Compose con un
túnel de Cloudflare para publicarlo en un dominio.

## Correr

```bash
cp .env.example .env               # pegar CLOUDFLARE_TUNNEL_TOKEN
docker compose up -d --build       # http://localhost:5175
```

Sin Docker:

```bash
npm install
npm run dev                        # Vite con recarga, http://localhost:5173
npm run build && npm start         # producción, http://localhost:3000
```

## Publicar con Cloudflare

1. Cloudflare Zero Trust → **Networks → Tunnels → Create a tunnel** (tipo *Cloudflared*).
2. Copiar el token del comando de instalación y ponerlo en `.env` como
   `CLOUDFLARE_TUNNEL_TOKEN`.
3. En **Public Hostname** del túnel, agregar el dominio/subdominio
   (por ejemplo `cuentos.tudominio.com`) con servicio `HTTP` →
   `cuentosinfantiles:3000` (el nombre del servicio en `docker-compose.yml`).
4. `docker compose up -d --build`.

## Rutas

| Ruta            | Qué muestra                          |
|-----------------|--------------------------------------|
| `/`             | Elegir: cuentos de Amelia o de Didi  |
| `/amelia`       | Portada e índice de Súper Labubus    |
| `/amelia/12`    | Capítulo 12 de Amelia                |
| `/didi`, `/didi/7` | Lo mismo para Didi                |

## Actualizar los cuentos

Los textos viven en `src/data/amelia.json` y `src/data/didi.json`, generados a
partir del HTML de los artifacts originales:

```bash
pip install beautifulsoup4
python3 scripts/extract.py amelia amelia.html src/data/amelia.json
python3 scripts/extract.py didi   didi.html   src/data/didi.json
```

## Escribir capítulos nuevos

Los capítulos nuevos se escriben en texto plano en `cuentos/<libro>/parte-N/`
(un `parte.txt` con la etiqueta y el nombre de la parte, y un `NNN-titulo.txt`
por capítulo; el formato está explicado arriba de `scripts/add_chapters.py`).
Después se suman al libro con:

```bash
python3 scripts/add_chapters.py amelia
```

Se puede correr las veces que haga falta: reemplaza esas partes sin duplicarlas.
Si se vuelve a correr `extract.py`, hay que correr `add_chapters.py` después.
