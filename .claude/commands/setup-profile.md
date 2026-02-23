Generate a profile.md from the user's resume and performance reviews: $ARGUMENTS

The user may optionally provide their target role type in the arguments (e.g. "Chief of Staff", "Business Operations", "GTM"). If not provided, infer it from their resume.

Follow these steps:

**1. Gather inputs**
- Read `context/resume.md`. If it doesn't exist, tell the user to copy `context/resume.example.md` to `context/resume.md` and paste their resume in, then stop.
- Check for any performance review files in `context/` (e.g. `context/performance_reviews.md` or any file matching `context/performance_reviews*.md`). Read them if present — they are optional.

**2. Generate profile**
Using the template in `prompts/generate-profile.md`, generate a filled-in profile by analyzing the resume and performance reviews.

**3. Save**
Write the output to `context/profile.md`.

**4. Confirm**
Tell the user the file was saved and suggest they review it before running `/prep` or `/outreach`. Point out any sections that were left as placeholders because the information wasn't available (e.g. "What I'm looking for" may need manual input).
