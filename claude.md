### 1. Plan Mode Default

- Enter plan mode for ANY non-trivial task (3+ steps or architectural decisions)
- If something goes sideways, STOP and re-plan immediately — don't keep pushing
- Use plan mode for verification steps, not just building
- Write detailed specs upfront to reduce ambiguity

### 2. Subagent Strategy

- Use subagents liberally to keep main context window clean
- Offload research, exploration, and parallel analysis to subagents
- For complex problems, throw more compute at it via subagents
- One task per subagent for focused execution

### 3. Self-Improvement Loop

- After ANY correction from the user: update `tasks/lessons. md` with the pattern
- Write rules for yourself that prevent the same mistake
- Ruthlessly iterate on these lessons until mistake rate drops
- Review lessons at session start for relevant project

### 4. Verification Before Done

- Never mark a task complete without proving it works
- Diff behavior between main and your changes when relevant
- Ask yourself: "Would a staff engineer approve this?"
- Run tests, check logs, demonstrate correctness

### 5. Demand Elegance (Balanced)

- For non-trivial changes: pause and ask "is there a more elegant way?"
- If a fix feels hacky: "Knowing everything I know now, implement the elegant solution"
- Skip this for simple, obvious fixes — don't over-engineer
- Challenge your own work before presenting it

### 6. Autonomous Bug Fixing

- When given a bug report: just fix it. Don't ask for hand-holding
- Point at logs, errors, failing tests — then resolve them
- Zero context switching required from the user
- Go fix failing CI tests without being told how

## Task Management

1. **Plan First**: Write plan to `tasks/todo.md` with checkable items
2. **Verify Plan**: Check in before starting implementation
3. **Track Progress**: Mark items complete as you go
4. **Explain Changes**: High-level summary at each step
5. **Document Results**: Add review section to `tasks/todo. md`
6. **Capture Lessons**: Update `tasks/lessons. md` after corrections

## Core Principles

- **Simplicity First**: Make every change as simple as possible. Impact minimal code.
- **No Laziness**: Find root causes. No temporary fixes. Senior developer standards.

## Délégation de tâches

Créez des sous-agents pour isoler le contexte, paralléliser les travaux indépendants, ou déléguer les tâches mécaniques volumineuses. Ne créez pas de sous-agents lorsque le parent a besoin du raisonnement, lorsque la synthèse nécessite de maintenir les éléments ensemble, ou lorsque le surcoût de création domine.

Choisissez le modèle le moins cher qui peut accomplir la sous-tâche efficacement :

- Haiku : travaux mécaniques volumineux, sans jugement
- Sonnet : recherche ciblée, exploration de code, synthèse dans le cadre défini
- Opus : sous-tâches nécessitant une véritable planification ou des arbitrages

Les sous-agents suivent les mêmes règles de manière récursive, avec deux limites :

- Haiku ne crée pas de sous-agents supplémentaires. S'il en a besoin, la tâche était mal dimensionnée pour Haiku — retournez au parent.
- Profondeur maximale de création est 2 (parent → sous-agent → un niveau supplémentaire).

N'escaladez pas les niveaux sans raison concrète. Si un sous-agent réalise qu'il a besoin d'un niveau supérieur au sien, retournez au parent plutôt que de créer vers le haut.

Le parent possède la sortie finale et la synthèse inter-créations. Les instructions de l'utilisateur priment
