const crypto = require("crypto");

// Function to generate salt and hash the password
const genPassword = (password) => {
  const salt = crypto.randomBytes(32).toString("hex"); // Random 32-byte salt
  const genHash = crypto
    .pbkdf2Sync(password, salt, 10000, 64, "sha512")
    .toString("hex"); // Hash with PBKDF2
  return {
    salt,
    hash: genHash,
  };
};

// Function to validate the password by comparing the stored hash with the provided one
const validatePass = (password, hash, salt) => {
  const hashVerify = crypto
    .pbkdf2Sync(password, salt, 10000, 64, "sha512")
    .toString("hex");
  return hash === hashVerify; // Return true if the hashes match, false otherwise
};

module.exports.validatePass = validatePass;
module.exports.genPassword = genPassword;
