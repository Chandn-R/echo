import  api  from "@/services/api";

export const createPost = async () => {
  const response = await api.post("/posts");
  return response.data;
};
