# Smart Commit Message Generator

Run `git diff --cached` to see the staged changes.
Analyze them and produce a commit message following
the Conventional Commits specification:

  <type>(<scope>): <short summary>
  
  [optional body explaining WHY, not WHAT]
  [optional BREAKING CHANGE footer]

Types: feat | fix | docs | style | refactor | test | chore

Rules:
- summary under 72 characters, imperative mood
- if changes span multiple concerns, list them in the body
- flag any breaking changes in a BREAKING CHANGE footer

Output ONLY the commit message, nothing else.
Then ask: "Run git commit with this message? (yes/no)"