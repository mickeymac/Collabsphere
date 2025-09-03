import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getProjectById, deleteProject, addCollaborator, removeCollaborator, updateCollaboratorRole } from '../services/projectService';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../styles/projectDetails.css';

const ProjectDetails = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState(location.state?.message || '');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCollaboratorForm, setShowCollaboratorForm] = useState(false);
  const [collaboratorEmail, setCollaboratorEmail] = useState('');
  const [collaboratorRole, setCollaboratorRole] = useState('viewer');
  const [collaboratorError, setCollaboratorError] = useState('');

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const response = await getProjectById(projectId);
      setProject(response.data);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteProject(projectId);
      navigate('/projects', { 
        state: { message: 'Project deleted successfully!' } 
      });
    } catch (err) {
      setError(err.message || 'Failed to delete project');
      setShowDeleteConfirm(false);
    }
  };

  const handleAddCollaborator = async (e) => {
    e.preventDefault();
    if (!collaboratorEmail.trim()) {
      setCollaboratorError('Email is required');
      return;
    }

    try {
      await addCollaborator(projectId, { email: collaboratorEmail, role: collaboratorRole });
      setCollaboratorEmail('');
      setCollaboratorRole('viewer');
      setCollaboratorError('');
      setShowCollaboratorForm(false);
      setMessage('Collaborator added successfully!');
      fetchProject(); // Refresh project data
    } catch (err) {
      setCollaboratorError(err.message || 'Failed to add collaborator');
    }
  };

  const handleRemoveCollaborator = async (userId) => {
    try {
      await removeCollaborator(projectId, userId);
      setMessage('Collaborator removed successfully!');
      fetchProject(); // Refresh project data
    } catch (err) {
      setError(err.message || 'Failed to remove collaborator');
    }
  };

  const handleUpdateCollaboratorRole = async (userId, newRole) => {
    try {
      await updateCollaboratorRole(projectId, userId, { role: newRole });
      setMessage('Collaborator role updated successfully!');
      fetchProject(); // Refresh project data
    } catch (err) {
      setError(err.message || 'Failed to update collaborator role');
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <Navbar />
        <div className="content-container">
          <h2>Loading project...</h2>
        </div>
        <Footer />
      </div>
    );
  }

  if (error && !project) {
    return (
      <div className="page-container">
        <Navbar />
        <div className="content-container">
          <div className="error-message">{error}</div>
          <button 
            onClick={() => navigate('/projects')} 
            className="back-btn"
          >
            Back to Projects
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="page-container">
      <Navbar />
      <div className="content-container">
        {message && (
          <div className="success-message">
            {message}
            <button onClick={() => setMessage('')} className="close-btn">×</button>
          </div>
        )}

        <div className="project-details-header">
          <h1>{project.name}</h1>
          <div className="project-actions">
            <button 
              onClick={() => navigate(`/projects/${projectId}/edit`)} 
              className="edit-btn"
            >
              Edit Project
            </button>
            <button 
              onClick={() => setShowDeleteConfirm(true)} 
              className="delete-btn"
            >
              Delete Project
            </button>
          </div>
        </div>

        {showDeleteConfirm && (
          <div className="delete-confirm">
            <p>Are you sure you want to delete this project? This action cannot be undone.</p>
            <div className="delete-actions">
              <button onClick={() => setShowDeleteConfirm(false)} className="cancel-btn">
                Cancel
              </button>
              <button onClick={handleDelete} className="confirm-delete-btn">
                Delete
              </button>
            </div>
          </div>
        )}

        <div className="project-details-content">
          <div className="project-info">
            <div className="info-group">
              <h3>Description</h3>
              <p>{project.description || 'No description provided'}</p>
            </div>

            {project.repositoryUrl && (
              <div className="info-group">
                <h3>Repository URL</h3>
                <a href={project.repositoryUrl} target="_blank" rel="noopener noreferrer">
                  {project.repositoryUrl}
                </a>
              </div>
            )}

            <div className="info-group">
              <h3>Visibility</h3>
              <p>{project.isPrivate ? 'Private' : 'Public'}</p>
            </div>

            {project.tags && project.tags.length > 0 && (
              <div className="info-group">
                <h3>Tags</h3>
                <div className="tags-container">
                  {project.tags.map((tag, index) => (
                    <span key={index} className="tag">{tag}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="info-group">
              <h3>Created</h3>
              <p>{new Date(project.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="collaborators-section">
            <div className="section-header">
              <h2>Collaborators</h2>
              <button 
                onClick={() => setShowCollaboratorForm(!showCollaboratorForm)} 
                className="add-collaborator-btn"
              >
                {showCollaboratorForm ? 'Cancel' : 'Add Collaborator'}
              </button>
            </div>

            {showCollaboratorForm && (
              <form onSubmit={handleAddCollaborator} className="collaborator-form">
                <div className="form-group">
                  <label htmlFor="collaboratorEmail">Email</label>
                  <input
                    type="email"
                    id="collaboratorEmail"
                    value={collaboratorEmail}
                    onChange={(e) => setCollaboratorEmail(e.target.value)}
                    placeholder="Enter collaborator's email"
                    className={collaboratorError ? 'error' : ''}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="collaboratorRole">Role</label>
                  <select
                    id="collaboratorRole"
                    value={collaboratorRole}
                    onChange={(e) => setCollaboratorRole(e.target.value)}
                  >
                    <option value="viewer">Viewer</option>
                    <option value="editor">Editor</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                {collaboratorError && <div className="error-message">{collaboratorError}</div>}

                <button type="submit" className="submit-btn">Add Collaborator</button>
              </form>
            )}

            <div className="collaborators-list">
              <div className="collaborator owner">
                <div className="collaborator-info">
                  <span className="collaborator-name">{project.owner.name}</span>
                  <span className="collaborator-email">{project.owner.email}</span>
                </div>
                <span className="collaborator-role owner">Owner</span>
              </div>

              {project.collaborators && project.collaborators.length > 0 ? (
                project.collaborators.map((collaborator) => (
                  <div key={collaborator.user._id} className="collaborator">
                    <div className="collaborator-info">
                      <span className="collaborator-name">{collaborator.user.name}</span>
                      <span className="collaborator-email">{collaborator.user.email}</span>
                    </div>
                    <div className="collaborator-actions">
                      <select
                        value={collaborator.role}
                        onChange={(e) => handleUpdateCollaboratorRole(collaborator.user._id, e.target.value)}
                        className="role-select"
                      >
                        <option value="viewer">Viewer</option>
                        <option value="editor">Editor</option>
                        <option value="admin">Admin</option>
                      </select>
                      <button 
                        onClick={() => handleRemoveCollaborator(collaborator.user._id)} 
                        className="remove-collaborator-btn"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="no-collaborators">No collaborators yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProjectDetails;