// Strategy for cleaning extracted text
class TextCleaningStrategy {
  clean(text) {
    return text
      .replace(/\r\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/\s+/g, ' ')
      .trim();
  }
}

module.exports = TextCleaningStrategy;
