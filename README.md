# The Last Sunday

Static visual essay for the PremPredict final-day scenarios.

## Local preview

```bash
python3 -m http.server 8000
```

Open `http://127.0.0.1:8000/`.

## Railway

This app is a static site. Railway Railpack can serve it directly from the repository root because the project includes:

- `index.html`
- `Staticfile`
- `railway.json` using the `RAILPACK` builder

Deploy from this directory with:

```bash
railway login
railway init --name rhino
railway up --detach -m "Deploy final-day visual essay"
```
