# Project Wellness — end-of-day auto-commit

End-of-day sweep on 2026-05-31 found `AgentDocumentation/Project.md` missing; `Memory.md` and `Glossary.md` are in place.

## The plan

1. Run the `project-brief` skill to build `AgentDocumentation/Project.md` from the codebase (don't hand-stub it — the skill surveys the code and interviews Luke).
2. Once `Project.md` is in, the `Sessions/` folder will be created automatically the next time a session writes to it.
