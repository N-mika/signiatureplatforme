import axios from "axios";
import type { User , Document, SignaturePosition } from "./type";

// const API = "https://transportmaritime.onrender.com";
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
  nameUpdate: string,
  params: User | Document
): Promise<"success" | "error"> => {
  try {
    const response = await axios.put(`${API}/${nameUpdate.toLowerCase()}/${params.id}`, params);
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

// UPLOAD PDF DOCUMENT
export const uploadDocumentService = async (
  title: string,
  recipientEmail: string,
  pdf: File, 
  signaturePosition : SignaturePosition
): Promise<Document | null> => {
  try {
    const formData = new FormData();

    formData.append("title", title);
    formData.append("recipientEmail", recipientEmail);
    formData.append("pdf", pdf);
    formData.append("signaturePositions", JSON.stringify(signaturePosition));

    const response = await axios.post<Document>(
      `${API}/upload`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );


    return response.data;

  } catch (error: any) {

    console.error(
      "Erreur upload document",
      error.response?.data || error
    );

    return null;
  }
};

export const signDocumentService = async (
  token: string,
  signatureImage: string,
  signaturePositions : SignaturePosition
): Promise<"success" | "error"> => {
  try {
    const response = await axios.post(
      `${API}/sign/${token}`,
      {
        signatureImage,
        signaturePositions
      }
    );

    return response.status >= 200 && response.status < 300
      ? "success"
      : "error";

  } catch (error) {
    console.error(error);
    return "error";
  }
};