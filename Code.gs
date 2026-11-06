function doPost(e) {

  const planilha = SpreadsheetApp.getActiveSpreadsheet();

  let aba = planilha.getSheetByName("Respostas");

  if (!aba) {
    aba = planilha.insertSheet("Respostas");
  }

  // Criar cabeçalhos
  if (aba.getLastRow() === 0) {

    aba.appendRow([
      "Data da resposta",
      "Nome completo",
      "Presença",
      "Adultos",
      "Crianças",
      "Acompanhantes",
      "Mensagem"
    ]);

  }

  // Receber informações do formulário
  const dados = JSON.parse(e.postData.contents);

  // Registrar resposta
  aba.appendRow([

    new Date(),

    String(dados.name || "").slice(0, 120),

    String(dados.attendance || ""),

    Number(dados.adults || 0),

    Number(dados.children || 0),

    String(dados.companions || "").slice(0, 300),

    String(dados.message || "").slice(0, 500)

  ]);

  return ContentService
    .createTextOutput(JSON.stringify({
      sucesso: true
    }))
    .setMimeType(ContentService.MimeType.JSON);

}


// Teste de funcionamento
function doGet() {

  return ContentService
    .createTextOutput("Sistema de confirmação do casamento ativo!");

}

