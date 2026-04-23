// Strategy for chunking text into course sections
class CourseChunkingStrategy {
  chunk(text) {
    const chunks = [];
    const sections = this._splitIntoCourses(text);
    
    sections.forEach((section, index) => {
      const courseData = this._extractCourseData(section);
      
      if (courseData) {
        chunks.push({
          courseCode: courseData.courseCode,
          courseTitle: courseData.courseTitle,
          content: section,
          chunkIndex: index,
          metadata: courseData.metadata,
        });
      }
    });
    
    return chunks;
  }

  _splitIntoCourses(text) {
    // Split by "Title of the Course" pattern
    const courseSections = text.split(/(?=Title of the Course\s*[:：])/i);
    return courseSections.filter(section => section.trim().length > 100);
  }

  _extractCourseData(section) {
    const titleMatch = section.match(/Title of the Course\s*[:：]\s*(.+?)(?:\n|$)/i);
    const codeMatch = section.match(/Course Code\s*[:：]\s*([A-Z0-9.]+)/i);
    const facultyMatch = section.match(/Name of the Faculty\s*[:：]\s*(.+?)(?:\n|$)/i);
    const creditsMatch = section.match(/Credits\s*[:：]\s*(\d+)/i);
    const ltpMatch = section.match(/L-T-P\s*[:：]\s*([\d-]+)/i);
    
    if (!titleMatch || !codeMatch) {
      return null;
    }
    
    return {
      courseTitle: titleMatch[1].trim(),
      courseCode: codeMatch[1].trim(),
      metadata: {
        faculty: facultyMatch ? facultyMatch[1].trim() : null,
        credits: creditsMatch ? parseInt(creditsMatch[1]) : null,
        ltp: ltpMatch ? ltpMatch[1].trim() : null,
      },
    };
  }
}

module.exports = CourseChunkingStrategy;
