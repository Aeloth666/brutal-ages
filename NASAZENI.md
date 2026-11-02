# Brutal Ages – webová verze

Celá hra je statický web: stačí nahrát obsah této složky na libovolný hosting s HTTPS.
HTTPS je potřeba kvůli hře online (WebRTC), skutečnému počasí (poloha) a offline režimu (service worker).

## Možnosti nasazení
- **Netlify Drop** – otevři https://app.netlify.com/drop a přetáhni tam složku `web`. Hotovo za minutu.
- **GitHub Pages** – nahraj obsah složky do repozitáře, v Settings → Pages zvol větev a kořen `/`.
- **itch.io** – nový projekt typu HTML, nahraj `BrutalAges-web.zip`, zaškrtni „This file will be played in the browser“
  a nastav rozměr třeba 1280 × 640 a „Fullscreen button“.
- **Vlastní server** – zkopíruj soubory do kořene webu (Apache, nginx, …). Žádný backend není potřeba.

## Co funguje na webu
- hra pro jednoho, kampaň, výzvy, turnaje, profil (data se ukládají do prohlížeče)
- hra s kámoši online přes kód nebo pozvánku – i mezi webem a aplikací v telefonu
- instalace na plochu (PWA) a hraní offline
- na počítači ovládání klávesnicí (nápověda v Nastavení hry), na mobilu se hra přepne na celou obrazovku

## Lokální vyzkoušení
Spusť v této složce třeba `npx serve` nebo `python -m http.server 8080` a otevři http://localhost:8080
(offline režim se na localhostu kvůli vývoji nezapíná, přidej `?pwa` do adresy, pokud ho chceš zkusit).

Po změně hry ve složce `www` spusť znovu `build-web.ps1` – složka `web` se vytvoří znovu.
