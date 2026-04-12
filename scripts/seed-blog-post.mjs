import { createConnection } from "mysql2/promise";
import * as dotenv from "dotenv";

dotenv.config();

const content = `## The Translation Problem Nobody Warns You About

You kept the network alive in the field. You troubleshot satellite terminals at 0200 in the rain. You trained junior soldiers on equipment that civilian IT professionals have never touched. And yet, when you sit down to write a resume, you stare at a blank page wondering how any of that translates into something a hiring manager in a glass office will understand.

This is the central challenge of the 25U to civilian IT transition — not a skills gap, but a *language gap*. The good news is that your MOS maps remarkably well to several high-demand civilian roles. The work ahead is translation, not reinvention.

---

## What a 25U Actually Does (In Civilian Terms)

The Army describes the 25U as a Signal Support Systems Specialist. Strip away the military language and you have a professional who installs, operates, and maintains voice and data communications networks; configures and troubleshoots tactical and strategic communication systems; manages network infrastructure under high-stakes, time-critical conditions; and trains end users on complex technical systems.

In the civilian world, those responsibilities map directly to roles like **IT Support Specialist**, **Network Technician**, **Systems Administrator**, **Help Desk Analyst**, and — with additional experience — **Network Engineer** or **IT Infrastructure Manager**.

---

## Your Transferable Skills Inventory

Before targeting specific jobs, it helps to take stock of what you already bring to the table. The following table maps common 25U duties to their civilian equivalents and the skills employers are actively hiring for.

| Military Duty | Civilian Skill | Employer Demand |
|---|---|---|
| Configuring SINCGARS and Harris radios | RF/wireless network configuration | High in telecom and defense contracting |
| Maintaining JNN/WIN-T nodes | WAN/LAN infrastructure management | Very high across all industries |
| Troubleshooting VSAT terminals | Satellite and broadband systems support | High in government and remote operations |
| Managing crypto equipment (KIV-7, KG-175) | Network security, encryption protocols | Very high in cybersecurity roles |
| Training soldiers on comms equipment | Technical training and end-user support | High in IT support and managed services |
| Operating in PACE planning | Redundancy and disaster recovery planning | High in enterprise IT and cloud roles |
| Maintaining equipment maintenance records | IT asset management and documentation | High in ITSM and enterprise environments |

---

## The Four Best Civilian Career Paths for 25U Veterans

### Path 1: IT Support Specialist / Help Desk Analyst

**Why it fits:** Your experience troubleshooting complex systems under pressure is exactly what help desk roles demand. The difference is that instead of a VSAT terminal, you're troubleshooting a Windows workstation or a VPN connection.

**Typical job titles:** IT Support Specialist, Help Desk Analyst, Desktop Support Technician, IT Technician  
**Entry salary range:** $42,000 – $58,000  
**Mid-level salary range:** $58,000 – $75,000  
**Key certifications:** CompTIA A+, CompTIA Network+, Microsoft 365 Fundamentals (MS-900)  
**Time to first job:** 30–90 days with existing 25U experience

This is the fastest on-ramp into civilian IT. Many veterans with a 25U background land Tier 2 or Tier 3 support roles immediately — bypassing entry-level Tier 1 entirely — because their troubleshooting depth is already above average.

### Path 2: Network Technician / Network Administrator

**Why it fits:** You've configured and maintained tactical networks. The protocols are different (802.11 vs. SINCGARS), but the mental model — topology, routing, redundancy, security — is identical.

**Typical job titles:** Network Technician, Network Administrator, NOC Analyst, Network Operations Specialist  
**Entry salary range:** $52,000 – $68,000  
**Mid-level salary range:** $68,000 – $95,000  
**Key certifications:** CompTIA Network+, Cisco CCNA, Juniper JNCIA  
**Time to first job:** 60–120 days (CCNA adds significant credibility)

The Cisco CCNA is the single highest-leverage certification for this path. Many employers treat it as a hard requirement for network roles. If you can study for 60–90 days and pass the exam before your terminal leave ends, you will enter the civilian job market with a credential that immediately signals competence.

### Path 3: Systems Administrator

**Why it fits:** Managing WIN-T nodes and maintaining server infrastructure in the field is closer to a sysadmin role than most veterans realize. You understand uptime requirements, redundancy, and the cost of failure.

**Typical job titles:** Systems Administrator, IT Systems Specialist, Infrastructure Technician, Junior SysAdmin  
**Entry salary range:** $55,000 – $72,000  
**Mid-level salary range:** $72,000 – $105,000  
**Key certifications:** CompTIA Server+, Microsoft AZ-900 (Azure Fundamentals), Red Hat RHCSA  
**Time to first job:** 90–150 days (cloud fundamentals add significant value)

Cloud computing has transformed this role. Adding an Azure or AWS fundamentals certification to your 25U background positions you for hybrid infrastructure roles that are in extremely high demand. Most organizations are mid-migration to cloud and need people who understand both on-premises and cloud environments — a combination your background supports naturally.

### Path 4: Cybersecurity Analyst (with additional training)

**Why it fits:** Your experience with COMSEC, crypto equipment, and secure communications gives you a foundation that most civilian cybersecurity candidates lack entirely. You already understand classification levels, need-to-know principles, and the operational cost of a security breach.

**Typical job titles:** Security Analyst, SOC Analyst, Information Security Specialist, Cybersecurity Technician  
**Entry salary range:** $62,000 – $82,000  
**Mid-level salary range:** $82,000 – $120,000  
**Key certifications:** CompTIA Security+, CompTIA CySA+, (ISC)² CC (Certified in Cybersecurity)  
**Time to first job:** 120–180 days (Security+ is the minimum bar)

This path requires the most additional study but offers the highest long-term earning potential and the strongest job security. The cybersecurity talent gap is well-documented — there are consistently more open roles than qualified candidates, and veterans with COMSEC backgrounds are actively recruited by defense contractors and federal agencies.

---

## The Certification Roadmap: Where to Start

The single most common mistake 25U veterans make is trying to get every certification at once. The following sequence is designed to get you employed as quickly as possible while building toward higher-earning roles.

**Phase 1 — Foundation (Weeks 1–6):** CompTIA A+ (two exams: Core 1 and Core 2). This is the baseline credential that proves fundamental IT competency to any employer. Study time: 4–6 weeks with 2–3 hours per day. Cost: approximately $246 per exam.

**Phase 2 — Networking (Weeks 7–14):** CompTIA Network+. This directly maps to your 25U experience and is often waived or fast-tracked for Signal veterans. Study time: 4–6 weeks. Cost: approximately $338.

**Phase 3 — Security (Weeks 15–22):** CompTIA Security+. This is DoD 8570 compliant and required for many government contractor roles. If you have a security clearance, this certification combined with your clearance makes you extremely competitive for federal IT positions. Study time: 4–6 weeks. Cost: approximately $370.

**Phase 4 — Specialization:** Choose one path — Cisco CCNA for networking, Microsoft AZ-104 for cloud/sysadmin, or CompTIA CySA+ for cybersecurity — based on which of the four career paths above resonates most.

One important note: the GI Bill and MyCAA can cover certification exam costs and prep courses. Check with your education center or a VSO before paying out of pocket.

---

## Translating Your Resume: Before and After

The language on your resume is the first filter between you and an interview. Here is a direct comparison of how to reframe common 25U duties.

**Before:** "Performed PMCS on AN/PRC-117G radio systems"  
**After:** "Maintained and troubleshot tactical VHF/UHF software-defined radios, ensuring 99%+ operational readiness for a 500-person unit"

**Before:** "Operated and maintained JNN node"  
**After:** "Managed wide-area network infrastructure supporting voice, data, and video communications for a forward-deployed brigade combat team"

**Before:** "Managed COMSEC equipment and keying material"  
**After:** "Administered cryptographic key management and encryption protocols for classified network infrastructure, maintaining 100% accountability across 47 line items"

**Before:** "Trained 12 soldiers on comms equipment"  
**After:** "Designed and delivered technical training programs for 12 personnel on complex communications systems, achieving 100% qualification rate"

The pattern is consistent: replace acronyms with plain-language descriptions, quantify wherever possible, and frame military outcomes in terms civilian employers recognize (uptime, readiness, accountability, training outcomes).

---

## Your 30-Day Action Plan

The transition from military to civilian IT does not require months of preparation before you can start moving. The following plan is designed to produce tangible results within 30 days.

**Week 1 — Foundation:** Register for CompTIA A+ Core 1 exam (schedule it 5–6 weeks out to create a deadline). Download Professor Messer's free A+ study guide. Update your LinkedIn profile with a civilian-language summary of your 25U experience. Connect with 10 veterans in IT roles on LinkedIn and send a brief, specific message asking for a 15-minute conversation.

**Week 2 — Resume and Network:** Rewrite your resume using the before/after framework above. Have it reviewed by a VSO or a veteran career coach. Apply to 5 IT support or network technician roles, even if you feel underqualified. The application process itself is valuable intelligence about what employers are asking for.

**Week 3 — Study and Outreach:** Dedicate 2 hours per day to A+ exam prep. Attend one local or virtual veteran career networking event. Research 10 companies in your target geography that hire IT professionals and follow them on LinkedIn.

**Week 4 — Interviews and Iteration:** By this point you may have initial screening calls. Prepare answers to the three most common IT interview questions: describe a time you troubleshot a complex technical problem, explain how you prioritize competing support requests, and walk me through how you would set up a new workstation. Each of these maps directly to 25U experience — you just need to translate the context.

---

## Resources Specifically for Veterans in IT

Several organizations exist specifically to help veterans enter the IT field, and most of their services are free.

**Hire Heroes USA** (hireheroesusa.org) offers free resume writing, interview coaching, and job placement services exclusively for veterans and military spouses. Their IT-focused career coaches understand MOS translation.

**Onward to Opportunity (O2O)** is a Syracuse University program that provides free IT certification training (including CompTIA A+, Network+, and Security+) to transitioning service members and veterans. Courses are available online and on many installations.

**VetSec** (vetsec.org) is a nonprofit focused specifically on cybersecurity careers for veterans. They offer mentorship, study groups, and job referrals within a veteran-only community.

**LinkedIn Veterans Program** offers one year of LinkedIn Premium free for veterans, which includes access to LinkedIn Learning courses (including full CompTIA exam prep courses) and InMail credits to reach out to hiring managers directly.

---

## The Bottom Line

The 25U MOS is one of the strongest technical backgrounds a veteran can bring into the civilian IT job market. The skills are real, the demand is high, and the translation — while requiring deliberate effort — is entirely achievable. The veterans who struggle in this transition are not those who lack skills; they are those who undersell what they already know.

Your mission in the civilian world is the same as it was in the Army: keep the network running, solve problems under pressure, and make sure the people who depend on you can do their jobs. The equipment is different. The mission is not.

Start with the 30-day plan above. Pick one certification path. Rewrite one bullet point on your resume today. The transition begins with a single action.`;

const now = new Date();

const conn = await createConnection(process.env.DATABASE_URL);

try {
  // Get the owner user id from the users table
  const [users] = await conn.execute("SELECT id, name FROM users LIMIT 1");
  const owner = users[0];
  if (!owner) {
    console.error("❌ No users found in DB — please log in first to create the owner account.");
    process.exit(1);
  }
  console.log(`ℹ️  Using author: ${owner.name} (id=${owner.id})`);

  const [result] = await conn.execute(
    `INSERT INTO blog_posts 
     (title, slug, excerpt, content, coverImageUrl, status, authorId, authorName, metaTitle, metaDescription, publishedAt, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, 'published', ?, ?, ?, ?, ?, ?, ?)`,
    [
      "Army 25U to IT Career: The Complete Transition Guide",
      "army-25u-to-it-career",
      "You spent years as an Army Signal Support Systems Specialist keeping communications alive under pressure. Here's exactly how to translate that experience into a thriving civilian IT career — with specific job titles, certifications, salary ranges, and a 30-day action plan.",
      content,
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&q=80",
      owner.id,
      owner.name,
      "Army 25U to IT Career: The Complete Transition Guide | Pathfinder",
      "Army 25U Signal Support Systems Specialist: complete guide to transitioning into civilian IT careers. Includes certification roadmap, resume translation examples, salary ranges, and a 30-day action plan.",
      now,
      now,
      now,
    ]
  );
  console.log("✅ Blog post inserted with id:", result.insertId);
} catch (err) {
  if (err.code === "ER_DUP_ENTRY") {
    console.log("ℹ️  Blog post with slug 'army-25u-to-it-career' already exists — skipping.");
  } else {
    throw err;
  }
} finally {
  await conn.end();
}
