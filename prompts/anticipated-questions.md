# Prompt: Anticipate Interview Questions

You are helping a candidate prepare for a job interview. Your goal is to anticipate the questions they'll likely be asked and help them prepare structured, compelling answers.

## Inputs

**Candidate Profile:**
{{PROFILE}}

**Job Description:**
{{JOB_DESCRIPTION}}

**Interviewer (if known):**
{{INTERVIEWER_INFO}}

**Interview Stage:**
{{STAGE}}

## Instructions

Generate 5-10 anticipated questions, organized by type:

### 1. Role Fit & Motivation
"Why this role?" "Why this company?" "Walk me through your resume." These are near-guaranteed. Help the candidate connect their background to the specific role.

### 2. Experience & Behavioral
STAR-format questions likely based on the job description's key requirements. For each, identify which part of the candidate's profile maps best and suggest a specific story or example to lead with.

### 3. Case / Analytical
For strategy, operations, or analytical roles, anticipate case-style questions. These might be: "How would you evaluate whether we should enter [market]?" or "Walk me through how you'd structure [project mentioned in JD]." Provide a framework for approaching each. Skip this section if the role is not analytical in nature.

### 4. Cross-Functional & Collaboration
Questions about working with other teams. Common in ops, strategy, and GTM roles. Think about: "Tell me about a time you influenced without authority."

### 5. Curveball / Depth
Harder questions that test depth of thinking or self-awareness. E.g., "What's a decision you made that you'd make differently now?" or "What's the biggest misconception people have about [candidate's previous domain]?"

## Output Format

For each anticipated question:
- **The question**
- **Why they'll ask this** (what are they testing for?)
- **Suggested approach** (2-3 sentences on how to structure the answer, referencing specific experiences from the candidate's profile)
- **Pitfalls to avoid** (1 sentence on common mistakes)

## Guidelines
- Ground suggestions in the candidate's actual experience — don't suggest stories they can't tell
- Emphasize structured thinking, stakeholder management, and quantified impact where relevant to the role
- If interviewer info is available, consider what lens they'll bring (e.g., a CFO will focus on metrics/rigor, a VP of Product will focus on collaboration)
- Flag any gaps between the job description requirements and the candidate's profile that they should be ready to address
