import type { PdfFile } from "../data/type";
import { supabase } from "./supabase";
import { v4 as uuid } from "uuid";
export const formatDate = (date: string) => {
  if (!date) return "";
  const dateR = new Date(date).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit", 
    minute: "2-digit",
    second: "2-digit",
  });
  return dateR;
};

export const uploadFile = async (file: File, uploadTo: string): Promise<PdfFile | undefined> => {
  if (!file) return undefined;

  const fileExt = file.name.split(".").pop();
  const filePath = `${uploadTo}/${uuid()}.${fileExt}`;

  const { data, error } = await supabase.storage.from("aesnasignature").upload(filePath, file, { contentType: file.type, cacheControl: "1500", upsert: false });

  if (error) {
    console.error("Erreur upload :", error.message);
    return undefined;
  }

  return {
    path: data.path,
    name: file.name,
    size: file.size,
    type: file.type
  };
};

export const deleteFile = async (fileUrl: string) => {
  if (!fileUrl) return false;

  try {
    // Extraire le chemin relatif du fichier dans le bucket
    const baseUrl = "https://mxbzfekwbvybtxlutkpz.supabase.co/storage/v1/object/public/intranet/";
    const filePath = fileUrl.replace(baseUrl, "");

    if (!filePath) return false;

    const { error } = await supabase.storage.from("intranet").remove([filePath]);

    if (error) {
      console.error("Erreur suppression fichier :", error.message);
      return false;
    }

    // console.log("Fichier supprimé avec succès :", data);
    return true;
  } catch (err) {
    console.error("Erreur deleteFile :", err);
    return false;
  }
};
export const getFileUrl = async (filePath: string): Promise<string | undefined> => {
  const { data, error } = await supabase.storage
    .from("aesnasignature")
    .createSignedUrl(filePath, 60 * 60);

  if (error) {
    console.error("Erreur URL signée :", error.message);
    return undefined;
  }

  return data.signedUrl;
};
// export const updateFile = async (id: string, name: string) => {
//   try {
//     let response = await axios.put(`${API}/file/update`, {
//       id,
//       newFileName: name,
//     });
//     if (response.data.status === 201) {
//       return true;
//     } else return false;
//   } catch (err) {
//     console.log(err);
//     return false;
//   }
// };