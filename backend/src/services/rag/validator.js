const { z } = require("zod");
const { validate } = require("../../middleware/validate");

const askSchema = z.object({
  question: z.string().trim().min(1, "A question is required").max(2000, "Question is too long"),
  conversationId: z.string().uuid().optional(),
});

const renameSchema = z.object({
  title: z.string().trim().min(1).max(120),
});

const searchQuerySchema = z.object({
  q: z.string().trim().min(1).max(500),
});

const idParamSchema = z.object({ id: z.string().uuid("Invalid conversation id") });

module.exports = {
  validateAsk: validate(askSchema),
  validateRename: validate(renameSchema),
  validateSearch: validate(searchQuerySchema, "query"),
  validateId: validate(idParamSchema, "params"),
};
