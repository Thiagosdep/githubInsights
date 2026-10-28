#!/usr/bin/env node
// githubInsights: CLI que usa a API REST do GitHub para gerar um resumo de um perfil.
// Uso: node index.js <usuario> [--json]
// Opcional: defina GITHUB_TOKEN para aumentar o limite de requisições.

const API = 'https://api.github.com';

async function gh(path) {
  const headers = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'githubInsights',
  };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

  const res = await fetch(`${API}${path}`, { headers });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`GitHub API ${res.status} em ${path}: ${body}`);
  }
  return res.json();
}

async function getAllRepos(user) {
  const repos = [];
  for (let page = 1; ; page++) {
    const batch = await gh(`/users/${user}/repos?per_page=100&page=${page}&type=owner`);
    repos.push(...batch);
    if (batch.length < 100) break;
  }
  return repos;
}

export function summarize(profile, repos) {
  const own = repos.filter((r) => !r.fork);
  const languages = {};
  for (const r of own) {
    if (r.language) languages[r.language] = (languages[r.language] || 0) + 1;
  }

  const byStars = [...own].sort((a, b) => b.stargazers_count - a.stargazers_count);
  const byPush = [...own].sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at));

  return {
    user: profile.login,
    name: profile.name,
    followers: profile.followers,
    following: profile.following,
    publicRepos: profile.public_repos,
    forks: repos.length - own.length,
    totalStars: own.reduce((sum, r) => sum + r.stargazers_count, 0),
    topLanguages: Object.entries(languages)
      .sort((a, b) => b[1] - a[1])
      .map(([lang, count]) => ({ lang, count })),
    topStarred: byStars.slice(0, 5).map((r) => ({ name: r.name, stars: r.stargazers_count })),
    recentlyUpdated: byPush.slice(0, 5).map((r) => ({ name: r.name, pushedAt: r.pushed_at })),
  };
}

function print(s) {
  console.log(`\n${s.name || s.user} (@${s.user})`);
  console.log(`Seguidores: ${s.followers} | Seguindo: ${s.following}`);
  console.log(`Repos públicos: ${s.publicRepos} | Forks: ${s.forks} | Estrelas: ${s.totalStars}`);

  console.log('\nLinguagens:');
  for (const { lang, count } of s.topLanguages) console.log(`  ${lang}: ${count}`);

  console.log('\nMais estrelados:');
  for (const r of s.topStarred) console.log(`  ${r.name} ★ ${r.stars}`);

  console.log('\nAtualizados recentemente:');
  for (const r of s.recentlyUpdated) console.log(`  ${r.name} (${r.pushedAt.slice(0, 10)})`);
  console.log();
}

async function main() {
  const [user, flag] = process.argv.slice(2);
  if (!user) {
    console.error('Uso: node index.js <usuario> [--json]');
    process.exit(1);
  }
  const [profile, repos] = await Promise.all([gh(`/users/${user}`), getAllRepos(user)]);
  const summary = summarize(profile, repos);
  if (flag === '--json') console.log(JSON.stringify(summary, null, 2));
  else print(summary);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
}
