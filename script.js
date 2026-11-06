(() => {
  "use strict";

  const config = window.WEDDING_CONFIG;

  const $ = id => document.getElementById(id);

  const money = value =>
    Number(value).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });

  // ==========================================
  // INICIALIZAÇÃO DO SITE
  // ==========================================

  function init() {
    if (!config) {
      console.error("Configurações do casamento não encontradas.");
      return;
    }

    $("noivo").textContent = config.groomName;
    $("noiva").textContent = config.brideName;

    $("church").textContent = config.church.name;
    $("story").textContent = config.story;

    if (config.church.mapsUrl) {
      $("churchMap").href = config.church.mapsUrl;
      $("churchMap").hidden = false;
    }

    renderGifts();
    updateCountdown();

    setInterval(updateCountdown, 1000);
  }

  // ==========================================
  // CONTAGEM REGRESSIVA
  // ==========================================

  function updateCountdown() {
    const target = new Date(config.weddingDate).getTime();

    let remaining = Math.max(0, target - Date.now());

    const values = [
      Math.floor(remaining / 86400000),
      Math.floor(remaining / 3600000) % 24,
      Math.floor(remaining / 60000) % 60,
      Math.floor(remaining / 1000) % 60
    ];

    ["days", "hours", "minutes", "seconds"].forEach((id, index) => {
      $(id).textContent = String(values[index]).padStart(
        index === 0 ? 3 : 2,
        "0"
      );
    });
  }

  // ==========================================
  // COTAS DE PRESENTES
  // ==========================================

  function renderGifts() {
    const container = $("gifts");

    container.replaceChildren();

    config.quotas.forEach(gift => {
      const card = document.createElement("article");
      card.className = "gift";

      const title = document.createElement("h3");
      title.textContent = gift.title;

      const description = document.createElement("p");
      description.textContent = gift.description;

      const price = document.createElement("strong");

      price.textContent =
        gift.value === null
          ? "Você escolhe"
          : money(gift.value);

      const button = document.createElement("button");

      button.className = "btn";
      button.textContent = "Escolher esta cota";

      button.addEventListener("click", () => {
        openGift(gift);
      });

      card.append(title, description, price, button);
      container.append(card);
    });
  }

  // ==========================================
  // GERADOR PIX
  // ==========================================

  let selectedGift = null;

  function tlv(id, value) {
    value = String(value);

    return (
      id +
      String(value.length).padStart(2, "0") +
      value
    );
  }

  function calculateCRC(text) {
    let crc = 0xFFFF;

    for (let i = 0; i < text.length; i++) {
      crc ^= text.charCodeAt(i) << 8;

      for (let j = 0; j < 8; j++) {
        crc =
          crc & 0x8000
            ? (crc << 1) ^ 0x1021
            : crc << 1;

        crc &= 0xFFFF;
      }
    }

    return crc.toString(16).toUpperCase().padStart(4, "0");
  }

  function cleanText(value, maxLength) {
    return String(value)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^A-Za-z0-9 ]/g, "")
      .toUpperCase()
      .slice(0, maxLength);
  }

  function generatePix(amount) {
    const pix = config.pix;

    const merchant =
      tlv("00", "BR.GOV.BCB.PIX") +
      tlv("01", pix.key);

    const merchantField = tlv("26", merchant);

    const additionalData = tlv(
      "62",
      tlv("05", cleanText(pix.txid, 25))
    );

    const payload =
      tlv("00", "01") +
      merchantField +
      tlv("52", "0000") +
      tlv("53", "986") +
      tlv("54", Number(amount).toFixed(2)) +
      tlv("58", "BR") +
      tlv("59", cleanText(pix.receiver, 25)) +
      tlv("60", cleanText(pix.city, 15)) +
      additionalData +
      "6304";

    return payload + calculateCRC(payload);
  }

  function updatePix() {
    if (!selectedGift) return;

    const amount =
      selectedGift.value === null
        ? Number($("custom").value)
        : selectedGift.value;

    $("amount").textContent = money(amount);

    const pix = config.pix;

    const valid =
      pix.key &&
      !pix.key.startsWith("PREENCHER") &&
      pix.receiver &&
      !pix.receiver.includes("NOME") &&
      Number.isFinite(amount) &&
      amount > 0;

    $("payload").value = valid
      ? generatePix(amount)
      : "Configure a chave Pix, o nome e a cidade do recebedor em config.js.";

    $("qr").replaceChildren();

    if (valid && window.QRCode) {
      new QRCode($("qr"), {
        text: $("payload").value,
        width: 150,
        height: 150
      });
    } else {
      $("qr").textContent =
        "QR Code disponível após configurar os dados Pix.";
    }
  }

  function openGift(gift) {
    selectedGift = gift;

    $("pixTitle").textContent = gift.title;

    $("customWrap").hidden = gift.value !== null;

    $("custom").value = gift.value || 50;

    $("key").value = config.pix.key;

    updatePix();

    $("pix").showModal();
  }

  $("custom").addEventListener("input", updatePix);

  $("close").addEventListener("click", () => {
    $("pix").close();
  });

  // ==========================================
  // COPIAR CHAVE E CÓDIGO PIX
  // ==========================================

  async function copyText(elementId) {
    const element = $(elementId);

    try {
      await navigator.clipboard.writeText(element.value);
      alert("Copiado com sucesso!");
    } catch {
      element.select();
      document.execCommand("copy");
      alert("Conteúdo copiado!");
    }
  }

  $("copyKey").addEventListener("click", () => {
    copyText("key");
  });

  $("copyPix").addEventListener("click", () => {
    copyText("payload");
  });

  // ==========================================
  // FORMULÁRIO RSVP
  // ==========================================

  $("rsvpForm").addEventListener("submit", async event => {
    event.preventDefault();

    const form = event.currentTarget;

    if (!(form instanceof HTMLFormElement)) {
      console.error("Elemento do formulário inválido.");
      return;
    }

    if (!form.reportValidity()) return;

    const data = Object.fromEntries(
      new FormData(form).entries()
    );

    data.adults = Number(data.adults);
    data.children = Number(data.children);

    if (data.attendance === "Não") {
      data.adults = 0;
      data.children = 0;
    }

    data.sentAt = new Date().toISOString();

    const status = $("status");
    const submitButton = form.querySelector('button[type="submit"]');

    status.textContent = "Enviando sua confirmação...";

    submitButton.disabled = true;

    try {
      if (!config.rsvpEndpoint) {
        throw new Error("URL do Google Apps Script não configurada.");
      }

      await fetch(config.rsvpEndpoint, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "text/plain;charset=utf-8"
        },
        body: JSON.stringify(data)
      });

      status.textContent =
        "Solicitação enviada! Confira se sua resposta foi registrada na planilha.";

      form.reset();

    } catch (error) {
      console.error("Erro no envio do RSVP:", error);

      status.textContent =
        "Não foi possível enviar sua confirmação. Tente novamente.";

    } finally {
      submitButton.disabled = false;
    }
  });

  // ==========================================
  // EXECUTAR QUANDO A PÁGINA CARREGAR
  // ==========================================

  document.addEventListener("DOMContentLoaded", init);

})();
