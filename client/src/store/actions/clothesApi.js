import apiClient from "../api/apiClient";

// Get all clothes
export const fetchClothes = async () => {
  const response = await apiClient.get("/clothes");
  return response.data;
};

// Get clothes by ID
export const fetchClothesById = async (id) => {
  const response = await apiClient.get(`/clothes/${id}`);
  return response.data;
};

// Add new clothes
export const addClothes = async (clothesData) => {
  const response = await apiClient.post("/clothes", clothesData);
  return response.data;
};

// Update existing clothes
export const updateClothes = async (id, clothesData) => {
  const response = await apiClient.put(`/clothes/${id}`, clothesData);
  return response.data;
};

// Delete clothes
export const deleteClothes = async (id) => {
  const response = await apiClient.delete(`/clothes/${id}`);
  return response.data;
};