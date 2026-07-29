# AGENTS.md

**Static site** - no build, no tests, no package manager. Serve `index.html` directly.


## Structure
- `index.html` - entry point, loads releases from `Viper12CU/link_chest`
- `script.js` - fetches GitHub releases API, renders latest + history
- `styles.css` - basic styling

## Dev
```bash
# Serve locally (any static server)
npx serve .
# or
python -m http.server
```

