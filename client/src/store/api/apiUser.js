import api from "./api"

export const addUser = async (userData) => {
  const response = await api.post("/users", userData);
  return response;
}

export const getUser = async () => {
  const response = await api.get("/auth/users");
  console.log("getUser", response);
  
  return response;
}

export const getUserById = async (id) => {
  const response = await api.get(`/auth/users/${id}`);
  return response;
}

export const deleteUserById = async (id) => {
  const response = await api.delete(`/users/${id}`);
  return response;
}
