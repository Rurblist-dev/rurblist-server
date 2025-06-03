const PropertyAdPackage = require("../schemas/PropertyAdPackages");

require("dotenv").config();

exports.addNewAdPackage = async (req, res) => {
  try {
    const adPackage = new PropertyAdPackage(req.body);
    await adPackage.save();
    res.status(201).json({ success: true, data: adPackage });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.updateAdPackage = async (req, res) => {
  try {
    const updated = await PropertyAdPackage.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updated) {
      return res
        .status(404)
        .json({ success: false, error: "Package not found" });
    }
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.deleteAdPackage = async (req, res) => {
  try {
    const deleted = await PropertyAdPackage.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, error: "Package not found" });
    }
    res.json({ success: true, message: "Package deleted" });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.getAllAdPackages = async (req, res) => {
  try {
    const packages = await PropertyAdPackage.find({ isActive: true });
    res.json({ success: true, data: packages });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
