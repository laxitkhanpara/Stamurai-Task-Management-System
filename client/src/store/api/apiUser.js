import api from "./api"

export const addUser = async (userData) => {
  const response = await api.post("/users", userData);
  return response;
}

export const getUser = async () => {
  const response = await api.get("/users");
  return response;
}

export const getUserById = async (id) => {
  const response = await api.get(`/users/${id}`);
  console.log("User API response:", response);
  
  return response;
}

export const deleteUserById = async (id) => {
  const response = await api.delete(`/users/${id}`);
  return response;
}
