import { EnrichedContact } from "@/types";

// Data pools for randomization
const firstNames = [
  "Adekunle", "Chioma", "Emeka", "Fatima", "Gbenga", "Halima", "Ibrahim", "Joy",
  "Kwame", "Lola", "Oluwaseun", "Amara", "Tunde", "Ngozi", "Kofi", "Adaeze",
  "Chidi", "Funke", "Babatunde", "Aisha", "Yemi", "Nneka", "Segun", "Zainab",
  "Obinna", "Folake", "Ahmed", "Blessing", "Kayode", "Amina", "Dayo", "Chiamaka"
];

const lastNames = [
  "Ogunsanwo", "Nwosu", "Obiora", "Bello", "Adeyemi", "Hassan", "Muhammad", 
  "Akinwale", "Asante", "Omotosho", "Okonkwo", "Mensah", "Adebayo", "Okafor",
  "Owusu", "Eze", "Adeleke", "Nnamdi", "Akpan", "Olawale", "Diallo", "Okoro",
  "Abubakar", "Adeola", "Anyanwu", "Boateng", "Chukwu", "Danjuma", "Fashola"
];

const companies = [
  { name: "Flutterwave", domain: "flutterwave.com", industry: "Fintech", vertical: "Payments", size: "500-1000", stage: "Series D", amount: "$250M", revenue: "$100M-500M" },
  { name: "Paystack", domain: "paystack.com", industry: "Fintech", vertical: "Payments", size: "200-500", stage: "Acquired", amount: "$200M", revenue: "$50M-100M" },
  { name: "Kobo360", domain: "kobo360.com", industry: "Logistics", vertical: "Freight Tech", size: "100-200", stage: "Series B", amount: "$30M", revenue: "$10M-50M" },
  { name: "Moniepoint", domain: "moniepoint.com", industry: "Fintech", vertical: "Business Banking", size: "500-1000", stage: "Series C", amount: "$110M", revenue: "$50M-100M" },
  { name: "Farmcrowdy", domain: "farmcrowdy.com", industry: "AgriTech", vertical: "Farm Investment", size: "50-100", stage: "Series A", amount: "$5M", revenue: "$5M-10M" },
  { name: "Kuda Bank", domain: "kuda.com", industry: "Fintech", vertical: "Neobanking", size: "200-500", stage: "Series B", amount: "$55M", revenue: "$20M-50M" },
  { name: "PiggyVest", domain: "piggyvest.com", industry: "Fintech", vertical: "Savings", size: "100-200", stage: "Series A", amount: "$4.5M", revenue: "$10M-20M" },
  { name: "Carbon", domain: "carbon.ng", industry: "Fintech", vertical: "Digital Lending", size: "100-200", stage: "Series A", amount: "$8M", revenue: "$10M-20M" },
  { name: "MTN Ghana", domain: "mtn.com.gh", industry: "Telecom", vertical: "Mobile Money", size: "1000+", stage: "Public", amount: "N/A", revenue: "$1B+" },
  { name: "Andela", domain: "andela.com", industry: "Tech Talent", vertical: "Remote Hiring", size: "500-1000", stage: "Series E", amount: "$200M", revenue: "$50M-100M" },
  { name: "Chipper Cash", domain: "chippercash.com", industry: "Fintech", vertical: "Cross-border Payments", size: "200-500", stage: "Series C", amount: "$150M", revenue: "$30M-50M" },
  { name: "OPay", domain: "opay.com", industry: "Fintech", vertical: "Mobile Payments", size: "1000+", stage: "Series C", amount: "$400M", revenue: "$100M+" },
  { name: "Interswitch", domain: "interswitchgroup.com", industry: "Fintech", vertical: "Payments Infrastructure", size: "500-1000", stage: "Series B", amount: "$200M", revenue: "$100M-200M" },
  { name: "Jumia", domain: "jumia.com", industry: "E-commerce", vertical: "Marketplace", size: "1000+", stage: "Public", amount: "N/A", revenue: "$200M+" },
  { name: "Twiga Foods", domain: "twiga.com", industry: "AgriTech", vertical: "Food Distribution", size: "200-500", stage: "Series C", amount: "$50M", revenue: "$20M-50M" }
];

const jobTitles = [
  { title: "VP of Operations", seniority: "VP" },
  { title: "Head of Product", seniority: "Director" },
  { title: "CTO", seniority: "C-Level" },
  { title: "Director of Growth", seniority: "Director" },
  { title: "Head of Partnerships", seniority: "Head" },
  { title: "VP of Engineering", seniority: "VP" },
  { title: "Product Manager", seniority: "Manager" },
  { title: "Marketing Manager", seniority: "Manager" },
  { title: "Director of Mobile", seniority: "Director" },
  { title: "Head of Talent", seniority: "Head" },
  { title: "Chief Revenue Officer", seniority: "C-Level" },
  { title: "Head of Sales", seniority: "Head" },
  { title: "VP of Marketing", seniority: "VP" },
  { title: "Senior Engineer", seniority: "Senior" },
  { title: "Head of Finance", seniority: "Head" }
];

const techStacks = [
  ["Stripe", "Salesforce", "HubSpot", "AWS", "Segment"],
  ["React", "Node.js", "PostgreSQL", "Redis", "Intercom"],
  ["Python", "Django", "AWS", "MongoDB", "Twilio"],
  ["Salesforce", "Mixpanel", "Braze", "GCP", "Looker"],
  ["Kotlin", "Swift", "PostgreSQL", "Kubernetes", "Datadog"],
  ["React Native", "Python", "AWS", "Firebase", "Amplitude"],
  ["Android", "iOS", "Python", "AWS", "Clevertap"],
  ["Oracle", "SAP", "Ericsson", "Huawei", "Salesforce"],
  ["Greenhouse", "Slack", "Notion", "G Suite", "Zoom"],
  ["Vue.js", "Go", "MySQL", "Docker", "PagerDuty"]
];

const previousCompanies = [
  ["PayPal", "Interswitch"], ["Google", "Andela"], ["Amazon", "Uber"], 
  ["McKinsey", "Jumia"], ["Nestle", "Olam"], ["Microsoft", "Interswitch"],
  ["GTBank", "OPay"], ["Sterling Bank"], ["Vodafone", "Airtel"], ["Deloitte"],
  ["Facebook", "Bolt"], ["Stripe", "Square"], ["IBM", "Oracle"], ["PWC", "EY"]
];

const newsItems = [
  "Announced expansion to 5 new African markets",
  "Launched virtual accounts product",
  "Partnered with major ports",
  "Reached 1 million customers",
  "Launched livestock investment program",
  "Launched business accounts",
  "Launched dollar savings feature",
  "Rebranded mobile app",
  "Hit 20M active users",
  "Pivoted to marketplace model",
  "Announced strategic partnership",
  "Opened new regional headquarters"
];

const locations = [
  { city: "Lagos", country: "Nigeria" },
  { city: "Accra", country: "Ghana" },
  { city: "Nairobi", country: "Kenya" },
  { city: "Cape Town", country: "South Africa" },
  { city: "Cairo", country: "Egypt" },
  { city: "Kigali", country: "Rwanda" }
];

// Helper functions
function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function generateEmail(firstName: string, lastName: string, domain: string): string {
  const formats = [
    `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`,
    `${firstName.toLowerCase()}${lastName.toLowerCase()}@${domain}`,
    `${firstName[0].toLowerCase()}${lastName.toLowerCase()}@${domain}`,
    `${firstName.toLowerCase()}_${lastName.toLowerCase()}@${domain}`,
  ];
  return randomPick(formats);
}

function generateRandomDate(): string {
  const year = 2023 + Math.floor(Math.random() * 2);
  const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
  return `${year}-${month}`;
}

// Generate random sample emails
export function generateSampleEmails(count: number = 10): string[] {
  const emails: string[] = [];
  const usedCombos = new Set<string>();
  
  while (emails.length < count) {
    const firstName = randomPick(firstNames);
    const lastName = randomPick(lastNames);
    const company = randomPick(companies);
    const combo = `${firstName}-${lastName}-${company.domain}`;
    
    if (!usedCombos.has(combo)) {
      usedCombos.add(combo);
      emails.push(generateEmail(firstName, lastName, company.domain));
    }
  }
  
  return emails;
}

// Generate random enriched contacts
export function generateSampleEnrichedData(count: number = 10): EnrichedContact[] {
  const contacts: EnrichedContact[] = [];
  const usedCombos = new Set<string>();
  const shuffledCompanies = shuffleArray(companies);
  
  for (let i = 0; i < count; i++) {
    let firstName: string, lastName: string, company: typeof companies[0];
    let combo: string;
    
    do {
      firstName = randomPick(firstNames);
      lastName = randomPick(lastNames);
      company = shuffledCompanies[i % shuffledCompanies.length];
      combo = `${firstName}-${lastName}-${company.domain}`;
    } while (usedCombos.has(combo));
    
    usedCombos.add(combo);
    
    const job = randomPick(jobTitles);
    const location = randomPick(locations);
    const engagementScores: Array<"high" | "medium" | "low"> = ["high", "high", "medium", "medium", "low"];
    
    contacts.push({
      email: generateEmail(firstName, lastName, company.domain),
      engagementScore: randomPick(engagementScores),
      person: {
        name: `${firstName} ${lastName}`,
        jobTitle: job.title,
        seniority: job.seniority,
        linkedinUrl: `https://linkedin.com/in/${firstName.toLowerCase()}${lastName.toLowerCase()}`,
        careerHistory: [...randomPick(previousCompanies), company.name],
        recentPromotions: Math.random() > 0.6 ? [`Promoted to ${job.title} - ${generateRandomDate()}`] : []
      },
      company: {
        name: company.name,
        size: company.size,
        industry: company.industry,
        vertical: company.vertical,
        fundingStage: company.stage,
        fundingAmount: company.amount,
        fundingDate: generateRandomDate(),
        location: location.city,
        country: location.country,
        revenueEstimate: company.revenue
      },
      techStack: randomPick(techStacks),
      signals: {
        recentNews: [randomPick(newsItems)],
        funding: `${company.stage} - ${company.amount}`,
        expansion: `Expanding operations in ${randomPick(locations).country}`,
        linkedinInsights: randomPick([
          "Team grew 40% in last 6 months",
          "Hiring aggressively for engineering roles",
          "Building out tech team significantly",
          "Aggressive growth hiring",
          "Stable team growth",
          "Building fintech partnerships team",
          "Moderate hiring activity"
        ])
      }
    });
  }
  
  return contacts;
}

// Legacy exports (now generate fresh data each time)
export const sampleEmails = generateSampleEmails(10);
export const sampleEnrichedData = generateSampleEnrichedData(10);
