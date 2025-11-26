export type FoundationSetupArgs = {
    projectName: string;
    orgId: string;
    billingAccount: string;
    regions: string;
    githubIdentity: string;
    developerIdentity: string;
    ownerEmails: string;
};
export type FoundationSetupResult = {
    projectId: string;
    serviceAccount: string;
    projectNumber: string;
    workloadIdentityProviders: {
        dev?: string;
        test?: string;
        sbx?: string;
        prod?: string;
    };
    terraformStateBucket: string;
    region: string;
    regions: string;
    orgId: string;
    billingAccount: string;
    githubIdentity: string;
    developerIdentity: string;
    ownerEmails: string;
};
export declare function runFoundationProject(args: FoundationSetupArgs): Promise<FoundationSetupResult>;
