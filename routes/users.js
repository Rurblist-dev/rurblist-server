const express = require("express");
const { verifyAdmin, verifyToken } = require("../lib/verifyToken");
const {
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
  getUserID,
  saveProperty,
} = require("../controllers/user");
const handleUpload = require("../middlewares/uploadImage");

const router = express.Router();

router.get("/all-users", verifyToken, getAllUsers);
router.get("/user-id", verifyToken, getUserID);
router.get("/:userId", verifyToken, getUser);
router.post("/:userId/save-property", verifyToken, saveProperty);
router.put("/:userId", verifyToken, handleUpload, updateUser);
router.delete("/:userId", verifyAdmin, deleteUser);

module.exports = router;
