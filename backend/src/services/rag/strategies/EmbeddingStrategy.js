// Strategy for generating embeddings from text
class EmbeddingStrategy {
  generate(text) {
    const words = text.toLowerCase().split(/\s+/);
    const embedding = new Array(1536).fill(0);
    
    // Simple word-based embedding generation
    for (let i = 0; i < words.length && i < embedding.length; i++) {
      const word = words[i];
      for (let j = 0; j < word.length; j++) {
        const charCode = word.charCodeAt(j);
        embedding[(i * 10 + j) % embedding.length] += charCode / 1000;
      }
    }
    
    // Normalize to unit vector
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    return embedding.map(val => val / (magnitude || 1));
  }
}

module.exports = EmbeddingStrategy;
