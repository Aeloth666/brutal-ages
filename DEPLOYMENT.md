# Brutal Ages – web version

🇨🇿 Česky: [NASAZENI.md](NASAZENI.md)

The whole game is a static website: just upload the contents of this folder to any hosting with HTTPS.
HTTPS is needed for online play (WebRTC), real weather (location) and offline mode (service worker).

## Deployment options
- **Netlify Drop** – open https://app.netlify.com/drop and drag the `web` folder there. Done in a minute.
- **GitHub Pages** – push the folder contents to a repository, then in Settings → Pages pick the branch and the root `/`.
- **itch.io** – create an HTML project, upload `BrutalAges-web.zip`, tick "This file will be played in the browser"
  and set the size to e.g. 1280 × 640 with the "Fullscreen button".
- **Your own server** – copy the files to the web root (Apache, nginx, …). No backend is needed.

## What works on the web
- single player, campaign, challenges, tournaments, profile (data is stored in the browser)
- online play with friends via a code or an invite – even between the web and the phone app
- install to the home screen (PWA) and offline play
- keyboard controls on a computer (help in the game settings), on a phone the game switches to full screen

## Trying it locally
Run e.g. `npx serve` or `python -m http.server 8080` in this folder and open http://localhost:8080
(offline mode is disabled on localhost for development, add `?pwa` to the address if you want to try it).

After changing the game in the `www` folder, run `build-web.ps1` again – the `web` folder is recreated.
