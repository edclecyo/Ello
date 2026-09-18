import { collection, deleteDoc, doc, getDoc, getDocs, orderBy, query, setDoc, where, updateDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db, storage, ensureUser, finalizeCapsuleSecure } from "./firebase";

export type MediaItem={id:string;type:"image"|"video"|"audio";url:string;name:string;size:number};
export type CloudCapsule={id:string;ownerId:string;kind:string;recipient:string;senderName?:string;message:string;openAt:string;secret:boolean;reply:boolean;cinematic:boolean;music:boolean;theme?:string;location?:string;experiencePlan?:"free"|"surprise"|"unforgettable"|"eternize";status:"sealed"|"opened";media:MediaItem[];createdAt?:any;openedAt?:any};
const token=()=>crypto.randomUUID().replaceAll("-","").slice(0,14);

export async function createCapsule(input:Omit<CloudCapsule,"id"|"ownerId"|"status"|"media">,files:File[],onProgress?:(n:number)=>void){
 const user=await ensureUser(); const id=token(); const media:MediaItem[]=[];
 for(let i=0;i<files.length;i++){
  const f=files[i],type:MediaItem["type"]=f.type.startsWith("video")?"video":f.type.startsWith("audio")?"audio":"image";
  const path=`capsules/${id}/${user.uid}/${crypto.randomUUID()}-${f.name.replace(/[^a-zA-Z0-9._-]/g,"_")}`;
  const task=uploadBytesResumable(ref(storage,path),f,{contentType:f.type});
  await new Promise<void>((resolve,reject)=>task.on("state_changed",s=>onProgress?.(Math.round(((i+s.bytesTransferred/s.totalBytes)/Math.max(files.length,1))*100)),reject,()=>resolve()));
  media.push({id:crypto.randomUUID(),type,url:await getDownloadURL(task.snapshot.ref),name:f.name,size:f.size});
 }
 const payload={...input,id,media};
 await finalizeCapsuleSecure(payload);
 const snap=await getDoc(doc(db,"capsules",id));
 if(!snap.exists()) throw new Error("O ELLO foi selado, mas não foi possível carregá-lo.");
 return snap.data() as CloudCapsule;
}
export async function getCapsuleMeta(id:string){const s=await getDoc(doc(db,"capsulePublic",id));return s.exists()?s.data():null}
export async function getCapsuleContent(id:string){await ensureUser();const s=await getDoc(doc(db,"capsules",id));return s.exists()?s.data() as CloudCapsule:null}
export async function listMine(){const u=await ensureUser();const q=query(collection(db,"capsules"),where("ownerId","==",u.uid),orderBy("createdAt","desc"));return (await getDocs(q)).docs.map(x=>x.data() as CloudCapsule)}
export async function markOpened(id:string){await updateDoc(doc(db,"capsules",id),{status:"opened",openedAt:serverTimestamp()})}
export async function saveReaction(capsuleId:string,payload:{type:string;text?:string}){const u=await ensureUser();const id=crypto.randomUUID();await setDoc(doc(db,"capsules",capsuleId,"reactions",id),{...payload,id,userId:u.uid,createdAt:serverTimestamp()})}
export async function listReactions(capsuleId:string){const q=query(collection(db,"capsules",capsuleId,"reactions"),orderBy("createdAt","desc"));return (await getDocs(q)).docs.map(d=>d.data())}
export async function deleteCapsule(id:string){await deleteDoc(doc(db,"capsules",id));await deleteDoc(doc(db,"capsulePublic",id))}
