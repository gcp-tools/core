# Advanced Patterns

> **PHASE:** implementation
> **PRIORITY:** REFERENCE

## Quick Reference

- [ ] Extending Library: Create new IO types (Firebase Auth example)
- [ ] Type Definition: Define function signature
- [ ] Wrapper Function: Add error handling and retry logic
- [ ] Initialization Middleware: Wrap functions with dependencies
- [ ] Usage: Implement in service io/ directory

## REFERENCE Patterns

### Extending gcp-tools/hono

**When to use:** Multiple services need shared SDK integration

**Four Components:**
1. Type Definition
2. Wrapper Function
3. Initialization Middleware
4. Service Usage

**Type Definition:**
```typescript
export type NewIOFn<A, R> = (
  client: ClientType,
  ctx: RequestContext,
  logger: Logger,
) => (args: A) => Promise<Result<R>>
```

**Wrapper Function:**
```typescript
export const makeNewIOFn = <A, R>(
  fn: (args: A) => Promise<Result<R>>,
  logger: Logger,
) => async (args: A): Promise<Result<R>> => {
  try {
    return await fn(args)
  } catch (cause) {
    logger.error({ error: cause }, '[new-io] error')
    return {
      ok: false,
      error: {
        code: 'SERVICE_UNAVAILABLE',
        message: cause instanceof Error ? cause.message : 'Unknown error',
        cause,
      },
    }
  }
}
```

**Initialization Middleware:**
```typescript
export const initNewIO = () =>
  createMiddleware<{ Variables: Context }>(async (c, next) => {
    const client = c.get('client')
    const ctx = c.get('ctx')
    const logger = c.get('logger')
    const ioFns = c.get('ioFns')
    
    const io = Object.fromEntries(
      Object.entries(ioFns).map(([key, fn]) => [
        key,
        makeNewIOFn(fn(client, ctx, logger), logger),
      ]),
    )
    
    c.set('io', io)
    await next()
  })
```

**Rules:**
- SHOULD: Extend library for shared SDK integrations
- SHOULD: Follow Firebase Auth pattern as template
- SHOULD: Add error handling in wrapper
- SHOULD: Use initialization middleware pattern

## Decision Trees

**Q: Should I extend the library?**

- Multiple services need same SDK → Extend library
- One-off HTTP call → Use ServiceFn
- Database operation → Use FirestoreRepoFn
- Service-specific logic → Put in commands

