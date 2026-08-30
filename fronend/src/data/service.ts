import axios from "axios";
import type { User, Document } from "./type";

export const API = "http://localhost:3000";

// CREATE
export const onAddService = async (
  nameAdd: string,
  params: User | Document
): Promise<"success" | "error"> => {
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

export const onDownloadSignedDocumentService = async (id: string) => {
  window.open(`${API}/file/signed/${id}`, "_blank");
};
export const onDownloadAllSignedDocumentsService = () => {
  const link = document.createElement("a");

  link.href = `${API}/file/signed/all`;
  link.download = "documents-signes.zip";

  document.body.appendChild(link);
  link.click();
  link.remove();
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