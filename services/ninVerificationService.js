const axios = require("axios");

const QOREID_BASE_URL = process.env.QOREID_BASE_URL;
const QOREID_API_KEY = process.env.QOREID_API_KEY; // Set this in your .env

// /**
//  * Verifies a user's Virtual NIN (vNIN) using QoreID API.
//  * @param {Object} payload - The verification payload.
//  * @param {string} payload.vnin - The user's virtual NIN (no hyphens).
//  * @param {string} payload.firstname - The user's first name.
//  * @param {string} payload.lastname - The user's last name.
//  * @param {string} [payload.phone] - The user's phone number (optional).
//  * @returns {Promise<Object>} - The verification result from QoreID.
//  */
async function verifyVNIN({ vnin, firstname, lastname, phone }) {
  try {
    const response = await axios.post(
      QOREID_BASE_URL,
      {
        vnin,
        firstname,
        lastname,
        phone,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${QOREID_API_KEY}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    // Return error details for debugging
    if (error.response) {
      return {
        success: false,
        status: error.response.status,
        data: error.response.data,
      };
    }
    return {
      success: false,
      error: error.message,
    };
  }
}

module.exports = { verifyVNIN };
