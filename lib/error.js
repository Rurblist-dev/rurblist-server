const createError = (res, status = 500, message = "Something went wrong!", error = null) => {
    return res.status(status).json({
      success: false,
      status,
      message,
      error: error ? error.message || error : null,
    });
  };
  
  module.exports = createError;
  