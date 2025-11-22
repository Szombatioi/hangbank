import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3001",
  //withCredentials: true, // TODO optional: if you use cookies/auth
  headers: {
    "Content-Type": "application/json",
  },
});
api.interceptors.request.use((config) => {
  console.log("Axios Request Headers:", config.headers);
  return config;
});

export function setAuthToken(token?: string | null){
  if(token){
    localStorage.setItem("token", token);
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    console.log(api.defaults.headers.common);
  } else{
    delete api.defaults.headers.common["Authorization"];
    localStorage.removeItem("token");
  }
}

export function getAuthToken(): string | null{
  return localStorage.getItem("token");
}

export enum GenderType{
  Male = 'Male',
  Female = 'Female',
  Other = 'Other',
}
export interface UserHeaderType{
  access_token: string;
  user: {
    id: string;
    email: string;
    name: string;
    birthdate: Date;
    gender: GenderType;
    username: string;
  }
}

export async function getUserByToken(){
  try{
    const res = await api.get<UserHeaderType>("/user/me");
    return res.data;
  } catch(err){
    return null;
  }
}

export default api;
