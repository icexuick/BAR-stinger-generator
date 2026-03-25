# BAR Alpha Cup VI — Stinger Project

## Bestanden

```
bar-stinger/
├── stinger-v1-simple.html      ← Simpele versie (logo in één keer)
├── stinger-v2-animated.html    ← Animated build (elementen komen los binnen)
├── README.md
└── assets/
    ├── shield.svg              ← Dark shield achtergrond
    ├── bar-logo.svg            ← BAR logo (zilver)
    ├── alpha.svg               ← "ALPHA" tekst (goud)
    ├── alpha-vi.svg            ← αVI symbool (goud + zilver)
    ├── cup.svg                 ← "CUP" tekst (zilver)
    ├── cup.png                 ← PNG fallback
    ├── alpha.png               ← PNG fallback
    ├── bar-logo.png            ← PNG fallback
    └── logo-full.png           ← Volledig samengesteld logo (voor V1)
```

## Gebruiken in VS Code

1. Installeer de **Live Server** extensie
2. Rechtermuisklik op een HTML-bestand → "Open with Live Server"
3. De stinger speelt automatisch af — klik **Replay** om opnieuw te bekijken

## Renderen naar 4K WebM voor OBS

### Methode 1: OBS Browser Source (makkelijkst)
1. Voeg een **Browser Source** toe in OBS
2. Stel in: Local File → pad naar het HTML-bestand
3. Breedte: 3840, Hoogte: 2160
4. Neem op met een hotkey of maak een recording

### Methode 2: Chrome + Puppeteer (preciezer)
Gebruik een Puppeteer-script om frame-by-frame te renderen naar PNG-sequence,
daarna FFmpeg om te converteren naar WebM met alpha.

### Timing
- **V1**: ~1.9 seconden
- **V2**: ~2.6 seconden

## Aanpassen

De timing van elk element staat in de CSS `animation` properties.
Zoek naar de seconde-waarden (bijv. `0.55s`) om de volgorde aan te passen.

De posities van de logo-onderdelen staan in de `.part-*` CSS classes
(top, left, width percentages).
