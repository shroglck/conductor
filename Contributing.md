# (Self-Review) ✅

## I. Code Structure and Standards (Node.js/Express)

- [ ] **Clean Architecture Layering:**
  - **Controllers/Routes:** Route handlers only handle **HTTP concerns** (`req`, `res`, status codes, input validation) and delegate all business logic to the Service Layer.
  - **Services/Use Cases:** The Service Layer contains all core business logic and is **decoupled** from Express/HTTP concerns.
- [ ] **Asynchronous Handling:**

  - All asynchronous functions use `async/await`.
  - All `async` route handlers and service methods are wrapped or configured to pass errors to the **Express global error handler** middleware. There are no unhandled promise rejections.
  - I/O operations (Database, File System, Network) are strictly non-blocking.

- [ ] \*\*Security & Configuration:
  - Configuration is read via **environment variables** (`process.env`) and never hardcoded.
  - API keys, secrets, and sensitive data are never logged or exposed in the client-side code.

---

## II. HTMX/JS/CSS Frontend Standards

- [ ] **CSS Naming & Modularity:**
  - All CSS classes follow the **BEM (Block-Element-Modifier)** convention (e.g., `card__header--active`).
  - CSS is scoped or modularized (e.g., using Sass imports or CSS modules) to prevent global style leakage.
- [ ] **JavaScript Quality:**
  - Frontend JavaScript is minimal, clean, and used primarily for **enhancement** (e.g., HTMX extensions, client-side validation), not replacing the core hypermedia control flow.
  - Avoid direct DOM manipulation where HTMX can achieve the same result via server-sent HTML.

---

## III. Behavior-Driven Development (BDD)

- [ ] **BDD Artifacts:** A new/updated **Gherkin `.feature` file** exists and covers all new user-facing behavior.
- [ ] **Language Alignment:**
  - The Gherkin steps strictly use **Ubiquitous Language** (business terminology) and avoid technical jargon.
  - Scenarios describe **behavior**, not implementation details.
- [ ] **Testing Rigor:**
  - The BDD scenarios test the **full stack** (HTMX triggering a request, Express processing it, and the resulting HTML being swapped).
  - All relevant **edge cases** and failure conditions are covered, often using `Scenario Outline` with an `Examples` table.
  - Test setup/teardown in the step definitions ensures absolute **isolation** (e.g., mock users/database state is created and destroyed for _each_ scenario).

---

## IV. Naming Conventions

| Category               | Item                          | Convention            | Example (Good)                              | Example (Bad)                           |
| :--------------------- | :---------------------------- | :-------------------- | :------------------------------------------ | :-------------------------------------- |
| **JavaScript/Node.js** | Classes (Services, Models)    | **PascalCase**        | `UserService`, `ProductValidator`           | `user_service`, `productvalidator`      |
| **JavaScript/Node.js** | Functions, Variables, Methods | **camelCase**         | `calculateTotal`, `userId`, `fetchUserData` | `Calculate_Total`, `user_id`, `data`    |
| **JavaScript/Node.js** | Global Constants              | **UPPER_SNAKE_CASE**  | `MAX_LOGIN_ATTEMPTS`, `DEFAULT_PORT`        | `maxLoginAttempts`, `MaxLoginAttempts`  |
| **CSS/HTML**           | Classes                       | **BEM or kebab-case** | `form__input--error`, `user-profile-card`   | `FormInputError`, `uicontainer`         |
| **Gherkin Steps**      | Step Parameter                | **Quotes or Tables**  | `Given a user with email "test@mail.com"`   | `Given a user with email test_mail_com` |

---

## V. Version Control & CI/CD

- [ ] **Linter Pass:** Local runs of **ESLint/Prettier/Stylelint** result in a zero-error/zero-warning state.
- [ ] **CI Gate:** The Pull Request has a **green passing status** on all CI pipeline checks (tests, security scan, build).
- [ ] **Commit Hygiene:** The commit history is atomic and the final commit message clearly and concisely summarizes the **behavioral change** introduced, following the Conventional Commits structure (e.g., `feat(auth): Add Gherkin scenarios for failed login`).

---
