# Project Workflow: GesBox

## Guiding Principles

1. **The Plan is the Source of Truth:** All work must be tracked in `plan.md`.
2. **The Tech Stack is Deliberate:** Changes to the tech stack must be documented in `tech-stack.md` *before* implementation.
3. **Task Integrity:** Tasks are implemented sequentially, verified and committed with descriptive conventional commit messages.
4. **User Experience First:** Every decision prioritizes user experience, speed, and safety.
5. **Non-Interactive & CI-Aware:** Prefer non-interactive commands. Use `CI=true` for linting and build checks.

## Task Workflow

All tasks follow this lifecycle:

1. **Select Task:** Choose the next available task from `plan.md` in sequential order.
2. **Mark In Progress:** Before beginning work, edit `plan.md` and change the task from `[ ]` to `[~]`.
3. **Implementation:**
   - Implement the necessary changes according to the specifications in `spec.md`.
   - Maintain code consistency with `conductor/code_styleguides/`.
4. **Validation & Quality Check:**
   - Run type-check / linting / build verification if appropriate.
   - Verify visually or via runtime execution.
5. **Commit Code Changes:**
   - Stage all code changes related to the task.
   - Commit with a clear, conventional commit message (e.g., `feat(auth): add google recaptcha v3 hook`).
6. **Attach Task Summary with Git Notes:**
   - Obtain commit hash (`git log -1 --format="%H"`).
   - Create task summary note and attach via `git notes add -m "<summary>" <commit_hash>`.
7. **Record Task Commit SHA & Update Plan:**
   - Update `plan.md` marking task as `[x]` with commit SHA.
   - Stage and commit `plan.md` update.

## Phase Completion & Checkpointing Protocol

When a Phase is completed:
1. Announce completion of the phase.
2. Provide step-by-step manual verification steps for the user.
3. Await explicit user confirmation.
4. Record the phase checkpoint commit SHA in `plan.md` (e.g. `[checkpoint: <sha>]`) and commit the update.

## Quality Gates

Before marking any task complete, verify:
- [ ] Code follows project style guidelines (`conductor/code_styleguides/`)
- [ ] Type safety is enforced (TypeScript types without avoidable `any`)
- [ ] No linting or build errors
- [ ] Responsive UI verified on mobile and desktop
- [ ] Error handling and UX feedback in place
- [ ] No secrets or sensitive keys exposed on client side

## Commit Guidelines

Format: `<type>(<scope>): <description>`

Types:
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code refactoring
- `style`: Formatting / style adjustments
- `docs`: Documentation
- `chore`: Maintenance / configuration
