<!-- @format -->

# SideTabs

A browser extension for enhanced tab management, focusing on organization, navigation, and productivity improvements.

## Development Principles

All development follows the [SideTabs Constitution](.specify/memory/constitution.md). Key principles:

- **Tab Management Focus**: Features must enhance tab organization, navigation, or productivity
- **Performance First**: <100ms response time for common actions, <50MB memory baseline
- **Data Privacy**: Local storage by default, explicit consent for cloud features
- **Accessibility**: WCAG 2.1 AA compliance, full keyboard navigation
- **Browser Compatibility**: Works across Chrome, Firefox, Safari, and Edge

## Development Workflow

1. All features start with problem definition
2. Design mockups required before implementation
3. Accessibility review during design phase
4. Performance impact assessment mandatory
5. Cross-browser testing required

## Technical Stack

- **Language**: TypeScript (mandatory for type safety)
- **Testing**: Jest (80% coverage minimum)
- **Code Quality**: ESLint + Prettier
- **Security**: Content Security Policy, Manifest v3

## Quick Start

For detailed development guidance, see the constitution and template files in `.specify/`.

## Architecture

SideTabs follows a modular architecture optimized for browser extension development:

- Clean separation between background scripts and content scripts
- Efficient tab state management
- Minimal memory footprint
- Cross-browser compatibility layer

## Contributing

All contributions must comply with the SideTabs Constitution. Please review the principles before submitting changes.
