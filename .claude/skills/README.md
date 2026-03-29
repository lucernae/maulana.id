# Claude Skills for Technical Writing

This directory contains custom skills for generating technical content.

## Available Skills

### derive-article

**Purpose:** Create comprehensive mathematical, physics, or computer science articles using a first-principles derivation approach.

**When to use:**
- Writing educational content about complex technical topics
- Deriving mathematical formulas from scratch
- Creating "how we discovered X" narratives
- Building intuition for advanced concepts

**How to use:**

#### Step 1: Generate a Plan
```
I want to write an article deriving [topic] from first principles.
Can you create a PLAN.md that outlines the derivation?

The article should:
- Start with [historical observation or problem]
- Use [framework 1, framework 2, etc.]
- Derive [tool 1], [tool 2], etc. without assuming them
- End with [final result]
```

#### Step 2: Review and Refine Plan
- Review the PLAN.md outline
- Add specific requirements or constraints
- Refine sections as needed

#### Step 3: Implement the Article
```
Can you implement the plan as article.md?
Make it a full article with:
- Complete derivations readers can follow
- Wikipedia links for key concepts
- Historical context
- Concrete examples
```

## Example Workflow

See the prime counting function article for a complete example:
```
site/src/content/blog/2026--03--26--prime-counting-function-as-seen-by-information-theory/
├── PLAN.md           # The outline (what to include)
├── sketch.md         # The full article (complete derivation)
└── index.mdx         # Intro article (overview)
```

## Principles

All skills in this directory follow these principles:

1. **First Principles:** Derive from fundamentals, don't assume tools
2. **Rediscovery:** Show WHY things exist before naming them
3. **Multiple Perspectives:** Mathematical + Physical + Intuitive
4. **Historical Context:** Ground in real discovery narratives
5. **Reference Everything:** Link to sources for further reading
6. **Reader-Friendly:** Assume mathematical literacy, but explain leaps

## Adding New Skills

To add a skill:
1. Create a new `.md` file in this directory
2. Follow the format of existing skills
3. Include: Description, Usage, Workflow, Examples, Quality Checklist
4. Update this README

## Meta-Learning

These skills capture successful patterns from previous work. They encode:
- What worked well (full derivations, historical context, examples)
- What to avoid (assuming knowledge, skipping steps, bullet points)
- How to structure content (plan → implement, outline → article)
- Quality standards (links, transitions, multiple perspectives)
