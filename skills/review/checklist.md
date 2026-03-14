# Review Checklist

Apply against the diff in two passes. Be specific — cite `file:line` and
suggest fixes. Skip anything that's fine. Only flag real problems.

## Pass 1 — Critical

These can block landing. Each finding needs explicit resolution.

### Race Conditions & Concurrency
- Read-check-write without atomicity (check-then-set that should be a
  single atomic operation)
- Concurrent creation without unique constraints or conflict handling
- State transitions that don't guard against concurrent updates
- Shared mutable state accessed without synchronization

### Trust Boundaries
- User input used without validation or sanitization
- External data (API responses, LLM output, file contents) persisted
  without format/type verification
- Direct object references that don't verify authorization (can user A
  access user B's data by manipulating IDs?)
- Secrets or credentials in code, logs, or error messages

### Data Safety
- Destructive operations without confirmation or soft-delete
- Migrations or schema changes that aren't backward-compatible with
  running code
- Type coercion at serialization boundaries (values crossing
  language/format boundaries where type could change)

## Pass 2 — Informational

Included in review findings but don't block landing.

### Conditional Side Effects
- Code paths that branch but forget a side effect on one branch
  (e.g., status updated but associated state not cleaned up)
- Log messages that claim an action happened but the action was
  conditionally skipped

### Error Handling
- Catch-all error handlers that swallow context (catch everything,
  log a generic message, continue)
- Error paths that fail silently — no error shown, no log, no alert
- Retry logic without backoff or bounds
- Resource cleanup missing in error paths (connections, file handles,
  temp files)

### Test Gaps
- New codepaths without corresponding tests
- Tests that assert state but not side effects
- Tests missing the failure/error path
- Security enforcement (auth, rate limiting, access control) without
  integration tests verifying the enforcement works end-to-end

### Dead Code & Consistency
- Variables assigned but never read
- Comments or docstrings describing old behavior after code changed
- Version/changelog inconsistencies

### Performance
- Unbounded queries or data structures that grow with input
- O(n²) patterns hidden in loops (lookup in a list inside a loop)
- Expensive operations repeated when they could be cached or hoisted

### Crypto & Secrets
- Weak randomness for security-sensitive values (use crypto-grade RNG)
- Non-constant-time comparisons on secrets or tokens
- Truncation instead of hashing (less entropy, easier collisions)

## Output Format

```
Review: N issues (X critical, Y informational)

CRITICAL:
- [file:line] Problem description
  Fix: suggested fix

INFORMATIONAL:
- [file:line] Problem description
  Fix: suggested fix
```

If no issues: `Review: No issues found.`

## Suppressions — Do NOT Flag

- Redundancy that aids readability
- "Add a comment explaining why" — comments rot, code should be clear
- Consistency-only changes with no functional impact
- Edge cases that can't occur given the actual input constraints
- Anything already addressed elsewhere in the diff
