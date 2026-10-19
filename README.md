# Cuentos infantiles

Los cuentos para dormir de **Amelia** (*Súper Labubus*, 155 capítulos) y de
**Didi** (*Las Superlabubus*, 109 capítulos). El inicio deja elegir de quién son
los cuentos de hoy; cada libro tiene índice con buscador, modo día/noche,
tamaño de letra, mayúsculas y botón para copiar el cuento.

Recuerda el último cuento de cada nena ("Seguir leyendo · cap. N" en cada
tarjeta del inicio).
Se guarda en el servidor (`data/progress.json`), así que se recuerda aunque
lean desde otro celular o tablet.

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

## Deploy automático

`.github/workflows/deploy.yml` corre en cada push a `main`: entra a
`~/proyectos/MisProyectos/cuentosinfantiles`, hace `git pull --ff-only` y
`docker compose up -d --build`, y después verifica `/health`. También se puede
lanzar a mano desde la pestaña **Actions → Deploy → Run workflow**.

Necesita un runner self-hosted en el servidor (una sola vez):

1. En GitHub: **Settings → Actions → Runners → New self-hosted runner → Linux**.
2. En el servidor, con tu usuario (el dueño de la carpeta y del grupo `docker`),
   correr los comandos que muestra esa página (`mkdir actions-runner`, descargar,
   `./config.sh --url ... --token ...`).
3. Dejarlo como servicio para que arranque solo:
   `sudo ./svc.sh install $USER && sudo ./svc.sh start`.

Como el repo es público, conviene ir a **Settings → Actions → General → Fork pull
request workflows** y elegir *Require approval for all external contributors*,
para que nadie pueda correr código en el servidor con un PR desde un fork.

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
por capítulo, con `# 🧸 Título` si lleva emoji como los de Didi; el formato está explicado arriba de `scripts/add_chapters.py`).
Después se suman al libro con:

```bash
python3 scripts/add_chapters.py amelia
```

Se puede correr las veces que haga falta: reemplaza esas partes sin duplicarlas.
Si se vuelve a correr `extract.py`, hay que correr `add_chapters.py` después.
