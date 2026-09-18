import { onCall, onRequest, HttpsError } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import { initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import crypto from "node:crypto";

initializeApp();
const db=getFirestore();
const MERCADO_PAGO_ACCESS_TOKEN=defineSecret("MERCADO_PAGO_ACCESS_TOKEN");
// ELLO V9: a IA deixou de ser vendida em pacotes de créditos.
// O produto pago é a experiência (Especial / Cápsula do Tempo), não a geração de texto.

// ELLO V6 — venda de experiências premium (separada dos créditos de IA)
const EXPERIENCE_PLANS={
 surprise:{amount:"5.90",title:"ELLO Especial"},
 eternize:{amount:"12.90",title:"ELLO Cápsula do Tempo"}
};

export const createExperiencePix=onCall({region:"southamerica-east1",secrets:[MERCADO_PAGO_ACCESS_TOKEN]},async request=>{
 if(!request.auth)throw new HttpsError("unauthenticated","Entre no ELLO.");
 const planId=String(request.data?.planId||"");const plan=EXPERIENCE_PLANS[planId];
 if(!plan)throw new HttpsError("invalid-argument","Experiência inválida.");
 const payerEmail=String(request.data?.payerEmail||request.auth.token.email||"").trim().toLowerCase();
 if(!/^\S+@\S+\.\S+$/.test(payerEmail))throw new HttpsError("invalid-argument","Informe um e-mail válido.");
 const ref=`ello_exp_${crypto.randomUUID().replaceAll("-","").slice(0,18)}`;const payRef=db.doc(`experiencePayments/${ref}`);
 await payRef.set({userId:request.auth.uid,planId,amount:Number(plan.amount),method:"pix",status:"created",externalReference:ref,payerEmail,createdAt:FieldValue.serverTimestamp()});
 const body={type:"online",processing_mode:"automatic",total_amount:plan.amount,external_reference:ref,transactions:{payments:[{amount:plan.amount,payment_method:{id:"pix",type:"bank_transfer"},expiration_time:"P1D"}]},payer:{email:payerEmail}};
 const res=await fetch("https://api.mercadopago.com/v1/orders",{method:"POST",headers:{Authorization:`Bearer ${MERCADO_PAGO_ACCESS_TOKEN.value()}`,"Content-Type":"application/json","X-Idempotency-Key":crypto.randomUUID()},body:JSON.stringify(body)});
 const data=await res.json();
 if(!res.ok){console.error("MercadoPago experience Pix",JSON.stringify({httpStatus:res.status,response:data},null,2));const detail=data?.errors?.[0]?.details?.map?.(x=>x?.message||x?.field||JSON.stringify(x)).filter(Boolean).join(" | ");throw new HttpsError("internal",detail?`Mercado Pago recusou o Pix: ${detail}`:"Não foi possível gerar o Pix.");}
 const payment=data.transactions?.payments?.[0],pm=payment?.payment_method||{};
 if(!pm.qr_code&&!pm.ticket_url)throw new HttpsError("internal","Mercado Pago não retornou os dados do Pix.");
 await payRef.set({mercadoPagoOrderId:data.id||null,providerStatus:data.status||payment?.status||null,updatedAt:FieldValue.serverTimestamp()},{merge:true});
 return{orderId:data.id,qrCode:pm.qr_code||"",qrCodeBase64:pm.qr_code_base64||"",ticketUrl:pm.ticket_url||"",status:data.status||payment?.status||"action_required",planId,amount:plan.amount};
});

async function confirmExperienceOrder(orderId){
 const res=await fetch(`https://api.mercadopago.com/v1/orders/${encodeURIComponent(orderId)}`,{headers:{Authorization:`Bearer ${MERCADO_PAGO_ACCESS_TOKEN.value()}`}});if(!res.ok)return false;
 const order=await res.json(),ext=order.external_reference;if(!ext)return false;const payRef=db.doc(`experiencePayments/${ext}`);
 return db.runTransaction(async tx=>{const p=await tx.get(payRef);if(!p.exists)return false;if(p.data().status==="approved")return true;const paid=order.status==="processed"||order.status==="approved"||order.transactions?.payments?.some(x=>x.status==="approved"||x.status==="processed");if(!paid){tx.set(payRef,{providerStatus:order.status||"pending",updatedAt:FieldValue.serverTimestamp()},{merge:true});return false}const data=p.data();tx.set(payRef,{status:"approved",providerStatus:order.status||"processed",approvedAt:FieldValue.serverTimestamp()},{merge:true});tx.set(db.collection(`users/${data.userId}/experiencePurchases`).doc(ext),{planId:data.planId,amount:data.amount,status:"available",paymentId:ext,createdAt:FieldValue.serverTimestamp()});return true});
}

export const checkExperiencePayment=onCall({region:"southamerica-east1",secrets:[MERCADO_PAGO_ACCESS_TOKEN]},async request=>{
 if(!request.auth)throw new HttpsError("unauthenticated","Entre no ELLO.");const orderId=String(request.data?.orderId||"");if(!orderId)throw new HttpsError("invalid-argument","Pagamento inválido.");
 const q=await db.collection("experiencePayments").where("mercadoPagoOrderId","==",orderId).limit(1).get();if(q.empty||q.docs[0].data().userId!==request.auth.uid)throw new HttpsError("permission-denied","Pagamento não pertence a esta conta.");
 await confirmExperienceOrder(orderId);const fresh=await q.docs[0].ref.get(),p=fresh.data();return{paid:p.status==="approved",status:p.status||p.providerStatus||"pending",planId:p.planId};
});


// ELLO V6.1 — selagem segura no servidor.
// O cliente nunca decide sozinho se uma experiência é Premium.
const PLAN_LIMITS={
 free:{maxMedia:3},
 surprise:{maxMedia:10},
 eternize:{maxMedia:10}
};
const ALLOWED_KINDS=new Set(["future","someone","child","love","group","gift"]);
const ALLOWED_MEDIA=new Set(["image","video","audio"]);

export const finalizeCapsule=onCall({region:"southamerica-east1"},async request=>{
 if(!request.auth)throw new HttpsError("unauthenticated","Entre no ELLO.");
 const uid=request.auth.uid,input=request.data||{};
 const capsuleId=String(input.id||"");
 const requestedPlan=String(input.experiencePlan||"free");
 if(!/^[A-Za-z0-9_-]{8,40}$/.test(capsuleId))throw new HttpsError("invalid-argument","Identificador do ELLO inválido.");
 if(!PLAN_LIMITS[requestedPlan])throw new HttpsError("invalid-argument","Plano inválido.");
 if(!ALLOWED_KINDS.has(String(input.kind||"")))throw new HttpsError("invalid-argument","Tipo de ELLO inválido.");
 const recipient=String(input.recipient||"").trim().slice(0,120);
 const senderName=String(input.senderName||"").trim().slice(0,120);
 const message=String(input.message||"").slice(0,12000);
 const openAt=new Date(String(input.openAt||""));
 if(!recipient||Number.isNaN(openAt.getTime()))throw new HttpsError("invalid-argument","Destinatário ou data inválidos.");
 const media=Array.isArray(input.media)?input.media:[];
 if(media.length>PLAN_LIMITS[requestedPlan].maxMedia)throw new HttpsError("invalid-argument",`Este plano permite até ${PLAN_LIMITS[requestedPlan].maxMedia} mídias.`);
 for(const m of media){
  if(!ALLOWED_MEDIA.has(String(m?.type||"")))throw new HttpsError("invalid-argument","Tipo de mídia inválido.");
  const url=String(m?.url||"");
  if(!url.includes(`/capsules%2F${capsuleId}%2F${uid}%2F`)&&!url.includes(`/capsules/${capsuleId}/${uid}/`))throw new HttpsError("permission-denied","Mídia não pertence a este ELLO.");
 }
 const capsuleRef=db.doc(`capsules/${capsuleId}`),publicRef=db.doc(`capsulePublic/${capsuleId}`);
 await db.runTransaction(async tx=>{
  const existing=await tx.get(capsuleRef);if(existing.exists)throw new HttpsError("already-exists","Este ELLO já foi selado.");
  let purchaseRef=null;
  if(requestedPlan!=="free"){
   const q=db.collection(`users/${uid}/experiencePurchases`).where("planId","==",requestedPlan).where("status","==","available").limit(1);
   const purchases=await tx.get(q);
   if(purchases.empty)throw new HttpsError("failed-precondition","Pagamento Premium não encontrado ou já utilizado.");
   purchaseRef=purchases.docs[0].ref;
  }
  const safePlan=requestedPlan;
  const capsule={id:capsuleId,ownerId:uid,kind:String(input.kind),recipient,senderName,message,openAt:openAt.toISOString(),secret:Boolean(input.secret),reply:safePlan==="free"?false:Boolean(input.reply),cinematic:safePlan==="free"?false:Boolean(input.cinematic),music:safePlan==="free"?false:Boolean(input.music),theme:safePlan==="free"?"cosmos":String(input.theme||"cosmos").slice(0,40),location:String(input.location||"").slice(0,240),experiencePlan:safePlan,status:"sealed",media:media.map(m=>({id:String(m.id||crypto.randomUUID()),type:String(m.type),url:String(m.url),name:String(m.name||"").slice(0,240),size:Number(m.size||0)})),createdAt:FieldValue.serverTimestamp()};
  tx.create(capsuleRef,capsule);
  tx.create(publicRef,{id:capsuleId,ownerId:uid,kind:capsule.kind,recipient,senderName:senderName||"Alguém especial",openAt:capsule.openAt,secret:capsule.secret,cinematic:capsule.cinematic,theme:capsule.theme,experiencePlan:safePlan,createdAt:FieldValue.serverTimestamp()});
  if(purchaseRef)tx.update(purchaseRef,{status:"consumed",capsuleId,consumedAt:FieldValue.serverTimestamp()});
 });
 return{id:capsuleId,experiencePlan:requestedPlan};
});
