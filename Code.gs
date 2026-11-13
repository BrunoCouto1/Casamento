
function doPost(e) {
  const lock = LockService.getScriptLock();

  try {
    lock.waitLock(10000);

    if (!e || !e.postData || !e.postData.contents) {
      throw new Error("Nenhum dado recebido.");
    }

    const dados = JSON.parse(e.postData.contents);

    const nome = String(dados.name || "").trim();
    const presenca = String(dados.attendance || "").trim();

    const adultos = Number(dados.adults);
    const criancas = Number(dados.children);

    const acompanhantes = String(dados.companions || "").trim();
    const mensagem = String(dados.message || "").trim();

    const consentimento =
      dados.consent === true ||
      String(dados.consent).toLowerCase() === "on" ||
      String(dados.consent).toLowerCase() === "true";

    // VALIDAÇÕES
    if (!nome || nome.length > 120) {
      throw new Error("Nome inválido.");
    }

    if (!["Sim", "Não"].includes(presenca)) {
      throw new Error("Resposta de presença inválida.");
    }

    if (!consentimento) {
      throw new Error("É necessário aceitar o consentimento.");
    }

    if (
      !Number.isInteger(adultos) ||
      !Number.isInteger(criancas) ||
      adultos < 0 ||
      criancas < 0 ||
      adultos > 20 ||
      criancas > 20
    ) {
      throw new Error("Quantidade de convidados inválida.");
    }

    const totalAdultos = presenca === "Não" ? 0 : adultos;
    const totalCriancas = presenca === "Não" ? 0 : criancas;

    const planilha = SpreadsheetApp.getActiveSpreadsheet();

    let aba = planilha.getSheetByName("Respostas");

    if (!aba) {
      aba = planilha.insertSheet("Respostas");
    }

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

      aba.getRange(1, 1, 1, 7).setFontWeight("bold");
    }

    aba.appendRow([
      new Date(),
      nome,
      presenca,
      totalAdultos,
      totalCriancas,
      acompanhantes.slice(0, 300),
      mensagem.slice(0, 500)
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({
        sucesso: true,
        mensagem: "Confirmação registrada."
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (erro) {
    return ContentService
      .createTextOutput(JSON.stringify({
        sucesso: false,
        mensagem: erro.message
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } finally {
    if (lock.hasLock()) {
      lock.releaseLock();
    }
  }
}

// TESTE DE FUNCIONAMENTO
function doGet() {
  return ContentService
    .createTextOutput("Sistema de confirmação do casamento ativo!")
    .setMimeType(ContentService.MimeType.TEXT);
}
