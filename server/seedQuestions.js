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
    "Describe a situation where you had to manage a difficult stakeholder. How did you handle it?",
    "Tell me about a time you had to adapt your approach due to team dynamics.",
    "Give an example of when you successfully managed conflicting priorities across projects.",
    "Share a time when you overcame a major setback in a project. What did you learn?",
    "How do you handle a situation where a team member is not meeting expectations?",
    "Describe a time when you had to persuade a senior leader to change their perspective.",
    "Tell me about a time you turned around an underperforming project.",
    "How do you maintain team morale during high-pressure situations?",
    "Describe a time you had to manage a project with limited information.",
    "Share an example of when you took initiative to improve a process."
  ],
  "Technical": [
    "How do you assess and prioritize technical risks in a project?",
    "Describe a time when you had to balance technical quality with tight deadlines.",
    "What process do you follow to select tools or platforms for a project?",
    "Tell me about a time when a technical issue threatened project success. How did you address it?",
    "How do you ensure alignment between technical teams and business stakeholders?",
    "What’s your experience with managing cross-functional technical dependencies?",
    "Describe a situation where you had to simplify a complex technical concept for non-technical stakeholders.",
    "How do you stay updated on emerging technologies relevant to your role?",
    "Tell me about a time you mitigated a technical bottleneck in a project.",
    "How do you ensure technical deliverables meet quality standards?"
  ],
  "Company Fit": [
    "What motivates you to join our organization?",
    "How do you see this role contributing to your professional growth?",
    "What aspects of our company’s culture resonate with you?",
    "Describe how your skills align with our company’s current goals.",
    "What do you know about our recent projects or initiatives?",
    "Tell me about a time you thrived in a similar company culture.",
    "How would you handle a situation where your values differ from company decisions?",
    "What unique value do you bring to our team?",
    "How do you stay aligned with a company’s strategic objectives?",
    "Why do you believe you’re the best candidate for this role?"
  ],
  "Leadership": [
    "How do you tailor your leadership approach to different team members?",
    "Tell me about a time you mentored someone to improve their performance.",
    "Describe a situation where you had to lead a team through uncertainty.",
    "How do you balance accountability with fostering a positive team environment?",
    "Share an example of a tough leadership call you made and its outcome.",
    "How do you ensure clear communication across diverse teams?",
    "Tell me about a time you rebuilt trust within a team.",
    "What’s your approach to managing high-performing versus struggling team members?",
    "Describe how you set a vision to guide your team.",
    "How do you empower your team to take ownership of their work?"
  ],
  "Case Study": [
    "A project is at risk of missing a critical deadline. How would you address it?",
    "Your team is demotivated due to repeated scope changes. What steps do you take?",
    "A key stakeholder insists on unrealistic timelines. How do you handle it?",
    "You discover a major flaw in the project plan halfway through. What’s your next move?",
    "How would you manage a project with conflicting stakeholder requirements?",
    "A critical resource leaves mid-project. How do you adapt to ensure delivery?",
    "Your project is facing unexpected regulatory challenges. What’s your approach?",
    "You’re tasked with delivering a complex project with a new team. How do you proceed?",
    "A client escalates concerns about quality. How do you respond and recover?",
    "Your project requires collaboration across time zones. How do you ensure efficiency?"
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
