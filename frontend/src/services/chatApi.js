import api from './api';

export const sendChat = async (question, folders, files, conversationId, searchMode = "all") => {
  const response = await api.post('/chat', {
    question,
    folders,
    files,
    conversation_id: conversationId,
    search_mode: searchMode
  });
  return response.data;
};
