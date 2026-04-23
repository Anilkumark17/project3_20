const express = require("express");
const controller = require("./controller");

const router = express.Router();

router.get("/", controller.getDocuments);
router.get("/:namespace", controller.getDocumentWithChunks);
router.get("/search/:semester", controller.searchCourses);
router.delete("/:namespace", controller.deleteDocument);

module.exports = router;
