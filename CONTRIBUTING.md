# Contributing to Passkey NFT Vault

Thank you for your interest in contributing to Passkey NFT Vault! This project aims to make NFT authentication seamless using biometric passkeys on the Stacks blockchain.

## 🌟 Ways to Contribute

- 🐛 Report bugs and issues
- 💡 Propose new features or enhancements
- 📝 Improve documentation
- 🔧 Submit bug fixes
- ✨ Add new features
- 🧪 Write tests
- 🎨 Improve UI/UX

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) >= 18
- [Clarinet](https://github.com/hirosystems/clarinet) >= 2.0
- [Git](https://git-scm.com/)
- A WebAuthn-compatible device for testing (Face ID, Touch ID, or security key)

### Setup Development Environment

1. **Fork the repository**
   ```bash
   # Click 'Fork' on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/passkey-nft-vault.git
   cd passkey-nft-vault
   ```

2. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/oderahub/passkey-nft-vault.git
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Configure environment**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your settings
   ```

5. **Run tests to verify setup**
   ```bash
   npm test
   ```

6. **Start development server**
   ```bash
   npm run dev
   ```

## 🔨 Development Workflow

### 1. Create a Feature Branch

Always create a new branch for your work:

```bash
# Update your main branch
git checkout main
git pull upstream main

# Create a feature branch
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

### Branch Naming Convention

- `feature/` - New features (e.g., `feature/multi-sig-support`)
- `fix/` - Bug fixes (e.g., `fix/signature-validation`)
- `docs/` - Documentation changes (e.g., `docs/update-readme`)
- `chore/` - Maintenance tasks (e.g., `chore/update-dependencies`)
- `test/` - Test additions/fixes (e.g., `test/add-integration-tests`)

### 2. Make Your Changes

#### Smart Contract Changes

If modifying Clarity contracts:

```bash
# Check syntax
clarinet check

# Run contract tests
npm test

# Test locally with console
clarinet console
```

**Important**: All contract changes must:
- Maintain SIP-009 compliance
- Include test coverage
- Not break existing functionality
- Be compatible with Clarity 4

#### Frontend Changes

If modifying the UI:

```bash
# Start dev server with hot reload
npm run dev

# Build to verify no errors
npm run build

# Check for TypeScript errors
npx tsc --noEmit
```

#### Testing Requirements

All contributions should include tests:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with UI
npm run test:ui
```

### 3. Commit Your Changes

We follow conventional commit messages:

```bash
# Format: <type>(<scope>): <description>

git commit -m "feat(contract): add multi-sig passkey support"
git commit -m "fix(ui): correct signature format validation"
git commit -m "docs(readme): update installation instructions"
git commit -m "test(contract): add transfer authorization tests"
git commit -m "chore(deps): update @stacks/transactions to v6.14.0"
```

**Commit Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation only
- `style` - Code style changes (formatting, etc.)
- `refactor` - Code refactoring
- `test` - Adding or updating tests
- `chore` - Maintenance tasks

### 4. Push and Create Pull Request

```bash
# Push to your fork
git push origin feature/your-feature-name

# Create PR on GitHub
# Go to: https://github.com/oderahub/passkey-nft-vault/pulls
```

## 📋 Pull Request Guidelines

### PR Title Format

Use the same format as commit messages:
- `feat: add time-locked minting feature`
- `fix: resolve signature verification bug`
- `docs: improve contributing guide`

### PR Description Template

```markdown
## Description
Brief description of what this PR does

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Changes Made
- Change 1
- Change 2
- Change 3

## Testing
- [ ] Tests pass locally
- [ ] New tests added for new functionality
- [ ] Manual testing completed

## Checklist
- [ ] My code follows the project's style guidelines
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have updated the documentation accordingly
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
```

## 🧪 Testing Guidelines

### Contract Testing

All Clarity contract changes must include Vitest tests:

```typescript
import { describe, expect, it } from "vitest";

describe("passkey-nft-v3", () => {
  it("should register a passkey", () => {
    // Test implementation
  });
});
```

### Frontend Testing

Test WebAuthn integration and UI components:

```typescript
// Test passkey registration flow
// Test signature generation
// Test contract interaction
```

## 📝 Code Style

### TypeScript/JavaScript

- Use TypeScript for type safety
- Follow the existing code style
- Use meaningful variable names
- Add comments for complex logic
- Avoid `any` types when possible

### Clarity

- Follow [Clarity best practices](https://docs.stacks.co/clarity/best-practices)
- Use descriptive function names
- Include natspec-style comments
- Validate all inputs
- Use appropriate error codes

## 🐛 Reporting Bugs

When reporting bugs, please include:

1. **Description**: Clear description of the bug
2. **Steps to Reproduce**: Detailed steps to reproduce the issue
3. **Expected Behavior**: What you expected to happen
4. **Actual Behavior**: What actually happened
5. **Environment**:
   - OS (macOS, Windows, Linux)
   - Node.js version
   - Browser (if frontend issue)
   - Clarinet version
6. **Screenshots**: If applicable
7. **Error Messages**: Full error messages and stack traces

### Bug Report Template

```markdown
**Description**
A clear description of the bug

**To Reproduce**
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What should happen

**Actual behavior**
What actually happens

**Environment**
- OS: [e.g., macOS 13.0]
- Node: [e.g., v18.17.0]
- Browser: [e.g., Chrome 119]
- Clarinet: [e.g., 2.0.0]

**Screenshots**
If applicable

**Additional context**
Any other relevant information
```

## 💡 Proposing Features

Before working on a major feature:

1. **Check existing issues** to avoid duplicates
2. **Open a discussion** in GitHub Issues with the `enhancement` label
3. **Describe the feature**:
   - What problem does it solve?
   - How should it work?
   - Are there any alternatives?
4. **Wait for feedback** from maintainers
5. **Start development** after approval

## 🔒 Security

If you discover a security vulnerability:

- **DO NOT** open a public issue
- Email the maintainers directly (check README for contact)
- Include detailed information about the vulnerability
- Allow time for the issue to be addressed before public disclosure

## 📜 Code of Conduct

### Our Standards

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Accept constructive criticism gracefully
- Focus on what's best for the community
- Show empathy towards other community members

### Unacceptable Behavior

- Harassment, trolling, or discriminatory comments
- Personal or political attacks
- Publishing others' private information
- Other conduct which could reasonably be considered inappropriate

## 🎯 Good First Issues

New to the project? Look for issues labeled:
- `good first issue` - Great for newcomers
- `help wanted` - We'd love your help on these
- `documentation` - Improve our docs

## 📞 Getting Help

- **GitHub Issues**: For bugs and feature requests
- **Discussions**: For questions and general discussion
- **Discord**: [Join our community] (if available)

## 🙏 Thank You!

Every contribution, no matter how small, helps make Passkey NFT Vault better. We appreciate your time and effort!

---

**Happy Contributing!** 🚀

Built with ❤️ for the Stacks ecosystem
