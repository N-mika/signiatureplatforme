import crypto from "crypto";


export const generateSignatureToken = ()=>{
  return crypto.randomBytes(32).toString("hex");
}