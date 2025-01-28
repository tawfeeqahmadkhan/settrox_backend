const { body, validationResult } = require("express-validator");
const Role = require("../models/role");
const Admin = require("../models/admin");

// Create new role
exports.createRole = async (req, res) => {
  try {
    const { name, permissions } = req.body;
    
    // Validate actions per module
    const isValid = permissions.every(p => 
      p.actions.every(a => ["view", "add", "edit", "delete"].includes(a))
    );
    
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid action types provided"
      });
    }

    const role = await Role.create({ name, permissions });
    res.status(201).json({ success: true, data: role });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: error.message.includes("duplicate") 
        ? "Role name already exists" 
        : error.message 
    });
  }
};

// Update existing role
exports.updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const role = await Role.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role not found"
      });
    }

    res.json({ success: true, data: role });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// List all roles
exports.listRoles = async (req, res) => {
  try {
    const roles = await Role.find()
      .select("-__v -createdAt -updatedAt");
      
    res.json({ success: true, data: roles });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single role
exports.getRoleById = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    
    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role not found"
      });
    }
    
    res.json({ success: true, data: role });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteRole = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if any users have this role
    const usersWithRole = await Admin.countDocuments({ role: id });
    
    if (usersWithRole > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete role assigned to users"
      });
    }

    const role = await Role.findByIdAndDelete(id);

    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role not found"
      });
    }

    res.json({
      success: true,
      message: "Role deleted successfully"
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

exports.updateRoleStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["active", "inactive"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value"
      });
    }

    const role = await Role.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role not found"
      });
    }

    res.json({ 
      success: true, 
      data: role 
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};