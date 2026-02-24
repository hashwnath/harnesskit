# 🧠 The Brain: Agent Knowledge Graph

This document provides a visual map of the AI agent infrastructure, specialized personas, and the repository's rules.

## 🕸️ Agent Architecture Graph

```mermaid
graph TD
    %% Core Nodes
    User(("🧑‍💻 You (Dev)"))
    Planner["🧭 Planner Agent<br/>(Breaks tasks into steps)"]
    Implementer["🛠️ Implementer Agent<br/>(Writes code)"]
    Reviewer["🕵️ General Reviewer<br/>(Quality & Tests)"]
    ArchReviewer["🏛️ Architecture Reviewer<br/>(Layer boundaries)"]
    SecReviewer["🔐 Security Reviewer<br/>(Auth & Crypto)"]

    %% Documents
    AgentsMD[["📄 AGENTS.md<br/>(Universal Instructions)"]]
    ArchDocs[["🏛️ docs/ARCHITECTURE.md<br/>(Layer Rules)"]]
    SecDocs[["🔐 docs/SECURITY.md<br/>(Security Posture)"]]
    RelDocs[["🛡️ docs/RELIABILITY.md<br/>(SLAs & Health)"]]
    QualDocs[["✨ docs/QUALITY_SCORE.md<br/>(Grades)"]]
    ExecPlans[["📋 docs/exec-plans/*<br/>(Execution Plans)"]]
    DesignDocs[["💡 docs/design-docs/*<br/>(Decisions & Beliefs)"]]

    %% Edges
    User -->|Prompts| Planner
    Planner -->|Creates Plan| ExecPlans
    Planner -->|Hands off| Implementer
    Implementer -->|Reads| AgentsMD
    Implementer -->|Executes| ExecPlans
    Implementer -->|Generates Code| Code[(Repository Code)]

    %% Review Process
    Code -.->|PR/Review| ArchReviewer
    Code -.->|PR/Review| SecReviewer
    Code -.->|PR/Review| Reviewer

    %% Feedback Loop
    ArchReviewer -.->|Fails| Implementer
    SecReviewer -.->|Fails| Implementer
    Reviewer -.->|Fails| Implementer

    %% Knowledge Base Connections
    ArchReviewer ==>|Enforces| ArchDocs
    SecReviewer ==>|Enforces| SecDocs
    Reviewer ==>|Enforces| QualDocs

    %% General Readings
    Planner -.->|Reads Context| DesignDocs
    Planner -.->|Reads Context| RelDocs

    style User fill:#f9f,stroke:#333,stroke-width:2px
    style Code fill:#e6e6e6,stroke:#666,stroke-width:2px
```

## 📂 Core Concepts

- **AGENTS.md**: The root of the agentic setup. All IDEs and CLIs look here first.
- **Planner Phase**: Agents analyze the task and architecture, producing a markdown execution plan.
- **Implementer Phase**: Agents write code strictly following the `ARCHITECTURE.md` boundary rules.
- **Review Phase**: Sub-agents verify code quality, structure, and security before humans approve.
- **Enforcement**: Run `npx harnesskit enforce` to mechanically validate layer rules.
