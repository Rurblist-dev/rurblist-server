const Property = require('../schemas/Property');
const Comment = require('../schemas/Comment');

// Create Property
const createProperty = async (req, res) => {
    const { title, description, price, location, type, images } = req.body;
    const userId = req.user.id; // Get user id from token

    if (!title || !description || !price || !location || !type) {
        return res.status(400).json({ error: "All fields are required." });
    }

    try {
        const newProperty = new Property({
            title,
            description,
            price,
            location,
            type,
            images, // Optional: if images are provided, they'll be saved
            user: userId,
        });
        await newProperty.save();
        res.status(201).json({ message: 'Property created successfully.', property: newProperty });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create property.', details: error });
    }
};

// Get all properties
const getAllProperties = async (req, res) => {
    try {
        const properties = await Property.find().populate('images').populate('comments');
        res.status(200).json({ properties });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch properties.', details: error });
    }
};

// Get property by ID
const getPropertyById = async (req, res) => {
    const { id } = req.params;

    try {
        const property = await Property.findById(id).populate('images').populate('comments');

        if (!property) {
            return res.status(404).json({ error: 'Property not found.' });
        }

        res.status(200).json({ property });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch property details.', details: error });
    }
};

// Update property by ID
const updateProperty = async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    // Validate that at least one field is being updated
    if (Object.keys(updates).length === 0) {
        return res.status(400).json({ error: 'At least one field must be provided for update.' });
    }

    try {
        // Find and update only the fields that are provided in the request
        const updatedProperty = await Property.findByIdAndUpdate(id, updates, { new: true });

        if (!updatedProperty) {
            return res.status(404).json({ error: 'Property not found.' });
        }

        res.status(200).json({ message: `Property ${id} updated successfully.`, property: updatedProperty });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update property.', details: error });
    }
};


// Delete property by ID
const deleteProperty = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedProperty = await Property.findByIdAndDelete(id);

        if (!deletedProperty) {
            return res.status(404).json({ error: 'Property not found.' });
        }

        res.status(200).json({ message: `Property ${id} deleted successfully.` });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete property.', details: error });
    }
};

// Add Comment to Property
const addCommentToProperty = async (req, res) => {
    const { id } = req.params;
    const { comment } = req.body;

    if (!comment) {
        return res.status(400).json({ error: 'Comment is required.' });
    }

    try {
        const newComment = new Comment({ text: comment });
        await newComment.save();

        const property = await Property.findById(id);
        if (!property) {
            return res.status(404).json({ error: 'Property not found.' });
        }

        property.comments.push(newComment._id);
        await property.save();

        res.status(201).json({ message: 'Comment added to property.', comment: newComment });
    } catch (error) {
        res.status(500).json({ error: 'Failed to add comment to property.', details: error });
    }
};

// Like property
const likeProperty = async (req, res) => {
    const { id } = req.params;

    try {
        const property = await Property.findById(id);
        if (!property) {
            return res.status(404).json({ error: 'Property not found.' });
        }

        property.like += 1; // Increment the like count
        await property.save();

        res.status(200).json({ message: `Property ${id} liked.`, likeCount: property.like });
    } catch (error) {
        res.status(500).json({ error: 'Failed to like property.', details: error });
    }
};


module.exports = {
    createProperty,
    getAllProperties,
    getPropertyById,
    updateProperty,
    deleteProperty,
    addCommentToProperty,
    likeProperty,
};