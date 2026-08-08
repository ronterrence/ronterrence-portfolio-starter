import test from 'node:test';
import assert from 'node:assert/strict';
import { buildOfflineProjects, buildProjects, githubPagesUrl, isHealthyDemo } from '../scripts/sync-github-projects.mjs';

const response = (status, body = null) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => body
});

test('derives the conventional GitHub Pages URL', () => {
  assert.equal(githubPagesUrl('ronterrence', 'demo'), 'https://ronterrence.github.io/demo/');
});

test('accepts healthy demos and retries servers that reject HEAD', async () => {
  assert.equal(await isHealthyDemo('https://demo.test', async () => response(200)), true);
  let calls = 0;
  assert.equal(await isHealthyDemo('https://demo.test', async () => response(++calls === 1 ? 405 : 200)), true);
  assert.equal(calls, 2);
});

test('groups repositories and hides an unhealthy demo', async () => {
  const warnings = [];
  const catalog = [{
    name: 'Grouped app', slug: 'grouped-app', repositories: [
      { name: 'app', label: 'Application' },
      { name: 'pipeline', label: 'Pipeline' }
    ]
  }];
  const repositories = [
    { name: 'app', html_url: 'https://github.test/app', homepage: 'https://dead.test', language: 'JavaScript', pushed_at: '2026-01-01', archived: false },
    { name: 'pipeline', html_url: 'https://github.test/pipeline', homepage: '', language: 'Python', pushed_at: '2026-02-01', archived: false }
  ];
  const projects = await buildProjects({ catalog, repositories, fetchImpl: async () => response(404), warn: (message) => warnings.push(message) });

  assert.equal(projects.length, 1);
  assert.deepEqual(projects[0].repositories.map(({ label }) => label), ['Application', 'Pipeline']);
  assert.deepEqual(projects[0].languages, ['JavaScript', 'Python']);
  assert.equal(projects[0].updatedAt, '2026-02-01');
  assert.equal(projects[0].demo, '');
  assert.match(warnings[0], /Hiding unhealthy demo/);
});

test('uses a healthy GitHub Pages deployment and records archived state', async () => {
  const catalog = [{ name: 'Archive', slug: 'archive', repositories: [{ name: 'archive', label: 'Source' }] }];
  const repositories = [{ name: 'archive', html_url: 'https://github.test/archive', has_pages: true, archived: true }];
  const projects = await buildProjects({ catalog, repositories, fetchImpl: async () => response(200) });

  assert.equal(projects[0].demo, 'https://ronterrence.github.io/archive/');
  assert.equal(projects[0].archived, true);
});

test('omits a card when all configured repositories are missing', async () => {
  const warnings = [];
  const catalog = [{ name: 'Missing', slug: 'missing', repositories: [{ name: 'missing', label: 'Source' }] }];
  const projects = await buildProjects({ catalog, repositories: [], warn: (message) => warnings.push(message) });

  assert.deepEqual(projects, []);
  assert.equal(warnings.length, 2);
});

test('offline projects retain deterministic source links without unverified demos', () => {
  const catalog = [{ name: 'Offline', slug: 'offline', repositories: [{ name: 'offline', label: 'Source' }] }];
  const [project] = buildOfflineProjects(catalog, 'owner');

  assert.equal(project.repositories[0].url, 'https://github.com/owner/offline');
  assert.equal(project.demo, '');
});
