const Property = require("../schemas/Property");
const PropertyImage = require("../schemas/PropertyImage");
const Comment = require("../schemas/Comment");
const PropertyDocuments = require("../schemas/PropertyDocuments");
const cloudinary = require("cloudinary").v2;

require("dotenv").config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_NAME_API_KEY,
  api_secret: process.env.CLOUDINARY_NAME_API_SECRET,

  limits: {
    fieldSize: 5 * 1024 * 1024, // Limit for individual field size (2MB)
    fileSize: 5 * 1024 * 1024, // Limit for file size (5MB)
    files: 10, // Limit for number of files
    fields: 20, // Limit for number of non-file fields
  },
});
// cloud_name: process.env.CLOUDINARY_NAME,
// api_key: process.env.CLOUDINARY_NAME_API_KEY,
// api_secret: process.env.CLOUDINARY_NAME_API_SECRET,

// Validate property data
const validatePropertyData = (data) => {
  const errors = [];

  if (!data.title?.trim()) errors.push("Title is required");
  if (!data.description?.trim()) errors.push("Description is required");
  if (!data.location?.trim()) errors.push("Location is required");
  if (!data.type?.trim()) errors.push("Property type is required");
  if (!data.bathrooms?.trim()) errors.push("Property bathrooms is required");
  if (!data.bedrooms?.trim()) errors.push("Property bedrooms is required");
  if (!data.paymentFrequency?.trim())
    errors.push("Property payment frequency is required");
  if (!data.agentFee || isNaN(data.agentFee) || data.agentFee <= 0)
    errors.push(
      "Property agent fee is required and must be a non-negative number"
    );
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
    // console.log(req.body);

    const validationErrors = validatePropertyData(req.body);
    if (validationErrors.length) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: validationErrors,
      });
    }

    const {
      title,
      description,
      price,
      location,
      type,
      status,
      latitude,
      longitude,
      bedrooms,
      bathrooms,
      agentFee,
      paymentFrequency,
      amenities,
      propertyIdNumber,
    } = req.body;
    const userId = req.user.id;

    let imageIds = [];
    let ownershipDocumentUrl = null;
    let govtApprovalUrl = null;
    let utilityBillUrl = null;
    if (req.files?.images.length > 0) {
      try {
        imageIds = await Promise.all(
          req.files.images.map((file) => {
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

    // Upload ownershipDocument
    if (req.files?.ownershipDocument?.length > 0) {
      try {
        const ownershipDocumentFile = req.files.ownershipDocument[0];
        const uploadResult = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              resource_type: "auto", // Allows uploading images or PDFs
              folder: "properties/documents",
            },
            (error, result) => {
              if (error) {
                console.error(
                  "Cloudinary ownershipDocument upload error:",
                  error
                );
                return reject(error);
              }
              resolve(result);
            }
          );

          // Write file buffer to the upload stream
          uploadStream.end(ownershipDocumentFile.buffer);
        });

        ownershipDocumentUrl = uploadResult.secure_url;
      } catch (error) {
        console.error("Failed to upload ownershipDocument:", error);
        return res.status(500).json({
          success: false,
          error: "Failed to upload ownership document",
          details: error.message,
        });
      }
    }
    if (req.files?.govtApproval?.length > 0) {
      try {
        const govtApprovalFile = req.files.govtApproval[0];
        const uploadResult = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              resource_type: "auto", // Allows uploading images or PDFs
              folder: "properties/documents",
            },
            (error, result) => {
              if (error) {
                console.error("Cloudinary govtApproval upload error:", error);
                return reject(error);
              }
              resolve(result);
            }
          );

          // Write file buffer to the upload stream
          uploadStream.end(govtApprovalFile.buffer);
        });

        govtApprovalUrl = uploadResult.secure_url;
      } catch (error) {
        console.error("Failed to upload government approval:", error);
        return res.status(500).json({
          success: false,
          error: "Failed to upload government approval document",
          details: error.message,
        });
      }
    }
    if (req.files?.utilityBill?.length > 0) {
      try {
        const utilityBillFile = req.files.utilityBill[0];
        const uploadResult = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              resource_type: "auto", // Allows uploading images or PDFs
              folder: "properties/documents",
            },
            (error, result) => {
              if (error) {
                console.error("Cloudinary utilityBill upload error:", error);
                return reject(error);
              }
              resolve(result);
            }
          );

          // Write file buffer to the upload stream
          uploadStream.end(utilityBillFile.buffer);
        });

        utilityBillUrl = uploadResult.secure_url;
      } catch (error) {
        console.error("Failed to upload utility bill:", error);
        return res.status(500).json({
          success: false,
          error: "Failed to upload utility bill document",
          details: error.message,
        });
      }
    }

    // Convert amenities string to array
    let amenitiesArray = [];
    if (amenities && typeof amenities === "string") {
      // Split by "|" and trim whitespace
      amenitiesArray = amenities
        .split("|")
        .map((item) => item.trim())
        .filter((item) => item !== ""); // Remove empty items
    }

    // Create the property first

    const newProperty = await new Property({
      title: title.toLowerCase(),
      description,
      price: parseFloat(price),
      location,
      type: type.toLowerCase(),
      images: imageIds,
      user: userId,
      latitude: latitude ? parseFloat(latitude) : undefined,
      longitude: longitude ? parseFloat(longitude) : undefined,
      status,
      bedrooms,
      bathrooms,
      agentFee,
      paymentFrequency: paymentFrequency.toLowerCase(),
      amenities: amenitiesArray.map((a) => a.toLowerCase()),
      propertyDocument: null, // Reference to PropertyDocuments ObjectId (will be set below)
    }).save();

    // Save documents with correct propertyId reference
    let propertyDocumentObj = null;
    if (ownershipDocumentUrl || govtApprovalUrl || utilityBillUrl) {
      propertyDocumentObj = await new PropertyDocuments({
        propertyIdNumber,
        ownershipDocument: ownershipDocumentUrl,
        govtApproval: govtApprovalUrl,
        utilityBill: utilityBillUrl,
        propertyId: newProperty._id,
      }).save();

      // Update property with reference to PropertyDocuments ObjectId
      newProperty.propertyDocument = propertyDocumentObj._id;
      await newProperty.save();
    }

    // Populate property for response
    const populatedProperty = await newProperty.populate([
      { path: "images" },
      { path: "user", select: "-salt -hash" },
    ]);

    // Save documents with correct propertyId reference

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

    // Add search functionality
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, "i"); // Case-insensitive regex
      filterQuery.$or = [
        { title: searchRegex }, // Search in property title
        { location: searchRegex }, // Search in property location
      ];
    }

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
      .populate({
        path: "comments",
        populate: {
          path: "user",
          select: "profileImg  fullname role",
        },
      })
      .populate({
        path: "images",
        select: "url fileName",
      })
      .populate("user", "-salt -hash")
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .lean();

    // Check for any missing image URLs and log warnings
    properties.forEach((property) => {
      if (property.images && property.images.length > 0) {
        const missingUrlImages = property.images.filter((img) => !img.url);
        if (missingUrlImages.length > 0) {
          console.warn(
            `Property ${property._id} has ${missingUrlImages.length} images with missing URLs`
          );
        }
      }
    });

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

const getAllActiveProperties = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sortBy = req.query.sortBy || "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;
    const skip = (page - 1) * limit;

    const filterQuery = {
      isActive: true, // ✅ Only return active properties
    };

    // 🔍 Search
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, "i");
      filterQuery.$or = [{ title: searchRegex }, { location: searchRegex }];
    }

    // ⛏️ Filters
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

    // 🔄 Sort by priorityLevel first, then user-defined sort
    const sortOptions = {
      priorityLevel: -1, // ✅ Higher priorityLevel first
      [sortBy]: sortOrder,
    };

    const properties = await Property.find(filterQuery)
      .populate({
        path: "comments",
        populate: {
          path: "user",
          select: "profileImg fullname role",
        },
      })
      .populate({
        path: "images",
        select: "url fileName",
      })
      .populate("user", "-salt -hash")
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .lean();

    // 🚨 Log missing images (optional)
    properties.forEach((property) => {
      if (property.images?.length) {
        const missing = property.images.filter((img) => !img.url);
        if (missing.length > 0) {
          console.warn(`Property ${property._id} has images missing URLs`);
        }
      }
    });

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
    // Validate ID format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        error: "Invalid property ID format",
      });
    }

    const property = await Property.findById(id)
      .populate({
        path: "images",
        select: "url fileName size cloudinaryId",
      })
      .populate({
        path: "comments",
        populate: {
          path: "user",
          select: "username email",
        },
      })
      .populate("user", "-salt -hash -credentials");

    if (!property) {
      return res.status(404).json({
        success: false,
        error: "Property not found.",
      });
    }

    // Verify images are properly loaded
    if (property.images && property.images.length > 0) {
      // Check if any image is missing URL
      const missingUrlImages = property.images.filter((img) => !img.url);
      if (missingUrlImages.length > 0) {
        console.warn(
          `Property ${id} has ${missingUrlImages.length} images with missing URLs`
        );
      }
    }

    res.status(200).json({
      success: true,
      property,
    });
  } catch (error) {
    console.error("Property fetch error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch property details.",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
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
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({
      success: false,
      error: "Authentication required",
    });
  }

  if (!comment) {
    return res.status(400).json({
      success: false,
      error: "Comment text is required.",
    });
  }

  try {
    // Validate ID format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        error: "Invalid property ID format",
      });
    }

    // First check if property exists
    const property = await Property.findById(id);
    if (!property) {
      return res.status(404).json({
        success: false,
        error: "Property not found.",
      });
    }

    // Create the comment with proper schema fields
    const newComment = new Comment({
      comment: comment, // Use the proper field name according to schema
      property: id,
      user: userId,
    });

    await newComment.save();

    // Update property with new comment
    property.comments.push(newComment._id);
    await property.save();

    // Return populated comment for better frontend experience
    const populatedComment = await Comment.findById(newComment._id).populate(
      "user",
      "username email"
    );

    res.status(201).json({
      success: true,
      message: "Comment added to property.",
      comment: populatedComment,
    });
  } catch (error) {
    console.error("Add comment error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to add comment to property.",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const likeProperty = async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({
      success: false,
      error: "Authentication required",
    });
  }

  try {
    const property = await Property.findById(id);
    if (!property) {
      return res.status(404).json({
        success: false,
        error: "Property not found.",
      });
    }

    const likes = property.likes || [];
    const userLiked = likes.includes(userId);

    if (userLiked) {
      property.likes = likes.filter((id) => id.toString() !== userId);
    } else {
      property.likes = [...likes, userId];
    }

    await property.save();

    res.status(200).json({
      success: true,
      message: userLiked ? "Property unliked." : "Property liked.",
      likeCount: property.likes.length,
    });
  } catch (error) {
    console.error("Like property error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to like property.",
      details: error.message,
    });
  }
};

const getPropertiesByUserId = async (req, res) => {
  const { id } = req.params;

  try {
    const properties = await Property.find({ user: id })
      .populate({
        path: "images",
        select: "url fileName",
      })
      .populate("user", "-salt -hash")
      .lean();

    if (!properties.length) {
      return res.status(404).json({
        success: false,
        error: "No properties found for this user.",
      });
    }

    res.status(200).json({
      success: true,
      properties,
    });
  } catch (error) {
    console.error("Error fetching properties by user ID:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch properties by user ID.",
      details: error.message,
    });
  }
};

module.exports = {
  createProperty,
  getAllProperties,
  getAllActiveProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
  addCommentToProperty,
  likeProperty,
  getPropertiesByUserId,
};
