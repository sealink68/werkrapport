# Werkrapport

Webapp voor een dormakaba-deurtechnieker om een werkrapport in te vullen. De interface staat standaard op Nederlands; je kunt ook Frans kiezen. De antwoorden blijven in de browser bewaard tot je het rapport afrondt.

Na de vragen zie je een voorbeeld. De andere taal wordt via MyMemory ingevuld (Nederlands naar Frans, of Frans naar Nederlands). Het rapport wordt naar het klembord gekopieerd en als `.txt` gedownload. Daarna worden de antwoorden gewist en opent de app ServiceMax Go (`https://go.servicemax.io`). Lukt die overgang niet vanzelf, tik op **Open ServiceMax Go** (Frans: **Ouvrir ServiceMax Go**). Met **Nieuw blanco rapport** wis je alles en begin je opnieuw.

Er is geen build-stap. Het zijn gewone statische bestanden: `index.html`, `css/style.css` en `js/app.js`.

## Op je iPhone zetten

Gebruik Safari. Alleen dan verschijnt het icoon op het beginscherm en opent de app zonder browserbalk.

1. Open in Safari: <https://sealink68.github.io/werkrapport/>
2. Tik op de deelknop (vierkant met een pijl omhoog).
3. Tik op **Zet op beginscherm**.
4. De naam is **Werkrapport**. Tik op **Voeg toe**.
5. Open de app via het nieuwe icoon op het beginscherm.

Het icoon is een wit klembord met een rapport, op de kleur van de oorspronkelijke Opdracht (`WFWorkflowIconStartColor` 3031607807). Dat getal is RGBA `0xB4B2A9FF`, dus achtergrond `#B4B2A9`.

## Lokaal openen

```bash
python3 -m http.server 8080
```

Ga daarna naar `http://localhost:8080/`. De vertaling heeft internet nodig.

## Publicatie

De bestanden staan op `main`. Het adres wordt <https://sealink68.github.io/werkrapport/>.

Pages kon niet vanuit deze omgeving worden aangezet (de token mag de site niet aanmaken). Zet het één keer zelf aan:

1. Open de repository op GitHub.
2. Ga naar **Settings → Pages**.
3. Kies bij **Build and deployment** de bron **GitHub Actions**.

Daarna publiceert `.github/workflows/pages.yml` de root bij elke push naar `main`. Je kunt de workflow ook met de hand starten via **Actions → Deploy GitHub Pages**.
