# Research Pipeline Template

A flexible, structured research framework that guides any research inquiry through a systematic 6-phase validation process. This template can be adapted for product research, academic studies, market analysis, policy evaluation, scientific investigation, and more.

---

## How to Customize This Template

**This is a framework, not a rigid process.** The phases below represent a general research progression that works across many domains, but you should adapt it to your specific needs.

### Adapting Phases for Your Domain

Each phase represents a research objective, not a fixed procedure. Consider:

- **Rename phases** to match your domain's terminology (e.g., "Literature Review" instead of "Landscape Analysis" for academic research)
- **Adjust success criteria** based on what matters for your field
- **Change the evidence types** you seek (peer-reviewed papers vs. market data vs. user interviews)

### When to Skip or Merge Phases

- **Skip Phase 4 (Differentiation)** if you are conducting exploratory research without a specific solution in mind
- **Merge Phases 2 and 3** when landscape analysis naturally includes feasibility considerations
- **Skip Phase 5** for pure research inquiries that do not require implementation planning
- **Start at Phase 2** if the problem/question is already well-established

### Adding Domain-Specific Phases

Insert additional phases where your domain requires them:

- **Ethics Review** (between Phases 3 and 4) for human subjects research
- **Regulatory Analysis** (after Phase 3) for policy or compliance research
- **Pilot Study Design** (between Phases 5 and 6) for experimental research
- **Stakeholder Mapping** (after Phase 1) for organizational research

---

## Quick Start - Automated Research

Simply provide your research topic and I will automatically:
1. Create a research folder for your inquiry
2. Run it through the applicable validation phases
3. Conduct web searches for relevant data and prior work
4. Document findings at each phase
5. Generate the final research document in `research-results/`

### How to Start

Describe your research topic in plain language:

```
"Research this topic: [your research question or idea]"
```

Examples:
```
"Research this topic: The effectiveness of remote work policies on employee productivity"
"Research this topic: Sustainable packaging alternatives for e-commerce"
"Research this topic: Machine learning approaches for early disease detection"
```

I will then:
- Create a folder for your research
- Execute phases sequentially
- Write phase documents as I go
- Stop and report if any phase reveals critical issues
- Generate final document in `research-results/` when complete

---

## Research Execution Process

### Phase 1: Problem/Question Definition
**Actions:**
- Clarify the core question or problem being investigated
- Identify the target audience, stakeholders, or affected population
- Search for evidence that this question/problem is significant
- Assess scope and boundaries of the inquiry

**Pass if:** Clear question defined, significance established, scope is manageable

### Phase 2: Landscape Analysis
**Actions:**
- Search for existing work, solutions, or prior research
- Analyze current approaches and their strengths/weaknesses
- Document the state of knowledge in this area
- Identify gaps, contradictions, or unexplored territory

**Pass if:** Landscape is understood, gaps or opportunities identified, research direction is justified

### Phase 3: Feasibility Assessment
**Actions:**
- Identify required resources, methods, or capabilities
- Assess availability and maturity of needed approaches
- Outline high-level methodology or approach
- Identify risks and constraints

**Pass if:** Approach is viable, resources are available, risks are understood and manageable

### Phase 4: Differentiation/Contribution Analysis
**Actions:**
- Define the unique contribution or value of this research
- Compare against existing work or alternatives
- Identify what makes this approach distinctive
- Clarify who benefits and how

**Pass if:** Clear contribution articulated, differentiation from prior work established

### Phase 5: Implementation/Methodology Path
**Actions:**
- Define initial scope or minimum viable approach
- Outline execution phases or methodology steps
- Estimate resource and time requirements
- Plan validation or evaluation strategy

**Pass if:** Path forward is clear, scope is achievable, validation approach defined

### Phase 6: Synthesis
**Actions:**
- Compile all findings into final document
- Summarize key insights and conclusions
- Provide actionable recommendations or next steps
- Document sources and methodology

**Output:** Complete research document in `research-results/`

---

## Handling Phase Issues

If any phase reveals critical problems:
1. I will stop and explain the issue
2. Document the finding in the phase file
3. Provide options:
   - **Refine:** Adjust the research question or approach and retry
   - **Pivot:** Explore a related but different direction
   - **Conclude:** Accept findings as the research outcome (negative results are still results)

---

## Project Structure

```
research/
├── CLAUDE.md                    # This file - research instructions
├── phases/                      # Phase templates and criteria
│   ├── 01-problem-definition.md
│   ├── 02-landscape-analysis.md
│   ├── 03-feasibility.md
│   ├── 04-differentiation.md
│   ├── 05-implementation.md
│   └── 06-synthesis.md
├── research-results/            # Final research documents
└── [your-topic]/                # Created for each new research
    ├── topic.md
    ├── phase-1-definition.md
    ├── phase-2-landscape.md
    ├── phase-3-feasibility.md
    ├── phase-4-differentiation.md
    └── phase-5-implementation.md
```

---

## Research Principles

1. **Evidence-Based:** Every claim backed by research, data, or clear reasoning
2. **Honest Assessment:** Document weaknesses and limitations, not just strengths
3. **Specific Focus:** Research the concrete topic, not generic concepts
4. **Critical Analysis:** Challenge assumptions, find gaps, stress-test conclusions
5. **Actionable Output:** Final document provides clear insights and next steps

---

## Commands

- `"Research this topic: [description]"` - Start full research process
- `"Continue research on [topic]"` - Resume incomplete research
- `"Re-run phase [N] for [topic]"` - Redo a specific phase with new information
- `"Show research status"` - List all research projects and their current phase

---

## Domain Examples

### Product/Startup Research
Adapt the framework for validating business ideas:
- **Phase 1:** Problem validation - Does this problem exist? Who has it?
- **Phase 2:** Competitive analysis - What solutions exist? What are their gaps?
- **Phase 3:** Technical/business feasibility - Can we build it? Is there a business model?
- **Phase 4:** Value proposition - Why would customers choose us?
- **Phase 5:** MVP and go-to-market planning
- **Phase 6:** Investment-ready summary

### Academic Research
Adapt for scholarly investigation:
- **Phase 1:** Research question formulation and significance
- **Phase 2:** Literature review and theoretical framework
- **Phase 3:** Methodological feasibility and resource assessment
- **Phase 4:** Contribution to the field and novelty
- **Phase 5:** Research design and timeline
- **Phase 6:** Research proposal or paper outline

### Market Research
Adapt for understanding markets and opportunities:
- **Phase 1:** Market question definition and business context
- **Phase 2:** Industry landscape and competitor mapping
- **Phase 3:** Data availability and research methodology feasibility
- **Phase 4:** Unique insights and strategic implications
- **Phase 5:** Research execution plan and stakeholder engagement
- **Phase 6:** Market intelligence report

### Policy Research
Adapt for policy analysis and recommendations:
- **Phase 1:** Policy problem definition and affected populations
- **Phase 2:** Current policy landscape and historical approaches
- **Phase 3:** Implementation feasibility and political viability
- **Phase 4:** Policy innovation and comparative advantage
- **Phase 5:** Implementation roadmap and stakeholder strategy
- **Phase 6:** Policy brief or recommendation document

### Scientific Research
Adapt for scientific investigation:
- **Phase 1:** Hypothesis formulation and scientific significance
- **Phase 2:** Prior research and current state of knowledge
- **Phase 3:** Experimental feasibility and resource requirements
- **Phase 4:** Scientific contribution and potential impact
- **Phase 5:** Experimental design and validation methodology
- **Phase 6:** Research summary and publication planning
