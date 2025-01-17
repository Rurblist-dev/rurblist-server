const express = require('express');
const {
    createProperty,
    getAllProperties,
    getPropertyById,
    updateProperty,
    deleteProperty,
    addCommentToProperty,
    likeProperty,
} = require('../controllers/property');

const router = express.Router();

// Property Routes
router.post('/create', createProperty); // Create a new property
router.get('/', getAllProperties); // Get all properties
router.get('/:id', getPropertyById); // Get a property by ID
router.put('/:id', updateProperty); // Update a property by ID
router.delete('/:id', deleteProperty); // Delete a property by ID

// Additional Routes for Property Features
router.post('/:id/comment', addCommentToProperty); // Add a comment to a property
router.post('/:id/like', likeProperty); // Like a property

module.exports = router;
