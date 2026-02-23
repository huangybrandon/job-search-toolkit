# Prompt: Generate Candidate Profile

You are helping a job seeker create a structured candidate profile that will be used as context for interview prep, outreach drafting, and debrief generation.

Analyze the resume and any performance reviews provided, then produce a filled-in version of the profile template below. Be specific — extract real job titles, companies, dates, accomplishments, and metrics from the source material. Do not invent information. Where something is genuinely unknown (e.g. target role preferences), leave a clearly marked placeholder.

## Inputs

**Resume:**
{{RESUME}}

**Performance Reviews (optional):**
{{PERFORMANCE_REVIEWS}}

**Target Role Type (optional):**
{{TARGET_ROLE}}

---

## Output

Produce a `context/profile.md` file using this exact structure:

---

# Candidate Profile

## Background

**Name:** [from resume]
**Location:** [from resume if listed]
**Years of experience:** [calculate from resume]
**Current/most recent role:** [Title] at [Company]

## Work History

[For each role on the resume, in reverse chronological order:]

### [Company Name] — [Title] ([Start Year]–[End Year or Present])
- [Key accomplishment or responsibility — be specific, include metrics where available]
- [Key accomplishment or responsibility]
- [Key accomplishment or responsibility]

## Skills & Strengths

[Extract 4-6 concrete strengths evident from the resume and/or performance reviews. Write each as a short phrase with a brief supporting example, not a generic buzzword.]

- [e.g. "Cross-functional program management: led coordination across product, eng, and finance for a platform migration affecting 200+ clients"]
- ...

## What I'm Looking For

**Target roles:** [Use {{TARGET_ROLE}} if provided; otherwise infer from resume trajectory, or leave as "[FILL IN: e.g. Chief of Staff, Business Operations, GTM]"]
**Target company stage:** [FILL IN: e.g. Series A–C, growth-stage]
**Target company size:** [FILL IN: e.g. 50–500 employees]
**What matters most:** [FILL IN: e.g. ownership, impact, learning, comp, mission]
**What I'm moving away from:** [FILL IN: e.g. pure IC work without strategic scope]

## Key Stories / Examples

[Extract 3-5 strong stories from the resume and/or performance reviews. Map each to a common interview theme. Use specific details — not generic restatements of job duties.]

### Story 1: [Theme — infer from the story, e.g. "Building from scratch", "Leading through ambiguity", "Influencing without authority"]
**Situation:** [1-2 sentences of context]
**What I did:** [2-3 sentences on the specific actions taken]
**Result:** [Specific outcome, with metrics if available]

### Story 2: [Theme]
**Situation:** [...]
**What I did:** [...]
**Result:** [...]

### Story 3: [Theme]
**Situation:** [...]
**What I did:** [...]
**Result:** [...]

[Add more if strong material exists]

## Themes to Be Ready to Address

[Based on the resume and performance reviews, identify 2-3 things that might come up as concerns or areas for growth — and suggest an honest framing for each.]

- **[Theme, e.g. "Limited people management experience"]:** [Suggested framing — acknowledge honestly, then bridge to relevant experience]
- **[Theme]:** [Suggested framing]

## Performance Review Highlights

[If performance reviews were provided, extract 3-5 key themes or direct quotes that are useful for self-awareness questions and behavioral answers. If no reviews were provided, omit this section.]

- [Key theme or quote]
- [Key theme or quote]

---

## Guidelines
- Extract real details from the source material — titles, companies, metrics, dates
- For accomplishments, prefer "led X initiative that resulted in Y" over "responsible for X"
- If performance reviews are available, use them to surface patterns the candidate might not volunteer (e.g. a recurring strength or a consistent growth area)
- Clearly mark anything that needs user input with [FILL IN: ...] so they know what to complete
- The "What I'm Looking For" and "Themes to Address" sections often need human judgment — it's fine to leave placeholders with guidance
