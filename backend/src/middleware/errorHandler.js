const { env } = require("../config/env");

function notFound(req, res) {
  res.status(404).json({ error: "Not found", path: req.originalUrl });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const status = err.status || err.statusCode || 500;
  if (status >= 500) console.error(`[${req.method} ${req.originalUrl}]`, err);

  if (res.headersSent) return res.end();

  res.status(status).json({
    error: status >= 500 && env.isProd ? "Internal server error" : err.message,
    ...(err.details ? { details: err.details } : {}),
  });
}

module.exports = { notFound, errorHandler };
