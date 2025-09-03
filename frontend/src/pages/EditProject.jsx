import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProjectById, updateProject } from '../services/projectService';
import ProjectForm from '../components/ProjectForm';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const EditProject = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
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

    fetchProject();
  }, [projectId]);

  const handleSubmit = async (projectData) => {
    try {
      await updateProject(projectId, projectData);
      navigate(`/projects/${projectId}`, { 
        state: { message: 'Project updated successfully!' } 
      });
    } catch (err) {
      setError(err.message || 'Failed to update project');
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
        <div className="page-header">
          <h1>Edit Project</h1>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <ProjectForm 
          project={project} 
          onSubmit={handleSubmit} 
          submitButtonText="Update Project"
        />
      </div>
      <Footer />
    </div>
  );
};

export default EditProject;