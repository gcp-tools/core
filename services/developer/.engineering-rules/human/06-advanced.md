# Advanced Patterns

## Overview

This document covers advanced patterns for extending the `gcp-tools/hono` library with new IO types. Use Firebase Auth as a reference implementation.

## When to Extend

Extend the library when:
- Multiple services need the same SDK integration
- You want consistent error handling and retry logic
- Operations follow similar pattern to existing IO types

Use existing patterns when:
- One-off HTTP calls (use `ServiceFn`)
- Database operations (use `FirestoreRepoFn`)
- Service-specific logic (put in commands)

## Extension Pattern

Four components needed:

1. **Type Definition**: Define function signature
2. **Wrapper Function**: Add error handling and retry logic
3. **Initialization Middleware**: Wrap functions with dependencies
4. **Service Usage**: Implement in service `io/` directory

See Firebase Auth implementation in the codebase for a complete example.

## See Also

- [Implementation Patterns](./02-patterns.md) - Basic patterns
- [Core Principles](./00-principles.md) - Design principles

