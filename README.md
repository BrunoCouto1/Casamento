# Site de casamento — GitHub Pages

Site estático em HTML, CSS e JavaScript puro, com confirmação de presença (RSVP), cotas voluntárias e geração local de Pix Copia e Cola/QR Code.

> **Atenção:** os nomes, local, data, telefone e chave Pix do exemplo são fictícios. Edite `config.example.js` antes de publicar. O arquivo de configuração é carregado pelo navegador e ficará público no repositório.

## 1. Estrutura

```text
casamento/
├── index.html
├── styles.css
├── script.js
├── config.example.js
├── .gitignore
├── README.md
└── assets/
    ├── README.md
    ├── images/
    │   ├── casal-placeholder.svg
    │   ├── foto-1-placeholder.svg
    │   ├── foto-2-placeholder.svg
    │   └── foto-3-placeholder.svg
    └── icons/
```

## 2. Personalizar nomes, data e local

Abra `config.example.js` e edite `window.WEDDING_CONFIG`:

- `groomName` e `brideName`: nomes exibidos.
- `weddingDate`: data ISO com fuso, por exemplo `2027-11-20T16:00:00-03:00`.
- `venue`, `address`, `mapsUrl`: local e localização.
- `rsvpDeadline`: prazo no formato `AAAA-MM-DD`.
- `whatsapp`: telefone internacional somente com números, incluindo 55 e DDD.
- `welcomeMessage`, `story`, `dressCode` e `eventExtra`: textos.

A data, o horário e a contagem regressiva são atualizados automaticamente a partir de `weddingDate`.

## 3. Adicionar fotos

Coloque as fotos dos noivos em `assets/images/`. Para manter os caminhos atuais, substitua os quatro arquivos SVG por imagens JPG/WebP com os mesmos nomes (atualize as extensões no HTML se necessário). Otimize as imagens para carregamento rápido e use fotografias com autorização de todas as pessoas retratadas.

## 4. Configurar Pix

Edite `pix` em `config.example.js`:

- `key`: chave Pix do recebedor.
- `keyType`: apenas informativo (aleatória, e-mail, telefone ou CPF); não altera a estrutura do payload.
- `receiver`: nome do recebedor conforme cadastro bancário, até 25 caracteres.
- `city`: cidade do recebedor, até 15 caracteres.
- `txid`: identificador de transação de até 25 caracteres; use `***` quando não houver identificador.

**Segurança:** a chave Pix ficará visível no código público do site. Prefira uma chave aleatória criada especificamente para o evento. Evite CPF, telefone ou e-mail pessoal. Nunca inclua senha, token, chave privada ou credencial bancária.

O código Pix é montado no navegador com os campos EMV/BR Code, valor, identificador e CRC16-CCITT. O QR Code usa a biblioteca `qrcodejs` 1.0.0 por CDN. O gerador monta um payload estático para a contribuição escolhida. Faça um pagamento de teste de baixo valor e valide com o aplicativo do banco antes de divulgar.

O site **não confirma pagamentos**. A confirmação deve ser consultada pelos noivos na conta bancária. Não solicite senha bancária, cartão, CVV, login, token ou código de autenticação dos convidados.

## 5. Alterar as cotas

Edite o array `quotas` em `config.example.js`. Cada item tem `id`, `name`, `description`, `amount` e `icon`. Use `amount: null` para a cota livre. Os cards são renderizados automaticamente.

## 6. RSVP com Google Sheets + Apps Script

O modo de demonstração vem ativo (`demoMode: true`). Nesse modo, as respostas são guardadas somente no `localStorage` do navegador utilizado para o teste; não chegam aos noivos e não são compartilhadas entre dispositivos.

Para receber respostas reais, use Google Sheets e Apps Script:

### 6.1 Criar a planilha

1. Crie uma planilha no Google Sheets chamada `RSVP Casamento`.
2. Renomeie a primeira aba para `Respostas`.
3. Na primeira linha, crie estes cabeçalhos, nesta ordem:

`Data de envio | Nome | Telefone | Presença | Adultos | Crianças | Acompanhantes | Restrição alimentar | Mensagem | Consentimento`

4. Abra **Extensões → Apps Script**, apague o conteúdo inicial e cole o código completo abaixo.

### 6.2 Código completo do Google Apps Script

```javascript
const SHEET_NAME = 'Respostas';
const HEADERS = [
  'Data de envio', 'Nome', 'Telefone', 'Presença', 'Adultos', 'Crianças',
  'Acompanhantes', 'Restrição alimentar', 'Mensagem', 'Consentimento'
];

function doGet() {
  return jsonResponse({ ok: true, message: 'Serviço RSVP disponível.' });
}

function doPost(e) {
  try {
    const raw = e && e.postData && e.postData.contents ? e.postData.contents : '{}';
    const data = JSON.parse(raw);

    const nome = clean(data.nome, 100);
    const telefone = clean(data.telefone, 30);
    const presenca = data.presenca === 'Sim' ? 'Sim' : data.presenca === 'Não' ? 'Não' : '';
    const adultos = Number(data.adultos);
    const criancas = Number(data.criancas);
    const consentimento = data.consentimento === true;

    if (!nome || !telefone || !presenca || !consentimento) {
      return jsonResponse({ ok: false, message: 'Dados obrigatórios ausentes.' });
    }
    if (!Number.isInteger(adultos) || adultos < 0 || adultos > 10 ||
        !Number.isInteger(criancas) || criancas < 0 || criancas > 10) {
      return jsonResponse({ ok: false, message: 'Quantidade de convidados inválida.' });
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) throw new Error('A aba Respostas não foi encontrada.');
    if (sheet.getLastRow() === 0) sheet.appendRow(HEADERS);

    // Neutraliza texto iniciado por caracteres que o Sheets poderia interpretar como fórmula.
    const row = [
      new Date(), safeCell(nome), safeCell(telefone), presenca, adultos, criancas,
      safeCell(clean(data.acompanhantes, 500)),
      safeCell(clean(data.restricao, 500)),
      safeCell(clean(data.mensagem, 1000)), 'Sim'
    ];
    sheet.appendRow(row);
    return jsonResponse({ ok: true });
  } catch (error) {
    // Não devolve detalhes internos nem dados enviados pelo convidado.
    return jsonResponse({ ok: false, message: 'Não foi possível registrar a resposta.' });
  }
}

function clean(value, maxLength) {
  return String(value == null ? '' : value).replace(/[\\u0000-\\u001F\\u007F]/g, '').trim().slice(0, maxLength);
}

function safeCell(value) {
  const text = String(value == null ? '' : value);
  return /^[=+@\\-]/.test(text) ? "'" + text : text;
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
```

### 6.3 Implantar como aplicativo web

1. No Apps Script, clique em **Implantar → Nova implantação**.
2. Selecione o tipo **Aplicativo da web**.
3. Em **Executar como**, selecione sua conta.
4. Em **Quem pode acessar**, selecione a opção que permita acesso público aos convidados (normalmente **Qualquer pessoa**). A disponibilidade pode depender da política da conta Google Workspace.
5. Clique em **Implantar**, autorize as permissões e copie a URL terminada em `/exec`.
6. Em `config.example.js`, configure:
   - `demoMode: false`
   - `rsvpEndpoint: "https://script.google.com/macros/s/SEU_ID/exec"`

Não coloque credenciais do Google no JavaScript. O endpoint publicado é público e deve aceitar somente os campos necessários. Para eventos com alto risco de abuso, adicione controles adicionais no Apps Script (limite de requisições, validação de origem/segredo de servidor e monitoramento).

### 6.4 Testar

- Abra a URL `/exec` em uma janela do navegador; deve aparecer uma resposta JSON indicando que o serviço está disponível.
- Envie uma confirmação pelo site e confira a nova linha na planilha.
- Teste presença Sim e Não, consentimento ausente e quantidades fora do limite.
- Faça uma implantação de nova versão depois de alterar o Apps Script: **Implantar → Gerenciar implantações → Editar → Nova versão**.

### 6.5 CORS e permissões

- Use a URL `/exec`, não a URL `/dev` (esta última é para testes de editores).
- Configure o acesso do aplicativo web para permitir os convidados e autorize o script com a conta proprietária da planilha.
- O front-end envia `Content-Type: text/plain` para evitar preflight desnecessário. O navegador ainda precisa conseguir ler a resposta; não use `mode: no-cors`, pois isso impede verificar o resultado.
- Se houver erro de CORS ou resposta opaca, revise a implantação e as políticas do Google Workspace. Em ambientes que bloqueiam o endpoint, considere Formspree ou um serviço de formulário compatível com CORS.
- Não compartilhe a planilha publicamente. Compartilhe-a somente com os organizadores.

## 7. Testar localmente

Abra `index.html` diretamente no navegador ou, preferencialmente, execute um servidor estático simples. Por exemplo, com Python instalado:

```bash
python -m http.server 8000
```

Acesse `http://localhost:8000`. Não é necessário Node.js. O modo demonstração permite testar o RSVP sem configurar o Google Sheets.

## 8. Criar repositório e publicar no GitHub

1. Entre em `https://github.com/BrunoCouto1`.
2. Crie um repositório público chamado **casamento**.
3. Envie a pasta do projeto para a raiz do repositório.
4. No terminal, dentro da pasta `casamento`, execute:

```bash
git init
git add .
git commit -m "Cria site do casamento"
git branch -M main
git remote add origin https://github.com/BrunoCouto1/casamento.git
git push -u origin main
```

Se o repositório já existir ou já houver um remote `origin`, não repita `git remote add origin`: confira com `git remote -v` e ajuste com `git remote set-url origin https://github.com/BrunoCouto1/casamento.git`. Se já houver commits remotos, sincronize antes de enviar.

### Ativar GitHub Pages

1. No repositório, acesse **Settings → Pages**.
2. Em **Build and deployment**, selecione **Deploy from a branch**.
3. Escolha a branch `main` e a pasta `/ (root)`.
4. Salve e aguarde a publicação.
5. O site ficará disponível em:

`https://brunocouto1.github.io/casamento/`

### Atualizar o site

Edite os arquivos, depois execute:

```bash
git add .
git commit -m "Atualiza informações do casamento"
git push
```

O GitHub Pages publicará a nova versão automaticamente após o processamento.

### Erro 404

- Confirme que o repositório se chama exatamente `casamento`.
- Confirme que `index.html` está na raiz, não dentro de outra pasta.
- Confirme branch `main` e pasta `/ (root)` nas configurações do Pages.
- Aguarde alguns minutos após a primeira publicação.
- Verifique se o repositório está público e se o Pages está habilitado.
- Confira o endereço: `https://brunocouto1.github.io/casamento/`.

## 9. Privacidade e LGPD

O RSVP coleta nome, telefone, presença, quantidade de convidados e informações opcionais de organização. A finalidade é dimensionar a recepção e atender necessidades relacionadas ao evento. O consentimento é obrigatório no formulário. Os organizadores devem restringir o acesso à planilha, usar os dados somente para essa finalidade e apagá-los quando deixarem de ser necessários. Para corrigir ou excluir dados, o convidado pode entrar em contato pelo WhatsApp configurado.

Esta implementação é um ponto de partida técnico, não uma consultoria jurídica. Os noivos devem revisar o texto e o prazo de retenção de acordo com o uso real.

## 10. Checklist antes de divulgar

- [ ] Trocar nomes, data, horário, local, endereço e Maps.
- [ ] Definir data limite e WhatsApp.
- [ ] Substituir todas as fotos placeholder.
- [ ] Configurar e testar chave Pix, nome e cidade do recebedor.
- [ ] Conferir cotas e valores.
- [ ] Testar o QR Code em mais de um aplicativo bancário.
- [ ] Implantar o Apps Script e testar a planilha.
- [ ] Desativar `demoMode` e preencher `rsvpEndpoint` para respostas reais.
- [ ] Testar o formulário em celular e computador.
- [ ] Revisar política de privacidade e acesso à planilha.
- [ ] Confirmar GitHub Pages em `main` e `/ (root)`.
- [ ] Abrir o endereço publicado em janela anônima.
