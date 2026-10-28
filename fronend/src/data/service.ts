import axios from "axios";
import type { User, Document, documentCreate } from "./type";
import { supabase } from "../tools/supabase";

// En développement, on passe par le proxy Vite (/api) pour éviter les blocages CORS.
// En production, on utilise VITE_API_URL s'il est défini, sinon le backend déployé.
export const API =
  import.meta.env.VITE_API_URL ??
  (import.meta.env.DEV ? "/api" : "https://signiatureplatforme.onrender.com");


// CREATE
export const onAddService = async (nameAdd: string, params: User | Document | documentCreate): Promise<"success" | "error"> => {
  try {
    const response = await axios.post(`${API}/${nameAdd.toLowerCase()}`, params);
    return response.status >= 200 && response.status < 300 ? "success" : "error";
  } catch (error) {
    console.error(error);
    return "error";
  }
};

// UPDATE
export const onUpdateService = async (
  endPoint: string,
  params: User
): Promise<"success" | "error"> => {
  try {
    const response = await axios.put(`${API}/${endPoint.toLowerCase()}`, params);
    return response.status >= 200 && response.status < 300 ? "success" : "error";
  } catch (error) {
    console.log(error);
    return "error";
  }
};

// GET (all)
export const onGetService = async <T>(endPoint: string): Promise<T[]> => {
  try {
    const response = await axios.get<T[]>(`${API}/${endPoint}`);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la requête GET", error);
    return [];
  }
};
// GET (one by id)
export const onGetByIdService = async <T>(endPoint: string, id: string): Promise<T | null> => {
  try {
    const response = await axios.get<T>(`${API}/${endPoint.toLowerCase()}/${id}`);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la requête GET by ID", error);
    return null;
  }
};

// DELETE
export const onDeleteService = async (nameDelete: string, id: string): Promise<"success" | "error"> => {
  try {
    const response = await axios.delete(`${API}/${nameDelete.toLowerCase()}/${id}`);
    return response.status >= 200 && response.status < 300 ? "success" : "error";
  } catch (error) {
    console.error(error);
    return "error";
  }
};

// LOGIN
export const loginService = async (email: string, password: string): Promise<User> => {
  try {
    const response = await axios.post<User>(`${API}/login`, { email, password });
    return response.data;
  } catch (error: any) {
    console.error("Erreur lors de la connexion", error);
    throw new Error(error.response?.data?.message || "Erreur de connexion");
  }
};


export const uploadDocumentService = async (
  title: string,
  presidentEmail: string,
  memberEmail: string,
  file: File
) => {
  try {
    const formData = new FormData();

    formData.append("title", title);
    formData.append("presidentEmail", presidentEmail);
    formData.append("memberEmail", memberEmail);

    // IMPORTANT
    formData.append("pdf", file);
    const response = await axios.post(`${API}/upload`, formData);

    return response.data;
  } catch (error) {
    console.error("Erreur upload document :", error);
    return null;
  }
};

export const signDocumentService = async (token: string, signatureImage: string): Promise<"success" | "error"> => {
  try {
    const response = await axios.post(`${API}/sign/${token}`, { signatureImage });
    return response.status >= 200 && response.status < 300 ? "success" : "error";

  } catch (error) {
    console.error(error);
    return "error";
  }
};

export const onDownloadSignedDocumentService = async (filePath: string, fileName: string) => {
  try {
    const { data, error } = await supabase.storage.from("aesnasignature").createSignedUrl(filePath, 60*3);

    if (error || !data?.signedUrl) {
      console.error("Erreur URL signée :", error);
      return;
    }

    const link = document.createElement("a");
    link.href = data.signedUrl;
    link.download = fileName;
    link.target = "_blank";

    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    console.error("Erreur téléchargement :", error);
  }
};
export const authService = async <T>(email: string, password: string): Promise<T | null> => {
  try {
    const data = { email, password }
    const response = await axios.post(`${API}/auth`, data);
    return response.data;
  } catch (error) {
    console.log(error)
    return null
  }
}

/* ------------------------------------------------------------------ */
/* Gestion des administrateurs                                         */
/* ------------------------------------------------------------------ */

export type ApiResult<T = unknown> = {
  success: boolean;
  message: string;
  data?: T;
};

const getErrorMessage = (error: any): string =>
  error?.response?.data?.message ||
  "Serveur injoignable. Vérifiez votre connexion Internet.";

export const inviteAdminService = async (
  name: string,
  email: string
): Promise<ApiResult<{ invitationLink: string; emailSent: boolean }>> => {
  try {
    const response = await axios.post(`${API}/invitadmin`, { name, email });

    return {
      success: true,
      message: response.data?.message ?? "Administrateur créé.",
      data: {
        invitationLink: response.data?.invitationLink ?? "",
        emailSent: response.data?.emailSent !== false,
      },
    };
  } catch (error) {
    console.error("Erreur invitation administrateur :", error);
    return { success: false, message: getErrorMessage(error) };
  }
};

export const deleteUserService = async (id: string): Promise<ApiResult> => {
  try {
    const response = await axios.delete(`${API}/user/${id}`);
    return {
      success: true,
      message: response.data?.message ?? "Utilisateur supprimé.",
    };
  } catch (error) {
    console.error("Erreur suppression utilisateur :", error);
    return { success: false, message: getErrorMessage(error) };
  }
};

export const loadInvitationService = async (token: string): Promise<ApiResult<User>> => {
  try {
    const response = await axios.get<User>(`${API}/getuser/${token}`);
    return { success: true, message: "", data: response.data };
  } catch (error) {
    return { success: false, message: getErrorMessage(error) };
  }
};

export const activateUserService = async (
  id: string,
  password: string
): Promise<ApiResult> => {
  try {
    const response = await axios.put(`${API}/activateuser`, { id, password });
    return {
      success: true,
      message: response.data?.message ?? "Compte activé avec succès.",
    };
  } catch (error) {
    return { success: false, message: getErrorMessage(error) };
  }
};