/* CONFIGURAÇÃO DE DEMONSTRAÇÃO — substitua todos os dados fictícios antes de divulgar. */
window.WEDDING_CONFIG = {
  groomName: "André", brideName: "Beatriz",
  weddingDate: "2027-11-20T16:00:00-03:00",
  venue: "Espaço Jardim", address: "Rua das Flores, 100 · São Paulo/SP",
  mapsUrl: "https://www.google.com/maps", rsvpDeadline: "2027-11-01",
  whatsapp: "5511999999999",
  welcomeMessage: "Com alegria, queremos compartilhar esse momento especial com você.",
  story: "Algumas histórias começam sem aviso e, quando percebemos, já se tornaram o nosso lugar favorito. Estamos felizes por celebrar o próximo capítulo ao lado de pessoas tão especiais.",
  dressCode: "Esporte fino", eventExtra: "Chegue com alguns minutos de antecedência.",
  pix: { key: "SUA-CHAVE-PIX-ALEATORIA", keyType: "aleatoria", receiver: "RECEBEDOR TESTE", city: "SAO PAULO", txid: "CASAMENTO2027" },
  rsvpEndpoint: "", /* URL pública do Google Apps Script implantado como aplicativo web */
  demoMode: true, /* true = salva somente neste navegador; false = envia para rsvpEndpoint */
  quotas: [
    { id:"brinde", name:"Brinde dos noivos", description:"Um brinde aos bons encontros e às novas histórias.", amount:50, icon:"🥂" },
    { id:"decoracao", name:"Ajuda com a decoração", description:"Um toque de carinho para deixar tudo ainda mais especial.", amount:100, icon:"🌿" },
    { id:"jantar", name:"Um jantar especial", description:"Uma noite gostosa para celebrar a vida a dois.", amount:150, icon:"🍽️" },
    { id:"passeio", name:"Passeio na lua de mel", description:"Uma lembrança para levar na nossa viagem.", amount:250, icon:"✈️" },
    { id:"experiencia", name:"Experiência dos noivos", description:"Uma experiência para guardar na memória.", amount:500, icon:"✨" },
    { id:"livre", name:"Cota livre", description:"Escolha o valor que desejar contribuir.", amount:null, icon:"💛" }
  ]
};
