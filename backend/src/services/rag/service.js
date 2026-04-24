const fs = require("fs");
const path = require("path");
const ragRepository = require("./repository");

/**
 * GraphRAG Service – In-memory Graph Implementation
 * Uses monsoon.json and spring.json as the source of truth.
 * Builds relationships based on program, credits, and description overlap.
 */
class RAGService {
  constructor() {
    this.courses = [];
    this.graph = new Map(); // Course Code -> Set of Related Course Codes
    this.loadData();
  }

  loadData() {
    try {
      const monsoonPath = path.join(__dirname, "../../utils/monsoon.json");
      const springPath = path.join(__dirname, "../../utils/spring.json");

      const monsoon = JSON.parse(fs.readFileSync(monsoonPath, "utf-8")).map(c => ({ ...c, season: "monsoon" }));
      const spring = JSON.parse(fs.readFileSync(springPath, "utf-8")).map(c => ({ ...c, season: "spring" }));

      this.courses = [...monsoon, ...spring];
      this.buildGraph();
      console.log(`✓ GraphRAG: Loaded ${this.courses.length} courses and built relationship graph.`);
    } catch (error) {
      console.error("Error loading course data for GraphRAG:", error);
    }
  }

  buildGraph() {
    // Basic relationship: Same Program & Similar Difficulty
    for (const course of this.courses) {
      const related = new Set();
      
      for (const other of this.courses) {
        if (course.code === other.code) continue;

        // Relation: Same Program
        if (course.program === other.program) {
          related.add(other.code);
        }

        // Relation: Overlapping Keywords in Description (at least 2 matching words > 4 chars)
        const words1 = new Set(course.description?.toLowerCase().split(/\W+/).filter(w => w.length > 4));
        const words2 = other.description?.toLowerCase().split(/\W+/).filter(w => w.length > 4);
        const matches = words2?.filter(w => words1.has(w));
        
        if (matches?.length >= 2) {
          related.add(other.code);
        }
      }
      this.graph.set(course.code, related);
    }
  }

  /**
   * Search for courses matching the query and their neighbors in the graph.
   */
  getGraphContext(query) {
    const searchTerms = query.toLowerCase().split(/\W+/).filter(w => w.length > 3);
    
    // Find initial matches
    const matches = this.courses.filter(c => {
      const title = c.title.toLowerCase();
      const desc = c.description.toLowerCase();
      return searchTerms.some(term => title.includes(term) || desc.includes(term));
    });

    // Expand to neighbors in the graph
    const contextualCodes = new Set(matches.map(m => m.code));
    matches.forEach(m => {
      const neighbors = this.graph.get(m.code) || [];
      neighbors.forEach(n => contextualCodes.add(n));
    });

    // Get full course objects for all codes (limit to 10 for prompt size)
    const contextCourses = Array.from(contextualCodes)
      .map(code => this.courses.find(c => c.code === code))
      .slice(0, 10);

    if (contextCourses.length === 0) return "No specific courses found for this query.";

    return contextCourses.map(c => {
      return `[COURSE: ${c.code}] ${c.title}
Program: ${c.program} | Credits: ${c.credits} | Difficulty: ${c.difficulty}/5
Season: ${c.season} | Semester: ${c.semester}
Description: ${c.description}
-------------------`;
    }).join("\n");
  }

  /**
   * Main entry point to ask questions
   */
  async ask(question, history = []) {
    const context = this.getGraphContext(question);

    const systemPrompt = {
      role: "system",
      content: `You are an academic course advisor. Use the following course information (Graph RAG Context) to answer the user's question. 
If the user asks for recommendations, suggest courses from the provided context that match their interests.
Always mention the Course Code and the Semester when talking about a course.

[GRAPH RAG CONTEXT]
${context}`
    };

    const messages = [systemPrompt, ...history, { role: "user", content: question }];
    
    const response = await ragRepository.chat(messages);
    return {
      answer: response.choices[0].message.content,
      contextUsed: context !== "No specific courses found for this query.",
    };
  }

  /**
   * Streaming version
   */
  async askStream(question, history = []) {
    const context = this.getGraphContext(question);

    const systemPrompt = {
      role: "system",
      content: `You are an academic course advisor. Use the following course information (Graph RAG Context) to answer the user's question. 
[GRAPH RAG CONTEXT]
${context}`
    };

    const messages = [systemPrompt, ...history, { role: "user", content: question }];
    return await ragRepository.chatStream(messages);
  }
}

module.exports = new RAGService();
