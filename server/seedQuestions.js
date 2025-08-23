// seedQuestions.js
const mongoose = require("mongoose");
const Question = require("./models/Question");
require("dotenv").config();

// Roles
const roles = [
  "Project Manager",
  "Program Manager",
  "Delivery Manager",
  "Technical Program Manager"
];

// Categories common for all roles
const categories = [
  "Behavioral",
  "Technical",
  "Company Fit",
  "Leadership",
  "Case Study"
];

// Questions for each category (10 each)
const questionsPerCategory = {
  "Behavioral": [
    "Tell me about a time you faced a major conflict at work. How did you handle it?",
    "Describe a project where you had to adapt quickly to unexpected changes.",
    "Give an example of a time you had to influence someone without direct authority.",
    "Tell me about a time you failed. What did you learn from it?",
    "Describe how you prioritize tasks when you have multiple deadlines.",
    "Tell me about a time when you had to deliver bad news to a team or stakeholder.",
    "Describe a situation where you had to balance competing priorities.",
    "Tell me about a time you resolved a misunderstanding in your team.",
    "How do you handle stress during critical project phases?",
    "Describe an example of when you went above and beyond for your role."
  ],
  "Technical": [
    "How do you ensure technical feasibility in your projects/programs?",
    "Describe a time when you had to make a technical trade-off decision.",
    "How do you evaluate new tools or technologies for a project?",
    "Tell me about a project where technical complexity was a major challenge.",
    "How do you collaborate with engineers to understand technical risks?",
    "What’s your experience with Agile or Scrum in technical programs?",
    "How do you handle dependencies between technical and non-technical teams?",
    "Describe a technical risk you identified early and mitigated successfully.",
    "How do you manage technical debt in long-term programs?",
    "Tell me about a time when technology constraints impacted delivery."
  ],
  "Company Fit": [
    "Why do you want to work at our company?",
    "How does this role align with your career goals?",
    "What do you know about our company’s mission and values?",
    "Describe how your past experience makes you a fit for this role.",
    "What excites you the most about our organization?",
    "Tell me about a time you adapted to a company’s culture quickly.",
    "How do you handle situations where company goals conflict with project goals?",
    "What do you expect from leadership in this organization?",
    "How do you see yourself contributing to our long-term success?",
    "Why should we hire you for this role?"
  ],
  "Leadership": [
    "Describe your leadership style and why it works for you.",
    "Tell me about a time you motivated a disengaged team member.",
    "How do you handle underperforming team members?",
    "Describe a time you had to make a tough leadership decision.",
    "How do you delegate responsibilities effectively?",
    "Tell me about a time you led a team through a major challenge.",
    "How do you build trust and credibility with your team?",
    "What strategies do you use to inspire and energize your team?",
    "Describe how you manage conflict within your team.",
    "How do you help team members grow in their careers?"
  ],
  "Case Study": [
    "You are leading a project running 2 months behind schedule. What steps would you take?",
    "A client is unhappy with project progress. How would you handle the situation?",
    "Your project is over budget by 15%. What actions do you take?",
    "Half your team is unavailable due to unforeseen events. How do you ensure delivery?",
    "Stakeholders disagree on project priorities. How would you resolve this?",
    "You inherit a project with poor documentation. What do you do first?",
    "A critical risk has materialized. How do you mitigate and recover?",
    "Your program spans multiple geographies with cultural differences. How do you ensure success?",
    "Your delivery quality is below expectations. How do you address it?",
    "A high-profile project requires a quick turnaround with limited resources. What’s your approach?"
  ]
};

// Generate full list of questions
const allQuestions = [];
roles.forEach(role => {
  categories.forEach(category => {
    questionsPerCategory[category].forEach(text => {
      allQuestions.push({ role, category, text });
    });
  });
});

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    await Question.deleteMany({});
    await Question.insertMany(allQuestions);
    console.log(`Seeded ${allQuestions.length} questions successfully!`);
    process.exit();
  })
  .catch(err => {
    console.error('Database connection error:', err);
    process.exit(1);
  });
