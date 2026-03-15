import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { hash } from "bcryptjs";
import { nanoid } from "nanoid";
import {
  users,
  debates,
  arguments_,
  votes,
  userFollows,
  follows,
  notifications,
  accounts,
  sessions,
} from "../src/lib/db/schema";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

// ─── Helper ───
function id() {
  return nanoid(21);
}

function randomDate(daysBack: number) {
  const d = new Date();
  d.setDate(d.getDate() - Math.floor(Math.random() * daysBack));
  d.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));
  return d;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function avatarUrl(name: string) {
  const encoded = name.replace(/ /g, "+");
  return `https://ui-avatars.com/api/?name=${encoded}&background=random&color=fff&size=200`;
}

// ─── User Data ───
type SeedUser = {
  id: string;
  name: string;
  username: string;
  email: string;
  bio: string;
  branch: string;
  reputationScore: number;
};

const PASSWORD = "Test@1234";

const userDefs: Omit<SeedUser, "id">[] = [
  // ── Females (15) ──
  { name: "Priya Sharma", username: "priya_cs", email: "priya.sharma@iitd.ac.in", branch: "CS", bio: "CS '27 @ IIT Delhi | ML enthusiast | Chai > Coffee | Building stuff that matters", reputationScore: 87 },
  { name: "Ananya Gupta", username: "ananya.ee", email: "ananya.gupta@iitd.ac.in", branch: "EE", bio: "EE @ IITD | Power systems nerd | Badminton doubles partner wanted | She/her", reputationScore: 62 },
  { name: "Kavya Reddy", username: "kavya_r", email: "kavya.reddy@iitd.ac.in", branch: "CS", bio: "CSE 3rd year | Open source contributor | Debating society VP | Hyderabadi biryani supremacy", reputationScore: 91 },
  { name: "Ishita Patel", username: "ishita.mech", email: "ishita.patel@iitd.ac.in", branch: "Mech", bio: "Mechanical '27 | Yes girls do mech | Robotics club | Hostel 5 represent", reputationScore: 45 },
  { name: "Roshni Iyer", username: "roshni_biotech", email: "roshni.iyer@iitd.ac.in", branch: "Biotech", bio: "Biotech @ IITD | Genomics research | Classical dancer | South campus best campus", reputationScore: 38 },
  { name: "Sneha Joshi", username: "sneha.civil", email: "sneha.joshi@iitd.ac.in", branch: "Civil", bio: "Civil Engg | Structural analysis is actually fun fight me | Photography club", reputationScore: 54 },
  { name: "Diya Mehta", username: "diya_cs", email: "diya.mehta@iitd.ac.in", branch: "CS", bio: "CS @ IIT Delhi | Competitive programming addict | Codeforces expert | Night owl 🦉", reputationScore: 78 },
  { name: "Aisha Khan", username: "aisha.chem", email: "aisha.khan@iitd.ac.in", branch: "Chemical", bio: "Chemical Engg '27 | Process design | Dramatics society | Delhiite through and through", reputationScore: 33 },
  { name: "Tanvi Singh", username: "tanvi_ee", email: "tanvi.singh@iitd.ac.in", branch: "EE", bio: "Electrical @ IITD | VLSI design | Quizzing club secretary | Insomniac coder", reputationScore: 69 },
  { name: "Meera Nair", username: "meera.cs", email: "meera.nair@iitd.ac.in", branch: "CS", bio: "CS 3rd year | Full stack dev | NSS volunteer | Kerala girl in Delhi surviving the heat", reputationScore: 82 },
  { name: "Pooja Agarwal", username: "pooja_mech", email: "pooja.agarwal@iitd.ac.in", branch: "Mech", bio: "Mech '27 | CAD is life | Entrepreneurship cell | Future startup founder", reputationScore: 41 },
  { name: "Shreya Das", username: "shreya.biotech", email: "shreya.das@iitd.ac.in", branch: "Biotech", bio: "Biotech @ IITD | CRISPR fascination | Music club guitarist | Bengali and proud", reputationScore: 29 },
  { name: "Nisha Verma", username: "nisha_civil", email: "nisha.verma@iitd.ac.in", branch: "Civil", bio: "Civil Engg | Sustainable infrastructure research | Debate club | Hostel 8 gang", reputationScore: 56 },
  { name: "Aditi Saxena", username: "aditi.chem", email: "aditi.saxena@iitd.ac.in", branch: "Chemical", bio: "ChemE @ IIT Delhi | Catalysis research | Lit fest organizer | Lucknowi nazaakat", reputationScore: 47 },
  { name: "Ritika Banerjee", username: "ritika_ee", email: "ritika.banerjee@iitd.ac.in", branch: "EE", bio: "EE 3rd year | Signal processing | Dance club | Kolkata misser | Tea addict", reputationScore: 60 },

  // ── Males (10) ──
  { name: "Arjun Krishnan", username: "arjun.mech", email: "arjun.krishnan@iitd.ac.in", branch: "Mech", bio: "Mechanical '27 | Thermo is love | Cricket team captain | Placement cell coord", reputationScore: 85 },
  { name: "Rohan Tiwari", username: "rohan_cs", email: "rohan.tiwari@iitd.ac.in", branch: "CS", bio: "CSE @ IITD | Systems programming | GSoC '25 | Btech ka last sem aane do bas", reputationScore: 93 },
  { name: "Vikram Malhotra", username: "vikram.civil", email: "vikram.malhotra@iitd.ac.in", branch: "Civil", bio: "Civil Engg | Transportation research | Basketball team | Punjabi by nature", reputationScore: 52 },
  { name: "Karthik Sundar", username: "karthik_ee", email: "karthik.sundar@iitd.ac.in", branch: "EE", bio: "EE @ IIT Delhi | Embedded systems | Robotics club lead | Filter coffee > everything", reputationScore: 74 },
  { name: "Aditya Bhatt", username: "aditya.biotech", email: "aditya.bhatt@iitd.ac.in", branch: "Biotech", bio: "Biotech 3rd year | Bioinformatics | Music society drummer | Uttarakhand se hoon bhai", reputationScore: 36 },
  { name: "Siddharth Jain", username: "sid_chem", email: "siddharth.jain@iitd.ac.in", branch: "Chemical", bio: "Chemical Engg | Reaction engineering | Consulting club | Rajasthani in Delhi", reputationScore: 58 },
  { name: "Rahul Pandey", username: "rahul.cs", email: "rahul.pandey@iitd.ac.in", branch: "CS", bio: "CS @ IITD | Backend dev | Open source | Chai pe charcha | UP boy", reputationScore: 71 },
  { name: "Dev Kapoor", username: "dev_mech", email: "dev.kapoor@iitd.ac.in", branch: "Mech", bio: "Mech '27 | Automobile enthusiast | Photography | Chandigarh boy in Delhi", reputationScore: 44 },
  { name: "Nikhil Rathore", username: "nikhil.civil", email: "nikhil.rathore@iitd.ac.in", branch: "Civil", bio: "Civil @ IIT Delhi | Geotechnical engg | Football team | MP represent", reputationScore: 31 },
  { name: "Aman Desai", username: "aman_ee", email: "aman.desai@iitd.ac.in", branch: "EE", bio: "EE 3rd year | Control systems | Coding club | Gujju in Delhi missing thepla", reputationScore: 66 },
];

// ─── Debate Data ───
type SeedDebate = {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  authorUsername: string;
};

const debateDefs: Omit<SeedDebate, "id">[] = [
  {
    title: "Should IIT reduce JEE weightage for admissions?",
    description: "JEE Advanced is the gold standard but is a single exam really the best way to judge potential? Should IITs consider board marks, interviews, or portfolios too?",
    category: "Education",
    tags: ["#JEE", "#IITAdmissions", "#Education", "#Reform"],
    authorUsername: "kavya_r",
  },
  {
    title: "Is the reservation system fair in its current form?",
    description: "Reservation was meant to be temporary. 75+ years later, is it still serving its purpose or has it become a political tool? Let's discuss with data, not emotions.",
    category: "Politics",
    tags: ["#Reservation", "#SocialJustice", "#India"],
    authorUsername: "rohan_cs",
  },
  {
    title: "Startup after graduation vs corporate placement - what's smarter?",
    description: "IIT tag + startup = guaranteed success? Or should you grind at a corporate for 3-4 years first and then jump? Real talk needed.",
    category: "Career",
    tags: ["#Startup", "#Placement", "#Career"],
    authorUsername: "arjun.mech",
  },
  {
    title: "Should attendance be mandatory in IIT?",
    description: "75% attendance policy - necessary discipline or outdated rule? Some profs are amazing, some literally read from slides. Should we have a choice?",
    category: "Campus",
    tags: ["#Attendance", "#IITLife", "#Campus"],
    authorUsername: "diya_cs",
  },
  {
    title: "Is AI going to replace engineers in the next 10 years?",
    description: "ChatGPT writes code, AI designs circuits, ML optimizes structures. Are we studying to become obsolete? Or is this just hype?",
    category: "Technology",
    tags: ["#AI", "#Engineering", "#Future", "#Tech"],
    authorUsername: "priya_cs",
  },
  {
    title: "Hindi should be the national language of India",
    description: "India needs a unifying language for governance and communication. Hindi is spoken by the most people. But what about the South? What about linguistic diversity?",
    category: "Politics",
    tags: ["#Hindi", "#Language", "#India", "#Diversity"],
    authorUsername: "karthik_ee",
  },
  {
    title: "Cricket gets way too much funding compared to other sports",
    description: "BCCI is richer than most sports bodies combined. Meanwhile hockey, wrestling, kabaddi athletes struggle for basic support. Is this fair?",
    category: "Sports",
    tags: ["#Cricket", "#Sports", "#India"],
    authorUsername: "vikram.civil",
  },
  {
    title: "Should IIT fees be increased to improve infrastructure?",
    description: "Current fees are heavily subsidized by taxpayers. Should IITs charge more (with better loans/scholarships) to fund world-class labs and facilities?",
    category: "Education",
    tags: ["#IITFees", "#Education", "#Infrastructure"],
    authorUsername: "sneha.civil",
  },
  {
    title: "Remote work is better than office culture for tech jobs",
    description: "Post-COVID many companies went back to office. But productivity data shows remote works fine. Is office culture just about control?",
    category: "Career",
    tags: ["#RemoteWork", "#WFH", "#TechJobs"],
    authorUsername: "meera.cs",
  },
  {
    title: "Social media is ruining Gen Z's mental health",
    description: "Doomscrolling, comparison culture, fake validation through likes. Are we the most connected yet loneliest generation?",
    category: "Society",
    tags: ["#SocialMedia", "#MentalHealth", "#GenZ"],
    authorUsername: "ananya.ee",
  },
  {
    title: "Internships matter more than CGPA for placements",
    description: "Companies say they want 8+ CGPA but hire based on projects and internships. So why are we killing ourselves for grades?",
    category: "Career",
    tags: ["#Internships", "#CGPA", "#Placements"],
    authorUsername: "rahul.cs",
  },
  {
    title: "Hostel life is the real education at IIT",
    description: "Late night coding sessions, mess food debates, wing culture, festival prep - you learn more outside class than inside. Change my mind.",
    category: "Campus",
    tags: ["#HostelLife", "#IIT", "#Campus"],
    authorUsername: "dev_mech",
  },
  {
    title: "India should invest more in research than defense",
    description: "We spend 2.4% GDP on defense but only 0.7% on R&D. For a country that wants to be a superpower, are our priorities right?",
    category: "Politics",
    tags: ["#Research", "#Defense", "#India"],
    authorUsername: "roshni_biotech",
  },
  {
    title: "Coaching institutes are destroying the education system",
    description: "Kota factories, Allen, FIITJEE - they produce JEE ranks but at what cost? Suicides, mental health crisis, zero creativity. Is this the way?",
    category: "Education",
    tags: ["#Coaching", "#Kota", "#JEE", "#Education"],
    authorUsername: "tanvi_ee",
  },
  {
    title: "Electric vehicles will dominate India by 2035",
    description: "Ola, Tata, Ather are pushing hard. But charging infra is still garbage and electricity comes from coal. Is EV the real solution?",
    category: "Technology",
    tags: ["#EV", "#India", "#CleanEnergy"],
    authorUsername: "ishita.mech",
  },
  {
    title: "Non-tech roles from IIT are a waste of the IIT tag",
    description: "People crack JEE, study engineering for 4 years, then join consulting/finance/PM roles. Is the IIT degree just a brand filter at that point?",
    category: "Career",
    tags: ["#IIT", "#NonTech", "#Career", "#Placements"],
    authorUsername: "sid_chem",
  },
  {
    title: "UPI is India's greatest tech innovation",
    description: "From chai stalls to international expansion, UPI changed how India transacts. Is it actually the best fintech innovation globally?",
    category: "Technology",
    tags: ["#UPI", "#Fintech", "#India", "#Tech"],
    authorUsername: "aman_ee",
  },
  {
    title: "Women in STEM still face discrimination at IITs",
    description: "Gender ratio is improving but is the culture? Lab partner bias, 'girls quota' comments, safety concerns - let's talk about it honestly.",
    category: "Society",
    tags: ["#WomenInSTEM", "#IIT", "#GenderEquality"],
    authorUsername: "kavya_r",
  },
  {
    title: "Mess food at IIT Delhi is actually decent",
    description: "Hot take: compared to other colleges the mess food is fine. We're just spoiled by home food. The real problem is variety, not quality.",
    category: "Campus",
    tags: ["#MessFood", "#IITDelhi", "#HostelLife"],
    authorUsername: "aditya.biotech",
  },
  {
    title: "Open book exams should be the standard in IITs",
    description: "Mugging up formulas tests memory not understanding. Open book forces profs to ask application-based questions. Win-win?",
    category: "Education",
    tags: ["#OpenBook", "#Exams", "#IIT", "#Education"],
    authorUsername: "nisha_civil",
  },
];

// ─── Arguments Data ───
type SeedArg = {
  debateIndex: number; // index into debateDefs
  authorUsername: string;
  content: string;
  side: "PRO" | "CON";
  upvotes: number;
};

const argDefs: SeedArg[] = [
  // Debate 0: JEE weightage
  { debateIndex: 0, authorUsername: "rohan_cs", content: "JEE is literally one exam on one day. I know people who are insanely smart but had a bad day and ended up at a tier-3 college. How is that fair? Multiple assessment points would give a much better picture of a student's potential.", side: "PRO", upvotes: 24 },
  { debateIndex: 0, authorUsername: "priya_cs", content: "Agreed! Look at the US system - SAT is just one component. They look at research, extracurriculars, essays. We reduce a student's worth to a single number. JEE toppers aren't always the best engineers.", side: "PRO", upvotes: 18 },
  { debateIndex: 0, authorUsername: "arjun.mech", content: "Bhai but JEE is the most objective system we have. The moment you add subjective criteria like interviews or portfolios, you open the door to corruption and bias. At least JEE is a level playing field.", side: "CON", upvotes: 31 },
  { debateIndex: 0, authorUsername: "tanvi_ee", content: "Level playing field? Really? A student from a village government school and one from DPS RK Puram are NOT on the same level playing field even for JEE. At least with multiple criteria, the village kid has more chances.", side: "PRO", upvotes: 15 },
  { debateIndex: 0, authorUsername: "diya_cs", content: "JEE tests problem-solving under pressure which is literally what engineering is about. You want to dilute the one thing that makes IIT admissions respected worldwide? Boards mein toh sabko 95+ mil jaate hain.", side: "CON", upvotes: 22 },

  // Debate 1: Reservation
  { debateIndex: 1, authorUsername: "vikram.civil", content: "Data shows that representation of lower castes in higher education has significantly improved because of reservation. Without it, we'd go back to the old system where only certain communities had access. It's not perfect but it's necessary.", side: "PRO", upvotes: 19 },
  { debateIndex: 1, authorUsername: "rahul.cs", content: "I support the idea of reservation but it should be income-based, not caste-based. A rich SC/ST kid getting reservation over a poor general category kid makes no sense. Creamy layer concept needs to be applied everywhere.", side: "CON", upvotes: 27 },
  { debateIndex: 1, authorUsername: "kavya_r", content: "Caste discrimination is not just economic - it's social. Even rich Dalits face discrimination. Income-based reservation ignores the deep social stigma that still exists. Talk to the Dalit students in our own batch and you'll understand.", side: "PRO", upvotes: 23 },
  { debateIndex: 1, authorUsername: "sid_chem", content: "The problem is reservation has become a vote bank tool. No party will touch it because they'll lose elections. Meanwhile the actual poor and marginalized still don't benefit. System needs an overhaul, not just continuation.", side: "CON", upvotes: 16 },
  { debateIndex: 1, authorUsername: "nisha_civil", content: "Representation matters. When I see SC/ST professors and IAS officers, it gives hope to millions. Reservation isn't just about individual benefit - it's about changing the power structure of society.", side: "PRO", upvotes: 20 },

  // Debate 2: Startup vs Corporate
  { debateIndex: 2, authorUsername: "meera.cs", content: "I interned at a startup last summer and learned more in 2 months than I did in a whole semester. The pace, the ownership, the impact - corporate can't match that. Plus equity upside is insane if it works out.", side: "PRO", upvotes: 14 },
  { debateIndex: 2, authorUsername: "pooja_mech", content: "Easy to romanticize startups when you have the IIT safety net. Most startups fail within 2 years. Corporate gives you stability, structured learning, and a strong resume. Build a foundation first, phir startup karna.", side: "CON", upvotes: 21 },
  { debateIndex: 2, authorUsername: "rohan_cs", content: "The best time to take risk is right after graduation when you have zero responsibilities. No EMI, no family to support. Corporate golden handcuffs make it harder to leave later. If you have a solid idea, just go for it.", side: "PRO", upvotes: 17 },
  { debateIndex: 2, authorUsername: "aditi.chem", content: "Not everyone wants to be the next Zuckerberg. Some of us want a stable 9-5, good salary, and work-life balance. That's valid too. This hustle culture glorification is toxic.", side: "CON", upvotes: 25 },
  { debateIndex: 2, authorUsername: "arjun.mech", content: "I'm going corporate first. The network, the brand name, understanding how big orgs work - all of that is valuable when you eventually start something. Most successful founders had corporate experience.", side: "CON", upvotes: 12 },

  // Debate 3: Attendance mandatory
  { debateIndex: 3, authorUsername: "rohan_cs", content: "Bhai main 8 baje ki class ke liye uthke jaaunga jab prof literally slides padh raha hai jo NPTEL pe available hain? Let me sleep and study on my own. Attendance != learning.", side: "PRO", upvotes: 35 },
  { debateIndex: 3, authorUsername: "sneha.civil", content: "Unpopular opinion but mandatory attendance actually helps. When I skip classes I spiral into a lazy cycle. The discipline of showing up matters, even if the lecture isn't great.", side: "CON", upvotes: 11 },
  { debateIndex: 3, authorUsername: "diya_cs", content: "Make attendance optional but make lectures worth attending. If 80% of students skip your class, maybe the problem isn't students - it's the teaching. Incentivize good teaching, not forced butts-in-seats.", side: "PRO", upvotes: 28 },
  { debateIndex: 3, authorUsername: "karthik_ee", content: "Some professors are genuinely amazing and their classes are always full without any attendance policy. The system should reward good teaching, not penalize students for bad teaching.", side: "PRO", upvotes: 19 },
  { debateIndex: 3, authorUsername: "ritika_ee", content: "Lab courses NEED mandatory attendance obviously. But theory courses? If I can score well without attending, why force me? Judge me on output not input.", side: "PRO", upvotes: 22 },

  // Debate 4: AI replacing engineers
  { debateIndex: 4, authorUsername: "rahul.cs", content: "AI tools are amazing assistants but they can't replace the creative problem-solving that engineers do. ChatGPT writes code but it doesn't understand WHY we need that code. Context and judgment are human things.", side: "CON", upvotes: 26 },
  { debateIndex: 4, authorUsername: "meera.cs", content: "The nature of engineering will change, not disappear. We'll go from writing code to reviewing AI-generated code, from designing circuits to specifying requirements. Adapt or become irrelevant - that's always been true.", side: "CON", upvotes: 20 },
  { debateIndex: 4, authorUsername: "aman_ee", content: "I used AI to complete my DSA assignment in 10 minutes. The same thing took me 3 hours last semester. If a tool can do my job 18x faster, companies will eventually prefer the tool. We need to be honest about this.", side: "PRO", upvotes: 18 },
  { debateIndex: 4, authorUsername: "priya_cs", content: "AI replacing routine coding? Sure. AI replacing the engineer who understands the business problem, talks to stakeholders, makes architectural decisions? Not happening. The job will evolve, not disappear.", side: "CON", upvotes: 29 },
  { debateIndex: 4, authorUsername: "tanvi_ee", content: "People said the same about automation in manufacturing. Many jobs DID disappear. New ones were created but the transition was painful. We should prepare for disruption, not dismiss it.", side: "PRO", upvotes: 14 },

  // Debate 5: Hindi national language
  { debateIndex: 5, authorUsername: "roshni_biotech", content: "As a Tamilian, I find this deeply offensive. India is not Hindi-speaking India. My mother tongue is as rich and ancient as Hindi. National language imposition is cultural imperialism within our own country.", side: "CON", upvotes: 32 },
  { debateIndex: 5, authorUsername: "rahul.cs", content: "English already serves as the link language. It's also the global business language. Why force Hindi when English does the job better for national AND international communication?", side: "CON", upvotes: 21 },
  { debateIndex: 5, authorUsername: "vikram.civil", content: "I speak Hindi and even I don't support this. Unity doesn't come from language imposition - it comes from mutual respect. The three-language formula already works. Don't fix what isn't broken.", side: "CON", upvotes: 17 },
  { debateIndex: 5, authorUsername: "aisha.chem", content: "Hindi is spoken by 57% of the population as a first or second language. For administrative efficiency, ONE common language helps. Not imposing, but encouraging Hindi alongside regional languages makes sense.", side: "PRO", upvotes: 9 },
  { debateIndex: 5, authorUsername: "karthik_ee", content: "Yaar I started this debate to have a real discussion and it seems like almost everyone disagrees lol. But genuinely, government documents in 22 languages is inefficient. There should be some practical middle ground.", side: "PRO", upvotes: 7 },

  // Debate 6: Cricket funding
  { debateIndex: 6, authorUsername: "arjun.mech", content: "Cricket team gets chartered flights, 5-star hotels, crores in sponsorship. Meanwhile our hockey team - the NATIONAL sport - struggles for basic equipment. This is not love for cricket, it's neglect of everything else.", side: "PRO", upvotes: 23 },
  { debateIndex: 6, authorUsername: "dev_mech", content: "Cricket generates its own money through IPL, sponsorships, broadcasting. BCCI doesn't take government money. Why should a self-sustaining sport subsidize others? That's the government's job.", side: "CON", upvotes: 19 },
  { debateIndex: 6, authorUsername: "nikhil.civil", content: "Neeraj Chopra won Olympic gold and got national attention for like 2 weeks. Then back to cricket. Indian athletes in other sports literally sell tea to fund their training. This is shameful for a 1.4B country.", side: "PRO", upvotes: 27 },
  { debateIndex: 6, authorUsername: "ishita.mech", content: "The real issue isn't cricket getting too much - it's other sports getting too little. Government sports budget is pathetic. Don't blame cricket, blame policy makers.", side: "CON", upvotes: 15 },

  // Debate 7: IIT fees
  { debateIndex: 7, authorUsername: "kavya_r", content: "IIT fees have already increased 10x in the last decade. Many students from lower-middle-class families already struggle. Increasing fees further would make IIT an elite-only institution. That defeats the purpose.", side: "CON", upvotes: 24 },
  { debateIndex: 7, authorUsername: "rohan_cs", content: "If fee increase comes with robust scholarships and zero-interest loans that cover 100% for economically weaker students, I'm okay with it. The current subsidy benefits rich students more than poor ones.", side: "PRO", upvotes: 16 },
  { debateIndex: 7, authorUsername: "aditya.biotech", content: "Mere papa ne loan leke meri fees bhari hai. Aur badhayenge toh middle class ka kya hoga? Scholarship sirf toppers ko milti hai, baaki sab ka kya? Nahi chahiye fee increase.", side: "CON", upvotes: 21 },
  { debateIndex: 7, authorUsername: "sid_chem", content: "MIT charges $60k/year and has insane infrastructure. IIT charges $2k/year and our labs have equipment from 2005. You get what you pay for. A moderate increase with proper utilization could transform our facilities.", side: "PRO", upvotes: 13 },

  // Debate 8: Remote work
  { debateIndex: 8, authorUsername: "priya_cs", content: "WFH during internship was amazing. Saved 2 hours of commute, worked in my PJs, was actually more productive. The future is hybrid at minimum. Forcing people to sit in an office cubicle is archaic.", side: "PRO", upvotes: 20 },
  { debateIndex: 8, authorUsername: "rahul.cs", content: "Remote work is great for experienced devs. But as fresh grads, we NEED that office environment for mentorship, learning by osmosis, building professional networks. I chose my job partly for the office culture.", side: "CON", upvotes: 17 },
  { debateIndex: 8, authorUsername: "diya_cs", content: "Studies from Stanford show remote workers are 13% more productive. Companies forcing RTO are doing it because managers can't manage without surveillance. It's a trust issue, not a productivity issue.", side: "PRO", upvotes: 23 },
  { debateIndex: 8, authorUsername: "ananya.ee", content: "Not everyone has a good home setup. Shared rooms, noisy neighborhoods, bad internet - remote work privilege often depends on your economic background. Office provides equal infrastructure for everyone.", side: "CON", upvotes: 14 },
  { debateIndex: 8, authorUsername: "aman_ee", content: "Hybrid is the answer. 2-3 days in office for collaboration, rest from home for deep work. Why is this such a hard concept for companies to understand?", side: "PRO", upvotes: 26 },

  // Debate 9: Social media and Gen Z
  { debateIndex: 9, authorUsername: "shreya.biotech", content: "I deleted Instagram for a month and my anxiety dropped significantly. We're comparing our behind-the-scenes with everyone's highlight reel. The dopamine addiction is real and we all know it.", side: "PRO", upvotes: 22 },
  { debateIndex: 9, authorUsername: "aisha.chem", content: "Social media also helped me find my community, learn about mental health, discover career opportunities. It's a tool - the problem is how we use it, not the tool itself.", side: "CON", upvotes: 16 },
  { debateIndex: 9, authorUsername: "ritika_ee", content: "FOMO is destroying us. Every party you're not at, every trip you didn't take, every achievement you haven't unlocked - it's all in your face 24/7. Previous generations didn't have this constant comparison.", side: "PRO", upvotes: 19 },
  { debateIndex: 9, authorUsername: "meera.cs", content: "Correlation is not causation. Mental health issues in Gen Z could be due to economic uncertainty, climate anxiety, pandemic effects. Blaming social media alone is oversimplification.", side: "CON", upvotes: 13 },

  // Debate 10: Internships vs CGPA
  { debateIndex: 10, authorUsername: "priya_cs", content: "My friend with 7.2 CGPA got a better offer than someone with 9.5 because she had 2 solid internships and open source contributions. Companies are starting to see through the CGPA facade.", side: "PRO", upvotes: 18 },
  { debateIndex: 10, authorUsername: "arjun.mech", content: "CGPA is the FILTER. You won't even get the interview without 7.5+ at most good companies. Internships help you CONVERT the interview. You need both, stop pretending otherwise.", side: "CON", upvotes: 24 },
  { debateIndex: 10, authorUsername: "kavya_r", content: "Google removed CGPA requirements years ago. The best companies test skills, not grades. CGPA matters only because Indian companies haven't evolved their hiring processes yet.", side: "PRO", upvotes: 15 },
  { debateIndex: 10, authorUsername: "tanvi_ee", content: "CGPA shows consistency and ability to handle diverse subjects. Someone who can't be bothered to maintain a decent GPA might lack discipline. It's not everything but it's not nothing either.", side: "CON", upvotes: 11 },

  // Debate 11: Hostel life
  { debateIndex: 11, authorUsername: "nikhil.civil", content: "2 AM Maggi at the wing common room > any classroom lecture. The life skills, the friendships, the crisis management (read: exam prep in 12 hours) - hostel teaches you how to adult.", side: "PRO", upvotes: 30 },
  { debateIndex: 11, authorUsername: "pooja_mech", content: "I literally learned project management by organizing hostel fest, people management by being wing representative, and negotiation by dealing with the mess committee. Real MBA stuff lol.", side: "PRO", upvotes: 21 },
  { debateIndex: 11, authorUsername: "sneha.civil", content: "Hostel life is great but let's not romanticize it. Ragging issues still exist, mental health support is minimal, and infrastructure in some hostels is terrible. The real education needs real improvement.", side: "CON", upvotes: 17 },
  { debateIndex: 11, authorUsername: "aditya.biotech", content: "Wing culture mein jo brotherhood banti hai na, wo kisi classroom mein nahi ban sakti. My wingmates are my family away from family. Hostel life >>> everything.", side: "PRO", upvotes: 25 },

  // Debate 12: Research vs Defense
  { debateIndex: 12, authorUsername: "priya_cs", content: "Israel spends 5.4% GDP on R&D and look at their tech industry. India spends 0.7% and we wonder why we don't have innovation. Redirecting even 0.5% from defense to R&D could be transformative.", side: "PRO", upvotes: 16 },
  { debateIndex: 12, authorUsername: "karthik_ee", content: "With China and Pakistan on our borders, reducing defense spending is suicidal. Research investment should INCREASE but not at the cost of defense. Find the money elsewhere - reduce bureaucratic waste.", side: "CON", upvotes: 22 },
  { debateIndex: 12, authorUsername: "roshni_biotech", content: "Defense and research aren't mutually exclusive. DRDO exists for exactly this reason. But pure science research funding in India is abysmal. Our best researchers leave for the US because there's no funding here.", side: "PRO", upvotes: 18 },
  { debateIndex: 12, authorUsername: "vikram.civil", content: "The real issue is not how much we spend on defense but how much we WASTE. Defense procurement is full of corruption and delays. Fix the efficiency first before cutting the budget.", side: "CON", upvotes: 14 },

  // Debate 13: Coaching institutes
  { debateIndex: 13, authorUsername: "rohan_cs", content: "I'm an IITian because of coaching classes, but I also lost my teenage years. No sports, no hobbies, no social life from class 9-12. Was it worth it? I genuinely don't know. The system needs to change.", side: "PRO", upvotes: 28 },
  { debateIndex: 13, authorUsername: "ananya.ee", content: "Coaching just fills the gap that our school system leaves. If school education was good enough, coaching wouldn't exist. Don't blame coaching - fix the schools first.", side: "CON", upvotes: 20 },
  { debateIndex: 13, authorUsername: "aditi.chem", content: "Kota mein jo mental health crisis hai wo numbers mein dikhti hai. Student suicides, depression, anxiety - ye sab normal nahi hai. We're literally killing kids for ranks. This must stop.", side: "PRO", upvotes: 24 },
  { debateIndex: 13, authorUsername: "diya_cs", content: "I self-studied for JEE using YouTube and free resources. If I can do it, the coaching argument is weak. Coaching creates dependency. Students should learn to learn independently.", side: "PRO", upvotes: 15 },

  // Debate 14: Electric vehicles
  { debateIndex: 14, authorUsername: "arjun.mech", content: "From a mechanical engineering perspective, EVs are simpler machines - fewer moving parts, lower maintenance. The transition is inevitable. India should lead, not follow.", side: "PRO", upvotes: 17 },
  { debateIndex: 14, authorUsername: "dev_mech", content: "India's electricity grid is 70% coal-powered. An EV running on coal electricity isn't cleaner than a BS6 petrol car. Until we fix power generation, EVs are just shifting pollution from tailpipe to power plant.", side: "CON", upvotes: 23 },
  { debateIndex: 14, authorUsername: "ishita.mech", content: "Battery disposal is a ticking time bomb. Lithium mining is environmentally devastating. We're solving one problem and creating another. Hydrogen fuel cells might be the real answer.", side: "CON", upvotes: 19 },
  { debateIndex: 14, authorUsername: "aman_ee", content: "Solar capacity in India is growing 30% year-on-year. By 2030, renewable will be 50%+ of our grid. The EV + renewable combo is the endgame. We need to build infrastructure NOW for that future.", side: "PRO", upvotes: 14 },

  // Debate 15: Non-tech roles from IIT
  { debateIndex: 15, authorUsername: "kavya_r", content: "IIT teaches you how to think, not just how to engineer. Problem-solving, analytical thinking, working under pressure - these skills apply everywhere. Why limit ourselves to tech roles?", side: "CON", upvotes: 21 },
  { debateIndex: 15, authorUsername: "sid_chem", content: "I started this debate because half my branch is prepping for consulting. Bhai chemical engineering padhi hai toh chemicals mein kaam karo. Taxpayer money se engineering degree leke McKinsey join karna is not cool.", side: "PRO", upvotes: 18 },
  { debateIndex: 15, authorUsername: "rohan_cs", content: "Freedom of choice is important but the system IS broken when IITs become a brand filter for non-engineering roles. If you want to do consulting, go to a B-school. Engineering seats should go to those who want to engineer.", side: "PRO", upvotes: 16 },
  { debateIndex: 15, authorUsername: "meera.cs", content: "Many of the best tech startup founders had non-tech stints. Understanding business, strategy, and finance makes you a BETTER engineer and entrepreneur. The cross-pollination is valuable.", side: "CON", upvotes: 12 },

  // Debate 16: UPI
  { debateIndex: 16, authorUsername: "priya_cs", content: "UPI processes 12 billion transactions/month. Even China's WeChat Pay doesn't have this scale. The fact that a chai wala in a small town can accept digital payments is revolutionary. India should be proud.", side: "PRO", upvotes: 31 },
  { debateIndex: 16, authorUsername: "karthik_ee", content: "UPI is great but it was built on the foundation of Aadhaar which has serious privacy concerns. Also, the zero-MDR policy is killing fintech innovation. It's a good product with a problematic ecosystem.", side: "CON", upvotes: 14 },
  { debateIndex: 16, authorUsername: "aman_ee", content: "I lived in the US for my internship and had to carry a physical wallet everywhere. Swipe cards, transaction fees, 2-day settlement. Coming back to UPI felt like time travel. Objectively superior system.", side: "PRO", upvotes: 22 },

  // Debate 17: Women in STEM
  { debateIndex: 17, authorUsername: "ishita.mech", content: "I'm the only girl in my Mech lab group and I STILL get asked 'tumne khud kiya ya kisi se karwaya?' every time I submit a good assignment. The casual sexism is exhausting and very real.", side: "PRO", upvotes: 33 },
  { debateIndex: 17, authorUsername: "priya_cs", content: "CS gender ratio has improved but the culture hasn't. I've been talked over in group discussions, had my code reviewed more harshly, and been called 'supernumerary' as if I don't deserve to be here.", side: "PRO", upvotes: 28 },
  { debateIndex: 17, authorUsername: "arjun.mech", content: "As a guy in mech, I acknowledge this is real. I've seen it happen to Ishita and others. We need to call it out when we see it instead of being bystanders. The culture change has to come from us too.", side: "PRO", upvotes: 26 },
  { debateIndex: 17, authorUsername: "ananya.ee", content: "The supernumerary seat policy actually made things worse in some ways. Instead of normalizing women in engineering, it gave people a reason to say 'oh she's only here because of the girls quota.' We need cultural change, not just policy.", side: "PRO", upvotes: 20 },
  { debateIndex: 17, authorUsername: "dev_mech", content: "Genuinely asking - what can male students do to help? I try to be aware but I'm sure I have blind spots. Would love to hear concrete suggestions instead of just acknowledging the problem.", side: "PRO", upvotes: 17 },

  // Debate 18: Mess food
  { debateIndex: 18, authorUsername: "nikhil.civil", content: "Bro the paneer in mess has the texture of rubber and the dal is basically turmeric water. 'Decent' is a stretch. My standards have dropped so low that outside food tastes like 5-star now.", side: "CON", upvotes: 24 },
  { debateIndex: 18, authorUsername: "shreya.biotech", content: "As a Bengali, the fish fry day is the only day I feel alive. Rest of the days it's a survival game. Decent? My dude, you need to recalibrate your taste buds.", side: "CON", upvotes: 19 },
  { debateIndex: 18, authorUsername: "aditya.biotech", content: "Maine ye debate start kiya tha to defend mess food but honestly after reading these comments, maybe I just have low standards lol. But fr, the Sunday special is good right? RIGHT?", side: "PRO", upvotes: 27 },
  { debateIndex: 18, authorUsername: "pooja_mech", content: "Mess food is fine calorie-wise. We're not paying for gourmet - we're paying for nutrition. Stop ordering Zomato every day and actually eat the mess food, you'll survive. Hostel 5 mess is unironically good.", side: "PRO", upvotes: 12 },

  // Debate 19: Open book exams
  { debateIndex: 19, authorUsername: "rohan_cs", content: "Had an open book exam for OS course. It was 10x harder than regular exams because the prof actually asked questions that required UNDERSTANDING not just recall. THIS is how education should work.", side: "PRO", upvotes: 25 },
  { debateIndex: 19, authorUsername: "tanvi_ee", content: "Open book just means you need to bring better cheat sheets lol. But seriously, it does test application over memorization. In real life, you always have Google - why pretend otherwise in exams?", side: "PRO", upvotes: 18 },
  { debateIndex: 19, authorUsername: "sneha.civil", content: "Some subjects genuinely need memorization. Structural design codes, material properties - you need these at your fingertips in practice. Open book makes students lazy about building fundamental knowledge.", side: "CON", upvotes: 13 },
  { debateIndex: 19, authorUsername: "karthik_ee", content: "The problem isn't open vs closed book - it's the quality of questions. Bad profs will ask bad questions regardless of format. Focus on training better question setters.", side: "CON", upvotes: 16 },
  { debateIndex: 19, authorUsername: "nisha_civil", content: "Open book exams would reduce the insane exam stress culture at IIT. Students wouldn't need to pull all-nighters memorizing formulas. Better mental health + better testing = obvious win.", side: "PRO", upvotes: 20 },
];

// ─── Main Seed Function ───
async function seed() {
  console.log("🌱 Starting ArgueX seed...\n");

  // ── 1. Hash password ──
  console.log("🔐 Hashing password...");
  const passwordHash = await hash(PASSWORD, 10);

  // ── 2. Build user records ──
  console.log("👤 Creating 25 users...");
  const userRecords = userDefs.map((u) => ({
    id: id(),
    name: u.name,
    username: u.username,
    email: u.email,
    passwordHash,
    emailVerified: new Date(),
    image: avatarUrl(u.name),
    bio: u.bio,
    avatarUrl: avatarUrl(u.name),
    bannerUrl: null,
    reputationScore: u.reputationScore,
    createdAt: randomDate(90),
  }));

  // Username -> id lookup
  const userMap = new Map<string, string>();
  userRecords.forEach((u) => userMap.set(u.username, u.id));

  // ── 3. Build debate records ──
  console.log("💬 Creating 20 debates...");
  const debateRecords = debateDefs.map((d) => ({
    id: id(),
    title: d.title,
    description: d.description,
    category: d.category,
    tags: d.tags,
    images: [] as string[],
    authorId: userMap.get(d.authorUsername)!,
    participantCount: 0,
    argCount: 0,
    proVotes: 0,
    conVotes: 0,
    createdAt: randomDate(60),
    updatedAt: new Date(),
  }));

  // ── 4. Build argument records ──
  console.log("🗣️  Creating arguments...");
  const argRecords = argDefs.map((a) => ({
    id: id(),
    debateId: debateRecords[a.debateIndex].id,
    authorId: userMap.get(a.authorUsername)!,
    content: a.content,
    side: a.side as "PRO" | "CON",
    parentId: null,
    upvotes: a.upvotes,
    downvotes: Math.floor(Math.random() * 5),
    evidenceCount: 0,
    createdAt: randomDate(30),
  }));

  // Update debate counts
  for (const arg of argRecords) {
    const debate = debateRecords.find((d) => d.id === arg.debateId)!;
    debate.argCount++;
    if (arg.side === "PRO") debate.proVotes++;
    else debate.conVotes++;
    // Count unique participants
    const debateArgs = argRecords.filter((a) => a.debateId === debate.id);
    const uniqueAuthors = new Set(debateArgs.map((a) => a.authorId));
    debate.participantCount = uniqueAuthors.size;
  }

  // ── 5. Build vote records ──
  console.log("👍 Creating votes...");
  const voteRecords: {
    id: string;
    userId: string;
    argumentId: string;
    voteType: "UP" | "DOWN" | "EVIDENCE";
    createdAt: Date;
  }[] = [];
  const voteSet = new Set<string>();

  for (const arg of argRecords) {
    // Give each argument some random upvotes from other users
    const numVotes = Math.min(arg.upvotes, Math.floor(Math.random() * 4) + 1);
    const availableVoters = userRecords.filter((u) => u.id !== arg.authorId);

    for (let i = 0; i < numVotes && i < availableVoters.length; i++) {
      const voter = availableVoters[Math.floor(Math.random() * availableVoters.length)];
      const key = `${voter.id}-${arg.id}`;
      if (voteSet.has(key)) continue;
      voteSet.add(key);
      voteRecords.push({
        id: id(),
        userId: voter.id,
        argumentId: arg.id,
        voteType: "UP",
        createdAt: randomDate(20),
      });
    }
  }
  console.log(`   Created ${voteRecords.length} votes`);

  // ── 6. Build follow records ──
  console.log("🤝 Creating user follows...");
  const followRecords: {
    id: string;
    followerId: string;
    followingId: string;
    createdAt: Date;
  }[] = [];
  const followSet = new Set<string>();

  // Branch-mates follow each other
  const branches = ["CS", "EE", "Mech", "Civil", "Chemical", "Biotech"];
  for (const branch of branches) {
    const branchUsers = userDefs
      .filter((u) => u.branch === branch)
      .map((u) => userMap.get(u.username)!);

    for (let i = 0; i < branchUsers.length; i++) {
      for (let j = 0; j < branchUsers.length; j++) {
        if (i === j) continue;
        const key = `${branchUsers[i]}-${branchUsers[j]}`;
        if (followSet.has(key)) continue;
        // 70% chance branch-mates follow each other
        if (Math.random() < 0.7) {
          followSet.add(key);
          followRecords.push({
            id: id(),
            followerId: branchUsers[i],
            followingId: branchUsers[j],
            createdAt: randomDate(60),
          });
        }
      }
    }
  }

  // Cross-branch follows (popular students get more)
  const highRepUsers = userDefs
    .filter((u) => u.reputationScore >= 70)
    .map((u) => userMap.get(u.username)!);

  for (const popularId of highRepUsers) {
    // 5-8 random followers from other branches
    const others = userRecords.filter((u) => u.id !== popularId);
    const numFollowers = Math.floor(Math.random() * 4) + 5;
    for (let i = 0; i < numFollowers; i++) {
      const follower = others[Math.floor(Math.random() * others.length)];
      const key = `${follower.id}-${popularId}`;
      if (followSet.has(key)) continue;
      followSet.add(key);
      followRecords.push({
        id: id(),
        followerId: follower.id,
        followingId: popularId,
        createdAt: randomDate(60),
      });
    }
  }

  console.log(`   Created ${followRecords.length} follow relationships`);

  // ── 7. Clear existing data & insert ──
  console.log("\n🗑️  Clearing existing data...");
  // Delete in dependency order
  await db.delete(votes);
  console.log("   Cleared votes");
  await db.delete(userFollows);
  console.log("   Cleared user_follows");
  await db.delete(arguments_);
  console.log("   Cleared arguments");
  await db.delete(follows);
  console.log("   Cleared follows");
  await db.delete(notifications);
  console.log("   Cleared notifications");
  await db.delete(debates);
  console.log("   Cleared debates");
  await db.delete(accounts);
  console.log("   Cleared accounts");
  await db.delete(sessions);
  console.log("   Cleared sessions");
  await db.delete(users);
  console.log("   Cleared users");

  console.log("\n📥 Inserting seed data...");

  // Insert users
  for (const user of userRecords) {
    await db.insert(users).values(user);
  }
  console.log(`   ✅ Inserted ${userRecords.length} users`);

  // Insert debates
  for (const debate of debateRecords) {
    await db.insert(debates).values(debate);
  }
  console.log(`   ✅ Inserted ${debateRecords.length} debates`);

  // Insert arguments
  for (const arg of argRecords) {
    await db.insert(arguments_).values(arg);
  }
  console.log(`   ✅ Inserted ${argRecords.length} arguments`);

  // Insert votes
  for (const vote of voteRecords) {
    await db.insert(votes).values(vote);
  }
  console.log(`   ✅ Inserted ${voteRecords.length} votes`);

  // Insert follows
  for (const follow of followRecords) {
    await db.insert(userFollows).values(follow);
  }
  console.log(`   ✅ Inserted ${followRecords.length} user follows`);

  console.log("\n🎉 Seed complete! ArgueX is ready to argue.");
  console.log(`
Summary:
  - ${userRecords.length} users (15 female, 10 male)
  - ${debateRecords.length} debates
  - ${argRecords.length} arguments
  - ${voteRecords.length} votes
  - ${followRecords.length} follow relationships
  `);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
