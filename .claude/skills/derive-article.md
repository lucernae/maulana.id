# Derive Article from First Principles

## Description
A skill for creating comprehensive mathematical, physics, or computer science articles using a first-principles approach. This skill helps generate both a detailed plan and a complete, readable article with proper references and derivations.

## Usage
Use this skill when you want to write a detailed technical article that:
- Derives concepts from first principles
- Uses a rediscovery narrative (derive first, reveal modern names later)
- Includes historical context and intuition
- Provides step-by-step derivations readers can follow
- Links to reference materials (Wikipedia, papers, etc.)

## Workflow

### Phase 1: Create the Plan (PLAN.md)

The plan is an **outline with directions**, not the full article. It should include:

1. **Frontmatter** for preview
2. **Purpose statement** - what the article will derive
3. **Target audience** - who should read this
4. **Derivation rules** - the principles to follow
5. **Section outlines** (10-15 sections typical) with:
   - Key questions to answer
   - Main derivation steps (outline form)
   - "Next step" transitions between sections
   - Modern names to reveal after derivation
   - Historical notes to include

**Example Plan Structure:**
```markdown
---
layout_name: blog-post
title: "Plan: [Topic] from First Principles"
description: "Outline for deriving [topic]"
date: YYYY-MM-DD
category:
  name: blog
---

## Section 1: [Empirical Starting Point]
**Historical context:** [18th-19th century observations]
**Key observation:** [What pattern do we see?]
**Strategy:** [How will we approach this?]
**Question:** [What do we need to find?]
**Next step:** [What's needed for next section]

## Section 2: [First Principle]
[Continue pattern...]
```

### Phase 2: Implement the Article (article.md or sketch.md)

Transform the plan into a **full article** with:

#### Content Requirements:

1. **Opening Section:**
   - Clear statement of what will be derived
   - Target audience and philosophy
   - Overview of the approach

2. **Historical Context:**
   - Who first observed the phenomenon
   - What tools were available at the time
   - Empirical observations before formal proofs

3. **Step-by-Step Derivations:**
   - Full prose, not just bullet points
   - Detailed mathematical steps
   - Concrete numerical examples
   - Intuitive explanations alongside formal math

4. **First Principles Approach:**
   - Derive tools as they become necessary
   - Don't assume prior knowledge of advanced tools
   - After deriving, reveal: "What we just derived is called [Name] ([Wikipedia link])"

5. **Transitions:**
   - "Next step" paragraphs connecting sections
   - Clear motivation for each new concept
   - Questions that lead naturally to next section

6. **Reference Links:**
   - Wikipedia links for key concepts on **first mention**
   - Format: `[concept name](https://en.wikipedia.org/wiki/...)
   - Link to papers, books for advanced topics

7. **Examples:**
   - Concrete numerical calculations
   - Small test cases
   - Visual descriptions

8. **Summary Section:**
   - Recap the complete derivation chain
   - Key insights (mathematical, physical, computational)
   - What was rediscovered

9. **Notes on Rigor:**
   - Acknowledge what was omitted for clarity
   - What's emphasized (insight vs formalism)
   - Recommended reading for full rigor

#### Writing Style:

- **Prose-heavy:** Full paragraphs, not bullet points
- **Narrative flow:** Tell a story of discovery
- **Multiple explanations:** Mathematical + intuitive + physical
- **Reader-friendly:** Assume mathematical literacy but explain jumps
- **Concrete before abstract:** Examples before general formulas

#### Mathematical Presentation:

- Use KaTeX: `$...$` for inline, `$$...$$` for display
- Number important equations
- Show intermediate steps
- Explain notation when first introduced
- Include units/dimensions where applicable

## Derivation Rules (Core Principles)

### 1. First Principles Only
Use fundamental frameworks:
- **Mathematics:** Information Theory (Max Ent), Fourier Analysis, Complex Analysis
- **Physics:** Conservation laws, symmetries, variational principles
- **Computer Science:** Complexity theory, algorithm analysis, information theory

Do NOT immediately introduce advanced tools. Derive them first.

### 2. Rediscovery Pattern
For each major concept:
```
Problem → Derive from first principles → Reveal modern name

Example:
"We need a function that weights integers by information content...
[derivation]
What we just derived is called the von Mangoldt function [link]"
```

### 3. Symmetry and Constraints
Explicitly identify:
- What symmetry does the problem respect?
- What are the natural constraints?
- What measure is appropriate? (Translation-invariant? Scale-invariant?)

### 4. Historical Context
Ground the derivation in history:
- Who first observed the pattern?
- What tools were available then?
- How did understanding evolve?

### 5. Multiple Perspectives
Provide at least 2-3 viewpoints:
- Mathematical (formal derivation)
- Physical/Intuitive (what does it mean?)
- Information-theoretic or computational (alternative framework)

## Example Topics

This skill works well for:

**Mathematics:**
- Deriving special functions (zeta, gamma, Bessel)
- Fourier/Laplace transforms from first principles
- Differential equations and their solutions
- Number theory results (PNT, quadratic reciprocity)

**Physics:**
- Deriving equations of motion (Lagrangian/Hamiltonian)
- Quantum mechanics from path integrals
- Statistical mechanics partition functions
- Field theories from symmetries

**Computer Science:**
- Algorithm complexity from information theory
- Data structures from access patterns
- Compression algorithms from entropy
- Cryptographic primitives from hardness assumptions

## File Organization

Recommended structure:
```
topic-folder/
├── PLAN.md          # The outline with directions
├── article.md       # The full implemented article
├── index.mdx        # Optional: intro article
└── references/      # Optional: supporting materials
```

## Quality Checklist

Before considering the article complete:

- [ ] Every key concept has a Wikipedia link on first mention
- [ ] Historical context provided for main ideas
- [ ] At least one concrete numerical example per major section
- [ ] "Next step" transitions between all major sections
- [ ] Modern names revealed AFTER derivation
- [ ] Summary section recaps the complete chain
- [ ] Notes on what was omitted for brevity
- [ ] Recommended reading for rigor provided
- [ ] All mathematical notation explained
- [ ] Prose flows naturally (not just equations)

## Anti-Patterns (What NOT to Do)

❌ **Don't:** Start with "Let $\zeta(s)$ be the Riemann zeta function defined as..."
✅ **Do:** Derive why we need a partition function, discover it, then reveal its name

❌ **Don't:** Use bullet points for main exposition
✅ **Do:** Write full paragraphs with narrative flow

❌ **Don't:** Skip intermediate steps in derivations
✅ **Do:** Show work, especially non-obvious algebraic steps

❌ **Don't:** Assume reader knows advanced tools
✅ **Do:** Build up from fundamentals, explain when introducing tools

❌ **Don't:** Leave concepts unlinked
✅ **Do:** Link to Wikipedia/references for every significant concept

## Notes

This skill produces articles that prioritize **insight and discovery** over **formal rigor**. The goal is to make advanced technical topics accessible by showing WHY things are defined the way they are, not just WHAT the definitions are.

The resulting articles are suitable for:
- Technical blogs
- Educational materials
- Supplementary readings for courses
- Appendices to papers
- Self-study guides

For publication-ready rigorous proofs, additional work on convergence conditions, error bounds, and formal statements would be needed.
