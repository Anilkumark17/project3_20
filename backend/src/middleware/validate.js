const { HttpError } = require("../utils/httpError");

/** Validate and normalise req[source] against a zod schema. */
const validate = (schema, source = "body") => (req, res, next) => {
  const result = schema.safeParse(req[source]);
  if (!result.success) {
    return next(new HttpError(400, "Validation failed", result.error.issues.map((i) => ({ path: i.path.join("."), message: i.message }))));
  }
  // Express 5 exposes req.query as a getter; only body can be replaced wholesale.
  if (source === "body") req.body = result.data;
  next();
};

module.exports = { validate };
