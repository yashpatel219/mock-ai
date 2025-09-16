// utils/feedback.js
export function generateFeedback(answer, questionType = 'behavioral') {
  const text = (answer || "").toLowerCase();
  
  // STAR method elements (particularly relevant for behavioral questions)
  const hasSituation = /situation|context|problem|challenge|background|environment|circumstance/.test(text);
  const hasTask = /task|goal|objective|responsibilit|purpose|aim|target/.test(text);
  const hasAction = /action|implemented|built|designed|led|debugg|collaborat|optimi|developed|created|managed|coordinated|executed|facilitated/.test(text);
  const hasResult = /result|impact|outcome|improved|reduced|increased|savings|kpi|metric|achieved|delivered|accomplished|efficiency|productivity/.test(text);

  // Keyword analysis for different question types
  const leadershipKeywords = /lead|mentor|inspire|guide|empower|motivate|coach|develop|strategy|vision|delegate|resolve|conflict|manage|team/.test(text);
  const technicalKeywords = /technical|technology|system|architecture|framework|code|develop|implement|design|infrastructure|stack|tool|platform|language|api/.test(text);
  const managementKeywords = /manage|coordinate|organize|plan|schedule|budget|resource|stakeholder|risk|mitigate|timeline|deadline|scope|agile|waterfall/.test(text);
  const companyFitKeywords = /culture|value|mission|vision|goal|align|contribute|growth|learn|develop|passion|excit|interest|product|service/.test(text);
  const caseStudyKeywords = /analyze|assess|evaluate|recommend|solution|approach|strategy|implement|execute|measure|result|outcome|metric|kpi|roi/.test(text);

  const strengths = [];
  const weaknesses = [];
  const improvements = [];
  const starElements = [];
  let rating = 0;

  // Answer length analysis
  const wordCount = text.split(/\s+/).length;
  
  // Type-specific evaluation
  switch(questionType.toLowerCase()) {
    case 'behavioral':
      // STAR method evaluation
      if (hasSituation) {
        strengths.push("Clearly described the situation/context");
        starElements.push("Situation ✓");
      } else {
        weaknesses.push("Missing clear description of the situation/context");
        improvements.push("Begin by framing the situation - describe the context, challenges, or background");
      }

      if (hasTask) {
        strengths.push("Clearly defined the task/goal/objective");
        starElements.push("Task ✓");
      } else {
        weaknesses.push("Missing clear statement of the task or objective");
        improvements.push("Clearly state the task, objective, or what success would look like");
      }

      if (hasAction) {
        strengths.push("Detailed specific actions and approach taken");
        starElements.push("Action ✓");
      } else {
        weaknesses.push("Actions not explicit or detailed enough");
        improvements.push("Detail your specific actions, decisions, and approach");
      }

      if (hasResult) {
        strengths.push("Included measurable results and outcomes");
        starElements.push("Result ✓");
      } else {
        weaknesses.push("No measurable results or clear outcomes described");
        improvements.push("Quantify outcomes with metrics, KPIs, or before/after comparisons");
      }

      // Personal involvement
      if (!text.includes('i ') && !text.includes('my ') && !text.includes('we ')) {
        weaknesses.push("Answer doesn't clearly describe personal involvement");
        improvements.push("Use 'I' statements to describe your specific role and contributions");
      } else {
        strengths.push("Clear ownership of actions and contributions");
      }
      
      // Calculate rating for behavioral questions
      const lengthScore = Math.min(1, wordCount / 120);
      const structureScore = (hasSituation + hasTask + hasAction + hasResult) / 4;
      rating = Math.round(((0.6 * structureScore) + (0.4 * lengthScore)) * 5 * 10) / 10;
      break;

    case 'leadership':
      if (leadershipKeywords) {
        strengths.push("Used appropriate leadership terminology");
      } else {
        weaknesses.push("Missing leadership-specific terminology");
        improvements.push("Incorporate leadership terms like 'mentored', 'guided', 'developed strategy', or 'empowered team'");
      }
      
      if (wordCount > 80) {
        strengths.push("Provided substantial content demonstrating leadership experience");
      } else {
        weaknesses.push("Answer lacks depth in leadership examples");
        improvements.push("Expand on specific leadership experiences with concrete examples");
      }
      
      // Calculate rating for leadership questions
      rating = Math.min(5, (wordCount / 50) * 0.5 + (leadershipKeywords ? 3 : 2));
      break;

    case 'technical':
      if (technicalKeywords) {
        strengths.push("Used appropriate technical terminology");
      } else {
        weaknesses.push("Missing technical-specific terminology");
        improvements.push("Include technical terms relevant to the role like 'architecture', 'framework', or 'implementation'");
      }
      
      if (wordCount > 70) {
        strengths.push("Provided substantial technical detail");
      } else {
        weaknesses.push("Answer lacks technical depth");
        improvements.push("Expand on technical specifics with more detail about systems, tools, or approaches");
      }
      
      // Calculate rating for technical questions
      rating = Math.min(5, (wordCount / 60) * 0.5 + (technicalKeywords ? 3.5 : 2));
      break;

    case 'company fit':
      if (companyFitKeywords) {
        strengths.push("Demonstrated knowledge of company culture and values");
      } else {
        weaknesses.push("Missing company-specific references");
        improvements.push("Research the company's mission, values, and culture and reference them in your answer");
      }
      
      if (wordCount > 50) {
        strengths.push("Provided thoughtful reasons for interest in the company");
      } else {
        weaknesses.push("Answer lacks depth in explaining company fit");
        improvements.push("Elaborate on why you're specifically interested in this company and how you align with its values");
      }
      
      // Calculate rating for company fit questions
      rating = Math.min(5, (wordCount / 40) * 0.5 + (companyFitKeywords ? 3.5 : 2));
      break;

    case 'case study':
      if (caseStudyKeywords) {
        strengths.push("Used appropriate analytical and problem-solving terminology");
      } else {
        weaknesses.push("Missing case study-specific terminology");
        improvements.push("Incorporate terms like 'analyze', 'evaluate', 'recommend', 'solution', or 'metrics'");
      }
      
      if (wordCount > 100) {
        strengths.push("Provided thorough analysis of the case scenario");
      } else {
        weaknesses.push("Answer lacks depth in case analysis");
        improvements.push("Expand on your thought process, analysis, and recommended solutions");
      }
      
      // Check for structured approach in case studies
      const hasStructure = /first|then|next|after|finally|analyze|recommend|conclude/.test(text);
      if (hasStructure) {
        strengths.push("Demonstrated structured approach to problem-solving");
      } else {
        weaknesses.push("Answer lacks clear structure in addressing the case");
        improvements.push("Use a structured approach: analyze the situation, identify options, make recommendations, and discuss implementation");
      }
      
      // Calculate rating for case study questions
      rating = Math.min(5, (wordCount / 80) * 0.4 + (caseStudyKeywords ? 3 : 2) + (hasStructure ? 1 : 0));
      break;

    default:
      // Generic feedback for unknown question types
      if (wordCount > 50) {
        strengths.push("Provided substantial content in response");
      } else {
        weaknesses.push("Answer may be too brief");
        improvements.push("Expand your answer with more details and specific examples");
      }
      
      rating = Math.min(5, wordCount / 30);
      break;
  }

  // Additional feedback based on answer quality
  if (wordCount < 50) {
    weaknesses.push("Answer is too brief and lacks detail");
    improvements.push("Expand your answer with more details and specific examples");
  } else if (wordCount > 300) {
    weaknesses.push("Answer may be too verbose and could lose focus");
    improvements.push("Focus on being concise while maintaining key details");
  } else if (questionType !== 'behavioral') {
    strengths.push("Appropriate answer length for the question type");
  }

  // Ensure we have at least some feedback
  if (strengths.length === 0) {
    strengths.push("Good attempt at answering the question");
  }
  if (weaknesses.length === 0) {
    weaknesses.push("No major weaknesses detected");
  }
  if (improvements.length === 0) {
    improvements.push("Continue with current approach, consider adding more specific details");
  }

  return {
    strengths,
    weaknesses,
    improvements,
    rating: Math.round(rating * 10) / 10, // Round to 1 decimal place
    starElements: questionType === 'behavioral' ? starElements : [],
    wordCount,
    questionType
  };
}

// Function to apply to all questions in your system
export function evaluateAllQuestions(questionsWithAnswers) {
  return questionsWithAnswers.map(qa => {
    const feedback = generateFeedback(qa.answer, qa.type);
    return {
      question: qa.question,
      answer: qa.answer,
      type: qa.type,
      feedback: feedback
    };
  });
}

// New function to generate summary report for multiple questions
export function generateSummaryReport(evaluatedQuestions) {
  const totalQuestions = evaluatedQuestions.length;
  const avgRating = evaluatedQuestions.reduce((sum, q) => sum + q.feedback.rating, 0) / totalQuestions;
  const avgWordCount = evaluatedQuestions.reduce((sum, q) => sum + q.feedback.wordCount, 0) / totalQuestions;
  
  // Count question types
  const typeCounts = {};
  evaluatedQuestions.forEach(q => {
    typeCounts[q.type] = (typeCounts[q.type] || 0) + 1;
  });
  
  // Find common strengths and weaknesses
  const allStrengths = evaluatedQuestions.flatMap(q => q.feedback.strengths);
  const allWeaknesses = evaluatedQuestions.flatMap(q => q.feedback.weaknesses);
  
  const strengthCounts = {};
  const weaknessCounts = {};
  
  allStrengths.forEach(s => {
    strengthCounts[s] = (strengthCounts[s] || 0) + 1;
  });
  
  allWeaknesses.forEach(w => {
    weaknessCounts[w] = (weaknessCounts[w] || 0) + 1;
  });
  
  // Get top 3 most common strengths and weaknesses
  const commonStrengths = Object.entries(strengthCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(item => item[0]);
    
  const commonWeaknesses = Object.entries(weaknessCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(item => item[0]);
  
  return {
    totalQuestions,
    avgRating: Math.round(avgRating * 10) / 10,
    avgWordCount: Math.round(avgWordCount),
    questionTypeBreakdown: typeCounts,
    commonStrengths,
    commonWeaknesses,
    overallAssessment: avgRating >= 4 ? "Strong performance across questions" :
                      avgRating >= 3 ? "Good performance with some areas for improvement" :
                      "Needs significant improvement in answering techniques"
  };
}