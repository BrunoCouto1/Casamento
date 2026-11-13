
// ==========================================
// CONFIGURAÇÕES DO CASAMENTO
// Bruno & Estefani
// ==========================================

window.WEDDING_CONFIG = {

  // NOIVOS
  groomName: "Bruno",
  brideName: "Estefani",

  // DATA DO CASAMENTO
  weddingDate: "2027-12-05T16:00:00-03:00",

  // CERIMÔNIA RELIGIOSA
  church: {
    name: "Paróquia João Paulo II",
    address: "Hortolândia – SP",
    time: "Horário a definir",
    mapsUrl: "https://share.google/6sFF1EP2WQzVVjETF"
  },

  // RECEPÇÃO E FESTA
  party: {
    name: "Local a definir",
    address: "Hortolândia – SP",
    time: "Após a cerimônia",
    mapsUrl: ""
  },

  // NOSSA HISTÓRIA
  story: `Toda grande história de amor é construída aos poucos, entre encontros, sorrisos, descobertas e momentos que se tornam inesquecíveis.

  Ao longo da nossa caminhada, aprendemos que o amor está nas pequenas coisas, na parceria de todos os dias, no cuidado, no companheirismo e na vontade de seguir juntos, mesmo diante dos desafios.

  Hoje, estamos prestes a viver um dos capítulos mais especiais das nossas vidas: dizer o nosso sim e celebrar o início de uma nova etapa, repleta de sonhos, planos e novas conquistas.

  Escolhemos caminhar lado a lado, construir nossa família e compartilhar tudo o que a vida ainda reserva para nós.

  E se existe algo que torna esse momento ainda mais especial, é poder dividir essa felicidade com as pessoas que fazem parte da nossa história.

  Estamos preparando tudo com muito amor e será uma alegria ter você conosco nesse dia tão especial!

  Com carinho,
  Bruno & Estefani`,

  // PRAZO PARA CONFIRMAÇÃO
  rsvpDeadline: "2027-11-05",

  // INTEGRAÇÃO DO FORMULÁRIO
  // Deixe vazio até configurarmos o Google Sheets.
  rsvpEndpoint: "https://script.google.com/macros/s/AKfycbzv54zd_qi0WQ4J9A1ZnEX0aPc0DI1rKYkj9uLeaI5wwyi-DgBGyTQOK4qnXNe55XrvLg/exec",

  // DADOS PIX
  // SUBSTITUIR ANTES DE DIVULGAR O SITE.
  pix: {
    key: "+5519998169995",
    receiver: "BRUNO GUILHERME COUTO",
    city: "HORTOLANDIA",
    txid: "CASAMENTO2027"
  },

  // COTAS DE PRESENTES
  quotas: [

    {
      title: "Brinde dos noivos",
      description: "Um brinde ao começo dessa nova jornada.",
      value: 50
    },

    {
      title: "Ajuda com a decoração",
      description: "Um carinho para deixar a festa especial.",
      value: 100
    },

    {
      title: "Um jantar especial",
      description: "Uma experiência para os recém-casados.",
      value: 150
    },

    {
      title: "Passeio na lua de mel",
      description: "Uma lembrança para nossa viagem.",
      value: 250
    },

    {
      title: "Experiência dos noivos",
      description: "Uma contribuição para algo inesquecível.",
      value: 500
    },

    {
      title: "Cota livre",
      description: "Escolha o valor que desejar contribuir.",
      value: null
    }

  ]

};

