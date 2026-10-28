# githubInsights

CLI em Node.js que consome a **API REST do GitHub** e gera um resumo de qualquer perfil: seguidores, repositórios, estrelas, linguagens mais usadas, repos mais estrelados e atualizados recentemente.

Sem dependências, usa apenas o `fetch` nativo do Node 18+.

## Uso

```bash
node index.js Thiagosdep
node index.js Thiagosdep --json
```

Para aumentar o limite de requisições da API, defina um token:

```bash
export GITHUB_TOKEN=seu_token
node index.js Thiagosdep
```

## Endpoints usados

| Endpoint | Para quê |
|---|---|
| `GET /users/{user}` | Dados do perfil |
| `GET /users/{user}/repos` | Repositórios (com paginação) |

## Testes

```bash
npm test
```

## Licença

MIT
