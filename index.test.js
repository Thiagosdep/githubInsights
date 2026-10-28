import { test } from 'node:test';
import assert from 'node:assert/strict';
import { summarize } from './index.js';

test('summarize agrega estrelas, linguagens e ignora forks', () => {
  const profile = { login: 'dev', name: 'Dev', followers: 3, following: 2, public_repos: 3 };
  const repos = [
    { name: 'a', fork: false, language: 'TypeScript', stargazers_count: 5, pushed_at: '2026-01-01T00:00:00Z' },
    { name: 'b', fork: false, language: 'TypeScript', stargazers_count: 1, pushed_at: '2026-03-01T00:00:00Z' },
    { name: 'c', fork: true, language: 'Go', stargazers_count: 99, pushed_at: '2026-02-01T00:00:00Z' },
  ];

  const s = summarize(profile, repos);

  assert.equal(s.totalStars, 6);
  assert.equal(s.forks, 1);
  assert.deepEqual(s.topLanguages, [{ lang: 'TypeScript', count: 2 }]);
  assert.equal(s.topStarred[0].name, 'a');
  assert.equal(s.recentlyUpdated[0].name, 'b');
});
