export const getSampleDataForTemplate = (slug) => {
  const baseContact = {
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    linkedin: 'linkedin.com/in/johndoe',
    github: 'github.com/johndoe',
    website: 'johndoe.dev'
  };

  switch (slug) {
    case 'software-engineer':
    case 'modern-ats':
    case 'two-column':
      return {
        title: 'Senior Software Engineer',
        personalInfo: {
          name: 'Alex Developer',
          email: 'alex.dev@example.com',
          ...baseContact,
          summary: 'Results-driven Senior Software Engineer with 6+ years of experience in full-stack development, specializing in React, Node.js, and cloud architecture. Proven track record of scaling applications and mentoring junior developers.'
        },
        skills: ['JavaScript (ES6+)', 'TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Docker', 'AWS', 'GraphQL', 'CI/CD'],
        experience: [
          {
            company: 'Tech Solutions Inc.',
            position: 'Senior Full Stack Engineer',
            startDate: 'Jan 2021',
            endDate: 'Present',
            current: true,
            description: '• Architected and migrated a monolithic legacy application to a microservices architecture using Node.js and Docker, reducing deployment time by 40%.\n• Mentored a team of 4 junior developers through code reviews and pair programming.\n• Optimized database indexing strategy, improving query performance by 60%.'
          },
          {
            company: 'StartupHub',
            position: 'Software Engineer',
            startDate: 'Jun 2018',
            endDate: 'Dec 2020',
            current: false,
            description: '• Developed responsive frontend features using React and Redux, serving 50k+ daily active users.\n• Implemented RESTful APIs and integrated third-party payment gateways (Stripe).\n• Improved unit test coverage from 45% to 85% using Jest.'
          }
        ],
        education: [
          { school: 'University of California, Berkeley', degree: 'B.S.', fieldOfStudy: 'Computer Science', startDate: '2014', endDate: '2018' }
        ],
        projects: [
          { name: 'E-commerce Platform', technologies: ['React', 'Node.js', 'MongoDB'], description: 'Built a full-featured e-commerce platform with real-time inventory management and scalable cart system.' }
        ]
      };

    case 'data-analyst':
      return {
        title: 'Data Analyst',
        personalInfo: {
          name: 'Sarah Data',
          email: 'sarah.data@example.com',
          ...baseContact,
          linkedin: 'linkedin.com/in/sarahdata',
          github: '',
          summary: 'Detail-oriented Data Analyst with 4 years of experience turning complex datasets into actionable business insights. Expert in SQL, Python, and Tableau.'
        },
        skills: ['SQL', 'Python (Pandas, NumPy)', 'Tableau', 'Power BI', 'R', 'Statistical Analysis', 'A/B Testing', 'Data Visualization'],
        experience: [
          {
            company: 'Fintech Corp',
            position: 'Data Analyst',
            startDate: 'Mar 2020',
            endDate: 'Present',
            current: true,
            description: '• Built automated Tableau dashboards that reduced reporting time by 15 hours per week.\n• Conducted A/B tests on onboarding flows, leading to a 12% increase in conversion rate.\n• Analyzed customer churn patterns using SQL and Python to identify key drop-off points.'
          }
        ],
        education: [
          { school: 'Stanford University', degree: 'M.S.', fieldOfStudy: 'Statistics', startDate: '2018', endDate: '2020' }
        ],
        projects: []
      };

    case 'ui-ux-designer':
    case 'creative':
      return {
        title: 'UI/UX Designer',
        personalInfo: {
          name: 'Mia Design',
          email: 'mia.design@example.com',
          ...baseContact,
          website: 'miadesign.portfolio',
          summary: 'Creative UI/UX Designer passionate about crafting intuitive, user-centric digital experiences. Strong background in user research, wireframing, and high-fidelity prototyping.'
        },
        skills: ['Figma', 'Adobe XD', 'Sketch', 'User Research', 'Wireframing', 'Prototyping', 'HTML/CSS', 'Design Systems'],
        experience: [
          {
            company: 'Creative Agency',
            position: 'Lead UI/UX Designer',
            startDate: 'Feb 2019',
            endDate: 'Present',
            current: true,
            description: '• Led the redesign of a major e-commerce app, increasing user engagement by 25%.\n• Established and maintained a comprehensive design system used across 4 product lines.\n• Conducted weekly user testing sessions to iterate on interaction flows.'
          }
        ],
        education: [
          { school: 'Rhode Island School of Design', degree: 'B.F.A.', fieldOfStudy: 'Graphic Design', startDate: '2015', endDate: '2019' }
        ],
        projects: []
      };

    case 'marketing':
    case 'product-manager':
    case 'sales':
      return {
        title: 'Product Marketing Manager',
        personalInfo: {
          name: 'James Market',
          email: 'james.mkt@example.com',
          ...baseContact,
          summary: 'Strategic Product Marketing Manager with a proven track record of launching successful SaaS products. Skilled in market research, GTM strategy, and cross-functional leadership.'
        },
        skills: ['Go-to-Market Strategy', 'Market Research', 'Product Positioning', 'SEO/SEM', 'Content Strategy', 'HubSpot', 'Google Analytics'],
        experience: [
          {
            company: 'SaaS Global',
            position: 'Product Marketing Manager',
            startDate: 'Aug 2019',
            endDate: 'Present',
            current: true,
            description: '• Orchestrated the launch of 3 major product features, resulting in $2M+ in pipeline generation.\n• Developed comprehensive buyer personas and tailored messaging that increased email CTR by 15%.\n• Managed a $500k quarterly digital marketing budget with an ROI of 300%.'
          }
        ],
        education: [
          { school: 'Northwestern University', degree: 'B.A.', fieldOfStudy: 'Marketing', startDate: '2015', endDate: '2019' }
        ],
        projects: []
      };
      
    case 'hr':
      return {
        title: 'Human Resources Manager',
        personalInfo: {
          name: 'Emma Human',
          email: 'emma.hr@example.com',
          ...baseContact,
          summary: 'Dedicated HR Manager with 7 years of experience fostering positive workplace cultures and streamlining talent acquisition. Passionate about employee development and retention.'
        },
        skills: ['Talent Acquisition', 'Employee Relations', 'Performance Management', 'HRIS (Workday, BambooHR)', 'Onboarding', 'Compliance'],
        experience: [
          {
            company: 'Enterprise Corp',
            position: 'HR Manager',
            startDate: 'May 2018',
            endDate: 'Present',
            current: true,
            description: '• Redesigned the onboarding process, increasing new hire retention by 20% in the first 90 days.\n• Managed full-cycle recruitment for over 50 roles annually across various departments.\n• Implemented a new performance review system using Workday.'
          }
        ],
        education: [
          { school: 'Michigan State University', degree: 'B.S.', fieldOfStudy: 'Human Resources', startDate: '2014', endDate: '2018' }
        ],
        projects: []
      };

    case 'finance':
    case 'mba':
    case 'executive':
    case 'corporate':
    case 'professional':
      return {
        title: 'Financial Analyst',
        personalInfo: {
          name: 'Robert Finance',
          email: 'robert.fin@example.com',
          ...baseContact,
          summary: 'Analytical Financial Analyst with expertise in financial modeling, forecasting, and variance analysis. Proven ability to translate complex financial data into strategic recommendations.'
        },
        skills: ['Financial Modeling', 'Variance Analysis', 'Forecasting', 'Excel (Advanced)', 'ERP Systems (SAP)', 'Corporate Finance', 'Valuation'],
        experience: [
          {
            company: 'Global Banking Group',
            position: 'Senior Financial Analyst',
            startDate: 'Jul 2017',
            endDate: 'Present',
            current: true,
            description: '• Developed dynamic financial models for M&A targets, contributing to a $50M acquisition.\n• Streamlined the monthly forecasting process, reducing turnaround time by 3 days.\n• Presented quarterly variance analysis reports to C-suite executives.'
          }
        ],
        education: [
          { school: 'Wharton School', degree: 'MBA', fieldOfStudy: 'Finance', startDate: '2015', endDate: '2017' }
        ],
        projects: []
      };

    case 'healthcare':
      return {
        title: 'Registered Nurse',
        personalInfo: {
          name: 'Olivia Health',
          email: 'olivia.rn@example.com',
          ...baseContact,
          summary: 'Compassionate Registered Nurse with 5+ years of experience in fast-paced ER environments. Dedicated to providing exceptional patient care and collaborating effectively with multidisciplinary teams.'
        },
        skills: ['Patient Assessment', 'Triage', 'EMR/EHR (Epic)', 'Medication Administration', 'BLS & ACLS Certified', 'Critical Care'],
        experience: [
          {
            company: 'City General Hospital',
            position: 'Emergency Room RN',
            startDate: 'Sep 2019',
            endDate: 'Present',
            current: true,
            description: '• Provided high-quality care to 15+ acute patients per shift in a Level 1 Trauma Center.\n• Trained and precepted 4 new graduate nurses.\n• Recognized with the "Excellence in Care" award for outstanding patient advocacy in 2021.'
          }
        ],
        education: [
          { school: 'New York University', degree: 'B.S.N.', fieldOfStudy: 'Nursing', startDate: '2015', endDate: '2019' }
        ],
        projects: []
      };

    case 'teacher':
    case 'student':
    case 'fresher':
    case 'minimal':
    default:
      return {
        title: 'Entry Level Professional',
        personalInfo: {
          name: 'Taylor Fresh',
          email: 'taylor.fresh@example.com',
          ...baseContact,
          summary: 'Highly motivated and adaptable recent graduate seeking to leverage strong analytical and communication skills in a dynamic professional environment. Fast learner with a passion for continuous growth.'
        },
        skills: ['Project Management', 'Data Analysis', 'Microsoft Office Suite', 'Public Speaking', 'Team Collaboration', 'Research'],
        experience: [
          {
            company: 'University Administration',
            position: 'Student Assistant',
            startDate: 'Sep 2020',
            endDate: 'May 2023',
            current: false,
            description: '• Managed front desk operations, answering 50+ inquiries daily.\n• Organized and coordinated 5 major student orientation events.\n• Updated and maintained student records using internal databases with 100% accuracy.'
          }
        ],
        education: [
          { school: 'State University', degree: 'B.A.', fieldOfStudy: 'Communications', startDate: '2019', endDate: '2023' }
        ],
        projects: [
          { name: 'Senior Capstone Project', description: 'Led a team of 4 to research and present a comprehensive marketing strategy for a local non-profit.' }
        ]
      };
  }
};
