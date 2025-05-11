import { IStorage } from './storage';
import bcrypt from 'bcryptjs';

export async function seedDatabase(storage: IStorage) {
  console.log('Seeding database with initial data...');
  
  // Create sample users
  const candidatePassword = await bcrypt.hash('Password123', 10);
  const recruiterPassword = await bcrypt.hash('Password123', 10);
  
  const candidateUser = await storage.createUser({
    email: 'candidate@example.com',
    password: 'Password123',
    firstName: 'Thabo',
    lastName: 'Ndlovu',
    role: 'candidate',
    language: 'english',
    whatsappNumber: '+27721234567',
    location: 'Cape Town, South Africa',
    consentGiven: true,
    emailVerified: true,
    profileComplete: true
  });
  
  const recruiterUser = await storage.createUser({
    email: 'recruiter@example.com',
    password: 'Password123',
    firstName: 'Sarah',
    lastName: 'Johnson',
    role: 'recruiter',
    language: 'english',
    whatsappNumber: '+27827654321',
    location: 'Johannesburg, South Africa',
    consentGiven: true,
    emailVerified: true,
    profileComplete: true
  });

  // Admin user
  const adminUser = await storage.createUser({
    email: 'admin@talentsyncza.com',
    password: 'Admin123',
    firstName: 'Admin',
    lastName: 'User',
    role: 'recruiter', // Using recruiter role for admin
    language: 'english',
    whatsappNumber: '+27831234567',
    location: 'Pretoria, South Africa',
    consentGiven: true,
    emailVerified: true,
    profileComplete: true
  });
  
  // Create candidate profile
  const candidateProfile = await storage.createCandidateProfile({
    userId: candidateUser.id,
    title: 'Full Stack Developer',
    summary: 'Passionate full stack developer with 5 years of experience building web applications using React, Node.js, and PostgreSQL.',
    skills: ['JavaScript', 'React', 'Node.js', 'TypeScript', 'PostgreSQL', 'AWS'],
    yearsOfExperience: 5,
    education: 'BSc Computer Science, University of Cape Town',
    portfolioLinks: ['https://github.com/thabondlovu', 'https://portfolio.thabondlovu.co.za'],
    resumeUrl: '/uploads/resume-thabo-ndlovu.pdf',
    racialGroup: 'black',
    gender: 'male',
    disabilityStatus: false,
    salary: 50000,
    isPremium: false
  });
  
  // Create company profile
  const companyProfile = await storage.createCompanyProfile({
    userId: recruiterUser.id,
    companyName: 'TechTalent Solutions',
    industry: 'Technology',
    description: 'TechTalent Solutions is a leading tech recruitment firm specializing in connecting top tech talent with innovative companies across South Africa.',
    website: 'https://techtalentsolutions.co.za',
    logo: '/uploads/techtalent-logo.png',
    bbbeeLevel: '1',
    companySize: '11-50',
    isPremium: true
  });

  // Admin company profile
  const adminCompanyProfile = await storage.createCompanyProfile({
    userId: adminUser.id,
    companyName: 'TalentSyncZA',
    industry: 'Technology',
    description: 'TalentSyncZA is an AI-driven recruitment platform for South Africa connecting job seekers and recruiters through private, skills-based matching with POPIA and B-BBEE compliance.',
    website: 'https://talentsyncza.com',
    logo: '/uploads/talentsyncza-logo.png',
    bbbeeLevel: '1',
    companySize: '11-50',
    isPremium: true
  });
  
  // Create jobs
  const job1 = await storage.createJob({
    recruiterId: recruiterUser.id,
    companyId: companyProfile.id,
    title: 'Senior React Developer',
    description: 'We are looking for a Senior React Developer to join our client\'s team in Cape Town. The ideal candidate will have 3+ years of experience with React and modern JavaScript.',
    location: 'Cape Town, South Africa',
    type: 'full-time',
    salary: 'R50,000 - R65,000 per month',
    skills: ['React', 'JavaScript', 'TypeScript', 'Redux', 'Node.js'],
    bbbeePreferred: true,
    remoteOk: true,
    active: true
  });
  
  const job2 = await storage.createJob({
    recruiterId: recruiterUser.id,
    companyId: companyProfile.id,
    title: 'Backend Developer (Node.js)',
    description: 'Our client is seeking a Backend Developer with strong Node.js experience to join their team in Johannesburg. This role involves building and maintaining microservices and APIs.',
    location: 'Johannesburg, South Africa',
    type: 'full-time',
    salary: 'R45,000 - R60,000 per month',
    skills: ['Node.js', 'Express', 'MongoDB', 'RESTful APIs', 'Docker'],
    bbbeePreferred: true,
    remoteOk: false,
    active: true
  });
  
  const job3 = await storage.createJob({
    recruiterId: recruiterUser.id,
    companyId: companyProfile.id,
    title: 'UI/UX Designer',
    description: 'Seeking a talented UI/UX Designer to create beautiful, intuitive interfaces for web and mobile applications. You\'ll work closely with our development team to bring designs to life.',
    location: 'Remote, South Africa',
    type: 'remote',
    salary: 'R40,000 - R55,000 per month',
    skills: ['UI Design', 'UX Design', 'Figma', 'Adobe XD', 'Prototyping'],
    bbbeePreferred: true,
    remoteOk: true,
    active: true
  });

  const job4 = await storage.createJob({
    recruiterId: adminUser.id,
    companyId: adminCompanyProfile.id,
    title: 'Full Stack Developer',
    description: 'Join TalentSyncZA to build next-generation recruitment technology. As a Full Stack Developer, you will work on our core platform, implementing new features and scaling our infrastructure.',
    location: 'Pretoria, South Africa',
    type: 'full-time',
    salary: 'R45,000 - R60,000 per month',
    skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'AWS'],
    bbbeePreferred: true,
    remoteOk: true,
    active: true
  });
  
  // Create match between candidate and job
  const match = await storage.createMatch({
    jobId: job1.id,
    candidateId: candidateUser.id,
    recruiterId: recruiterUser.id,
    status: 'pending',
    score: 85,
    unlockedByCandidate: false,
    unlockedByRecruiter: false,
    candidateNotes: null,
    recruiterNotes: null
  });

  // Create skill assessments
  const jsAssessment = await storage.createSkillAssessment({
    title: 'JavaScript Proficiency Assessment',
    skill: 'JavaScript',
    description: 'Test your knowledge of JavaScript fundamentals, including closures, promises, ES6 features, and more.',
    type: 'quiz',
    difficulty: 'intermediate',
    timeLimit: 30,
    passingScore: 70,
    isActive: true
  });
  
  // Add questions to the JavaScript assessment
  await storage.createAssessmentQuestion({
    assessmentId: jsAssessment.id,
    questionText: 'What is the output of: console.log(typeof null);',
    options: JSON.stringify(['null', 'object', 'undefined', 'number']),
    correctAnswer: 'object',
    explanation: 'In JavaScript, typeof null returns "object", which is considered a bug in the language.',
    points: 1,
    order: 1
  });
  
  await storage.createAssessmentQuestion({
    assessmentId: jsAssessment.id,
    questionText: 'Which method is used to serialize an object into a JSON string?',
    options: JSON.stringify(['JSON.parse()', 'JSON.stringify()', 'JSON.toObject()', 'JSON.serialize()']),
    correctAnswer: 'JSON.stringify()',
    explanation: 'JSON.stringify() converts a JavaScript object into a JSON string.',
    points: 1,
    order: 2
  });
  
  await storage.createAssessmentQuestion({
    assessmentId: jsAssessment.id,
    questionText: 'What is a closure in JavaScript?',
    options: JSON.stringify([
      'A function that has access to variables in its lexical scope',
      'A way to close a browser window using JavaScript',
      'A method to terminate a loop',
      'A data structure to store key-value pairs'
    ]),
    correctAnswer: 'A function that has access to variables in its lexical scope',
    explanation: 'A closure is a function that has access to variables in its own scope, the scope of the outer function, and global variables.',
    points: 1,
    order: 3
  });
  
  await storage.createAssessmentQuestion({
    assessmentId: jsAssessment.id,
    questionText: 'What does the "this" keyword refer to in JavaScript?',
    options: JSON.stringify([
      'It refers to the current function',
      'It refers to the object that the function is a property of',
      'It refers to the global window object always',
      'It refers to the parent object in inheritance'
    ]),
    correctAnswer: 'It refers to the object that the function is a property of',
    explanation: 'The value of "this" depends on how a function is called. In method calls, it refers to the object the method belongs to.',
    points: 1,
    order: 4
  });
  
  await storage.createAssessmentQuestion({
    assessmentId: jsAssessment.id,
    questionText: 'What is the correct way to check if a variable is an array?',
    options: JSON.stringify([
      'typeof variable === "array"',
      'variable instanceof Array',
      'Array.isArray(variable)',
      'variable.isArray()'
    ]),
    correctAnswer: 'Array.isArray(variable)',
    explanation: 'Array.isArray() is the most reliable way to check if a variable is an array in JavaScript.',
    points: 1,
    order: 5
  });
  
  // Create React assessment
  const reactAssessment = await storage.createSkillAssessment({
    title: 'React Developer Assessment',
    skill: 'React',
    description: 'Validate your React skills with this assessment covering components, hooks, state management, and performance optimization.',
    type: 'quiz',
    difficulty: 'intermediate',
    timeLimit: 25,
    passingScore: 70,
    isActive: true
  });
  
  // Add questions to the React assessment
  await storage.createAssessmentQuestion({
    assessmentId: reactAssessment.id,
    questionText: 'What is the correct way to create a functional component in React?',
    options: JSON.stringify([
      'function Component() { return <div>Hello</div>; }',
      'class Component extends React.Component { render() { return <div>Hello</div>; } }',
      'const Component = function() { render(<div>Hello</div>); }',
      'const Component = <div>Hello</div>;'
    ]),
    correctAnswer: 'function Component() { return <div>Hello</div>; }',
    explanation: 'In React, a functional component is a JavaScript function that returns JSX.',
    points: 1,
    order: 1
  });
  
  await storage.createAssessmentQuestion({
    assessmentId: reactAssessment.id,
    questionText: 'Which hook is used to perform side effects in a functional component?',
    options: JSON.stringify(['useState', 'useEffect', 'useContext', 'useReducer']),
    correctAnswer: 'useEffect',
    explanation: 'useEffect is the hook used for performing side effects like data fetching, subscriptions, or DOM manipulations.',
    points: 1,
    order: 2
  });
  
  await storage.createAssessmentQuestion({
    assessmentId: reactAssessment.id,
    questionText: 'What is the purpose of keys in React lists?',
    options: JSON.stringify([
      'To style list items differently',
      'To help React identify which items have changed, are added, or are removed',
      'To create references to DOM elements',
      'To enable event delegation on list items'
    ]),
    correctAnswer: 'To help React identify which items have changed, are added, or are removed',
    explanation: 'Keys help React identify which items have changed, are added, or are removed. Keys should be given to the elements inside the array to give the elements a stable identity.',
    points: 1,
    order: 3
  });
  
  await storage.createAssessmentQuestion({
    assessmentId: reactAssessment.id,
    questionText: 'What is the purpose of React.memo()?',
    options: JSON.stringify([
      'To memorize variables across renders',
      'To create a memoized version of a component that only renders if props change',
      'To cache API responses',
      'To record a component\'s render history'
    ]),
    correctAnswer: 'To create a memoized version of a component that only renders if props change',
    explanation: 'React.memo is a higher-order component that memoizes a component, preventing unnecessary re-renders if props haven\'t changed.',
    points: 1,
    order: 4
  });
  
  await storage.createAssessmentQuestion({
    assessmentId: reactAssessment.id,
    questionText: 'In which lifecycle method would you make API calls in class components?',
    options: JSON.stringify(['constructor', 'componentDidMount', 'render', 'componentWillUnmount']),
    correctAnswer: 'componentDidMount',
    explanation: 'componentDidMount is called after the component is mounted and is the appropriate place to make API calls in class components.',
    points: 1,
    order: 5
  });
  
  // Create Node.js assessment
  const nodeAssessment = await storage.createSkillAssessment({
    title: 'Node.js Backend Assessment',
    skill: 'Node.js',
    description: 'Test your knowledge of Node.js, Express, middleware, async programming, and backend concepts.',
    type: 'quiz',
    difficulty: 'intermediate',
    timeLimit: 25,
    passingScore: 70,
    isActive: true
  });
  
  // Add questions to the Node.js assessment
  await storage.createAssessmentQuestion({
    assessmentId: nodeAssessment.id,
    questionText: 'What is the event loop in Node.js?',
    options: JSON.stringify([
      'A UI component for handling user interactions',
      'A mechanism that allows Node.js to perform non-blocking I/O operations',
      'A data structure for storing events',
      'A loop that continuously checks for new HTTP requests'
    ]),
    correctAnswer: 'A mechanism that allows Node.js to perform non-blocking I/O operations',
    explanation: 'The event loop allows Node.js to perform non-blocking I/O operations despite JavaScript being single-threaded.',
    points: 1,
    order: 1
  });
  
  await storage.createAssessmentQuestion({
    assessmentId: nodeAssessment.id,
    questionText: 'What does the middleware function express.json() do?',
    options: JSON.stringify([
      'Converts JSON to JavaScript objects',
      'Parses incoming request bodies with JSON payloads',
      'Returns responses in JSON format',
      'Validates JSON schemas'
    ]),
    correctAnswer: 'Parses incoming request bodies with JSON payloads',
    explanation: 'express.json() is a middleware function that parses incoming requests with JSON payloads and makes the parsed data available on req.body.',
    points: 1,
    order: 2
  });
  
  await storage.createAssessmentQuestion({
    assessmentId: nodeAssessment.id,
    questionText: 'Which of the following is NOT a core module in Node.js?',
    options: JSON.stringify(['fs', 'http', 'path', 'express']),
    correctAnswer: 'express',
    explanation: 'Express is a popular third-party framework for Node.js. fs, http, and path are core modules built into Node.js.',
    points: 1,
    order: 3
  });
  
  await storage.createAssessmentQuestion({
    assessmentId: nodeAssessment.id,
    questionText: 'How do you handle asynchronous operations in modern Node.js applications?',
    options: JSON.stringify([
      'Only using callbacks',
      'Using nested setTimeout calls',
      'Using Promises and async/await',
      'Converting all operations to synchronous calls'
    ]),
    correctAnswer: 'Using Promises and async/await',
    explanation: 'Modern Node.js applications typically use Promises and async/await syntax to handle asynchronous operations in a more readable and maintainable way.',
    points: 1,
    order: 4
  });
  
  await storage.createAssessmentQuestion({
    assessmentId: nodeAssessment.id,
    questionText: 'What is the purpose of package.json in a Node.js application?',
    options: JSON.stringify([
      'To store application data',
      'To configure Node.js settings',
      'To define routes and endpoints',
      'To manage project metadata and dependencies'
    ]),
    correctAnswer: 'To manage project metadata and dependencies',
    explanation: 'package.json is a manifest file that contains metadata about the project and its dependencies, scripts, version information, and more.',
    points: 1,
    order: 5
  });

  // Create a skill badge for the candidate
  await storage.createSkillBadge({
    userId: candidateUser.id,
    skill: 'JavaScript',
    level: 'intermediate',
    expiresAt: null,
    attemptId: null,
    isVerified: true
  });

  console.log('Database seeded successfully!');
  return {
    candidateUser,
    recruiterUser,
    adminUser,
    jobs: [job1, job2, job3, job4],
    assessments: [jsAssessment, reactAssessment, nodeAssessment]
  };
}