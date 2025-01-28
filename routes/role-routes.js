const express = require('express');
const { createRole, updateRole, listRoles, getRoleById,deleteRole,updateRoleStatus } = require('../controllers/role-controller');
const router = express.Router();


router.post("/", createRole);
router.put("/:id", updateRole);

router.get("/", listRoles);
router.get("/:id", getRoleById);

router.delete("/:id", deleteRole);
router.put("/status/:id", updateRoleStatus);

module.exports = router;