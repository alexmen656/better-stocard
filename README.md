# Pocketz

## What is Pocketz? (About the project)

Pocketz is a simple card manager that turns your physical cards into digital ones. It also supports Apple Wallet, allowing you to keep all your cards in one place. Additionally, it includes a sharing feature, so you can digitally share your physical cards with family and friends.
A new feature I added is support for QR codes and GS1-based cards. Pocketz currently supports 5 languages.

## Demo

[YouTube](https://youtu.be/ANMNPKKc5Yc)

## Special Features

- Apple Wallet support
- Barcode Scanner as easier adding method
- Multi-language support
- Card sharing functionality
- Support for multiple card types (Barcode, QR Code, GS1)

## Changes since 1. Siege submission:

Since I already submitted this project to Siege once, here are the changes I made during this week (week 12):

- Added share feature: You can share your cards with other people via a QR code and/or a link
- Multilang support: Added support for 5 languages (translations themselves were mostly by AI to be fair)
- Added delete card feature
- Added edit card feature
- Many minor improvements, such as padding tweaks, general code optimizations, UI bugs, etc
- You can find everything in siege-week-11 branch (the name is wrong it should have been week 12)

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

Install all dependencies defined in `package.json`:

```sh
npm install
```

### Compile and Hot-Reload for Development

Start the development server with hot module replacement for rapid iteration:

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

Build an optimized production bundle:

```sh
npm run build
```

Synchronize the web build with Capacitor native platforms:

```sh
npx cap sync
```

Open the iOS project in Xcode:

```sh
npx cap open ios
```
