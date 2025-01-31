const { genPassword } = require("../lib/passwordUtils");
const { verifyToken } = require("../lib/verifyToken");
const User = require("../schemas/User");

// Getting all users here
const getAllUsers = (req, res, next) => {
  User.find()
    .then((users) => {
      res.status(200).json(users);
    })
    .catch((err) => next(err));
};

// Getting Users by Id here
const getUser = (req, res, next) => {
  const userId = req.params.userId;

  User.findById(userId)
    .then((user) => {
      res.status(200).json(user);
    })
    .catch((err) => {
      next(err);
    });
};

const getUserID = (req, res) => {
  verifyToken(req, res, (err) => {
    if (err) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    res.status(200).json({ "userId": req.user.id });
  });
};

// Update User
const updateUser = async (req, res, next) => {
  const { password, ...newUser } = req.body;

  // Filter out empty strings from newUser object
  const filteredUser = {};
  Object.keys(newUser).forEach((key) => {
    if (newUser[key] !== "") {
      filteredUser[key] = newUser[key];
    }
  });

  try {
    if (password) {
      const { salt, hash } = genPassword(password);

      const userCred = {
        salt,
        hash,
        ...filteredUser,
      };

      const updatedUser = await User.findByIdAndUpdate(
        req.params.userId,
        { $set: userCred },
        { new: true }
      );

      if (updatedUser) {
        res.status(200).json({
          message: "Successful",
          status: 200,
          detail: `User was updated successfully`,
        });
      } else {
        res.status(404).json({
          message: "User Not Found",
          status: 404,
          detail: `The User with the id ${req.params.userId} was not found`,
        });
      }
    } else {
      const updatedUser = await User.findByIdAndUpdate(
        req.params.userId,
        { $set: filteredUser },
        { new: true }
      );

      if (updatedUser) {
        res.status(200).json({
          message: "Successful",
          status: 200,
          detail: `User was updated successfully`,
        });
      } else {
        res.status(404).json({
          message: "User Not Found",
          status: 404,
          detail: `The User with the id ${req.params.userId} was not found`,
        });
      }
    }
  } catch (error) {
    // Handle the error properly, for example:
    next(error);
  }
};

// Delete User
const deleteUser = (req, res, next) => {
  User.findByIdAndDelete(req.params.userId)
    .then(() => {
      res.status(200).json({
        message: "Successful",
        status: 200,
        detail: "User successfully deleted",
      });
    })
    .catch((err) => next(err));
};

module.exports = {
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
  getUserID,
};
