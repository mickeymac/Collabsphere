import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createProject } from '../services/projectService';
import ProjectForm from '../components/ProjectForm';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const CreateProject = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleSubmit = async (projectData) => {
    try {
      await createProject(projectData);
      navigate('/projects', { 
        state: { message: 'Project created successfully!' } 
      });
    } catch (err) {
      setError(err.message || 'Failed to create project');
    }
  };

  return (
    <div className="page-container">
      <Navbar />
      <div className="content-container">
        <div className="page-header">
          <h1>Create New Project</h1>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <ProjectForm 
          onSubmit={handleSubmit} 
          submitButtonText="Create Project"
        />
      </div>
      <Footer />
    </div>
  );
};

export default CreateProject;