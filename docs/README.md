# iCMS Admin Frontend Documentation

## Overview

The Integrated Content Management System (iCMS) is a government-grade enterprise application built with Next.js 15, designed to provide a robust, scalable, and secure admin interface for content management operations.

## System Vision

iCMS is designed as a modular, enterprise-grade system that supports:
- **Multi-language Content Management**: Nepali/English with real-time switching
- **Role-based Access Control**: Granular permissions and security
- **Scalable Architecture**: Domain-driven design for government operations
- **Enterprise Security**: Government-level security and compliance standards

## Key Architectural Features

- **Modern Technology Stack**: Next.js 15, Carbon Design System, TypeScript
- **Domain-Driven Design**: Self-contained domains with clear boundaries
- **Internationalization**: Real-time language switching with performance optimization
- **State Management**: Robust Zustand stores with TanStack Query integration
- **API Architecture**: Layered API design with separation of concerns
- **Testing Strategy**: 100% test coverage with comprehensive testing pyramid
- **Accessibility**: WCAG 2.1 AA compliance throughout the system

## Documentation Architecture

### System Foundation Documentation

- [**Technology Stack**](./tech-stack/README.md) - Technology decisions, dependencies, and architectural choices
- [**Architecture & Design Patterns**](./architecture/README.md) - System architecture, design patterns, and scalability approach
- [**Development Guidelines**](./development/README.md) - Coding standards, best practices, and development workflow

### Core Implementation Strategies

- [**Authentication & Authorization**](./auth/README.md) - Security architecture, authentication flows, and access control patterns
- [**API Integration**](./api/README.md) - API layer design, service patterns, and data management strategies
- [**Internationalization**](./i18n/README.md) - Multi-language architecture and translation management strategy
- [**Design System**](./design/README.md) - Visual design system, color palette, typography, and component design tokens
- [**UI/UX Guidelines**](./ui-ux/README.md) - Design system implementation and component architecture

### Quality & Testing

- [**Testing Strategy**](./testing/README.md) - Comprehensive testing approach, patterns, and quality assurance
- [**Basic Setup & Getting Started**](./basic-setup/getting-started.md) - Project initialization and development environment setup

## System Requirements

### Core Technology Standards
- **Next.js 15.x**: Latest App Router with server components
- **IBM Carbon Design System**: Enterprise-grade UI components
- **TypeScript**: Full type safety throughout the application
- **Domain-Driven Design**: Clear separation of business domains
- **Test-Driven Development**: 100% test coverage requirement

### Architectural Principles
- **Scalability**: Maximum 1000 lines per file, modular architecture
- **Performance**: Sub-100ms language switching, optimized bundle splitting
- **Accessibility**: WCAG 2.1 AA compliance mandatory
- **Security**: Government-grade security standards
- **Maintainability**: Clear documentation and consistent patterns

## Getting Started Guide

### For Developers
1. **Understanding the System**: Start with [Architecture & Design Patterns](./architecture/README.md)
2. **Technology Overview**: Review [Technology Stack](./tech-stack/README.md)
3. **Setup Environment**: Follow [Basic Setup Guide](./basic-setup/getting-started.md)
4. **Development Standards**: Read [Development Guidelines](./development/README.md)

### For Architects
1. **System Design**: Review [Architecture Overview](./architecture/README.md)
2. **API Design**: Understand [API Integration Strategy](./api/README.md)
3. **Security Architecture**: Study [Authentication Patterns](./auth/README.md)
4. **Scalability Approach**: Examine domain-driven design implementation

### For QA Engineers
1. **Testing Strategy**: Start with [Testing Overview](./testing/README.md)
2. **Quality Standards**: Review quality gates and coverage requirements
3. **Accessibility Testing**: Understand WCAG 2.1 AA compliance approach
4. **Performance Testing**: Learn performance benchmarks and testing patterns

## Documentation Philosophy

### High-Level Architecture Focus
- **Patterns Over Implementation**: Emphasis on architectural patterns and design decisions
- **Signatures Over Code**: Interface definitions and component signatures
- **Strategy Over Details**: Strategic approaches rather than detailed code examples
- **Scalability Considerations**: Architecture designed for growth and maintenance

### Navigation Strategy
Each documentation section provides:
- **Overview**: High-level purpose and strategic approach
- **Architecture**: Structural patterns and design decisions
- **Key Patterns**: Signature interfaces and implementation patterns
- **Integration Points**: How components connect and interact
- **Related Documentation**: Cross-references to related architectural concerns

## Contributing Standards

### Documentation Standards
- **Architectural Focus**: Document patterns, not implementations
- **Clear Navigation**: Provide clear paths through documentation
- **Cross-References**: Link related architectural concepts
- **Update Consistency**: Maintain consistency across all documentation

### Development Contribution
- **Pattern Adherence**: Follow established architectural patterns
- **Documentation Updates**: Update relevant documentation with architectural changes
- **Test Coverage**: Maintain 100% test coverage requirement
- **Review Process**: Comprehensive architectural review for changes

## Support and Maintenance

### Documentation Maintenance
- **Regular Updates**: Documentation updated with architectural evolution
- **Pattern Consistency**: Ensure patterns remain consistent across system
- **Architecture Reviews**: Regular architectural decision documentation
- **Accessibility Compliance**: Maintain WCAG 2.1 AA compliance documentation

### Development Support
For technical guidance:
1. **Architecture Questions**: Refer to [Architecture Documentation](./architecture/README.md)
2. **Implementation Patterns**: Check [Development Guidelines](./development/README.md)
3. **Testing Approach**: Consult [Testing Strategy](./testing/README.md)
4. **Integration Patterns**: Review [API Integration](./api/README.md) 