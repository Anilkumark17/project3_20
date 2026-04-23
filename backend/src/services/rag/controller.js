const service = require("./service");

class RAGController {
  async getDocuments(req, res) {
    try {
      const { semester } = req.query;

      const documents = semester
        ? await service.getDocumentsBySemester(semester)
        : await service.getAllDocuments();

      res.json({
        success: true,
        data: documents,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getDocumentWithChunks(req, res) {
    try {
      const { namespace } = req.params;

      const document = await service.getDocumentWithChunks(namespace);

      res.json({
        success: true,
        data: document,
      });
    } catch (error) {
      const statusCode = error.message === "Document not found" ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        error: error.message,
      });
    }
  }

  async searchCourses(req, res) {
    try {
      const { semester } = req.params;
      const { q, topK = 10 } = req.query;

      if (!q) {
        return res.status(400).json({
          success: false,
          error: "Search query is required",
        });
      }

      const results = await service.searchCourses(semester, q, parseInt(topK));

      res.json({
        success: true,
        data: results,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  async deleteDocument(req, res) {
    try {
      const { namespace } = req.params;

      await service.deleteDocument(namespace);

      res.json({
        success: true,
        message: "Document deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
}

module.exports = new RAGController();
