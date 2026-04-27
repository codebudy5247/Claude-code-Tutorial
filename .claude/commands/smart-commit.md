# Smart Commit Message Generator

Run `git add .` to stage all changes, then `git diff --cached` to see what's staged.

If there are no staged changes, tell the user "Nothing to commit." and stop.

Otherwise, analyze the diff and produce a commit message following the Conventional Commits specification:

  <type>(<scope>): <short summary>
  
  [optional body explaining WHY, not WHAT]
  [optional BREAKING CHANGE footer]

Types: feat | fix | docs | style | refactor | test | chore

Rules:
- summary under 72 characters, imperative mood
- if changes span multiple concerns, list them in the body
- flag any breaking changes in a BREAKING CHANGE footer

Then immediately run:
  git commit -m "<your commit message>"

If the commit message has a body, use multiple -m flags:
  git commit -m "<summary>" -m "<body>"

After committing, confirm to the user what was committed and show the short git log entry.