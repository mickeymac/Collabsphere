import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUserProjects, deleteProject } from '../services/projectService';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { FiPlus, FiEye, FiEdit2, FiTrash2 } from 'react-icons/fi';
import '../styles/projects.css';

const Projects = () => {
  const [projects, setProjects] = useState({ owned: [], collaborated: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const response = await getUserProjects();
        setProjects(response.data);
        setError('');
      } catch (err) {
        setError(err.message || 'Failed to load projects');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handleDeleteProject = async (projectId) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await deleteProject(projectId);
        // Update projects list after deletion
        setProjects(prev => ({
          ...prev,
          owned: prev.owned.filter(project => project._id !== projectId)
        }));
      } catch (err) {
        setError(err.message || 'Failed to delete project');
      }
    }
  };

  if (loading) {
    return (
      <div className="projects-container">
        <Navbar />
        <div className="projects-content projects-loading">
          <div className="loading-spinner"></div>
          <h2>Loading your projects...</h2>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="projects-container">
      <Navbar />
      <div className="projects-content">
        <div className="projects-header">
          <h1 className="page-title">My Projects</h1>
          <Link to="/projects/create" className="create-project-btn">
            <FiPlus className="icon" /> Create New Project
          </Link>
        </div>

        {error && <div className="error-message"><p>{error}</p></div>}

        <div className="projects-section">
          <h2 className="section-title">Projects You Own</h2>
          {projects.owned.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📁</div>
              <p>You don't have any projects yet. Create one to get started!</p>
              <Link to="/projects/create" className="empty-action-btn">
                <FiPlus className="icon" /> Create Your First Project
              </Link>
            </div>
          ) : (
            <div className="projects-grid">
              {projects.owned.map(project => (
                <div key={project._id} className="project-card">
                  <div className="project-card-header">
                    <h3 className="project-title">{project.name}</h3>
                    {project.isPrivate ? (
                      <span className="private-badge">Private</span>
                    ) : (
                      <span className="public-badge">Public</span>
                    )}
                  </div>
                  <p className="project-description">
                    {project.description || 'No description provided'}
                  </p>
                  <div className="project-meta">
                    <div className="project-tags">
                      {project.tags && project.tags.map((tag, index) => (
                        <span key={index} className="project-tag">{tag}</span>
                      ))}
                    </div>
                    <div className="project-date">
                      Created: {new Date(project.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="project-card-footer">
                    <Link to={`/projects/${project._id}`} className="view-project-btn">
                      <FiEye className="btn-icon" /> View Details
                    </Link>
                    <div className="project-actions">
                      <Link to={`/projects/${project._id}/edit`} className="edit-project-btn">
                        <FiEdit2 className="btn-icon" /> Edit
                      </Link>
                      <button 
                        onClick={() => handleDeleteProject(project._id)} 
                        className="delete-project-btn"
                        aria-label="Delete project"
                      >
                        <FiTrash2 className="btn-icon" /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="projects-section">
          <h2 className="section-title">Projects You Collaborate On</h2>
          {projects.collaborated.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">👥</div>
              <p>You're not collaborating on any projects yet.</p>
            </div>
          ) : (
            <div className="projects-grid">
              {projects.collaborated.map(project => (
                <div key={project._id} className="project-card collaborator">
                  <div className="project-card-header">
                    <h3 className="project-title">{project.name}</h3>
                    {project.isPrivate ? (
                      <span className="private-badge">Private</span>
                    ) : (
                      <span className="public-badge">Public</span>
                    )}
                  </div>
                  <p className="project-description">
                    {project.description || 'No description provided'}
                  </p>
                  <div className="project-meta">
                    <div className="project-tags">
                      {project.tags && project.tags.map((tag, index) => (
                        <span key={index} className="project-tag">{tag}</span>
                      ))}
                    </div>
                    <div className="project-date">
                      Created: {new Date(project.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="project-role">
                    Role: {project.collaborators.find(c => c.user === project._id)?.role || 'Collaborator'}
                  </div>
                  <div className="project-card-footer">
                    <Link to={`/projects/${project._id}`} className="view-project-btn">
                      <FiEye className="btn-icon" /> View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Projects;