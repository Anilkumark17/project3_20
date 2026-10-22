const pipeline = require("../../rag/pipeline");
const conversationRepository = require("./repository");
const userRepository = require("../auth/repository");
const profileRepository = require("../profile/repository");
const completedCoursesRepository = require("../courses/repositories/completed");
const { HttpError } = require("../../utils/httpError");

const titleFrom = (question) => (question.length > 60 ? `${question.slice(0, 57).trimEnd()}…` : question);

class RAGService {
  async resolveUser(clerkId) {
    const user = await userRepository.findByClerkId(clerkId);
    if (!user) throw new HttpError(404, "User not found");
    return user;
  }

  async studentContext(userId) {
    const [profile, completed] = await Promise.all([
      profileRepository.findByUserId(userId),
      completedCoursesRepository.findByUserId(userId),
    ]);
    return {
      program: profile?.program,
      semester: profile?.semester,
      goal: profile?.goal,
      creditsCompleted: profile?.creditsCompleted,
      completed: completed.map((c) => `${c.courseCode} ${c.courseTitle}`),
    };
  }

  /** Load (and authorise) or create the conversation for this question. */
  async openConversation(user, conversationId, question) {
    if (conversationId) {
      const conversation = await conversationRepository.findForUser(conversationId, user.id);
      if (!conversation) throw new HttpError(404, "Conversation not found");
      const history = await conversationRepository.recentHistory(conversation.id);
      return { conversation, history };
    }
    const conversation = await conversationRepository.create(user.id, titleFrom(question));
    return { conversation, history: [] };
  }

  async record(user, conversation, question, result, error) {
    await conversationRepository.logQuery({
      userId: user.id,
      conversationId: conversation?.id,
      question,
      searchQuery: result?.searchQuery,
      retrievedChunkIds: result?.retrievedChunkIds,
      topScore: result?.topScore,
      timings: result?.timings,
      model: result?.model,
      promptTokens: result?.usage?.prompt_tokens,
      completionTokens: result?.usage?.completion_tokens,
      status: error ? "error" : result.status,
      error: error?.message,
    });
  }

  async ask(clerkId, { question, conversationId }) {
    const user = await this.resolveUser(clerkId);
    const [{ conversation, history }, student] = await Promise.all([
      this.openConversation(user, conversationId, question),
      this.studentContext(user.id),
    ]);
    try {
      const result = await pipeline.answer(question, { history, student });
      const message = await conversationRepository.saveExchange(conversation.id, question, result.answer, result.citations);
      await this.record(user, conversation, question, result);
      return {
        conversationId: conversation.id,
        messageId: message.id,
        answer: result.answer,
        citations: result.citations,
        timings: result.timings,
      };
    } catch (err) {
      await this.record(user, conversation, question, null, err);
      throw err;
    }
  }

  async askStream(clerkId, { question, conversationId }, { emit, signal }) {
    const user = await this.resolveUser(clerkId);
    const [{ conversation, history }, student] = await Promise.all([
      this.openConversation(user, conversationId, question),
      this.studentContext(user.id),
    ]);
    emit("conversation", { conversationId: conversation.id, title: conversation.title });

    try {
      const result = await pipeline.streamAnswer(question, { history, student, signal, emit });
      const message = await conversationRepository.saveExchange(conversation.id, question, result.answer, result.citations);
      await this.record(user, conversation, question, result);
      emit("done", { messageId: message.id, citations: result.citations, timings: result.timings, usage: result.usage });
    } catch (err) {
      await this.record(user, conversation, question, null, err);
      throw err;
    }
  }

  async listConversations(clerkId) {
    const user = await this.resolveUser(clerkId);
    return conversationRepository.listForUser(user.id);
  }

  async getConversation(clerkId, id) {
    const user = await this.resolveUser(clerkId);
    const conversation = await conversationRepository.findForUser(id, user.id);
    if (!conversation) throw new HttpError(404, "Conversation not found");
    const messages = await conversationRepository.messages(id);
    return { ...conversation, messages };
  }

  async renameConversation(clerkId, id, title) {
    const user = await this.resolveUser(clerkId);
    const conversation = await conversationRepository.rename(id, user.id, title);
    if (!conversation) throw new HttpError(404, "Conversation not found");
    return conversation;
  }

  async deleteConversation(clerkId, id) {
    const user = await this.resolveUser(clerkId);
    if (!(await conversationRepository.delete(id, user.id))) throw new HttpError(404, "Conversation not found");
  }

  /** Retrieval-only debug view: what would the model see for this query? */
  async search(question) {
    const prep = await pipeline.prepare(question);
    return { searchQuery: prep.analysis.searchQuery, analysis: prep.analysis, citations: prep.citations, timings: prep.timings };
  }

  async stats() {
    const [index, queries] = await Promise.all([conversationRepository.indexStats(), conversationRepository.queryStats()]);
    return { index, queries };
  }
}

module.exports = new RAGService();
