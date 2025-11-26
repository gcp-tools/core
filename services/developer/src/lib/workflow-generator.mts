import type { IacInventory } from './iac-discovery.mjs'

const generatePathFilters = (inventory: IacInventory): string => {
  const filters: string[] = []

  // Standard workspace filters
  if (inventory.workspaces.projects) {
    filters.push("            projects:\n              - 'iac/projects/**'")
  }
  if (inventory.workspaces.infra) {
    filters.push("            infra:\n              - 'iac/infra/**'")
  }
  if (inventory.workspaces.ingress) {
    filters.push(
      "            ingress:\n              - 'iac/ingress/**'\n              - 'api-gateway-config/**'",
    )
  }

  // Service filters
  for (const service of inventory.services) {
    const filterName = `service-${service.name}`
    filters.push(
      `            '${filterName}':\n              - 'iac/app/src/stacks/${service.name}/**'\n              - 'services/${service.name}/**'`,
    )
  }

  // App filters
  for (const app of inventory.apps) {
    const filterName = `app-${app.name}`
    filters.push(
      `            '${filterName}':\n              - 'iac/app/src/stacks/${app.name}/**'\n              - 'apps/${app.name}/api/**'`,
    )
  }

  return filters.join('\n')
}

const generateDetectChangesOutputs = (inventory: IacInventory): string => {
  const outputs: string[] = []

  if (inventory.workspaces.projects) {
    outputs.push(`      projects: \${{ steps.filter.outputs.projects }}`)
  }
  if (inventory.workspaces.infra) {
    outputs.push(`      infra: \${{ steps.filter.outputs.infra }}`)
  }
  if (inventory.workspaces.ingress) {
    outputs.push(`      ingress: \${{ steps.filter.outputs.ingress }}`)
  }

  for (const service of inventory.services) {
    const outputName = `service-${service.name}`
    outputs.push(
      `      '${outputName}': \${{ steps.filter.outputs['${outputName}'] }}`,
    )
  }

  for (const app of inventory.apps) {
    const outputName = `app-${app.name}`
    outputs.push(
      `      '${outputName}': \${{ steps.filter.outputs['${outputName}'] }}`,
    )
  }

  return outputs.join('\n')
}

const generateCiMatrixScript = (inventory: IacInventory): string => {
  const lines: string[] = [
    '          SYNTH_MATRIX=()',
    '          DIFF_MATRIX=()',
    '',
  ]

  // Projects workspace
  if (inventory.workspaces.projects) {
    lines.push('          # Projects workspace')
    lines.push(
      `          if [ "\${{ needs.detect-changes.outputs.projects }}" == "true" ]; then`,
    )
    lines.push('            SYNTH_MATRIX+=(\'{"workspace": "iac/projects"}\')')
    lines.push(
      '            DIFF_MATRIX+=(\'{"workspace": "iac/projects", "stack": "host"}\')',
    )
    lines.push(
      '            DIFF_MATRIX+=(\'{"workspace": "iac/projects", "stack": "data"}\')',
    )
    lines.push(
      '            DIFF_MATRIX+=(\'{"workspace": "iac/projects", "stack": "app"}\')',
    )
    lines.push('          fi')
    lines.push('')
  }

  // Infra workspace
  if (inventory.workspaces.infra) {
    lines.push('          # Infra workspace')
    lines.push(
      `          if [ "\${{ needs.detect-changes.outputs.infra }}" == "true" ]; then`,
    )
    lines.push('            SYNTH_MATRIX+=(\'{"workspace": "iac/infra"}\')')
    for (const stack of [
      'network',
      'iam',
      'firestore',
      'identity-platform',
      'artifact-registry',
    ]) {
      lines.push(
        `            DIFF_MATRIX+=('{"workspace": "iac/infra", "stack": "${stack}"}')`,
      )
    }
    lines.push('          fi')
    lines.push('')
  }

  // Ingress workspace
  if (inventory.workspaces.ingress) {
    lines.push('          # Ingress workspace')
    lines.push(
      `          if [ "\${{ needs.detect-changes.outputs.ingress }}" == "true" ]; then`,
    )
    lines.push('            SYNTH_MATRIX+=(\'{"workspace": "iac/ingress"}\')')
    for (const stack of inventory.workspaces.ingress.stacks) {
      lines.push(
        `            DIFF_MATRIX+=('{"workspace": "iac/ingress", "stack": "${stack}"}')`,
      )
    }
    lines.push('          fi')
    lines.push('')
  }

  // App workspace - check if any app/service stack changed
  const allAppStacks = [
    ...inventory.services.map((s) => ({
      name: s.name,
      outputName: `service-${s.name}`,
    })),
    ...inventory.apps.map((a) => ({
      name: a.name,
      outputName: `app-${a.name}`,
    })),
  ]

  if (allAppStacks.length > 0) {
    lines.push('          # App workspace - only add if any app stack changed')
    const conditions = allAppStacks
      .map(
        (stack) =>
          `"\${{ needs.detect-changes.outputs['${stack.outputName}'] }}" == "true"`,
      )
      .join(' || \\\n             ')
    lines.push(`          if [ ${conditions} ]; then`)
    lines.push('            SYNTH_MATRIX+=(\'{"workspace": "iac/app"}\')')
    lines.push('          fi')
    lines.push('')

    // Add app stacks to diff matrix if they changed
    for (const stack of allAppStacks) {
      lines.push(
        `          # Add ${stack.name} stack to diff matrix if it changed`,
      )
      lines.push(
        `          if [ "\${{ needs.detect-changes.outputs['${stack.outputName}'] }}" == "true" ]; then`,
      )
      lines.push(
        `            DIFF_MATRIX+=('{"workspace": "iac/app", "stack": "${stack.name}"}')`,
      )
      lines.push('          fi')
    }
    lines.push('')
  }

  // Convert arrays to JSON
  lines.push('          # Convert arrays to JSON')
  lines.push(`          if [ \${#SYNTH_MATRIX[@]} -eq 0 ]; then`)
  lines.push('            SYNTH_MATRIX_JSON="[]"')
  lines.push('          else')
  lines.push(
    `            SYNTH_MATRIX_JSON=$(printf '%s\\n' "\${SYNTH_MATRIX[@]}" | jq -s '.')`,
  )
  lines.push('          fi')
  lines.push('')
  lines.push(`          if [ \${#DIFF_MATRIX[@]} -eq 0 ]; then`)
  lines.push('            DIFF_MATRIX_JSON="[]"')
  lines.push('          else')
  lines.push(
    `            DIFF_MATRIX_JSON=$(printf '%s\\n' "\${DIFF_MATRIX[@]}" | jq -s '.')`,
  )
  lines.push('          fi')
  lines.push('')
  lines.push('          echo "synth-matrix<<EOF" >> $GITHUB_OUTPUT')
  lines.push('          echo "$SYNTH_MATRIX_JSON" >> $GITHUB_OUTPUT')
  lines.push('          echo "EOF" >> $GITHUB_OUTPUT')
  lines.push('')
  lines.push('          echo "diff-matrix<<EOF" >> $GITHUB_OUTPUT')
  lines.push('          echo "$DIFF_MATRIX_JSON" >> $GITHUB_OUTPUT')
  lines.push('          echo "EOF" >> $GITHUB_OUTPUT')
  lines.push('')
  lines.push('          echo "Generated synth-matrix: $SYNTH_MATRIX_JSON"')
  lines.push('          echo "Generated diff-matrix: $DIFF_MATRIX_JSON"')

  return lines.join('\n')
}

const generateDeployMatrixScript = (inventory: IacInventory): string => {
  const lines: string[] = [
    '          BUILD_MATRIX=()',
    '          SERVICES_MATRIX=()',
    '          APPS_MATRIX=()',
    '',
  ]

  // Discover services
  if (inventory.services.length > 0) {
    lines.push('          # Discover services')
    lines.push('          for service_dir in services/*/api; do')
    lines.push('            if [ ! -d "$service_dir" ]; then')
    lines.push('              continue')
    lines.push('            fi')
    lines.push('            service_name=$(basename $(dirname "$service_dir"))')
    lines.push('')
    lines.push('            # Verify stack exists')
    lines.push(
      '            if [ ! -d "iac/app/src/stacks/$service_name" ]; then',
    )
    lines.push('              continue')
    lines.push('            fi')
    lines.push('')
    lines.push('            # Get change detection output name')
    lines.push('            change_output="service-$service_name"')
    lines.push('            changed="false"')
    lines.push('')
    lines.push(
      '            # Map known services to their change detection outputs',
    )
    lines.push('            case "$service_name" in')

    for (const service of inventory.services) {
      const outputName = `service-${service.name}`
      lines.push(`              ${service.name})`)
      lines.push(`                change_output="${outputName}"`)
      lines.push(
        `                changed="\${{ needs.detect-changes.outputs['${outputName}'] }}"`,
      )
      lines.push('                ;;')
    }

    lines.push('              *)')
    lines.push(
      '                # For unknown services, try to get the output dynamically',
    )
    lines.push("                # Fallback to 'false' if output doesn't exist")
    lines.push('                changed="false"')
    lines.push('                ;;')
    lines.push('            esac')
    lines.push('')
    lines.push('            # Only include if changed')
    lines.push('            if [ "$changed" = "true" ]; then')
    lines.push('              # Entry for build-containers')
    lines.push('              build_entry=$(jq -n \\')
    lines.push('                --arg service "$service_name" \\')
    lines.push('                --arg type "service" \\')
    lines.push('                --arg stack_id "$service_name" \\')
    lines.push('                --arg service_id "api" \\')
    lines.push('                --arg path "services/$service_name/api" \\')
    lines.push('                --arg changed "$changed" \\')
    lines.push(
      '                \'{service: $service, type: $type, "stack-id": $stack_id, "service-id": $service_id, path: $path, changed: $changed}\')',
    )
    lines.push('              BUILD_MATRIX+=("$build_entry")')
    lines.push('')
    lines.push(
      '              # Entry for deploy-services (needs stack-name instead of service)',
    )
    lines.push('              deploy_entry=$(jq -n \\')
    lines.push('                --arg stack_name "$service_name" \\')
    lines.push('                --arg stack_id "$service_name" \\')
    lines.push('                --arg service_id "api" \\')
    lines.push('                --arg changed "$changed" \\')
    lines.push(
      '                \'{"stack-name": $stack_name, "stack-id": $stack_id, "service-id": $service_id, changed: $changed}\')',
    )
    lines.push('              SERVICES_MATRIX+=("$deploy_entry")')
    lines.push('            fi')
    lines.push('          done')
    lines.push('')
  }

  // Discover apps
  if (inventory.apps.length > 0) {
    lines.push('          # Discover apps')
    lines.push('          for app_dir in apps/*/api; do')
    lines.push('            if [ ! -d "$app_dir" ]; then')
    lines.push('              continue')
    lines.push('            fi')
    lines.push('            app_name=$(basename $(dirname "$app_dir"))')
    lines.push('')
    lines.push('            # Verify stack exists')
    lines.push('            if [ ! -d "iac/app/src/stacks/$app_name" ]; then')
    lines.push('              continue')
    lines.push('            fi')
    lines.push('')
    lines.push('            # Get change detection output name')
    lines.push('            change_output="app-$app_name"')
    lines.push('            changed="false"')
    lines.push('')
    lines.push('            # Map known apps to their change detection outputs')
    lines.push('            case "$app_name" in')

    for (const app of inventory.apps) {
      const outputName = `app-${app.name}`
      lines.push(`              ${app.name})`)
      lines.push(`                change_output="${outputName}"`)
      lines.push(
        `                changed="\${{ needs.detect-changes.outputs['${outputName}'] }}"`,
      )
      lines.push('                ;;')
    }

    lines.push('              *)')
    lines.push(
      '                # For unknown apps, try to get the output dynamically',
    )
    lines.push("                # Fallback to 'false' if output doesn't exist")
    lines.push('                changed="false"')
    lines.push('                ;;')
    lines.push('            esac')
    lines.push('')
    lines.push('            # Only include if changed')
    lines.push('            if [ "$changed" = "true" ]; then')
    lines.push('              entry=$(jq -n \\')
    lines.push('                --arg service "$app_name" \\')
    lines.push('                --arg type "app" \\')
    lines.push('                --arg stack_id "$app_name" \\')
    lines.push('                --arg service_id "api" \\')
    lines.push('                --arg path "apps/$app_name/api" \\')
    lines.push('                --arg changed "$changed" \\')
    lines.push(
      '                \'{service: $service, type: $type, "stack-id": $stack_id, "service-id": $service_id, path: $path, changed: $changed}\')',
    )
    lines.push('              BUILD_MATRIX+=("$entry")')
    lines.push('')
    lines.push(
      '              # For deploy-apps, we need stack-name instead of service',
    )
    lines.push('              deploy_entry=$(jq -n \\')
    lines.push('                --arg stack_name "$app_name" \\')
    lines.push('                --arg stack_id "$app_name" \\')
    lines.push('                --arg service_id "api" \\')
    lines.push('                --arg changed "$changed" \\')
    lines.push(
      '                \'{"stack-name": $stack_name, "stack-id": $stack_id, "service-id": $service_id, changed: $changed}\')',
    )
    lines.push('              APPS_MATRIX+=("$deploy_entry")')
    lines.push('            fi')
    lines.push('          done')
    lines.push('')
  }

  // Convert arrays to JSON
  lines.push('          # Convert arrays to JSON')
  lines.push(`          if [ \${#BUILD_MATRIX[@]} -eq 0 ]; then`)
  lines.push('            BUILD_MATRIX_JSON="[]"')
  lines.push('          else')
  lines.push(
    `            BUILD_MATRIX_JSON=$(printf '%s\\n' "\${BUILD_MATRIX[@]}" | jq -s '.')`,
  )
  lines.push('          fi')
  lines.push('')
  lines.push(`          if [ \${#SERVICES_MATRIX[@]} -eq 0 ]; then`)
  lines.push('            SERVICES_MATRIX_JSON="[]"')
  lines.push('          else')
  lines.push(
    `            SERVICES_MATRIX_JSON=$(printf '%s\\n' "\${SERVICES_MATRIX[@]}" | jq -s '.')`,
  )
  lines.push('          fi')
  lines.push('')
  lines.push(`          if [ \${#APPS_MATRIX[@]} -eq 0 ]; then`)
  lines.push('            APPS_MATRIX_JSON="[]"')
  lines.push('          else')
  lines.push(
    `            APPS_MATRIX_JSON=$(printf '%s\\n' "\${APPS_MATRIX[@]}" | jq -s '.')`,
  )
  lines.push('          fi')
  lines.push('')
  lines.push('          echo "build-matrix<<EOF" >> $GITHUB_OUTPUT')
  lines.push('          echo "$BUILD_MATRIX_JSON" >> $GITHUB_OUTPUT')
  lines.push('          echo "EOF" >> $GITHUB_OUTPUT')
  lines.push('')
  lines.push('          echo "services-matrix<<EOF" >> $GITHUB_OUTPUT')
  lines.push('          echo "$SERVICES_MATRIX_JSON" >> $GITHUB_OUTPUT')
  lines.push('          echo "EOF" >> $GITHUB_OUTPUT')
  lines.push('')
  lines.push('          echo "apps-matrix<<EOF" >> $GITHUB_OUTPUT')
  lines.push('          echo "$APPS_MATRIX_JSON" >> $GITHUB_OUTPUT')
  lines.push('          echo "EOF" >> $GITHUB_OUTPUT')
  lines.push('')
  lines.push('          echo "Generated build-matrix: $BUILD_MATRIX_JSON"')
  lines.push(
    '          echo "Generated services-matrix: $SERVICES_MATRIX_JSON"',
  )
  lines.push('          echo "Generated apps-matrix: $APPS_MATRIX_JSON"')

  return lines.join('\n')
}

export const generateCiWorkflow = (
  inventory: IacInventory,
  existingWorkflow: string,
): string => {
  let workflow = existingWorkflow

  // Update detect-changes outputs (find the detect-changes job outputs section)
  const detectChangesJobStart = workflow.indexOf('  detect-changes:')
  if (detectChangesJobStart !== -1) {
    const outputsStart = workflow.indexOf('    outputs:', detectChangesJobStart)
    const stepsStart = workflow.indexOf('    steps:', outputsStart)
    if (outputsStart !== -1 && stepsStart !== -1) {
      const newOutputs = generateDetectChangesOutputs(inventory)
      workflow =
        workflow.slice(0, outputsStart + '    outputs:'.length) +
        '\n' +
        newOutputs +
        '\n' +
        workflow.slice(stepsStart)
    }
  }

  // Update detect-changes filters
  const filtersStart = workflow.indexOf('          filters: |')
  if (filtersStart !== -1) {
    const filtersEnd = workflow.indexOf(
      '\n\n  generate-matrices:',
      filtersStart,
    )
    if (filtersEnd !== -1) {
      const newFilters = generatePathFilters(inventory)
      workflow =
        workflow.slice(0, filtersStart + '          filters: |'.length) +
        '\n' +
        newFilters +
        workflow.slice(filtersEnd)
    }
  }

  // Update generate-matrices script
  const generateMatricesStart = workflow.indexOf('  generate-matrices:')
  if (generateMatricesStart !== -1) {
    const runStart = workflow.indexOf('        run: |', generateMatricesStart)
    const diffStart = workflow.indexOf('\n\n  diff:', runStart)
    if (runStart !== -1 && diffStart !== -1) {
      const newMatrixScript = generateCiMatrixScript(inventory)
      workflow =
        workflow.slice(0, runStart + '        run: |'.length) +
        '\n' +
        newMatrixScript +
        workflow.slice(diffStart)
    }
  }

  return workflow
}

export const generateDeployWorkflow = (
  inventory: IacInventory,
  existingWorkflow: string,
): string => {
  let workflow = existingWorkflow

  // Update detect-changes outputs (find the detect-changes job outputs section)
  const detectChangesJobStart = workflow.indexOf('  detect-changes:')
  if (detectChangesJobStart !== -1) {
    const outputsStart = workflow.indexOf('    outputs:', detectChangesJobStart)
    const stepsStart = workflow.indexOf('    steps:', outputsStart)
    if (outputsStart !== -1 && stepsStart !== -1) {
      const newOutputs = generateDetectChangesOutputs(inventory)
      workflow =
        workflow.slice(0, outputsStart + '    outputs:'.length) +
        '\n' +
        newOutputs +
        '\n' +
        workflow.slice(stepsStart)
    }
  }

  // Update detect-changes filters
  const filtersStart = workflow.indexOf('          filters: |')
  if (filtersStart !== -1) {
    const filtersEnd = workflow.indexOf(
      '\n\n  # ===== Matrix Generation =====',
      filtersStart,
    )
    if (filtersEnd !== -1) {
      const newFilters = generatePathFilters(inventory)
      workflow =
        workflow.slice(0, filtersStart + '          filters: |'.length) +
        '\n' +
        newFilters +
        workflow.slice(filtersEnd)
    }
  }

  // Update generate-matrices script
  const generateMatricesStart = workflow.indexOf('  generate-matrices:')
  if (generateMatricesStart !== -1) {
    const runStart = workflow.indexOf('        run: |', generateMatricesStart)
    const infraDeployStart = workflow.indexOf(
      '\n\n  # ===== Infrastructure Deployment =====',
      runStart,
    )
    if (runStart !== -1 && infraDeployStart !== -1) {
      const newMatrixScript = generateDeployMatrixScript(inventory)
      workflow =
        workflow.slice(0, runStart + '        run: |'.length) +
        '\n' +
        newMatrixScript +
        workflow.slice(infraDeployStart)
    }
  }

  return workflow
}
