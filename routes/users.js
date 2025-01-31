const express = require("express");
const { 
    verifyAdmin, 
    verifyToken 
} = require("../lib/verifyToken");
const { 
    getAllUsers, 
    getUser, 
    updateUser, 
    deleteUser, 
    getUserID
} = require("../controllers/user");

const router = express.Router();

router.get("/all-users", verifyToken, getAllUsers);
router.get('/user-id', verifyToken, getUserID);
router.get("/:userId", verifyToken, getUser);
router.put("/:userId", verifyToken, updateUser);
router.delete("/:userId", verifyAdmin, deleteUser);

module.exports = router;