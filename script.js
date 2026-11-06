/* Funcionalidades do site. A configuração fica em config.example.js. */
(() => {
"use strict";
const cfg = window.WEDDING_CONFIG || {};
const $ = (s, root=document) => root.querySelector(s);
const setText = (selector, value) => { const el=$(selector); if(el && value != null) el.textContent=value; };
const dateObj = new Date(cfg.weddingDate);
const formatDate = (date, options={day:"numeric",month:"long",year:"numeric"}) =>
  Number.isNaN(date.getTime()) ? "Data a definir" : new Intl.DateTimeFormat("pt-BR",options).format(date);
const money = n => new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(n);
const safeString = (value, max=80) => String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^\w .-]/g,"").trim().slice(0,max).toUpperCase();
const digits = value => String(value ?? "").replace(/\D/g,"");

function renderConfig(){
  setText("[data-groom]",cfg.groomName); setText("[data-bride]",cfg.brideName);
  setText("[data-welcome]",cfg.welcomeMessage); setText("[data-story]",cfg.story);
  setText("[data-date]",`${formatDate(dateObj)} · ${new Intl.DateTimeFormat("pt-BR",{hour:"2-digit",minute:"2-digit",timeZone:"America/Sao_Paulo"}).format(dateObj)}`);
  setText("#eventDate",formatDate(dateObj)); setText("[data-time]",new Intl.DateTimeFormat("pt-BR",{hour:"2-digit",minute:"2-digit",timeZone:"America/Sao_Paulo"}).format(dateObj));
  setText("[data-venue]",cfg.venue); setText("[data-address]",cfg.address); setText("[data-deadline]",formatDate(new Date(`${cfg.rsvpDeadline}T12:00:00`)));
  setText("[data-story]",cfg.story); setText("[data-event-extra]",cfg.eventExtra);
  const maps=$("[data-maps]"); if(maps && cfg.mapsUrl){maps.href=cfg.mapsUrl;}
  const whats=$("[data-whatsapp]"); if(whats && cfg.whatsapp){whats.href=`https://wa.me/${digits(cfg.whatsapp)}`; whats.textContent="WhatsApp dos noivos";}
  const grid=$("#quotaGrid"); if(!grid)return;
  grid.replaceChildren();
  (cfg.quotas||[]).forEach(q=>{
    const card=document.createElement("article"); card.className="quota-card";
    const icon=document.createElement("span"); icon.className="quota-icon"; icon.textContent=q.icon||"♡";
    const title=document.createElement("h3"); title.textContent=q.name;
    const desc=document.createElement("p"); desc.textContent=q.description;
    const amount=document.createElement("strong"); amount.textContent=q.amount==null?"Você escolhe o valor":money(q.amount);
    const button=document.createElement("button"); button.className="button button-primary"; button.type="button"; button.textContent="Escolher esta cota";
    button.addEventListener("click",()=>openPix(q));
    card.append(icon,title,desc,amount,button); grid.append(card);
  });
}

function updateCountdown(){
 const now=Date.now(), target=dateObj.getTime(), diff=target-now;
 if(!Number.isFinite(target)||diff<=0){["days","hours","minutes","seconds"].forEach(id=>$("#"+id).textContent="00");return;}
 const values={days:Math.floor(diff/86400000),hours:Math.floor(diff%86400000/3600000),minutes:Math.floor(diff%3600000/60000),seconds:Math.floor(diff%60000/1000)};
 Object.entries(values).forEach(([id,v])=>$("#"+id).textContent=String(v).padStart(2,"0"));
}

/* TLV: identificador de dois dígitos + tamanho (2 dígitos) + valor. */
function tlv(id,value){const v=String(value);return id+String(v.length).padStart(2,"0")+v;}
function crc16CCITT(payload){
 let crc=0xFFFF;
 for(let i=0;i<payload.length;i++){crc^=payload.charCodeAt(i)<<8;for(let j=0;j<8;j++)crc=(crc&0x8000)?((crc<<1)^0x1021):(crc<<1);crc&=0xFFFF;}
 return crc.toString(16).toUpperCase().padStart(4,"0");
}
function validateAmount(value){
 const n=Number(value);
 if(!Number.isFinite(n)||n<1||n>100000||Math.round(n*100)!==n*100) throw new Error("Informe um valor entre R$ 1,00 e R$ 100.000,00, com até duas casas decimais.");
 return n;
}
function buildPixPayload(amount){
 const pix=cfg.pix||{};
 if(!pix.key||pix.key.includes("SUA-CHAVE")) throw new Error("Configure uma chave Pix válida no arquivo config.example.js.");
 const key=String(pix.key).trim();
 const merchant=safeString(pix.receiver,25), city=safeString(pix.city,15);
 if(!merchant||!city) throw new Error("Configure o nome e a cidade do recebedor.");
 const gui=tlv("00","br.gov.bcb.pix")+tlv("01",key);
 const merchantAccount=tlv("26",gui);
 const additional=tlv("05",safeString(pix.txid||"***",25));
 let payload=tlv("00","01")+tlv("01","12")+merchantAccount+tlv("52","0000")+tlv("53","986")+tlv("54",amount.toFixed(2))+tlv("58","BR")+tlv("59",merchant)+tlv("60",city)+tlv("62",additional)+"6304";
 payload+=crc16CCITT(payload);
 return payload;
}
function makeQr(payload){
 const target=$("#qrcode"); target.replaceChildren();
 if(typeof QRCode==="undefined"){target.textContent="Não foi possível carregar a biblioteca de QR Code. Copie o código Pix.";return;}
 new QRCode(target,{text:payload,width:190,height:190,colorDark:"#263326",colorLight:"#ffffff",correctLevel:QRCode.CorrectLevel.M});
}
let selectedQuota=null;
function openPix(quota){
 selectedQuota=quota;
 $("#selectedQuota").textContent=quota.name;
 $("#customAmountWrap").hidden=quota.amount!==null;
 $("#customAmount").value=quota.amount||50;
 $("#pixKey").textContent=(cfg.pix&&cfg.pix.key)||"Chave Pix não configurada";
 $("#pixFeedback").textContent="";
 refreshPix();
 const modal=$("#pixModal");
 if(typeof modal.showModal==="function")modal.showModal();else modal.setAttribute("open","");
}
function refreshPix(){
 try{
  const amount=validateAmount(selectedQuota.amount===null?$("#customAmount").value:selectedQuota.amount);
  const payload=buildPixPayload(amount); $("#pixPayload").value=payload; makeQr(payload);
 }catch(err){$("#pixPayload").value="";$("#qrcode").textContent=err.message;}
}
async function copyText(text){
 if(!text)throw new Error("Não há conteúdo para copiar.");
 if(navigator.clipboard&&window.isSecureContext)await navigator.clipboard.writeText(text);
 else{const t=document.createElement("textarea");t.value=text;t.style.position="fixed";t.style.opacity="0";document.body.append(t);t.select();const ok=document.execCommand("copy");t.remove();if(!ok)throw new Error("Não foi possível copiar automaticamente.");}
}
$("#customAmount").addEventListener("input",()=>{if(selectedQuota)refreshPix();});
$("#copyKey").addEventListener("click",async()=>{try{await copyText(cfg.pix.key);$("#pixFeedback").textContent="Chave Pix copiada.";}catch(e){$("#pixFeedback").textContent=e.message;}});
$("#copyPayload").addEventListener("click",async()=>{try{await copyText($("#pixPayload").value);$("#pixFeedback").textContent="Código Pix copiado.";}catch(e){$("#pixFeedback").textContent=e.message;}});
$("#closeModal").addEventListener("click",()=>$("#pixModal").close());
$("#pixModal").addEventListener("click",e=>{if(e.target===$("#pixModal"))$("#pixModal").close();});
$("#pixModal").addEventListener("keydown",e=>{if(e.key==="Escape")$("#pixModal").close();});

/* RSVP: demonstração local ou envio para Google Apps Script. */
const form=$("#rsvpForm"), status=$("#formStatus"), submit=$("#submitRsvp");
function formDataObject(){
 const fd=new FormData(form); const data=Object.fromEntries(fd.entries());
 data.presenca=fd.get("presenca");data.adultos=Number(data.adultos||0);data.criancas=Number(data.criancas||0);
 data.consentimento=fd.get("consentimento")==="on";data.enviadoEm=new Date().toISOString();
 return data;
}
form.addEventListener("submit",async e=>{
 e.preventDefault();status.className="form-status";status.textContent="";
 if(!form.reportValidity()){status.classList.add("error");status.textContent="Verifique os campos obrigatórios antes de enviar.";return;}
 const data=formDataObject();
 if(data.adultos<0||data.adultos>10||data.criancas<0||data.criancas>10){status.classList.add("error");status.textContent="A quantidade de adultos e crianças deve estar entre 0 e 10.";return;}
 submit.disabled=true;submit.textContent="Enviando…";status.textContent="Sua resposta está sendo enviada…";
 try{
  if(cfg.demoMode===true){
   const entries=JSON.parse(localStorage.getItem("wedding_rsvp_demo")||"[]");entries.push(data);localStorage.setItem("wedding_rsvp_demo",JSON.stringify(entries));
   status.textContent="Resposta salva neste navegador (modo demonstração). Ela não foi enviada aos noivos.";
  }else{
   if(!cfg.rsvpEndpoint)throw new Error("A URL de envio ainda não foi configurada.");
   const response=await fetch(cfg.rsvpEndpoint,{method:"POST",mode:"cors",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify(data)});
   if(!response.ok)throw new Error("O serviço retornou um erro. Tente novamente ou fale com os noivos.");
   const result=await response.json();if(result.ok===false)throw new Error(result.message||"Não foi possível registrar a resposta.");
   status.textContent="Confirmação enviada com sucesso. Muito obrigado!";
  }
  form.reset();
 }catch(err){status.classList.add("error");status.textContent=err.message||"Erro no envio. Tente novamente.";}
 finally{submit.disabled=false;submit.textContent="Enviar confirmação";}
});

/* Navegação mobile acessível. */
const toggle=$("#menuToggle"),nav=$("#mainNav");
toggle.addEventListener("click",()=>{const open=nav.classList.toggle("open");toggle.setAttribute("aria-expanded",String(open));toggle.setAttribute("aria-label",open?"Fechar menu":"Abrir menu");});
nav.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>{nav.classList.remove("open");toggle.setAttribute("aria-expanded","false");}));
renderConfig();updateCountdown();setInterval(updateCountdown,1000);
})();
