// seedQuestions.js
const mongoose = require("mongoose");
const Question = require("./models/Question");
require("dotenv").config();

// Updated Roles to match your React app
const roles = [
  "AI Engineer",
  "Machine Learning Engineer", 
  "Deep Learning Specialist",
  "AI Research Scientist",
  "Cloud Architect",
  "AWS Solutions Engineer",
  "DevOps Cloud Engineer",
  "Azure Administrator",
  "Security Analyst",
  "Ethical Hacker",
  "Network Security Engineer",
  "Incident Response Specialist",
  "Data Scientist",
  "Data Analyst",
  "Business Intelligence Engineer",
  "Data Engineer",
  "Network Administrator",
  "Network Engineer",
  "System Engineer",
  "Network Security Specialist",
  "Android Developer",
  "iOS Developer",
  "React Native Developer",
  "Flutter Developer",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Web Application Engineer",
  "DevOps Engineer",
  "Release Manager",
  "Site Reliability Engineer (SRE)",
  "Build and Deployment Engineer",
  "Blockchain Developer",
  "Smart Contract Engineer",
  "Crypto Analyst",
  "Blockchain Architect",
  "ML Engineer",
  "Data Scientist (ML Focus)",
  "AI Model Developer",
  "Research Data Engineer"
];

// Updated Categories to match your React app
const categories = [
  "Artificial Intelligence",
  "Cloud Computing", 
  "Cybersecurity",
  "Data Science",
  "Networking",
  "Mobile App Development",
  "Web Development",
  "DevOps",
  "Blockchain",
  "Machine Learning"
];

// Enhanced questions per category with role-specific context
const questionsPerCategory = {
  "Artificial Intelligence": [
    "Explain the difference between supervised and unsupervised learning with real-world examples.",
    "How would you handle overfitting in a deep neural network?",
    "Describe your experience with TensorFlow, PyTorch, or other AI frameworks.",
    "What are some ethical considerations when deploying AI systems in production?",
    "How do you approach hyperparameter tuning for complex models?",
    "Explain the transformer architecture and its impact on NLP.",
    "What strategies do you use for data preprocessing in AI projects?",
    "How do you ensure model interpretability and explainability?",
    "Describe a challenging AI project you worked on and your contribution.",
    "What's your experience with computer vision or natural language processing?"
  ],
  "Cloud Computing": [
    "Compare AWS, Azure, and GCP for enterprise cloud solutions.",
    "How do you design for high availability and fault tolerance in cloud architecture?",
    "Describe your experience with container orchestration (Kubernetes, ECS).",
    "What strategies do you use for cloud cost optimization?",
    "How do you implement disaster recovery and backup strategies in cloud?",
    "Explain your approach to cloud security and compliance.",
    "What's your experience with serverless computing (Lambda, Azure Functions)?",
    "How do you monitor and troubleshoot cloud infrastructure?",
    "Describe a cloud migration project you were involved in.",
    "What are the key considerations for multi-cloud strategies?"
  ],
  "Cybersecurity": [
    "Explain the CIA triad and how you implement it in practice.",
    "How would you conduct a vulnerability assessment and penetration test?",
    "Describe your experience with SIEM tools and security monitoring.",
    "What are the latest trends in cybersecurity threats and defenses?",
    "How do you ensure compliance with security standards (ISO 27001, SOC 2)?",
    "Explain your approach to incident response and recovery.",
    "What's your experience with network security and firewall configuration?",
    "How do you implement identity and access management (IAM)?",
    "Describe a security vulnerability you discovered and how you fixed it.",
    "What strategies do you use for security awareness training?"
  ],
  "Data Science": [
    "Explain the CRISP-DM methodology and your experience with it.",
    "How do you handle missing data and outliers in your datasets?",
    "Describe your experience with SQL and NoSQL databases.",
    "What metrics do you use to evaluate model performance?",
    "How do you communicate technical findings to non-technical stakeholders?",
    "What's your experience with data visualization tools (Tableau, Power BI)?",
    "How do you approach feature engineering and selection?",
    "Describe a time when your data analysis revealed unexpected insights.",
    "What's your experience with big data technologies (Spark, Hadoop)?",
    "How do you ensure data quality and governance?"
  ],
  "Networking": [
    "Explain the OSI model and its practical importance.",
    "How do you troubleshoot network connectivity issues?",
    "Describe your experience with routing protocols (BGP, OSPF).",
    "What strategies do you use for network security and monitoring?",
    "How do you design scalable network infrastructure?",
    "Explain your experience with VPNs and remote access solutions.",
    "What's your approach to network capacity planning?",
    "Describe a complex network issue you resolved.",
    "How do you ensure network reliability and performance?",
    "What's your experience with SD-WAN and cloud networking?"
  ],
  "Mobile App Development": [
    "Compare native vs cross-platform development approaches.",
    "How do you optimize mobile app performance and battery usage?",
    "Describe your experience with mobile app architecture patterns (MVVM, MVC).",
    "What strategies do you use for mobile app testing?",
    "How do you handle offline functionality and data synchronization?",
    "Explain your approach to mobile security and data protection.",
    "What's your experience with app store deployment and compliance?",
    "How do you implement push notifications and background processing?",
    "Describe a challenging mobile app feature you implemented.",
    "What trends do you see in mobile development?"
  ],
  "Web Development": [
    "Explain the difference between REST and GraphQL APIs.",
    "How do you optimize website performance and Core Web Vitals?",
    "Describe your experience with modern frontend frameworks (React, Vue, Angular).",
    "What strategies do you use for web application security?",
    "How do you ensure cross-browser compatibility?",
    "Explain your approach to responsive web design.",
    "What's your experience with backend development and APIs?",
    "How do you implement authentication and authorization?",
    "Describe a complex web application you built.",
    "What's your experience with web accessibility (a11y)?"
  ],
  "DevOps": [
    "Explain the CI/CD pipeline you've implemented and its benefits.",
    "How do you monitor application performance and infrastructure?",
    "Describe your experience with infrastructure as code (Terraform, CloudFormation).",
    "What strategies do you use for container security?",
    "How do you handle configuration management?",
    "Explain your approach to incident management and post-mortems.",
    "What's your experience with logging and monitoring tools?",
    "How do you ensure high availability and disaster recovery?",
    "Describe a production incident you resolved.",
    "What metrics do you track for DevOps success?"
  ],
  "Blockchain": [
    "Explain the difference between proof-of-work and proof-of-stake.",
    "How do you ensure security in smart contract development?",
    "Describe your experience with blockchain platforms (Ethereum, Solana).",
    "What are the challenges of blockchain scalability?",
    "How do you approach decentralized application (dApp) architecture?",
    "Explain your experience with cryptocurrency and token standards.",
    "What's your approach to blockchain security audits?",
    "How do you handle gas optimization in Ethereum?",
    "Describe a smart contract you developed.",
    "What trends do you see in blockchain technology?"
  ],
  "Machine Learning": [
    "Explain the bias-variance tradeoff with practical examples.",
    "How do you select the right algorithm for a machine learning problem?",
    "Describe your experience with feature engineering techniques.",
    "What strategies do you use for model deployment and serving?",
    "How do you handle imbalanced datasets?",
    "Explain your experience with deep learning architectures.",
    "What's your approach to A/B testing for ML models?",
    "How do you ensure model fairness and avoid bias?",
    "Describe an end-to-end ML project you worked on.",
    "What's your experience with MLOps practices?"
  ]
};

// Role-specific additional questions
const roleSpecificQuestions = {
  "AI Engineer": [
    "How do you approach building AI systems that can learn continuously?",
    "What's your experience with reinforcement learning?",
    "How do you handle uncertainty in AI model predictions?"
  ],
  "Machine Learning Engineer": [
    "Describe your experience with model deployment and monitoring.",
    "How do you optimize models for production environments?",
    "What's your experience with distributed training?"
  ],
  "Cloud Architect": [
    "How do you design multi-region cloud architectures?",
    "What's your approach to cloud migration strategy?",
    "How do you evaluate and select cloud services?"
  ],
  "Data Scientist": [
    "How do you approach experimental design and hypothesis testing?",
    "What's your experience with statistical modeling?",
    "How do you communicate complex data insights effectively?"
  ],
  "Frontend Developer": [
    "How do you optimize React application performance?",
    "What's your experience with state management solutions?",
    "How do you ensure code quality in frontend development?"
  ],
  "Backend Developer": [
    "How do you design scalable API architectures?",
    "What's your experience with database optimization?",
    "How do you handle concurrent requests and race conditions?"
  ],
  "DevOps Engineer": [
    "How do you implement GitOps practices?",
    "What's your experience with Kubernetes in production?",
    "How do you handle secrets management?"
  ]
};

// Generate full list of questions
const allQuestions = [];

roles.forEach(role => {
  categories.forEach(category => {
    const baseQuestions = questionsPerCategory[category] || [];
    const roleSpecific = roleSpecificQuestions[role] || [];
    
    // Combine base category questions with role-specific questions
    const allCategoryQuestions = [...baseQuestions, ...roleSpecific];
    
    if (allCategoryQuestions.length > 0) {
      allCategoryQuestions.forEach(text => {
        allQuestions.push({
          role,
          category,
          text,
          difficulty: getRandomDifficulty(),
          tags: generateTags(role, category)
        });
      });
    }
  });
});

// Helper function to assign random difficulty
function getRandomDifficulty() {
  const difficulties = ['easy', 'medium', 'hard'];
  return difficulties[Math.floor(Math.random() * difficulties.length)];
}

// Helper function to generate relevant tags
function generateTags(role, category) {
  const tagMap = {
    "Artificial Intelligence": ["ai", "machine-learning", "neural-networks", "deep-learning"],
    "Cloud Computing": ["cloud", "aws", "azure", "devops", "scalability"],
    "Cybersecurity": ["security", "infosec", "networking", "encryption"],
    "Data Science": ["data", "analytics", "python", "sql", "statistics"],
    "Networking": ["networking", "tcp-ip", "security", "infrastructure"],
    "Mobile App Development": ["mobile", "ios", "android", "react-native", "flutter"],
    "Web Development": ["web", "javascript", "react", "nodejs", "api"],
    "DevOps": ["devops", "ci-cd", "docker", "kubernetes", "automation"],
    "Blockchain": ["blockchain", "crypto", "smart-contracts", "web3"],
    "Machine Learning": ["ml", "python", "tensorflow", "pytorch", "data-science"]
  };
  
  return tagMap[category] || [category.toLowerCase()];
}

// Database connection and seeding
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(async () => {
    console.log("Connected to MongoDB...");
    
    // Clear existing questions
    await Question.deleteMany({});
    console.log("Cleared existing questions");
    
    // Insert new questions in batches to avoid timeout
    const batchSize = 100;
    for (let i = 0; i < allQuestions.length; i += batchSize) {
      const batch = allQuestions.slice(i, i + batchSize);
      await Question.insertMany(batch);
      console.log(`Inserted batch ${Math.floor(i/batchSize) + 1}`);
    }
    
    console.log(`✅ Seeded ${allQuestions.length} questions successfully!`);
    
    // Verify the data
    const count = await Question.countDocuments();
    console.log(`📊 Total questions in database: ${count}`);
    
    // Show breakdown by category
    const categoryBreakdown = await Question.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } }
    ]);
    
    console.log("\n📈 Questions by category:");
    categoryBreakdown.forEach(item => {
      console.log(`   ${item._id}: ${item.count} questions`);
    });
    
    // Show breakdown by role
    const roleBreakdown = await Question.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } }
    ]);
    
    console.log("\n👥 Questions by role (sample):");
    roleBreakdown.slice(0, 10).forEach(item => {
      console.log(`   ${item._id}: ${item.count} questions`);
    });
    
    if (roleBreakdown.length > 10) {
      console.log(`   ... and ${roleBreakdown.length - 10} more roles`);
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error("❌ Database connection error:", err);
    process.exit(1);
  });