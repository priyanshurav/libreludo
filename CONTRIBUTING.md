# Contributing to LibreLudo

Thanks for taking the time to contribute to **LibreLudo**. Contributions of all kinds are welcome — fixing bugs, improving the UI, adding features, writing tests, or even improving documentation.

---

## Core Development Principles

LibreLudo is designed to be a fast, privacy-respecting PWA. To keep the codebase clean and performant, please keep the following boundaries in mind before starting work:

- Architecture: We use React, TypeScript, and Redux Toolkit. Ensure changes align with existing reducer patterns (avoid scattering global state locally) and maintain strict type safety.

- Dependencies: We actively minimize external dependencies to keep the app lightweight. If your feature requires a new npm package, please open an issue to discuss it first.

- Privacy First: We are committed to an ad-free, untracked experience. PRs introducing telemetry, analytics, or any form of data collection will not be merged.

---

## Before opening an issue or PR

A quick check before starting helps keep things organized.

- Look through the existing issues to see if someone has already reported the problem or suggested the idea.
- If you're planning a **larger change or new feature**, it's usually better to open an issue first so the approach can be discussed before work begins.

This helps avoid duplicated effort.

---

## Reporting a bug

If you've found a bug, please open an issue and include:

- A short description of what went wrong
- Steps to reproduce it
- What you expected to happen vs. what actually happened
- Browser and OS (including versions)

The more detail you include, the faster it can be understood and resolved.

---

## Local setup

LibreLudo requires <a href="https://nodejs.org/" target="_blank" rel="noopener noreferrer">Node.js 20+</a>.

```bash
# Fork the repository on GitHub, then clone your fork
# Replace YOUR_USERNAME with your GitHub username
git clone https://github.com/YOUR_USERNAME/libreludo.git
cd libreludo

# Install dependencies
npm install

# Start the development server
npm run dev

# Optionally, build and preview the production build
npm run build && npm run preview
```

After running the dev server, the project should be available locally in your browser.

---

## Branch naming

Please create branches using the following naming pattern. It helps keep the commit history easier to read.

| Type     | Pattern        | Example                    |
| -------- | -------------- | -------------------------- |
| Feature  | `feat/...`     | `feat/animated-dice`       |
| Bug fix  | `fix/...`      | `fix/token-overlap`        |
| Refactor | `refactor/...` | `refactor/turn-reducer`    |
| Docs     | `docs/...`     | `docs/update-contributing` |
| Chore    | `chore/...`    | `chore/upgrade-vite`       |

Keep branch names short but descriptive.

---

## Code quality checks

This repository uses **ESLint**, **Prettier**, and **EditorConfig** to keep the codebase consistent.

Before opening a pull request, please make sure everything passes locally.

```bash
# Linting
npm run lint

# Type checking
npm run type-check

# Run tests
npm test
```

Formatting is handled automatically by **Prettier** if your editor supports it. Installing the Prettier extension for your editor is recommended.

EditorConfig settings are also included in the repo. Many editors support it automatically.

---

## Commit messages

Commits must follow the **Conventional Commits** format.

Scope is required for every commit.

```
<type>(<scope>): <short description>

[optional body]
```

The body is optional but helpful when the reason behind the change isn't obvious.

### Commit types

| Type     | Description                                  |
| -------- | -------------------------------------------- |
| feat     | New feature                                  |
| fix      | Bug fix                                      |
| docs     | Documentation only                           |
| style    | Formatting or style changes                  |
| refactor | Code restructuring without changing behavior |
| test     | Adding or updating tests                     |
| chore    | Maintenance tasks or dependency updates      |
| perf     | Performance improvements                     |
| ci       | CI/CD related changes                        |

### Example commits

```
feat(board): animate token movement
fix(dice): correct roll distribution
refactor(game-state): simplify turn reducer
docs(contributing): clarify commit guidelines
test(bot): add move scoring tests
chore(deps): upgrade vite to v7
```

Commits without a scope (for example `fix: typo`) will not be accepted.

---

## Submitting a pull request

When you're ready to submit your work:

1. Create a branch from `main`
2. Commit your changes using the format above
3. Write or update tests if your change affects game logic or existing behavior
4. Push the branch to your fork
5. Open a Pull Request against `main`
6. Add a short explanation of what the change does and why it was needed

A review may request changes before the PR is merged.

---

## License

By contributing to this project, you agree that your contributions will be licensed under the **GNU Affero General Public License, version 3**.
