from crewai import Agent

# Updated prompt with TypeScript standards, best practices, architecture, and observation principles
prompt_template = (
    "Given the following plan section, generate TypeScript backend code. "
    "Strictly follow ALL of these TypeScript standards, best practices, and architecture principles.\n"
    "\n"
    "# TypeScript Standards\n"
    "- Use 2-space indentation\n"
    "- Maximum line length of 80 characters\n"
    "- Use single quotes for strings\n"
    "- Always use trailing commas in multi-line structures\n"
    "- Use semicolons only when necessary\n"
    "- Use arrow functions with parentheses for parameters\n"
    "- Use double quotes for JSX attributes\n"
    "\n"
    "# TypeScript Best Practices\n"
    "- Enable strict mode and all strict checks\n"
    "- Do not use the 'any' type\n"
    "- Use explicit return types for functions\n"
    "- Use types not interfaces\n"
    "- Use readonly for immutable properties\n"
    "- Use const assertions for literal types\n"
    "- Use type inference where possible, but be explicit with function parameters\n"
    "- Use proper type imports/exports with ESM syntax\n"
    "- Prefer functions over classes - where possible\n"
    "- Use async/await for asynchronous operations\n"
    "- Leverage TypeScript's built-in utility types\n"
    "- Use generics for reusable type patterns\n"
    "- Use zod v4 to parse all inputs into your application\n"
    "\n"
    "# Architecture Principles\n"
    "- ALWAYS validate inputs into handlers (request, database, API calls, agent responses, events, etc.)\n"
    "- Separation of Concerns:\n"
    "  - IO functions that fetch data should exist in their own file in a 'lib/io' directory\n"
    "  - Functions that transform data should be pure and live in their own file in a 'lib/transform' directory\n"
    "  - Control flow should occur in the handler where possible\n"
    "  - NEVER mix IO and transform/processing functionality in the same function\n"
    "- Data returned from IO functions should be of a type:\n"
    "  Promise<Result<Data|IoError>>\n"
    "  Where Data is a type that represents actual data\n"
    "  Where IoError is a type, e.g.:\n"
    "    export type BaseError = {\n"
    "      cause?: Error | unknown\n"
    "      data?: unknown\n"
    "      message: string\n"
    "    }\n"
    "    export type NotFoundError = BaseError & {\n"
    "      code: 'NOT_FOUND'\n"
    "    }\n"
    "    type IoError = NotFoundError | ...\n"
    "\n"
    "# Observation Principles\n"
    "- Log all inputs to a handler (request, database, API calls, agent responses, events, etc.)\n"
    "\n"
    "Output only the code, with clear file structure and comments.\n\n"
    "Plan Section:\n{plan}\n\n"
    "Code:"
)

ts_codegen_agent = Agent(
    role="TypeScript Backend Codegen Agent",
    goal="Generate clean, idiomatic TypeScript backend code for cloud-native services based on the provided plan section.",
    backstory="You are an expert TypeScript backend engineer, skilled at building robust APIs and services for GCP.",
    verbose=True,
    max_iter=3,
    respect_context_window=True,
    prompt_template=prompt_template,
)

def run_ts_codegen_agent(plan: str) -> str:
    """Run the CrewAI TypeScript Codegen Agent on the provided plan section."""
    return ts_codegen_agent.run({"plan": plan})
