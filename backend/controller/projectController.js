const Project = require("../models/Project");
const User = require("../models/User");

// Create a new project
exports.createProject = async (req, res) => {
  try {
    const { name, description, repositoryUrl, isPrivate, tags } = req.body || {};
    
    if (!name) {
      return res.status(400).json({ error: "Project name is required" });
    }

    // Create project with current user as owner
    const project = await Project.create({
      name,
      description: description || "",
      repositoryUrl: repositoryUrl || "",
      owner: req.user.id, // From auth middleware
      isPrivate: isPrivate || false,
      tags: tags || []
    });

    return res.status(201).json({ data: project });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};

// Get all projects for current user (owned + collaborated)
exports.getUserProjects = async (req, res) => {
  try {
    // Find projects where user is owner
    const ownedProjects = await Project.find({ owner: req.user.id })
      .sort({ updatedAt: -1 });

    // Find projects where user is a collaborator
    const collaboratedProjects = await Project.find({
      "collaborators.user": req.user.id
    }).sort({ updatedAt: -1 });

    return res.status(200).json({
      data: {
        owned: ownedProjects,
        collaborated: collaboratedProjects
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};

// Get a single project by ID
exports.getProjectById = async (req, res) => {
  try {
    const { projectId } = req.params;
    
    const project = await Project.findById(projectId)
      .populate('owner', 'name email')
      .populate('collaborators.user', 'name email');
    
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Check if user has access to this project
    const isOwner = project.owner._id.toString() === req.user.id;
    const isCollaborator = project.collaborators.some(
      collab => collab.user._id.toString() === req.user.id
    );

    if (!isOwner && !isCollaborator && project.isPrivate) {
      return res.status(403).json({ error: "You don't have access to this project" });
    }

    return res.status(200).json({ data: project });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};

// Update a project
exports.updateProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { name, description, repositoryUrl, isPrivate, tags } = req.body || {};
    
    const project = await Project.findById(projectId);
    
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Check if user is owner or admin collaborator
    const isOwner = project.owner.toString() === req.user.id;
    const isAdminCollaborator = project.collaborators.some(
      collab => collab.user.toString() === req.user.id && collab.role === "admin"
    );

    if (!isOwner && !isAdminCollaborator) {
      return res.status(403).json({ error: "You don't have permission to update this project" });
    }

    // Update fields
    if (name) project.name = name;
    if (description !== undefined) project.description = description;
    if (repositoryUrl !== undefined) project.repositoryUrl = repositoryUrl;
    if (isPrivate !== undefined) project.isPrivate = isPrivate;
    if (tags) project.tags = tags;

    await project.save();

    return res.status(200).json({ data: project });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};

// Delete a project
exports.deleteProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    
    const project = await Project.findById(projectId);
    
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Only owner can delete a project
    if (project.owner.toString() !== req.user.id) {
      return res.status(403).json({ error: "Only the project owner can delete this project" });
    }

    await Project.findByIdAndDelete(projectId);

    return res.status(200).json({ message: "Project deleted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};

// Add a collaborator to a project
exports.addCollaborator = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { email, role } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: "Collaborator email is required" });
    }

    // Find the project
    const project = await Project.findById(projectId);
    
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Check if user is owner or admin collaborator
    const isOwner = project.owner.toString() === req.user.id;
    const isAdminCollaborator = project.collaborators.some(
      collab => collab.user.toString() === req.user.id && collab.role === "admin"
    );

    if (!isOwner && !isAdminCollaborator) {
      return res.status(403).json({ error: "You don't have permission to add collaborators" });
    }

    // Find the user to add as collaborator
    const userToAdd = await User.findOne({ email });
    
    if (!userToAdd) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if user is already a collaborator
    const isAlreadyCollaborator = project.collaborators.some(
      collab => collab.user.toString() === userToAdd._id.toString()
    );

    if (isAlreadyCollaborator) {
      return res.status(400).json({ error: "User is already a collaborator" });
    }

    // Check if user is the owner
    if (project.owner.toString() === userToAdd._id.toString()) {
      return res.status(400).json({ error: "Owner cannot be added as a collaborator" });
    }

    // Add collaborator
    project.collaborators.push({
      user: userToAdd._id,
      role: role || "viewer",
      addedAt: new Date()
    });

    await project.save();

    return res.status(200).json({ 
      message: "Collaborator added successfully",
      data: project
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};

// Remove a collaborator from a project
exports.removeCollaborator = async (req, res) => {
  try {
    const { projectId, userId } = req.params;
    
    // Find the project
    const project = await Project.findById(projectId);
    
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Check if user is owner or admin collaborator
    const isOwner = project.owner.toString() === req.user.id;
    const isAdminCollaborator = project.collaborators.some(
      collab => collab.user.toString() === req.user.id && collab.role === "admin"
    );

    if (!isOwner && !isAdminCollaborator) {
      return res.status(403).json({ error: "You don't have permission to remove collaborators" });
    }

    // Check if collaborator exists
    const collaboratorIndex = project.collaborators.findIndex(
      collab => collab.user.toString() === userId
    );

    if (collaboratorIndex === -1) {
      return res.status(404).json({ error: "Collaborator not found" });
    }

    // Remove collaborator
    project.collaborators.splice(collaboratorIndex, 1);
    await project.save();

    return res.status(200).json({ 
      message: "Collaborator removed successfully",
      data: project
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};

// Update collaborator role
exports.updateCollaboratorRole = async (req, res) => {
  try {
    const { projectId, userId } = req.params;
    const { role } = req.body;
    
    if (!role || !['viewer', 'contributor', 'admin'].includes(role)) {
      return res.status(400).json({ error: "Valid role is required (viewer, contributor, or admin)" });
    }

    // Find the project
    const project = await Project.findById(projectId);
    
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Check if user is owner or admin collaborator
    const isOwner = project.owner.toString() === req.user.id;
    
    if (!isOwner) {
      return res.status(403).json({ error: "Only the project owner can update collaborator roles" });
    }

    // Find collaborator
    const collaborator = project.collaborators.find(
      collab => collab.user.toString() === userId
    );

    if (!collaborator) {
      return res.status(404).json({ error: "Collaborator not found" });
    }

    // Update role
    collaborator.role = role;
    await project.save();

    return res.status(200).json({ 
      message: "Collaborator role updated successfully",
      data: project
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};