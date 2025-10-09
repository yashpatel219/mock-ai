// seedQuestions.js
const mongoose = require("mongoose");
const Question = require("./models/Question");
require("dotenv").config();

// Roles (modern / trending)
const roles = [
  "Software Engineer",
  "AI / ML Engineer",
  "Data Engineer",
  "Cybersecurity Engineer",
  "Cloud / DevOps Engineer",
  "Product Manager",
  "Site Reliability Engineer",
  "Full Stack Engineer"
];

// Categories
const categories = [
  "Technical & Tools",
  "System Design / Architecture",
  "Data & Analytics / Metrics",
  "Behavioral / Soft Skills",
  "Product & Domain Understanding",
  "Problem Solving / Algorithms",
  "Security & Risk",
  "Leadership & Collaboration"
];

// Sample questions per category
const questionsPerCategory = {
  "Technical & Tools": [
    "Which programming languages, frameworks, or tools are you most comfortable with? Give examples.",
    "Describe a time when a tooling decision you made significantly impacted the project.",
    "How do you debug a production error you’ve never seen before?",
    "Explain how you manage dependencies and versioning across services.",
    "Tell me about a time you introduced a new tool or library to the team.",
    "What is your experience with CI/CD, automated testing, and related pipelines?",
    "How do you choose between different frameworks or tech stacks for a project?",
    "Describe a challenging bug you found and how you resolved it."
  ],
  "System Design / Architecture": [
    "Design a scalable, high-availability system for a real-time chat service.",
    "How would you architect a system to handle millions of daily users uploading images/videos?",
    "What tradeoffs do you consider between consistency, availability, and partition tolerance?",
    "Explain how you would break a monolith into microservices.",
    "Design a distributed caching system for frequently accessed data.",
    "How would you ensure backward compatibility when evolving APIs?",
    "Design an analytics pipeline from data ingestion to dashboards.",
    "How do you handle failure — e.g. a service crash or network partition — in your architecture?"
  ],
  "Data & Analytics / Metrics": [
    "Which metrics would you define to measure product success or system health?",
    "How do you approach data instrumentation and observability in your systems?",
    "Tell me about a time you used data to drive a product or technical decision.",
    "How do you ensure data quality when integrating multiple data sources?",
    "Describe a situation where your analysis revealed a surprising insight.",
    "What is your experience with ETL pipelines, data warehouses, and big data tools?",
    "How would you detect anomalies in real-time data streams?",
    "How do you balance business KPI targets vs technical constraints?"
  ],
  "Behavioral / Soft Skills": [
    "Tell me about a time you handled conflict in a team.",
    "Describe a situation when you had to influence without formal authority.",
    "When did you make a mistake and how did you recover from it?",
    "How do you prioritize your work when faced with multiple deadlines?",
    "Tell me about a time you had to learn a new skill quickly to deliver.",
    "How do you receive and act on feedback?",
    "Describe a time you mentored or coached someone.",
    "How do you handle stress or pressure in a critical situation?"
  ],
  "Product & Domain Understanding": [
    "How would you decide which feature to build next for a product?",
    "Describe how you would validate a new product idea with users.",
    "Tell me about a time you disagreed with product direction — how did you handle it?",
    "How do you balance technical debt vs feature development?",
    "Explain how domain knowledge (e.g. finance, health, e-commerce) influences design.",
    "What’s an example of a product you love and how you’d improve it?",
    "How would you define your target user personas and their pain points?",
    "How do you handle ambiguous requirements or unclear product scope?"
  ],
  "Problem Solving / Algorithms": [
    "Given a large array of numbers, find the top k frequent elements — describe your approach.",
    "How would you detect cycles in a graph? Explain your algorithm of choice.",
    "Design an efficient algorithm to merge k sorted lists.",
    "Explain dynamic programming with an example you implemented.",
    "How do you optimize a slow query or algorithmic bottleneck?",
    "The ‘two-sum’ problem — how would you solve it and what’s the complexity?",
    "How would you find the lowest common ancestor in a binary tree?",
    "Describe a time you had to optimize time or space complexity in production."
  ],
  "Security & Risk": [
    "How would you secure an API endpoint exposed to the public?",
    "Explain how you would do threat modeling for a new service.",
    "Describe a time when you found a security vulnerability and how you fixed it.",
    "How do you protect data at rest and in transit?",
    "What are common web vulnerabilities (e.g. XSS, CSRF, SQL injection)?",
    "How would you enforce role-based access control (RBAC) in a microservices architecture?",
    "How do you keep secrets (API keys, DB passwords) secure in deployment?",
    "How would you respond to a data breach?"
  ],
  "Leadership & Collaboration": [
    "Tell me about a time you led a cross-functional team to deliver a major project.",
    "How do you resolve disagreements between engineers and stakeholders?",
    "Describe how you set vision and goals for your team.",
    "How do you ensure accountability and ownership among your team members?",
    "Tell me about a time you needed to escalate an issue — how did you manage it?",
    "How do you ensure effective communication across distributed teams?",
    "Describe how you onboard new team members and get them productive.",
    "How do you coach or mentor to grow technical or soft skills in your team?"
  ]
};

// Generate full list of questions
const allQuestions = [];
roles.forEach(role => {
  categories.forEach(category => {
    // Only add if we have questions for that category
    const qlist = questionsPerCategory[category];
    if (qlist && qlist.length) {
      qlist.forEach(text => {
        allQuestions.push({
          role,
          category,
          text
        });
      });
    }
  });
});

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(async () => {
    // Optionally: you can filter or limit questions per role-category if too many
    await Question.deleteMany({});
    await Question.insertMany(allQuestions);
    console.log(`Seeded ${allQuestions.length} questions successfully!`);
    process.exit();
  })
  .catch(err => {
    console.error("Database connection error:", err);
    process.exit(1);
  });
