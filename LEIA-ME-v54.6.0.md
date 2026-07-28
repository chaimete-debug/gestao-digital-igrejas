# Avante Evangelho v54.6.0 — dois modos de acesso

Esta versão cria duas formas claramente separadas de acesso ao módulo **Avante Evangelho**.

## 1. Visualização geral para membros

Endereço a partilhar:

```text
https://gestao-digital-igrejas.vercel.app/contribuicoes.html
```

Características:

- não exige nome de utilizador nem palavra-passe;
- apresenta grupos, igrejas, metas, contribuições, totais e evolução anual;
- não contém o cartão **Registar contribuição**;
- não contém código de submissão de novos lançamentos;
- consulta apenas o endpoint público `avantepublicdata`.

Na página inicial de login foi acrescentado o botão **Ver Avante Evangelho**, que abre esta visualização.

## 2. Área de lançamento de dados

Endereço:

```text
https://gestao-digital-igrejas.vercel.app/
```

O utilizador deve iniciar sessão. O cartão **Registar contribuição** só aparece quando o backend devolver `canManage: true` para o perfil autenticado.

Para utilizadores sem essa permissão:

- o cartão fica totalmente oculto;
- a área de progresso ocupa toda a largura;
- o módulo é identificado como **Modo de consulta**.

Mesmo que alguém tente alterar o HTML no navegador, o backend continua a exigir token válido e permissão para gravar contribuições.

## Ficheiros a substituir no GitHub

1. `index.html`
2. `app.js`
3. `styles.css`
4. `contribuicoes.html`

Não substitua o `config.js`, porque deve conservar o URL `/exec` correcto.

Não é necessário alterar o `Code.gs` nem efectuar novo deploy do Google Apps Script, desde que os endpoints `avantedata`, `avantepublicdata` e `saveAvanteContribution` já estejam activos.
