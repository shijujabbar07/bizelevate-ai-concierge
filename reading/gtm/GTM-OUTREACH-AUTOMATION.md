# BizElevate — Automated GTM Outreach System

**Created:** 2026-05-30
**Purpose:** How to run GTM outreach while working a full-time day job
**Audience:** Shiju (founder) — reference before any outreach sprint
**Status:** System defined. Week 1 not yet executed.

---

## The Founder Constraint

Full-time job limits GTM bandwidth to roughly 5-8 hours per week.
Direct outreach (cold calls, manual DMs, follow-ups) consumes that budget fast and doesn't scale.

**The fix:** Build a system that generates conversations while you're at work.
You respond to interest. The system does the prospecting.

---

## Core Principle — Eat Your Own Dog Food

The AI automation system you sell to clinics should run your own GTM.

When you're in a demo with a clinic owner, you can say:
> "The system I used to get this meeting with you today is the same system I'm proposing
> for your practice. It handled outreach while I was at my day job. This conversation is
> proof it works."

That closes harder than any sales pitch.

---

## The Three-Layer System

```
Layer 1: Lead List        →   Who to target (30 min/week)
Layer 2: Outreach Engine  →   Automated email sequences (set once, runs daily)
Layer 3: Content Engine   →   LinkedIn content warms up cold leads passively
```

Run all three in parallel. They reinforce each other.
A prospect who's had your email AND seen your LinkedIn content is 3-5x more likely to reply.

---

## Layer 1 — Lead List

### Sources (in order of recommendation)

| Source | What you get | Cost | Start? |
|--------|-------------|------|--------|
| **Apollo.io** (free tier) | 50 email leads/month, clinic owners, practice managers | Free | Yes — start here |
| **Google Maps + Outscraper** | Local clinic phone/email | Free | Yes, for local density |
| **LinkedIn manual search** | Dentists, physios, allied health in your city | Free, slower | Supplement |
| **LinkedIn Sales Navigator** | Best targeting by role + company size | $100/mo | After client 2 |

### Target Profile (Week 1)

- **Role:** Practice owner, practice manager, clinic director
- **Industry:** Dental, physiotherapy, allied health, GP clinics, beauty/wellness
- **Location:** Your city — local trust matters for first clients
- **Size:** Solo to 5-practitioner — they feel the missed call pain most acutely

### Weekly Routine

Saturday morning: Pull 50 new contacts from Apollo. Add to Instantly campaign. Done.

---

## Layer 2 — Outreach Engine

### Recommended Tool: Instantly.ai

**Cost:** $37/mo
**What it does:** Sends your email sequence, tracks opens, pauses when someone replies, handles follow-up timing automatically.

**Setup (one-time, 2-3 hours):**
1. Connect your Gmail (use a domain email, not personal Gmail)
2. Warm up the sending inbox for 2 weeks before first send (Instantly does this automatically)
3. Write the 3-email sequence below
4. Upload lead list
5. Set schedule: Mon-Fri, 8am-5pm local time
6. Activate

After that: you only open Instantly when someone replies.

---

### The 3-Email Sequence

Write these once. Use them for every campaign until reply rate drops below 5%.

---

**Email 1 — The Problem (Day 1)**

```
Subject: [Clinic name] — missed calls?

Hi [First name],

Quick question — what happens at [Clinic name] when a patient calls
after hours or during a busy period and no one picks up?

Most clinics I talk to either lose the booking entirely, or the
receptionist spends the next morning chasing callbacks.

I've built a simple AI system that handles those calls automatically —
captures the reason, sends the patient a confirmation, and alerts the
practice. Takes about a week to set up.

Worth a 20-minute call to see if it fits?

[Your name]
BizElevate
```

---

**Email 2 — Social Proof (Day 5, if no reply)**

```
Subject: Re: missed calls?

Just following up on my note from earlier this week.

We recently set this up for a physio practice — they were losing
around 3-4 bookings per week to unanswered after-hours calls.
First month in, they recovered 11 appointments they would have lost.

Happy to show you how it works in 20 minutes if the timing is right.

[Your name]
```

---

**Email 3 — Soft Close (Day 10, if no reply)**

```
Subject: Last note

Not going to keep clogging your inbox — just one last note.

If missed calls or after-hours coverage is ever a pain point at
[Clinic name], I'm happy to walk you through what we've built.

Demo link if you'd rather watch than talk: [Loom link]

[Your name]
```

---

### Build vs. Buy Decision

| Situation | Recommendation |
|-----------|---------------|
| Pre-revenue, no paying clients yet | Use Instantly.ai — don't build |
| First client live, want to customise | Build the n8n version (see below) |
| Demonstrating product capability in demos | Build the n8n version — it's your live proof |

**n8n version (build after first client):**

```
Google Sheets (lead list)
  → n8n trigger (daily 8am)
  → Claude (personalise email per lead using clinic name/type)
  → Gmail/SMTP (send)
  → Wait node (4 days)
  → HTTP check (did they reply?)
  → If no reply → send follow-up
  → Log outcome to Sheets
```

This becomes a demo artefact. Show it in client calls as "here's the system running my own outreach."

---

## Layer 3 — LinkedIn Content Engine

### Purpose

Warm up leads who've received your email. Establish credibility passively.
You are not trying to go viral. You are trying to be recognised when your email lands.

### Saturday Routine (60 minutes total)

Write 4 posts for the coming week. Schedule with Buffer (free tier). Done.

### Post Formats That Work

| Format | Example topic |
|--------|--------------|
| **Before/After story** | "A dental practice was losing 4 bookings/week. Here's what changed." |
| **Myth bust** | "You don't need a 24/7 receptionist to never miss a call." |
| **Product demo clip** | 60-second Loom of the AI handling a missed call |
| **Industry insight** | "Why most clinic front desks will look different in 3 years" |
| **Win post** | "[Clinic] recovered 11 missed appointments in 30 days." (use after first case study) |

### Rules for LinkedIn Content

- 150-200 words per post maximum
- One real insight per post, not a listicle
- No content until you have one live paying client for case study posts — fabricated proof is worse than no proof
- Educational and insight posts can start now — product proof posts wait for case study

---

## Booking Automation (Converting Replies to Demos)

When someone replies to your email, you need them booked without a back-and-forth.

**Setup:**
1. Calendly free tier - set available slots (evenings + weekends)
2. Include Calendly link in every email (Email 3 especially)
3. Enable Calendly's built-in reminders (24hr + 1hr before demo)
4. After each demo: Instantly can send an automated follow-up sequence

**Demo response template (when someone replies yes):**
```
Great to hear from you [Name] — happy to show you how it works.

Grab a 20-minute slot here that works for you: [Calendly link]

I'll send a short overview beforehand so you're not going in cold.
```

---

## Commission/Referral Partner Model

For friends or contacts willing to refer prospects:

### When It Works

- Friend has genuine relationships with clinic owners or SME operators
- They can explain the product in two sentences
- Motivated by income, not just doing you a favour
- Their job is "get me in a room" — not closing the deal (you close)

### When It Fails

- Friend has no relevant network
- Complex pitch required before any referral
- No structure or agreement in place
- Expectation that they cold prospect

### Recommended Structure

| Payment trigger | Amount |
|----------------|--------|
| Qualified intro (meeting booked) | $200-$300 flat |
| Client closes (signs contract) | 10-15% of first year MRR |

Put it in writing. Even with friends. A simple 1-page referral agreement prevents friction later.

### Channel Partners (Better Than Friends at Scale)

Find people who already serve your target market:

- Clinic management consultants
- Healthcare IT advisors
- Practice management software vendors (complementary, not competing)
- Business coaches who serve SME owners
- Accountants / bookkeepers to small businesses

These people have warm relationships with 20-50 clinic owners. One good channel partner beats five commission friends.

**Revenue share:** 10-20% of Year 1 revenue per referred client. They do warm intro. You do demo and close.

---

## Week 1 Execution Checklist

- [ ] Sign up for Apollo.io (free), export 50 clinic leads in your city
- [ ] Sign up for Instantly.ai ($37/mo), connect Gmail/domain email
- [ ] Write the 3-email sequence (customise to your voice)
- [ ] Upload leads, set schedule Mon-Fri business hours, activate
- [ ] Set up Calendly with your available slots
- [ ] Record a 3-minute Loom of the product working (this is your demo link)
- [ ] Write and schedule 4 LinkedIn posts for next week via Buffer

**Total setup time:** 3-4 hours this weekend. Then it runs.

---

## Daily Operating Routine (5 Minutes)

- Check Instantly for new replies - respond same day while they're warm
- Check LinkedIn notifications - engage with comments quickly
- Check Calendly for new demo bookings

That is the entire daily commitment. You are responding to interest, not generating it manually.

---

## Time Allocation (Full-Time Job Constraint)

| When | Activity | Time |
|------|----------|------|
| Weekday evenings | Reply to email leads, demo calls, follow-ups | 30-60 min |
| Saturday morning | Pull new leads from Apollo, write 4 LinkedIn posts | 60-90 min |
| Automation runs | Email sequences, reminders, scheduling | 0 min (automated) |

5-8 focused hours per week, pointed at the right things, beats 40 hours of unfocused manual outreach.

---

## Tool Stack Summary

| Tool | Purpose | Cost |
|------|---------|------|
| Apollo.io | Lead sourcing | Free (50/mo) |
| Instantly.ai | Email sequences | $37/mo |
| Calendly | Demo scheduling | Free |
| Buffer | LinkedIn scheduling | Free |
| Loom | Demo video | Free |
| n8n (own stack) | Custom sequences (Phase 2) | Already have it |

---

## Key Insight — Distribution Over Direct Sales

The most effective GTM for a technical founder with limited time is:

1. **Product-led growth** - let the product sell itself through results
2. **Channel partnerships** - leverage others' existing relationships
3. **Content / thought leadership** - async, scalable, warms cold leads

NOT: traditional cold outreach requiring real-time presence and constant follow-up.

Direct outreach (cold calls, manual DMs) requires time you don't have.
Automated sequences + channel partners give you the same pipeline without the time cost.

---

## Next Review

Review this document:
- Before any outreach sprint
- When reply rate drops below 5% (rewrite the sequence)
- When adding a new channel partner
- After first client closes (update social proof in email templates)

---

*See also: [GTM-STRATEGY.md](GTM-STRATEGY.md) for pricing, gaps, and ordered action sequence.*
*See also: [sales-call.md](../checklists/sales-call.md) for objection handling scripts.*
