import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { githubOwner, projectCatalog } from '../src/data/projectCatalog.js';

const generatedFile = fileURLToPath(new URL('../src/data/projects.generated.json', import.meta.url));

function requestWithTimeout(fetchImpl, url, options = {}, timeoutMs = 6000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return fetchImpl(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(timer));
}

export function githubPagesUrl(owner, repository) {
  return `https://${owner}.github.io/${repository}/`;
}

export async function isHealthyDemo(url, fetchImpl = fetch, timeoutMs = 6000) {
  if (!url) return false;

  try {
    // Streamlit's normal entry point uses a cookie-based authentication redirect.
    // Probe the public embed view, while retaining the original link on the card.
    const parsedUrl = new URL(url);
    if (parsedUrl.hostname.endsWith('.streamlit.app')) parsedUrl.searchParams.set('embed', 'true');
    const probeUrl = parsedUrl.hostname.endsWith('.streamlit.app') ? parsedUrl.href : url;
    const head = await requestWithTimeout(fetchImpl, probeUrl, { method: 'HEAD', redirect: 'follow' }, timeoutMs);
    if (head.ok) return true;
    if (parsedUrl.hostname.endsWith('.streamlit.app') && head.status === 404) {
      const canonical = await requestWithTimeout(fetchImpl, url, { method: 'HEAD', redirect: 'manual' }, timeoutMs);
      return canonical.status >= 300 && canonical.status < 400;
    }
    if (head.status !== 405) return false;

    const get = await requestWithTimeout(fetchImpl, probeUrl, { method: 'GET', redirect: 'follow' }, timeoutMs);
    return get.ok;
  } catch {
    return false;
  }
}

function fallbackRepository(owner, repository) {
  return {
    name: repository.name,
    label: repository.label,
    url: `https://github.com/${owner}/${repository.name}`,
    language: null,
    updatedAt: null,
    archived: false
  };
}

export async function buildProjects({ catalog = projectCatalog, owner = githubOwner, repositories, fetchImpl = fetch, warn = console.warn }) {
  const repositoryMap = new Map(repositories.map((repository) => [repository.name.toLowerCase(), repository]));
  const projects = [];

  for (const project of catalog) {
    const matched = project.repositories.flatMap((configured) => {
      const repository = repositoryMap.get(configured.name.toLowerCase());
      if (!repository) {
        warn(`[github-sync] Missing public repository: ${owner}/${configured.name}`);
        return [];
      }
      return [{
        name: repository.name,
        label: configured.label,
        url: repository.html_url,
        language: repository.language || null,
        updatedAt: repository.pushed_at || repository.updated_at || null,
        archived: Boolean(repository.archived)
      }];
    });

    if (matched.length === 0) {
      warn(`[github-sync] Omitting ${project.name}: none of its repositories are public.`);
      continue;
    }

    const configuredNames = new Set(project.repositories.map(({ name }) => name.toLowerCase()));
    const candidates = [project.demoUrl, ...repositories
      .filter(({ name }) => configuredNames.has(name.toLowerCase()))
      .flatMap((repository) => {
        const homepage = repository.homepage?.trim();
        if (homepage) return [homepage];
        return repository.has_pages ? [githubPagesUrl(owner, repository.name)] : [];
      })].filter(Boolean);

    let demo = '';
    for (const candidate of [...new Set(candidates)]) {
      if (await isHealthyDemo(candidate, fetchImpl)) {
        demo = candidate;
        break;
      }
      warn(`[github-sync] Hiding unhealthy demo for ${project.name}: ${candidate}`);
    }

    const updatedAt = matched.map(({ updatedAt }) => updatedAt).filter(Boolean).sort().at(-1) || null;
    const languages = [...new Set(matched.map(({ language }) => language).filter(Boolean))];

    projects.push({
      ...project,
      repositories: matched,
      demo,
      languages,
      updatedAt,
      archived: matched.every(({ archived }) => archived)
    });
  }

  return projects;
}

export function buildOfflineProjects(catalog = projectCatalog, owner = githubOwner) {
  return catalog.map((project) => ({
    ...project,
    repositories: project.repositories.map((repository) => fallbackRepository(owner, repository)),
    demo: '',
    languages: [],
    updatedAt: null,
    archived: false
  }));
}

async function readSnapshot() {
  try {
    return JSON.parse(await readFile(generatedFile, 'utf8'));
  } catch {
    return null;
  }
}

async function refreshSnapshotDemos(projects, fetchImpl) {
  return Promise.all(projects.map(async (project) => ({
    ...project,
    demo: project.demo && await isHealthyDemo(project.demo, fetchImpl) ? project.demo : ''
  })));
}

export async function syncGitHubProjects({ fetchImpl = fetch, token = process.env.GITHUB_TOKEN, warn = console.warn } = {}) {
  const headers = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'ronterrence-portfolio-sync',
    'X-GitHub-Api-Version': '2022-11-28'
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const response = await requestWithTimeout(
      fetchImpl,
      `https://api.github.com/users/${githubOwner}/repos?per_page=100&type=owner&sort=updated`,
      { headers },
      10000
    );
    if (!response.ok) throw new Error(`GitHub returned HTTP ${response.status}`);
    const repositories = await response.json();
    return await buildProjects({ repositories, fetchImpl, warn });
  } catch (error) {
    warn(`[github-sync] GitHub unavailable (${error.message}). Using the last generated snapshot.`);
    const snapshot = await readSnapshot();
    return snapshot ? refreshSnapshotDemos(snapshot, fetchImpl) : buildOfflineProjects();
  }
}

export async function runSync(options = {}) {
  const projects = await syncGitHubProjects(options);
  await writeFile(generatedFile, `${JSON.stringify(projects, null, 2)}\n`, 'utf8');
  return projects;
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  const projects = await runSync();
  console.log(`[github-sync] Wrote ${projects.length} projects to src/data/projects.generated.json`);
}
