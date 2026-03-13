---
name: github
description: "Interact with GitHub using the `gh` CLI. Use `gh issue`, `gh pr`, `gh run`, and `gh api` for issues, PRs, CI runs, and advanced queries."
---

# GitHub Skill

Use the `gh` CLI to interact with GitHub. Always specify `--repo owner/repo` when not in a git directory, or use URLs directly.

## Pull Requests

Check CI status on a PR:
```bash
gh pr checks 55 --repo owner/repo
```

List recent workflow runs:
```bash
gh run list --repo owner/repo --limit 10
```

View a run and see which steps failed:
```bash
gh run view <run-id> --repo owner/repo
```

View logs for failed steps only:
```bash
gh run view <run-id> --repo owner/repo --log-failed
```

When the user has approved branch deletion, pass `--delete-branch` to the merge
command to clean up in one step — avoids a separate delete call that may fail if
GitHub already removed the branch:
```bash
gh pr merge 453 --squash --delete-branch
```

## Usernames

Never guess GitHub usernames. Verify before using in any command:
- Authenticated user: use `@me` where the CLI supports it (e.g., `--assignee @me`,
  `--reviewer @me`). Fall back to `gh api user --jq '.login'` when `@me` isn't supported.
- Org members: `gh api orgs/{org}/members --jq '.[].login'`

## API for Advanced Queries

The `gh api` command is useful for accessing data not available through other subcommands.

Get PR with specific fields:
```bash
gh api repos/owner/repo/pulls/55 --jq '.title, .state, .user.login'
```

## JSON Output

Most commands support `--json` for structured output.  You can use `--jq` to filter:

```bash
gh issue list --repo owner/repo --json number,title --jq '.[] | "\(.number): \(.title)"'
```
