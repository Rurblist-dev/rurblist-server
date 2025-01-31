const Property = require("../schemas/Property");
const PropertyImage = require("../schemas/PropertyImage");
const Comment = require("../schemas/Comment");

// Validate property data
const validatePropertyData = (data) => {
  const errors = [];

  if (!data.title?.trim()) errors.push("Title is required");
  if (!data.description?.trim()) errors.push("Description is required");
  if (!data.location?.trim()) errors.push("Location is required");
  if (!data.type?.trim()) errors.push("Property type is required");

  if (!data.price || isNaN(data.price) || data.price <= 0) {
    errors.push("Valid price is required");
  }

  const validTypes = [
    "bedsitter",
    "self_contain",
    "flat",
    "boys_quarters",
    "duplexes",
    "mansion",
  ];

  if (!validTypes.includes(data.type)) {
    errors.push("Invalid property type");
  }

  return errors;
};

// Utility function to clean up images if property creation fails
const cleanupImages = async (imageIds) => {
  try {
    await PropertyImage.deleteMany({ _id: { $in: imageIds } });
  } catch (error) {
    console.error("Error cleaning up images:", error);
  }
};

const createProperty = async (req, res) => {
  try {
    // Validate user authentication
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        error: "Authentication required",
      });
    }

    // Validate property data
    const validationErrors = validatePropertyData(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        error: "Validation failed",
        details: validationErrors,
      });
    }

    const { title, description, price, location, type, latitude, longitude } =
      req.body;
    const userId = req.user.id;

    // Handle image uploads if present
    let imageIds = [];
    if (req.files && req.files.length > 0) {
      try {
        const imagePromises = req.files.map(async (file) => {
          const newImage = new PropertyImage({
            data: file.buffer,
            contentType: file.mimetype,
            fileName: file.originalname,
            size: file.size,
          });
          return await newImage.save();
        });

        imageIds = await Promise.all(imagePromises);
      } catch (error) {
        await cleanupImages(imageIds);
        throw new Error("Failed to process images: " + error.message);
      }
    }

    const newProperty = new Property({
      title,
      description,
      price: parseFloat(price),
      location,
      type,
      images: imageIds,
      user: userId,
      latitude: latitude ? parseFloat(latitude) : undefined,
      longitude: longitude ? parseFloat(longitude) : undefined,
      status: "for_sale",
    });

    await newProperty.save();

    const populatedProperty = await Property.findById(newProperty._id)
      .populate({
        path: "images",
      })
      .populate({
        path: "user",
        select: "name email",
      });

    res.status(201).json({
      success: true,
      message: "Property created successfully",
      property: populatedProperty,
    });
  } catch (error) {
    console.error("Property creation error:", error);

    res.status(500).json({
      success: false,
      error: "Failed to create property",
      details:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
};

const getAllProperties = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sortBy = req.query.sortBy || "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;
    const skip = (page - 1) * limit;

    const filterQuery = {};

    if (req.query.type) filterQuery.type = req.query.type;
    if (req.query.status) filterQuery.status = req.query.status;
    if (req.query.minPrice)
      filterQuery.price = { $gte: parseFloat(req.query.minPrice) };
    if (req.query.maxPrice) {
      filterQuery.price = {
        ...filterQuery.price,
        $lte: parseFloat(req.query.maxPrice),
      };
    }

    const totalProperties = await Property.countDocuments(filterQuery);

    const properties = await Property.find(filterQuery)
      .populate("images")
      .populate("comments")
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalPages = Math.ceil(totalProperties / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    res.status(200).json({
      success: true,
      data: {
        properties,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: totalProperties,
          itemsPerPage: limit,
          hasNextPage,
          hasPreviousPage,
        },
        links: {
          self: `${req.baseUrl}?page=${page}&limit=${limit}`,
          next: hasNextPage
            ? `${req.baseUrl}?page=${page + 1}&limit=${limit}`
            : null,
          prev: hasPreviousPage
            ? `${req.baseUrl}?page=${page - 1}&limit=${limit}`
            : null,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching properties:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch properties.",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const getPropertyById = async (req, res) => {
  const { id } = req.params;

  try {
    const property = await Property.findById(id)
      .populate("images")
      .populate("comments");

    if (!property) {
      return res.status(404).json({ error: "Property not found." });
    }

    res.status(200).json({ property });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to fetch property details.", details: error });
  }
};

const updateProperty = async (req, res) => {

  const { id } = req.params;
  const updates = req.body;

  if (Object.keys(updates).length === 0) {
    return res
      .status(400)
      .json({ error: "At least one field must be provided for update." });
  }

  try {
    const updatedProperty = await Property.findByIdAndUpdate(id, updates, {
      new: true,
    });

    if (!updatedProperty) {
      return res.status(404).json({ error: "Property not found." });
    }

    res.status(200).json({
      message: `Property ${id} updated successfully.`,
      property: updatedProperty,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to update property.", details: error });
  }
};

const deleteProperty = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedProperty = await Property.findByIdAndDelete(id);

    if (!deletedProperty) {
      return res.status(404).json({ error: "Property not found." });
    }

    res.status(200).json({ message: `Property ${id} deleted successfully.` });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to delete property.", details: error });
  }
};

const addCommentToProperty = async (req, res) => {
  const { id } = req.params;
  const { comment } = req.body;

  if (!comment) {
    return res.status(400).json({ error: "Comment is required." });
  }

  try {
    const newComment = new Comment({ text: comment });
    await newComment.save();

    const property = await Property.findById(id);
    if (!property) {
      return res.status(404).json({ error: "Property not found." });
    }

    property.comments.push(newComment._id);
    await property.save();

    res
      .status(201)
      .json({ message: "Comment added to property.", comment: newComment });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to add comment to property.", details: error });
  }
};

const likeProperty = async (req, res) => {
  const { id } = req.params;

  try {
    const property = await Property.findById(id);
    if (!property) {
      return res.status(404).json({ error: "Property not found." });
    }

    property.like += 1;
    await property.save();

    res
      .status(200)
      .json({ message: `Property ${id} liked.`, likeCount: property.like });
  } catch (error) {
    res.status(500).json({ error: "Failed to like property.", details: error });
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
