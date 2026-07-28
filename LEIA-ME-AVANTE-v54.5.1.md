# Correcção do módulo Avante Evangelho — v54.5.1

## Diagnóstico

O formulário não possui opções escritas directamente no HTML. Os campos **Grupo** e **Igreja** só são preenchidos depois de `app.js` consultar o endpoint autenticado:

```text
?action=avantedata&token=...
```

A função `testarRouterAvanteV5450` ter devolvido `ok: true`, `eventoActivo: false`, grupos e igrejas confirma que o código guardado no editor do Apps Script e os dados das folhas estão correctos. Isso, porém, não comprova que o URL público `/exec` usado pelo Vercel já esteja a executar essa mesma versão.

Havia ainda dois problemas no frontend:

1. quando o endpoint administrativo falhava, os dropdowns permaneciam vazios sem um diagnóstico suficientemente visível;
2. os dropdowns **Grupo** e **Igreja**, apesar de também servirem para consulta, eram desactivados quando o utilizador não podia lançar contribuições.

## Correcções aplicadas

- compatibilidade com diferentes nomes de campos devolvidos por versões anteriores do backend;
- tentativa automática do endpoint público `avantepublicdata` quando `avantedata` falhar;
- os dropdowns **Grupo** e **Igreja** permanecem disponíveis para consulta;
- a edição de 2026 encerrada continua bloqueada para novos lançamentos;
- mensagens explícitas quando não são recebidos grupos ou igrejas;
- indicação explícita quando o Apps Script devolve uma resposta antiga ou inválida;
- versão do frontend e backend alterada para **54.5.1**, forçando a actualização dos ficheiros em cache;
- o backend passa a devolver `backendVersion: "54.5.1"` nos dados do Avante.

## Instalação obrigatória

### 1. Google Apps Script

1. Abra o projecto do backend.
2. Substitua integralmente o conteúdo de `Code.gs` pelo ficheiro desta pasta.
3. Guarde.
4. Abra **Implementar → Gerir implementações**.
5. Edite a implementação usada pelo sistema.
6. Em **Versão**, escolha **Nova versão**.
7. Clique em **Implementar**.
8. Mantenha o URL terminado em `/exec` que já consta de `config.js`, salvo se o Google gerar outro URL.

Executar uma função no editor não actualiza, por si só, a aplicação web publicada.

### 2. GitHub/Vercel

Substitua os ficheiros do repositório pelos ficheiros desta pasta. No mínimo, substitua:

```text
index.html
app.js
config.js
Code.gs (somente no Apps Script, não no frontend público)
```

É preferível substituir o pacote completo para que todos os ficheiros utilizem a versão 54.5.1.

### 3. Depois da publicação

1. Aguarde a conclusão do deploy do Vercel.
2. Feche todos os separadores do sistema.
3. Abra novamente a aplicação.
4. Confirme no ecrã de login ou menu lateral que aparece **v54.5.1**.
5. Entre no módulo **Avante Evangelho**.

Resultado esperado:

- **Grupo** apresenta Grupo 1 a Grupo 8;
- **Igreja** apresenta as igrejas do grupo escolhido;
- o estado apresenta **2026 · Encerrado**;
- os grupos e igrejas podem ser consultados;
- os campos de lançamento permanecem bloqueados, porque o evento de 2026 já terminou.
