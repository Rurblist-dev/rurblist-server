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

router.get("/all-users", verifyAdmin, getAllUsers);
router.get("/user/:userId", verifyToken, getUser);
router.put("/user/:userId", verifyToken, updateUser);
router.delete("/user/:userId", verifyAdmin, deleteUser);
router.get('/user-id', verifyToken, getUserID);

module.exports = router;