import axios from 'axios';

const API_URL = 'http://localhost:5000/api/projects';

// Create a new project
export const createProject = async (projectData) => {
  try {
    const response = await axios.post(API_URL, projectData, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to create project');
  }
};

// Get all projects for current user
export const getUserProjects = async () => {
  try {
    const response = await axios.get(API_URL, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to fetch projects');
  }
};

// Get a single project by ID
export const getProjectById = async (projectId) => {
  try {
    const response = await axios.get(`${API_URL}/${projectId}`, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to fetch project');
  }
};

// Update a project
export const updateProject = async (projectId, projectData) => {
  try {
    const response = await axios.put(`${API_URL}/${projectId}`, projectData, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to update project');
  }
};

// Delete a project
export const deleteProject = async (projectId) => {
  try {
    const response = await axios.delete(`${API_URL}/${projectId}`, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to delete project');
  }
};

// Add a collaborator to a project
export const addCollaborator = async (projectId, collaboratorData) => {
  try {
    const response = await axios.post(`${API_URL}/${projectId}/collaborators`, collaboratorData, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to add collaborator');
  }
};

// Remove a collaborator from a project
export const removeCollaborator = async (projectId, userId) => {
  try {
    const response = await axios.delete(`${API_URL}/${projectId}/collaborators/${userId}`, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to remove collaborator');
  }
};

// Update collaborator role
export const updateCollaboratorRole = async (projectId, userId, roleData) => {
  try {
    const response = await axios.put(`${API_URL}/${projectId}/collaborators/${userId}`, roleData, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to update collaborator role');
  }
};