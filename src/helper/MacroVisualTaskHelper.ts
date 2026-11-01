export type VisualBranch = {
  id: string
  task: any
  children: VisualTask[]
  inputs?: string[]
}

export type VisualTask = {
  id: string
  type: 'task' | 'condition' | 'loop' | 'switch'
  task: any
  children?: VisualTask[]
  branches?: VisualBranch[]
  cases?: VisualBranch[]
  defaultBranch?: VisualBranch
}

export type UidFactory = () => string

export function cloneMacroTask<T = any>(value: T): T {
  if (typeof structuredClone === 'function') {
    try {
      return structuredClone(value)
    } catch (_) {
      // Fall back for values structuredClone cannot handle.
    }
  }

  return JSON.parse(JSON.stringify(value ?? {})) as T
}

function defaultUid(): string {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`
}

export function parseMacroVisualTasks(tasks: any[], uid: UidFactory = defaultUid): VisualTask[] {
  return parseTaskRange(Array.isArray(tasks) ? tasks : [], 0, [], uid).items
}

function parseTaskRange(tasks: any[], startIndex: number, stopMethods: string[], uid: UidFactory) {
  const items: VisualTask[] = []
  let index = startIndex
  let stopMethod = ''

  while (index < tasks.length) {
    const task = cloneMacroTask(tasks[index])
    const method = ['condition', 'loop', 'switch'].includes(String(task?.channel ?? ''))
      ? String(task?.method ?? '')
      : ''

    if (stopMethods.includes(method)) {
      stopMethod = method
      break
    }

    if (task?.channel === 'condition' && task.method === 'if') {
      const childResult = parseTaskRange(tasks, index + 1, ['else_if', 'else', 'end_if'], uid)
      const branches: VisualBranch[] = []
      index = childResult.index

      while (
        index < tasks.length
        && tasks[index]?.channel === 'condition'
        && ['else_if', 'else'].includes(tasks[index]?.method)
      ) {
        const branchTask = cloneMacroTask(tasks[index])
        const branchResult = parseTaskRange(tasks, index + 1, ['else_if', 'else', 'end_if'], uid)

        branches.push({
          id: uid(),
          task: branchTask,
          children: branchResult.items,
        })

        index = branchResult.index
      }

      if (tasks[index]?.channel === 'condition' && tasks[index]?.method === 'end_if') index++

      items.push({
        id: uid(),
        type: 'condition',
        task,
        children: childResult.items,
        branches,
      })
      continue
    }

    if (task?.channel === 'loop' && task.method === 'for') {
      const childResult = parseTaskRange(tasks, index + 1, ['end_for'], uid)
      index = childResult.index
      if (tasks[index]?.channel === 'loop' && tasks[index]?.method === 'end_for') index++

      items.push({
        id: uid(),
        type: 'loop',
        task,
        children: childResult.items,
      })
      continue
    }

    if (task?.channel === 'switch' && task.method === 'switch') {
      const cases: VisualBranch[] = []
      let defaultBranch: VisualBranch | undefined
      index++

      while (index < tasks.length) {
        const marker = tasks[index]

        if (marker?.channel === 'switch' && marker.method === 'end_switch') {
          index++
          break
        }

        if (marker?.channel === 'switch' && marker.method === 'case') {
          const caseInputs: string[] = []
          let firstCaseTask: any = null
          let caseChildren: VisualTask[] = []

          while (index < tasks.length && tasks[index]?.channel === 'switch' && tasks[index]?.method === 'case') {
            const currentCaseTask = cloneMacroTask(tasks[index])
            if (!firstCaseTask) firstCaseTask = currentCaseTask
            caseInputs.push(String(currentCaseTask?.data?.input ?? ''))

            const caseResult = parseTaskRange(tasks, index + 1, ['case', 'default', 'end_switch'], uid)
            caseChildren = caseResult.items
            index = caseResult.index

            if (caseChildren.length > 0) break
            if (!(tasks[index]?.channel === 'switch' && tasks[index]?.method === 'case')) break
          }

          firstCaseTask ??= { channel: 'switch', method: 'case', data: { input: '' } }
          firstCaseTask.data ??= {}
          firstCaseTask.data.input = caseInputs[0] ?? ''

          cases.push({
            id: uid(),
            task: firstCaseTask,
            inputs: caseInputs.length ? caseInputs : [''],
            children: caseChildren,
          })
          continue
        }

        if (marker?.channel === 'switch' && marker.method === 'default') {
          const defaultTask = cloneMacroTask(marker)
          const defaultResult = parseTaskRange(tasks, index + 1, ['end_switch'], uid)
          defaultBranch = {
            id: uid(),
            task: defaultTask,
            children: defaultResult.items,
          }
          index = defaultResult.index
          continue
        }

        const looseResult = parseTaskRange(tasks, index, ['case', 'default', 'end_switch'], uid)
        cases.push({
          id: uid(),
          task: { channel: 'switch', method: 'case', data: { input: '' } },
          inputs: [''],
          children: looseResult.items,
        })
        index = looseResult.index
      }

      items.push({
        id: uid(),
        type: 'switch',
        task,
        cases,
        defaultBranch,
      })
      continue
    }

    if (task?.channel === 'function' && task.method === 'parallel') {
      task.data = task.data && typeof task.data === 'object' ? task.data : {}
      const nestedTasks = Array.isArray(task.data.tasks) ? task.data.tasks : []

      items.push({
        id: uid(),
        type: 'task',
        task,
        children: parseMacroVisualTasks(nestedTasks, uid),
      })
      index++
      continue
    }

    items.push({ id: uid(), type: 'task', task })
    index++
  }

  return { items, index, stopMethod }
}

export function flattenMacroVisualTasks(items: VisualTask[]): any[] {
  const tasks: any[] = []

  for (const item of items ?? []) {
    if (item.type === 'condition') {
      tasks.push(cloneMacroTask(item.task))
      tasks.push(...flattenMacroVisualTasks(item.children ?? []))

      for (const branch of item.branches ?? []) {
        tasks.push(cloneMacroTask(branch.task))
        tasks.push(...flattenMacroVisualTasks(branch.children ?? []))
      }

      tasks.push({ channel: 'condition', method: 'end_if' })
      continue
    }

    if (item.type === 'loop' || (item.task?.channel === 'loop' && item.task?.method === 'for')) {
      tasks.push(cloneMacroTask(item.task))
      tasks.push(...flattenMacroVisualTasks(item.children ?? []))
      tasks.push({ channel: 'loop', method: 'end_for' })
      continue
    }

    if (item.type === 'switch' || (item.task?.channel === 'switch' && item.task?.method === 'switch')) {
      tasks.push(cloneMacroTask(item.task))

      for (const caseItem of item.cases ?? []) {
        const inputs = Array.isArray(caseItem.inputs) && caseItem.inputs.length > 0
          ? caseItem.inputs
          : [caseItem.task?.data?.input ?? '']

        for (const input of inputs) {
          const caseTask = cloneMacroTask(caseItem.task)
          caseTask.channel = 'switch'
          caseTask.method = 'case'
          caseTask.data ??= {}
          caseTask.data.input = input
          tasks.push(caseTask)
        }

        tasks.push(...flattenMacroVisualTasks(caseItem.children ?? []))
      }

      if (item.defaultBranch) {
        tasks.push(cloneMacroTask(item.defaultBranch.task))
        tasks.push(...flattenMacroVisualTasks(item.defaultBranch.children ?? []))
      }

      tasks.push({ channel: 'switch', method: 'end_switch' })
      continue
    }

    const task = cloneMacroTask(item.task)
    if (task?.channel === 'function' && task?.method === 'parallel') {
      task.data = task.data && typeof task.data === 'object' ? task.data : {}
      task.data.tasks = flattenMacroVisualTasks(item.children ?? [])
    }

    tasks.push(task)
  }

  return tasks
}

export function replaceVisualItem(target: any, source: VisualTask): void {
  for (const key of Object.keys(target ?? {})) delete target[key]
  Object.assign(target, cloneMacroTask(source))
}
