export const getFirestoreProjectId = (): string => {
  const value =
    process.env.FIRESTORE_PROJECT_ID?.trim() ??
    process.env.GCP_TOOLS_DEVELOPER_FIRESTORE_PROJECT_ID?.trim() ??
    ''

  if (!value) {
    throw new Error(
      'FIRESTORE_PROJECT_ID is required for Firestore integration tests. ' +
        'Set FIRESTORE_PROJECT_ID or GCP_TOOLS_DEVELOPER_FIRESTORE_PROJECT_ID ' +
        'before running run_tests.',
    )
  }

  return value
}
