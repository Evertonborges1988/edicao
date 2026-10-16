# Palavra Viva — Estudo Bíblico (PIB Gravataí)

App web estático (HTML/CSS/JS, sem build). Rodar: `npm start` (ou qualquer servidor estático apontando para `public/`).

## O que já existe
- Barra de busca: referências (`João 3:16`, `1 Co 13:4-7`, `Sl 23`, `Romanos`) ou palavras-chave.
- Menu lateral: Antigo/Novo Testamento → livro → capítulos → versículos.
- Versículo em destaque + abas **Citações / Livros / Vídeos**.
- Conteúdo curado em `public/data/related.json`, chave `livro.capítulo.versículo` (livro 0–65; João 3:16 = `42.3.16`):
  `{"42.3.16":{"quotes":[{"text":"","author":"","source":""}],"books":[{"title":"","author":"","note":""}],"videos":[{"id":"YOUTUBE_ID","title":"","channel":""}]}}`
  Sem curadoria, as abas oferecem busca no YouTube / Google Livros.

## Texto bíblico
O padrão é a **NVI** (`public/data/nvi.json`). Ela é protegida por direitos autorais (Biblica / SBI): mantenha o repositório privado e confirme a licença antes de publicar o app. A ACF (domínio público) continua em `public/data/acf.json`; troque em `public/js/config.js`.

## Identidade visual
Nome, cores (azul-marinho + dourado) e logo são provisórios, pois o Instagram da PIB Gravataí não pôde ser consultado. Troque em `public/css/style.css` (variáveis `:root`) e `public/logo.svg`.
