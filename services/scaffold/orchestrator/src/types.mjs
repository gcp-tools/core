import { z } from 'zod';
// Foundation Project Setup Types
export const SetupFoundationProjectSchema = z.object({
    projectName: z.string().min(1),
    orgId: z.string().min(1),
    billingAccount: z.string().min(1),
    regions: z.string().min(1),
    githubIdentity: z.string().min(1),
    developerIdentity: z.string().min(1),
});
//# sourceMappingURL=types.mjs.map