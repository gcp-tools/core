import { z } from 'zod';
import type { InstallPrerequisitesResult } from '../../types.mjs';
export declare function installPrerequisites(): Promise<InstallPrerequisitesResult>;
export declare const InstallPrerequisitesInputSchema: z.ZodObject<{
    checkOnly: z.ZodOptional<z.ZodBoolean>;
    includeOptional: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    checkOnly?: boolean | undefined;
    includeOptional?: boolean | undefined;
}, {
    checkOnly?: boolean | undefined;
    includeOptional?: boolean | undefined;
}>;
