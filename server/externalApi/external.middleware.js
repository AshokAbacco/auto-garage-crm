export const verifyExternalApiKey = (req, res, next) => {
  try {
    const apiKey = req.headers["x-api-key"];

     console.log("🔑 HEADER KEY:", req.headers["x-api-key"]);
     console.log("🔑 ENV KEY:", process.env.EXTERNAL_API_KEY);

    if (!apiKey || apiKey !== process.env.EXTERNAL_API_KEY) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Middleware error",
    });
  }
};
