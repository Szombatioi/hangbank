import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3001",
  //withCredentials: true, // TODO optional: if you use cookies/auth
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
