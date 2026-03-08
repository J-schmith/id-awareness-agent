import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database ...");

  // ── Themes ──────────────────────────────────────────────────────────────

  const mentalHealth = await prisma.theme.upsert({
    where: { label: "Mental Health" },
    update: {},
    create: {
      label: "Mental Health",
      description:
        "Initiatives promoting psychological well-being, stress management, and mental health awareness across the organisation.",
      color: "#34c759",
    },
  });

  const lgbtq = await prisma.theme.upsert({
    where: { label: "LGBTQ+" },
    update: {},
    create: {
      label: "LGBTQ+",
      description:
        "Celebrating and supporting lesbian, gay, bisexual, transgender, queer, and other diverse identities.",
      color: "#af52de",
    },
  });

  const disability = await prisma.theme.upsert({
    where: { label: "Disability & Accessibility" },
    update: {},
    create: {
      label: "Disability & Accessibility",
      description:
        "Advancing inclusion for people with disabilities and championing accessible design in products and workplaces.",
      color: "#0071e3",
    },
  });

  const racialEquity = await prisma.theme.upsert({
    where: { label: "Racial Equity" },
    update: {},
    create: {
      label: "Racial Equity",
      description:
        "Driving conversations and action on racial justice, representation, and systemic change.",
      color: "#ff9500",
    },
  });

  const genderEquality = await prisma.theme.upsert({
    where: { label: "Gender Equality" },
    update: {},
    create: {
      label: "Gender Equality",
      description:
        "Promoting equal opportunities, pay equity, and gender-inclusive policies across all levels.",
      color: "#ff3b30",
    },
  });

  console.log("  Themes created.");

  // ── Admin User ──────────────────────────────────────────────────────────

  const adminUser = await prisma.user.upsert({
    where: { email: "sarah@company.com" },
    update: {},
    create: {
      name: "Sarah Lane",
      email: "sarah@company.com",
      role: "admin",
    },
  });

  console.log("  Admin user created.");

  // ── Awareness Days ──────────────────────────────────────────────────────

  const worldHealthDay = await prisma.awarenessDay.create({
    data: {
      name: "World Health Day",
      date: new Date("2026-04-07T00:00:00.000Z"),
      themeId: mentalHealth.id,
      sourceUrl: "https://www.who.int/campaigns/world-health-day",
      sourceNotes: "WHO flagship awareness day, focus changes annually.",
      status: "confirmed",
    },
  });

  const idahot = await prisma.awarenessDay.create({
    data: {
      name: "International Day Against Homophobia, Biphobia and Transphobia",
      date: new Date("2026-05-17T00:00:00.000Z"),
      themeId: lgbtq.id,
      sourceUrl: "https://may17.org/",
      sourceNotes: "Observed globally since 2004.",
      status: "confirmed",
    },
  });

  const gaad = await prisma.awarenessDay.create({
    data: {
      name: "Global Accessibility Awareness Day",
      date: new Date("2026-05-21T00:00:00.000Z"),
      themeId: disability.id,
      sourceUrl: "https://accessibility.day/",
      sourceNotes:
        "Third Thursday of May. Focuses on digital access and inclusion.",
      status: "discovered",
    },
  });

  const prideMonth = await prisma.awarenessDay.create({
    data: {
      name: "Pride Month",
      date: new Date("2026-06-01T00:00:00.000Z"),
      themeId: lgbtq.id,
      sourceUrl: "https://www.loc.gov/lgbt-pride-month/",
      sourceNotes: "Month-long celebration throughout June.",
      status: "discovered",
    },
  });

  const mandelaDay = await prisma.awarenessDay.create({
    data: {
      name: "Nelson Mandela International Day",
      date: new Date("2026-07-18T00:00:00.000Z"),
      themeId: racialEquity.id,
      sourceUrl: "https://www.un.org/en/events/mandeladay/",
      sourceNotes:
        "UN-recognised day calling for 67 minutes of community service.",
      status: "confirmed",
    },
  });

  const worldMentalHealthDay = await prisma.awarenessDay.create({
    data: {
      name: "World Mental Health Day",
      date: new Date("2026-10-10T00:00:00.000Z"),
      themeId: mentalHealth.id,
      sourceUrl:
        "https://www.who.int/campaigns/world-mental-health-day",
      sourceNotes: "Annual WHO campaign held on 10 October.",
      status: "discovered",
    },
  });

  console.log("  Awareness days created.");

  // ── Message Drafts ──────────────────────────────────────────────────────

  await prisma.messageDraft.create({
    data: {
      awarenessDayId: worldHealthDay.id,
      subject: "World Health Day 2026 — Putting Well-Being First",
      body: `<h2>World Health Day 2026</h2>
<p>Hi everyone,</p>
<p>April 7 marks <strong>World Health Day</strong>, a moment to reflect on the connection between physical and mental well-being in our daily lives.</p>
<p>This year the World Health Organisation is spotlighting the importance of accessible healthcare and preventive support. At our company, we believe that starts right here in the workplace.</p>
<h3>What you can do this week</h3>
<ul>
  <li><strong>Take a well-being break</strong> &mdash; block 30 minutes on your calendar for a walk, meditation, or simply stepping away from screens.</li>
  <li><strong>Explore our EAP resources</strong> &mdash; free, confidential counselling is available 24/7 through our Employee Assistance Programme.</li>
  <li><strong>Join the lunchtime panel</strong> &mdash; our Health &amp; Safety team hosts a live Q&amp;A on 7 April at 12:30 pm GMT.</li>
</ul>
<p>Small actions add up. Let&rsquo;s make health a priority &mdash; not just today, but every day.</p>
<p>Warm regards,<br/>The I&amp;D Team</p>`,
      status: "pending",
      version: 1,
    },
  });

  await prisma.messageDraft.create({
    data: {
      awarenessDayId: idahot.id,
      subject:
        "Standing Together on IDAHOBIT — 17 May",
      body: `<h2>International Day Against Homophobia, Biphobia &amp; Transphobia</h2>
<p>Dear colleagues,</p>
<p>On <strong>17 May</strong>, people around the world come together to speak out against discrimination based on sexual orientation and gender identity. This day &mdash; known as <em>IDAHOBIT</em> &mdash; reminds us that acceptance and allyship are not passive; they require ongoing effort.</p>
<h3>How to take part</h3>
<ul>
  <li><strong>Add your pronouns</strong> to your email signature and Slack profile to signal an inclusive environment.</li>
  <li><strong>Attend the virtual roundtable</strong> on 17 May at 15:00 GMT, hosted by our LGBTQ+ Employee Resource Group.</li>
  <li><strong>Share a story</strong> &mdash; if you feel comfortable, tell us what allyship means to you using #IDAHOBIT2026 on the intranet.</li>
</ul>
<p>Everyone deserves to feel safe, seen, and respected. Thank you for being part of a culture that makes that possible.</p>
<p>With pride,<br/>The I&amp;D Team</p>`,
      status: "pending",
      version: 1,
    },
  });

  await prisma.messageDraft.create({
    data: {
      awarenessDayId: gaad.id,
      subject:
        "Global Accessibility Awareness Day — Building for Everyone",
      body: `<h2>Global Accessibility Awareness Day 2026</h2>
<p>Hi team,</p>
<p><strong>21 May</strong> is Global Accessibility Awareness Day (GAAD), a day dedicated to digital access and inclusion for the more than one billion people worldwide living with disabilities.</p>
<p>Accessibility is not an edge case &mdash; it is a fundamental part of great design, great engineering, and great leadership.</p>
<h3>Three things you can do today</h3>
<ol>
  <li><strong>Try navigating with your keyboard only</strong> &mdash; close your mouse for 15 minutes and experience our products the way many users do every day.</li>
  <li><strong>Run a quick audit</strong> &mdash; use the WAVE or axe browser extension to check one page you own for accessibility issues.</li>
  <li><strong>Join our Accessibility Guild</strong> &mdash; the next meeting is 21 May at 11:00 am GMT. All skill levels welcome.</li>
</ol>
<p>When we design for the margins, we make things better for everyone. Let&rsquo;s keep pushing forward.</p>
<p>Best,<br/>The I&amp;D Team</p>`,
      status: "pending",
      version: 1,
    },
  });

  console.log("  Message drafts created.");

  // ── Subscribers ─────────────────────────────────────────────────────────

  await prisma.subscriber.createMany({
    data: [
      {
        email: "james.kim@company.com",
        name: "James Kim",
        segments: JSON.stringify(["London", "Engineering"]),
      },
      {
        email: "maya.patel@company.com",
        name: "Maya Patel",
        segments: JSON.stringify(["NYC", "Marketing"]),
      },
      {
        email: "tom.reyes@company.com",
        name: "Tom Reyes",
        segments: JSON.stringify(["ERG Lead", "San Francisco"]),
      },
      {
        email: "aisha.okonkwo@company.com",
        name: "Aisha Okonkwo",
        segments: JSON.stringify(["Sydney", "People Ops"]),
      },
      {
        email: "chris.larsson@company.com",
        name: "Chris Larsson",
        segments: JSON.stringify(["Stockholm", "Design"]),
      },
    ],
  });

  console.log("  Subscribers created.");

  // ── Audit Log Entries ───────────────────────────────────────────────────

  await prisma.auditLog.createMany({
    data: [
      {
        action: "create",
        entityType: "Theme",
        entityId: mentalHealth.id,
        actor: "sarah@company.com",
        metadata: JSON.stringify({ label: "Mental Health" }),
      },
      {
        action: "confirm",
        entityType: "AwarenessDay",
        entityId: worldHealthDay.id,
        actor: "sarah@company.com",
        metadata: JSON.stringify({
          name: "World Health Day",
          previousStatus: "discovered",
          newStatus: "confirmed",
        }),
      },
      {
        action: "create",
        entityType: "AwarenessDay",
        entityId: idahot.id,
        actor: "system:scraper",
        metadata: JSON.stringify({
          name: "International Day Against Homophobia, Biphobia and Transphobia",
          source: "https://may17.org/",
        }),
      },
      {
        action: "draft_generated",
        entityType: "MessageDraft",
        entityId: worldHealthDay.id,
        actor: "system:ai-agent",
        metadata: JSON.stringify({
          awarenessDay: "World Health Day",
          version: 1,
        }),
      },
      {
        action: "subscriber_import",
        entityType: "Subscriber",
        entityId: "batch",
        actor: "sarah@company.com",
        metadata: JSON.stringify({ count: 5, source: "csv_upload" }),
      },
    ],
  });

  console.log("  Audit log entries created.");
  console.log("Seeding complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
