```markdown
# ArgueX – Phase I Development Document (MVP)

**Author:** Rengaraj K  
**Product:** ArgueX  
**Version:** Phase I – MVP  
**Stack:** Next.js (Fullstack) + Neon PostgreSQL  
**Authentication:** Google OAuth + Email/Password  
**Deployment Target:** Vercel + Neon  

---

# 1. Objective

The goal of Phase I is to launch the **Minimum Viable Product (MVP)** of ArgueX — a structured debate social platform where users can create debates, post arguments, and evaluate ideas through voting.

The platform focuses on **organized intellectual discussions** instead of chaotic comment threads typically seen in general social platforms.

The MVP must enable users to:

* Create accounts and authenticate  
* Create debate topics  
* Post arguments and counter-arguments  
* Vote on arguments  
* View trending debates  
* Build reputation through participation  

Artificial intelligence features, monetization, and advanced moderation will **not be included in Phase I**.

---

# 2. Product Overview

ArgueX is a **social platform built around structured debates**.

Each discussion is organized around a **clear topic**, where users contribute arguments either supporting or opposing the topic.

Unlike traditional social networks where conversations become disorganized, ArgueX organizes discussions into **logical argument structures** so users can follow reasoning clearly.

Example debate topic:

```

Will AI replace software engineers?

```

Users can contribute:

* supporting arguments
* opposing arguments
* evidence
* counterarguments

The community evaluates arguments through voting, which determines argument visibility and user reputation.

---

# 3. Core Product Concept

The core interaction model of ArgueX is built around three elements:

### Debate Topics

A central question or claim that users discuss.

Example:

```

Should AI development be regulated?

```

### Arguments

Users submit logical statements supporting or opposing the topic.

### Voting

The community evaluates argument strength through voting.

This structure allows debates to remain organized and readable even with large numbers of participants.

---

# 4. How a Debate Actually Looks on ArgueX

A debate in ArgueX is not a random comment thread.  
It is a **structured argument tree** where users contribute claims, counterarguments, and responses.

Example debate:

```

TRENDING DEBATE

Will AI replace software engineers?

Category: Technology
Participants: 124
Arguments: 52

Current Community Opinion:
YES 62% | NO 38%

```

Users see two sides of the debate.

```

LEFT SIDE (PRO)                 RIGHT SIDE (CON)

AI WILL replace                 AI WILL NOT replace
software engineers              software engineers

```

---

## Example Argument Flow

### PRO Argument

```

Claim:
AI will automate most programming tasks.

Author: Alex Chen
Votes: +482

```

Explanation:

```

Large language models already generate working code.

Tools such as AI coding assistants reduce the need for
manual programming work and accelerate development.

In the future companies may require fewer engineers.

```

Evidence:

```

• AI code assistants generate large portions of code
• Automated testing reduces developer workload

```

---

### Counter Argument

```

Author: Maria Lopez
Votes: +511

```
```

AI cannot replace software engineers because
software development requires system design,
problem analysis, and long-term maintenance.

AI can assist coding but cannot replace
engineering thinking and decision making.

```

---

### Counter Reply

```

Author: Alex Chen
Votes: +302

```
```

Architecture tasks could also be partially automated
using AI trained on large system designs.

Future AI systems might design full applications.

```

---

## Argument Tree Example

Inside ArgueX the debate structure visually appears like:

```

Will AI replace software engineers?
│
├── PRO
│   ├── AI will automate coding tasks
│   │      └── Counter: Engineering requires design thinking
│   │             └── Reply: AI may automate architecture
│   │
│   └── AI reduces engineering demand
│          └── Counter: Software demand keeps increasing
│
└── CON
├── Software engineering requires creativity
│      └── Counter: AI can learn creative patterns
│
└── AI is only a tool
└── Counter: Tools sometimes replace jobs

```

This structure allows users to **follow reasoning logically** instead of scrolling through chaotic comment threads.

---

## Voting Example

Each argument has voting options.

```

👍 Strong argument
👎 Weak argument
📚 Evidence provided

```

Example:

```

Argument:
AI will automate coding tasks

👍 482 votes
👎 113 votes
Evidence Sources: 3

```

Arguments with higher scores appear higher in the debate.

---

## Community Participation Example

Users can contribute directly to the debate.

Example contribution:

```

User: Rengaraj K

Argument:
AI will not replace engineers but will
transform their role into system designers
who guide AI development.

Votes: +72

```

Users can:

* add arguments  
* reply to arguments  
* vote on arguments  
* follow debates  

---

# 5. Target Users

Primary users include:

* university students
* developers and engineers
* startup founders
* researchers
* philosophy enthusiasts
* intellectually curious internet users

These users are likely to engage in thoughtful discussions around topics such as:

* technology
* artificial intelligence
* economics
* philosophy
* science
* startups

---

# 6. Technology Stack

## Framework

The entire application will be built using **Next.js fullstack architecture**.

Next.js will handle:

* frontend UI rendering
* backend API logic
* server-side data fetching
* authentication flows

The project will use **Next.js App Router architecture**.

---

## UI Framework

User interface components will use:

* Tailwind CSS
* modern responsive design
* mobile-first layout

---

## Database

The application will use **Neon PostgreSQL**, a serverless PostgreSQL platform designed for scalable web applications.

Neon provides:

* managed PostgreSQL
* branching environments
* serverless scaling

---

## Authentication

Authentication will support two methods.

### Google OAuth

Users can sign in using their Google accounts.

Flow:

```

User clicks "Continue with Google"
↓
Google OAuth authentication
↓
Account created or linked
↓
User redirected to dashboard

```

### Email and Password Login

Users can create accounts using:

* email
* password
* username

Passwords must be securely hashed before storage.

---

# 7. Application Architecture

The application follows a **fullstack Next.js architecture** where both frontend and backend are contained within the same project.

High-level architecture:

```

Browser Client
│
▼
Next.js Application
│
├─ React UI Components
│
├─ Server Actions
│
└─ API Routes
│
▼
Neon Database

```

This architecture simplifies development and deployment by keeping frontend and backend logic in a single codebase.

---

# 8. Core Pages

## Landing Page

The landing page introduces the platform and allows users to create accounts or log in.

Sections include:

* product introduction
* explanation of structured debates
* trending debates preview
* signup and login actions

The landing page serves as the primary entry point for new users.

---

## Authentication Pages

Two authentication screens exist.

### Login Page

Users can:

* login with Google
* login using email and password

### Signup Page

Users provide:

* username
* email
* password

After successful signup, users are redirected to the main debate feed.

---

## Main Feed

The feed displays active debates on the platform.

Content includes:

* trending debates
* newest debates
* debates from followed topics

Each debate appears as a card showing:

* debate title
* category
* number of arguments
* current vote balance
* participation metrics

Example feed card:

```

Debate:
Will AI replace software engineers?

YES 62% | NO 38%

Arguments: 52
Participants: 124
Category: Technology

```

Users can open the debate directly from the feed.

---

## Debate Page

The debate page is the central interaction environment.

Each debate contains:

* topic title
* debate description
* argument threads
* voting results

Arguments are grouped into **supporting and opposing sides**.

Example layout:

```

Debate Topic

PRO ARGUMENTS
└ Argument
└ Counter Argument
└ Response

CON ARGUMENTS
└ Argument
└ Counter Argument

```

Users can:

* add arguments
* reply to arguments
* vote on arguments

Arguments are ranked based on votes.

---

## Create Debate Page

Users can create a new debate topic by submitting:

* title
* category
* description
* tags

After submission, the debate becomes publicly visible in the feed.

---

## User Profile Page

Each user has a public profile displaying:

* username
* biography
* reputation score
* number of debates participated in
* number of arguments posted
* achievements or badges

Profiles allow users to build identity and credibility within the debate community.

---

# 9. Argument System

Arguments are the core content unit of the platform.

Each argument includes:

* text content
* author
* timestamp
* vote score
* optional parent argument

Arguments can form **nested reply structures**, allowing users to respond directly to specific claims.

This creates logical debate chains instead of flat comment lists.

---

# 10. Voting System

Users evaluate arguments through voting.

Voting determines:

* argument ranking
* argument visibility
* user reputation

Arguments with higher scores appear more prominently in debates.

Voting encourages high-quality reasoning and discourages weak arguments.

---

# 11. Reputation System

ArgueX encourages quality contributions through a reputation system.

Users gain reputation when:

* their arguments receive positive votes
* their arguments rank highly in debates
* they consistently contribute valuable insights

Reputation acts as a **credibility signal** within the platform.

Users with higher reputation appear more trustworthy in discussions.

---

# 12. Notifications

Users receive notifications when:

* someone replies to their argument
* someone mentions them
* their argument receives votes
* they gain achievements

Notifications help users stay engaged with ongoing debates.

---

# End of Document
```
