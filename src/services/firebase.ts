import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInAnonymously, signInWithPopup, signOut, onAuthStateChanged, User } from "firebase/auth";
import { getFirestore, serverTimestamp } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions, httpsCallable } from "firebase/functions";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const configured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app, "southamerica-east1");
export const googleProvider = new GoogleAuthProvider();

export async function ensureUser() {
  if (auth.currentUser) return auth.currentUser;
  return (await signInAnonymously(auth)).user;
}
export const loginGoogle = () => signInWithPopup(auth, googleProvider);
export const logout = () => signOut(auth);
export const watchUser = (cb:(u:User|null)=>void) => onAuthStateChanged(auth, cb);
export { serverTimestamp };

export type AITone = "emocionante"|"romantico"|"futuro"|"leve"|"profundo";
export async function gerarTextoIA(input:{rascunho:string;destinatario:string;remetente:string;tipo:string;tom:AITone}) {
  await ensureUser();
  const call = httpsCallable(functions, "gerarTextoELLO");
  const result:any = await call(input);
  return result.data as {texto:string;titulo?:string;credits?:number};
}

export async function getAICredits(){
  await ensureUser();
  const call=httpsCallable(functions,"getAICredits");
  const result:any=await call({});
  return result.data as {credits:number};
}
export async function createCreditCheckout(packageId:string){
  await ensureUser();
  const call=httpsCallable(functions,"createCreditCheckout");
  const result:any=await call({packageId});
  return result.data as {checkoutUrl:string;orderId?:string};
}

export async function createPixPayment(packageId:string,payerEmail:string){
  await ensureUser();
  const call=httpsCallable(functions,"createPixPayment");
  const result:any=await call({packageId,payerEmail});
  return result.data as {orderId:string;qrCode:string;qrCodeBase64:string;ticketUrl:string;status:string;credits:number;amount:string};
}
export async function checkPixPayment(orderId:string){
  await ensureUser();
  const call=httpsCallable(functions,"checkPixPayment");
  const result:any=await call({orderId});
  return result.data as {paid:boolean;status:string;credits:number};
}

export async function createExperiencePix(planId:string,payerEmail:string){
  await ensureUser();
  const call=httpsCallable(functions,"createExperiencePix");
  const result:any=await call({planId,payerEmail});
  return result.data as {orderId:string;qrCode:string;qrCodeBase64:string;ticketUrl:string;status:string;planId:string;amount:string};
}
export async function checkExperiencePayment(orderId:string){
  await ensureUser();
  const call=httpsCallable(functions,"checkExperiencePayment");
  const result:any=await call({orderId});
  return result.data as {paid:boolean;status:string;planId?:string};
}

export async function finalizeCapsuleSecure(payload:any){
  await ensureUser();
  const call=httpsCallable(functions,"finalizeCapsule");
  const result:any=await call(payload);
  return result.data as {id:string;experiencePlan:string};
}
