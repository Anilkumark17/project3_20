class CourseChunker {
  chunkCourse(course, season) {
    const chunks = [];
    const baseMetadata = {
      courseId: course.id,
      title: course.title,
      code: course.code,
      credits: course.credits,
      difficulty: course.difficulty,
      program: course.program,
      semester: course.semester,
      season: season,
      sourceFile: `${season}.json`
    };

    chunks.push({
      id: `${course.id}_identity`,
      text: this.buildIdentityChunk(course),
      metadata: {
        ...baseMetadata,
        chunkType: 'identity'
      }
    });

    if (course.description) {
      chunks.push({
        id: `${course.id}_summary`,
        text: this.buildSummaryChunk(course),
        metadata: {
          ...baseMetadata,
          chunkType: 'summary'
        }
      });
    }

    if (course.learning_outcomes && course.learning_outcomes.length > 0) {
      chunks.push({
        id: `${course.id}_outcomes`,
        text: this.buildOutcomesChunk(course),
        metadata: {
          ...baseMetadata,
          chunkType: 'learning_outcomes'
        }
      });
    }

    if (course.assessments) {
      chunks.push({
        id: `${course.id}_assessments`,
        text: this.buildAssessmentsChunk(course),
        metadata: {
          ...baseMetadata,
          chunkType: 'assessments'
        }
      });
    }

    if (course.prerequisites && course.prerequisites.length > 0) {
      chunks.push({
        id: `${course.id}_prerequisites`,
        text: this.buildPrerequisitesChunk(course),
        metadata: {
          ...baseMetadata,
          chunkType: 'prerequisites'
        }
      });
    }

    return chunks;
  }

  buildIdentityChunk(course) {
    return `Course: ${course.title}
Code: ${course.code}
Credits: ${course.credits}
Difficulty: ${course.difficulty}/5
Program: ${course.program}
Semester: ${course.semester}`;
  }

  buildSummaryChunk(course) {
    return `${course.title} (${course.code}):
${course.description}

This is a ${course.credits}-credit course in the ${course.program} program, rated ${course.difficulty}/5 difficulty.`;
  }

  buildOutcomesChunk(course) {
    const outcomes = course.learning_outcomes.map((o, i) => `${i + 1}. ${o}`).join('\n');
    return `Learning Outcomes for ${course.title} (${course.code}):

${outcomes}

Students completing this course will gain these skills and knowledge areas.`;
  }

  buildAssessmentsChunk(course) {
    const assessments = Object.entries(course.assessments)
      .map(([key, value]) => `- ${key}: ${value}%`)
      .join('\n');
    
    return `Assessment Structure for ${course.title} (${course.code}):

${assessments}

Total: 100%`;
  }

  buildPrerequisitesChunk(course) {
    const prereqs = course.prerequisites.join(', ');
    return `Prerequisites for ${course.title} (${course.code}):
${prereqs}

Students should complete these courses before enrolling.`;
  }

  chunkAllCourses(courses, season) {
    const allChunks = [];
    
    for (const course of courses) {
      const courseChunks = this.chunkCourse(course, season);
      allChunks.push(...courseChunks);
    }

    console.log(`Generated ${allChunks.length} chunks from ${courses.length} courses (${season})`);
    return allChunks;
  }
}

module.exports = new CourseChunker();
