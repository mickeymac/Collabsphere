const express = require("express");
const router = express.Router();
const projectController = require("../controller/projectController");
const protect = require("../middleware/auth");

// All project routes require authentication
router.use('/', protect);

// Project CRUD routes
router.post("/", projectController.createProject);
router.get("/", projectController.getUserProjects);
router.get("/:projectId", projectController.getProjectById);
router.put("/:projectId", projectController.updateProject);
router.delete("/:projectId", projectController.deleteProject);

// Collaborator management routes
router.post("/:projectId/collaborators", projectController.addCollaborator);
router.delete("/:projectId/collaborators/:userId", projectController.removeCollaborator);
router.put("/:projectId/collaborators/:userId", projectController.updateCollaboratorRole);

module.exports = router;