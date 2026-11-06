# Finanças Borges

App de finanças da família que funciona no celular (instala como aplicativo) e **sem internet**.
Mantém a mesma lógica da planilha: **Venc., Dt. Comp., Tipo, P. Conta (categoria), Fornecedor/Cartão, Descrição, Parcela, Valor, Pago**, e as **Receitas** do mês.

## Como lançar (para a Bianca)

Toque no **+** azul e preencha de cima para baixo:

1. **Valor**
2. **O que foi?** — ao digitar um nome que já existe na planilha (ex.: *Mercado Grando*, *Netflix*), o app **preenche sozinho** categoria, cartão, tipo e valor da última vez.
3. **Categoria** e **Pago com** — toque nos botões (os mais usados aparecem primeiro).
4. **Vence em** — se escolher um cartão, o app sugere o dia de vencimento que vocês sempre usam.
5. **Repetição** — *À vista*, *Parcelado* (cria todas as parcelas nos meses seguintes, com 1/5, 2/5…) ou *Todo mês* (contas fixas).
6. **Já foi pago** e **Salvar**.

Nos **Lançamentos**, o círculo à esquerda marca como pago/recebido com um toque. Tocar na linha edita.

## O que cada tela mostra

- **Início** — sobra do mês, quanto já foi pago/falta pagar, contas a vencer, metas (10% dízimo / 40% fixas / 30% variáveis / 20% guardar, como na aba *Resultados*), categorias e cartões.
- **Lançamentos** — lista do mês com busca e filtros.
- **Análise** — evolução de receitas × despesas, fixas × variáveis, comparação com o mês anterior, fatura por cartão e previsão dos próximos 6 meses.
- **Ajustes** — sincronização, metas, backup e importação.

> "Casa dos Borges" (transferências entre contas e sobra do mês guardada na poupança) aparece como **Guardado** e não conta como gasto.

## Colocar no ar (uma vez só)

1. No GitHub: **Settings → Pages → Source: GitHub Actions**. (Páginas gratuitas exigem o repositório público; o app não contém dados seus, só o código.)
2. Faça o merge desta branch na `main`. O workflow `financas-pages.yml` publica e mostra o endereço, algo como `https://SEU-USUARIO.github.io/edicao/`.
3. Abra o endereço no celular:
   - **iPhone (Safari):** Compartilhar → *Adicionar à Tela de Início*.
   - **Android (Chrome):** menu ⋮ → *Instalar aplicativo*.

## Trazer os dados da planilha

Gere o arquivo no computador (a planilha precisa estar **sem senha**):

```bash
python3 -m pip install openpyxl
python3 financas/tools/converter_planilha.py Planilha_Borges.xlsx dados-importar.json
```

No app: **Ajustes → Importar da planilha** e escolha o `dados-importar.json`. Não envie esse arquivo para o GitHub (já está no `.gitignore`).

## Usar nos dois celulares (sincronização)

Gratuito, ~10 minutos, uma vez:

1. Crie conta em <https://supabase.com> → **New project** (anote a senha do banco; não será usada no app).
2. **SQL Editor** → cole o conteúdo de `financas/supabase/schema.sql` → **Run**.
3. **Authentication → Providers → Email**: deixe ligado, **desligue "Allow new users to sign up"** e desligue "Confirm email".
4. **Authentication → Users → Add user**: crie **um e-mail e senha da família** (os dois celulares usam o mesmo).
5. **Project Settings → API**: copie a **Project URL** e a chave **anon public**.
6. No app, em **Ajustes → Sincronizar**, cole URL, chave, e-mail e senha → **Conectar**. Repita no celular da Bianca.

Depois de conectar, importe a planilha em **um** dos celulares: ela sobe para a nuvem e aparece no outro. A sincronização é automática ao abrir o app e depois de cada lançamento; sem internet, tudo fica salvo e sobe quando voltar.

Os dados ficam na conta Supabase de vocês, protegidos por login. A chave *anon* é pública por desenho; quem protege é o login + a regra do `schema.sql`.

## Backup

**Ajustes → Baixar backup (.json)** ou **.csv** (abre no Excel). Faça de vez em quando.
