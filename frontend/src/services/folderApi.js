import api from './api';

export const getFolders = async () => {
  const response = await api.get('/folders');
  return response.data;
};

export const createFolder = async (folderPath) => {
  const response = await api.post('/folders', { folder_path: folderPath });
  return response.data;
};

export const deleteFolder = async (folderPath) => {
  // We use the singular endpoint that deletes recursively
  const response = await api.delete(`/folders/${encodeURIComponent(folderPath)}`);
  return response.data;
};
