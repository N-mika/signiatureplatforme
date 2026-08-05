import crypto from "crypto";


export function generateSignatureToken(){
  return crypto.randomBytes(32).toString("hex");
}