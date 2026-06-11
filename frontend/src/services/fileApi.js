import api from './api';

export const uploadFile = async (folderPath, file) => {
  const formData = new FormData();
  formData.append('folder_path', folderPath);
  formData.append('file', file);
  
  const response = await api.post('/files/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const deleteFile = async (filePath) => {
  const response = await api.delete('/files', { data: { file_path: filePath } });
  return response.data;
};
