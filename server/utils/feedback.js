// utils/feedback.js
export function generateStarFeedback(answer, questionType = 'behavioral') {
  const text = (answer || "").toLowerCase();
  
  // Enhanced regex patterns for better detection
  const hasSituation = /situation|context|problem|challenge|background|environment|circumstance/.test(text);
  const hasTask = /task|goal|objective|responsibilit|purpose|aim|target/.test(text);
  const hasAction = /action|implemented|built|designed|led|debugg|collaborat|optimi|developed|created|managed|coordinated|executed|facilitated/.test(text);
  const hasResult = /result|impact|outcome|improved|reduced|increased|savings|kpi|metric|achieved|delivered|accomplished|efficiency|productivity/.test(text);

  const strengths = [];
  const weaknesses = [];
  const improvements = [];
  const starElements = [];

  // STAR element detection with more detailed feedback
  if (hasSituation) {
    strengths.push("Clear situation/context described");
    starElements.push("Situation ✓");
  } else {
    weaknesses.push("Missing situation/context");
    improvements.push("Frame the situation by describing the context, challenges, or background");
  }

  if (hasTask) {
    strengths.push("Defined task/goal/objective");
    starElements.push("Task ✓");
  } else {
    weaknesses.push("Missing task/goal");
    improvements.push("Clearly state the task, objective, or success criteria");
  }

  if (hasAction) {
    strengths.push("Concrete actions and approach described");
    starElements.push("Action ✓");
  } else {
    weaknesses.push("Actions not explicit or detailed");
    improvements.push("Detail your specific actions, decisions, and approach");
  }

  if (hasResult) {
    strengths.push("Measurable results and outcomes included");
    starElements.push("Result ✓");
  } else {
    weaknesses.push("No measurable results or outcomes");
    improvements.push("Quantify outcomes with metrics, KPIs, or before/after comparisons");
  }

  // Additional feedback based on answer quality
  const wordCount = text.split(/\s+/).length;
  
  if (wordCount < 50) {
    weaknesses.push("Answer is too brief");
    improvements.push("Expand your answer with more details and examples");
  } else if (wordCount > 300) {
    weaknesses.push("Answer may be too verbose");
    improvements.push("Focus on being concise while maintaining key details");
  }

  // Question-type specific feedback
  if (questionType === 'behavioral' && !text.includes('i ') && !text.includes('my ') && !text.includes('we ')) {
    weaknesses.push("Answer doesn't clearly describe personal involvement");
    improvements.push("Use 'I' statements to describe your specific role and contributions");
  }

  // Calculate rating
  const lengthScore = Math.min(1, wordCount / 120);
  const structureScore = (hasSituation + hasTask + hasAction + hasResult) / 4;
  const rating = Math.round(((0.6 * structureScore) + (0.4 * lengthScore)) * 5 * 10) / 10;

  return {
    strengths,
    weaknesses,
    improvements,
    rating,
    starElements,
    wordCount
  };
}

// Function to apply to all questions in your system
export function evaluateAllQuestions(questionsWithAnswers) {
  return questionsWithAnswers.map(qa => {
    const feedback = generateStarFeedback(qa.answer, qa.type);
    return {
      question: qa.question,
      answer: qa.answer,
      feedback: feedback
    };
  });
}