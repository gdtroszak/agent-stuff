---
name: plan-product
description: "Challenge premises and find the best version of a feature or product idea. Use before engineering planning to ensure you're solving the right problem."
---

# Plan: Product Thinking

Pressure-test a feature idea or product direction before committing to
engineering work. The goal is to ensure we're solving the right problem
at the right scope.

This is not engineering review — no architecture diagrams, error maps, or
test matrices. That comes later. This is about product clarity.

## When to Use

- Before starting a new feature or project
- When a task description feels too literal or too vague
- When you want to challenge whether the obvious approach is the right one
- Before engineering planning or implementation

## Process

### 1. Understand the Request

Read the issue, task description, or user's explanation fully. Read relevant
code to understand the current state. Then restate the request back in your
own words — what is the user actually trying to achieve?

Don't proceed until the user confirms you've understood the intent.

### 2. Premise Challenge

Before accepting the request at face value, ask:

- **Is this the right problem?** Could a different framing yield a simpler
  or more impactful solution?
- **What's the actual outcome?** What does the user (end-user, not developer)
  get? Is this plan the most direct path to that outcome?
- **What if we did nothing?** Is this a real pain point or a hypothetical one?
- **What already exists?** What existing code, flows, or tools partially solve
  this? Can we build on them instead of building new?

Present your analysis. If the premise holds up, say so and move on. If it
doesn't, explain why and propose a reframe. Wait for the user's response
before proceeding.

### 3. Scope Mode

Ask the user which mode fits this work:

- **Expand** — The idea is good but could be bigger. Push scope up. Find
  the version that's 10x more valuable for 2x the effort. Ask "what would
  make this feel inevitable and delightful?" Default for greenfield features.
- **Hold** — The scope is right. Don't expand or reduce. Focus on making
  the current plan as clear and complete as possible. Default for well-scoped
  tasks.
- **Reduce** — The scope is too large or the direction is uncertain. Find
  the minimum version that delivers the core value. Cut everything else.
  Default for plans touching many files or introducing many new abstractions.

Suggest a default based on context, but let the user override.

### 4. Mode-Specific Analysis

**Expand:**
- What's the 10-star version? Describe concretely what the user would
  experience — start from the interaction, not the architecture.
- What adjacent improvements (< 1 hour each) would make this feature
  feel polished? List 3-5 specific opportunities.
- What would make this a platform other features can build on?

**Hold:**
- Is every piece of this plan necessary? Flag anything that could be
  deferred without blocking the core objective.
- Are there implicit assumptions that should be made explicit?
- What's the one thing most likely to be wrong about this plan?

**Reduce:**
- What's the absolute minimum that ships value? Everything else is
  a follow-up.
- What can be deferred vs. what must ship together?
- Is there a simpler approach that gets 80% of the value?

Work through the analysis conversationally. Ask one question at a time
when the answer shapes what comes next. Don't batch deep questions.

### 5. Dream State

Map where this work fits in the bigger picture:

```
CURRENT STATE  →  THIS CHANGE  →  WHERE WE WANT TO BE
```

Does this change move toward the long-term direction or create a detour?
If it's a detour, is that acceptable?

### 6. Wrap Up

Summarize:
- **Refined problem statement** — one paragraph on what we're actually
  building and why
- **Scope decisions** — what's in, what's explicitly out, what's deferred
- **Key assumptions** — things we're betting on being true
- **Open questions** — anything unresolved that engineering planning should
  address

Offer to write this summary to a file. For multi-session or complex work,
suggest a location in the repo (e.g., alongside the feature code or in a
docs directory). For quick scope checks, leaving it in the conversation
is fine. Let the user decide.
