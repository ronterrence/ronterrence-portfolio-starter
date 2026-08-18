# Ronterrence Portfolio Starter

A simple React + Vite project portfolio inspired by clean builder/project directory websites.

## Run locally

```bash
npm install
npm run dev
```

## Project data

The portfolio uses a curated seven-project catalog in:

```bash
src/data/projectCatalog.js
```

The catalog controls project names, descriptions, categories, tags, ordering, and repository grouping. GitHub controls repository URLs, languages, update dates, archive status, and demo candidates.

Refresh the generated project snapshot with:

```bash
npm run sync:github
```

The sync runs automatically before `npm run dev` and `npm run build`. It validates demo URLs and hides unhealthy deployments instead of publishing broken Demo buttons. You can optionally set `GITHUB_TOKEN` to use authenticated GitHub API limits; the token is read only by the build script and is never included in browser code.

If GitHub is temporarily unavailable, the build retains the last generated snapshot.

## Deploy to Vercel

1. Create a new GitHub repository.
2. Upload this project.
3. Go to Vercel and import the GitHub repository.
4. Use the default build settings:
   - Framework: Vite
   - Build command: `npm run build`
   - Output directory: `dist`
5. Deploy.

You will get a free URL like:

```text
https://ronterrenceportfolio.vercel.app
```
