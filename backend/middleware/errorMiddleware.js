// Global error handler for Express
// Global error handling middleware
// Must be registered LAST in server.js (after all routes)
// Express recognizes it as an error handler because it has 4 parameters: (err, req, res, next)

const errorMiddleware = (err, req, res, next) => {
  // Log the error stack in development for easier debugging
  if (process.env.NODE_ENV !== "production") {
    console.error(err.stack);
  }

  // Use the status code set on the error, or fall back to 500
  const statusCode = err.statusCode || res.statusCode || 500;

  // Handle Mongoose validation errors (e.g. required field missing)
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      message: "Validation error",
      errors: messages,
    });
  }

  // Handle Mongoose duplicate key error (e.g. email already exists)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      message: `${field} already exists.`,
    });
  }

  // Handle invalid Mongoose ObjectId (e.g. malformed :id param)
  if (err.name === "CastError") {
    return res.status(400).json({
      message: "Invalid ID format.",
    });
  }

  // Handle multer file size errors
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      message: "File is too large.",
    });
  }

  // Default error response for everything else
  res.status(statusCode).json({
    message: err.message || "Internal server error.",
  });
};

module.exports = errorMiddleware;