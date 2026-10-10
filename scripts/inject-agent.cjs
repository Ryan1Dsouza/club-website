const fs = require('fs');

const agentData = [
  {
    name: "Poorvik Kuthyala",
    quote: "turning coffee into algorithms",
    socials: { linkedin: "https://www.linkedin.com/in/poorvik-kuthyala", github: "https://github.com/poorvikkg", leetcode: "https://leetcode.com/u/Poorvikkg/", website: "https://share.google/1Ql7r13HdAmNspLeY" }
  },
  {
    name: "Dinol Castelino",
    quote: "Running on caffeine, GPUs, and La Pasión.",
    socials: { linkedin: "https://www.linkedin.com/in/dinol-castelino-57053631a", github: "https://GitHub.com/Dinol-ino" }
  },
  {
    name: "Joylin Mathias",
    quote: "Keeping the team in sync while ideas find their rhythm",
    socials: { linkedin: "https://www.linkedin.com/in/joylin-mathias", github: "https://github.com/joylinmhs" }
  },
  {
    name: "Nishanth Uday Naik",
    quote: "Learning AI, Leading Strategy",
    socials: { linkedin: "https://www.linkedin.com/in/nishanth-naik21", github: "https://github.com/Nishanthnaik21" }
  },
  {
    name: "Karthik",
    quote: "Trusted To Execute, No Cap",
    socials: { linkedin: "https://www.linkedin.com/in/karthik-ㅤ-4bab052a9", github: "https://github.com/karthik17-hub" }
  },
  {
    name: "Prajwal Gaonkar",
    quote: "Exploring questionable decisions with epsilon=1",
    socials: { linkedin: "https://www.linkedin.com/in/prajwal-gaonkar-a57586195", github: "https://github.com/OP-Prajwal", leetcode: "https://leetcode.com/u/Prajwal_S_07/" }
  },
  {
    name: "Mohit",
    quote: "May your gradients never vanish",
    socials: { linkedin: "https://www.linkedin.com/in/mohit---7838b631a", github: "https://github.com/mohit782005", website: "https://www.kaggle.com/mohit78241" }
  },
  {
    name: "Rakshith Dsouza",
    quote: "Nothing really...",
    socials: { linkedin: "https://www.linkedin.com/in/rakshith-d-souza-575b34335", github: "https://github.com/Knight-eGithub", leetcode: "https://leetcode.com/u/Knight-eLeetCode" }
  },
  {
    name: "Navya Suvarna",
    quote: "Outrunning time limits daily.",
    socials: { linkedin: "https://www.linkedin.com/in/navya-y-suvarna/", github: "https://github.com/navya-y-suvarna", leetcode: "https://leetcode.com/u/Navya_Suvarna/", website: "https://www.geeksforgeeks.org/profile/navyasuvzo4b?tab=activity" }
  },
  {
    name: "Deona Rego",
    quote: "Give me a crowd, a mic and a little chaos- I'll turn it into an event",
    socials: { linkedin: "https://www.linkedin.com/in/deona-rego-0b2002323", github: "https://github.com/deonahub" }
  },
  {
    name: "Sweedan Cardoza",
    quote: "Ballin in and off the field",
    socials: { linkedin: "https://www.linkedin.com/in/sweedan23" }
  },
  {
    name: "Manvitha Lewis",
    quote: "Thinking like a user, designing like a creator.",
    socials: { linkedin: "https://in.linkedin.com/in/manvitha-lewis", github: "https://github.com/manvithalewis" }
  },
  {
    name: "Salim Pallikal",
    quote: "inspired to innovate",
    socials: { linkedin: "https://www.linkedin.com/in/mahammad-salim", github: "https://github.com/mahammad-salim7899" }
  },
  {
    name: "Nikhitha Dsouza",
    quote: "Debugging, one existential crisis at a time.",
    socials: { linkedin: "https://www.linkedin.com/in/nikhitha-risha-dsouza", github: "https://github.com/nikhrd" }
  },
  {
    name: "Aisahath Saniya",
    quote: "90% coffee, 10% code.",
    socials: { linkedin: "https://www.linkedin.com/in/ayesha-saniya-194b92294", github: "https://github.com/Ayeshasaniyaaaa" }
  }
];

const portraits = JSON.parse(fs.readFileSync('src/lib/team-portraits.json'));

for (const [key, value] of Object.entries(portraits)) {
  const nameMatch = key.match(/\/([^\/]+)\.avif$/);
  if (nameMatch) {
    let nameHint = nameMatch[1];
    if (nameHint === 'Sweeden') nameHint = 'Sweedan';
    
    const agentMember = agentData.find(s => s.name.includes(nameHint) || s.name.split(' ')[0] === nameHint);
    
    if (agentMember) {
      if (agentMember.quote) {
        value.tagline = agentMember.quote;
      }
      
      if (Object.keys(agentMember.socials).length > 0) {
        value.socials = agentMember.socials;
      } else {
        delete value.socials;
      }
    }
  }
}

fs.writeFileSync('src/lib/team-portraits.json', JSON.stringify(portraits, null, 2));
