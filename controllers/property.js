const Property = require("../schemas/Property");
const PropertyImage = require("../schemas/PropertyImage");
const Comment = require("../schemas/Comment");
const cloudinary = require("cloudinary").v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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
  if (!imageIds.length) return;
  try {
    await PropertyImage.deleteMany({ _id: { $in: imageIds } });
  } catch (error) {
    console.error("Error cleaning up images:", error);
  }
};

const createProperty = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "Authentication required" });
    }

    console.log("Files received:", req.files); // Add this for debugging

    const validationErrors = validatePropertyData(req.body);
    if (validationErrors.length) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: validationErrors,
      });
    }

    const { title, description, price, location, type, latitude, longitude } =
      req.body;
    const userId = req.user.id;

    let imageIds = [];
    if (req.files?.length > 0) {
      try {
        imageIds = await Promise.all(
          req.files.map((file) => {
            return new Promise((resolve, reject) => {
              const uploadStream = cloudinary.uploader.upload_stream(
                {
                  resource_type: "auto",
                  folder: "properties",
                },
                async (error, result) => {
                  if (error) {
                    console.error("Cloudinary upload error:", error);
                    reject(error);
                    return;
                  }
                  try {
                    const image = await new PropertyImage({
                      url: result.secure_url,
                      fileName: file.originalname,
                      size: file.size,
                      cloudinaryId: result.public_id,
                    }).save();
                    resolve(image._id);
                  } catch (err) {
                    reject(err);
                  }
                }
              );

              // Handle stream errors
              uploadStream.on("error", (error) => {
                console.error("Upload stream error:", error);
                reject(error);
              });

              // Write file buffer to stream
              uploadStream.end(file.buffer);
            });
          })
        );
      } catch (error) {
        await cleanupImages(imageIds);
        return res.status(500).json({
          success: false,
          error: "Failed to process images",
          details: error.message,
        });
      }
    }

    const newProperty = await new Property({
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
    }).save();

    const populatedProperty = await newProperty.populate([
      { path: "images" },
      { path: "user", select: "-salt -hash" },
    ]);

    res.status(201).json({
      success: true,
      message: "Property created successfully",
      property: populatedProperty,
    });
  } catch (error) {
    console.error("Property creation error:", error);
    await cleanupImages(imageIds);
    res.status(500).json({
      success: false,
      error: "Failed to create property",
      details: error.message,
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
      .populate("comments") // Ensure comments are populated
      .populate("comments.user", "username email") // Populate comment owners
      .populate("images", "url") // Populate image URLs
      .populate("user", "-salt -hash") // Populate user excluding sensitive info
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
      .populate("images", "url")
      .populate("comments")
      .populate("user", "-salt -hash -credentials");

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
  const userId = req.user?.id;

  if (!userId)
    return res.status(401).json({ error: "Authentication required" });

  try {
    const property = await Property.findById(id);
    if (!property)
      return res.status(404).json({ error: "Property not found." });

    if (property.likes.includes(userId)) {
      return res
        .status(400)
        .json({ error: "You have already liked this property." });
    }

    property.likes.push(userId);
    await property.save();

    res
      .status(200)
      .json({ message: `Property liked.`, likeCount: property.likes.length });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to like property.", details: error.message });
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
