export { default as MacroApiBodyEditor } from './MacroApiBodyEditor.vue'
export { default as MacroApiDeleteTaskAccordion } from './MacroApiDeleteTaskAccordion.vue'
export { default as MacroApiGetTaskAccordion } from './MacroApiGetTaskAccordion.vue'
export { default as MacroApiKeyValueEditor } from './MacroApiKeyValueEditor.vue'
export { default as MacroApiPatchTaskAccordion } from './MacroApiPatchTaskAccordion.vue'
export { default as MacroApiPostTaskAccordion } from './MacroApiPostTaskAccordion.vue'
export { default as MacroApiPutTaskAccordion } from './MacroApiPutTaskAccordion.vue'
export { default as MacroApiRequestFields } from './MacroApiRequestFields.vue'

import type { MacroTaskPresetRegistration } from '../preset-registry-types'

export const apiMacroTaskPresets: MacroTaskPresetRegistration[] = [
  {
    path: [
      { titleKey: "macro.presets.expert.title", icon: "mdi-function" },
      { titleKey: "macro.presets.expert.apiRequest.title", icon: "mdi-api" },
    ],
    titleKey: "macro.presets.expert.apiRequest.get",
    icon: "mdi-download",
    order: 136,
    create: () => ({ type: 'task', task: { channel: 'api_request', method: 'get', data: { url: '', result_variable: 'api_response', headers: {}, query: {}, timeout: 30000, fail_on_error: false } } }),
  },
  {
    path: [
      { titleKey: "macro.presets.expert.title", icon: "mdi-function" },
      { titleKey: "macro.presets.expert.apiRequest.title", icon: "mdi-api" },
    ],
    titleKey: "macro.presets.expert.apiRequest.post",
    icon: "mdi-upload",
    order: 137,
    create: () => ({ type: 'task', task: { channel: 'api_request', method: 'post', data: { url: '', result_variable: 'api_response', headers: {}, query: {}, timeout: 30000, fail_on_error: false, body_type: 'json', body_data: {}, form_data: {} } } }),
  },
  {
    path: [
      { titleKey: "macro.presets.expert.title", icon: "mdi-function" },
      { titleKey: "macro.presets.expert.apiRequest.title", icon: "mdi-api" },
    ],
    titleKey: "macro.presets.expert.apiRequest.put",
    icon: "mdi-file-replace-outline",
    order: 138,
    create: () => ({ type: 'task', task: { channel: 'api_request', method: 'put', data: { url: '', result_variable: 'api_response', headers: {}, query: {}, timeout: 30000, fail_on_error: false, body_type: 'json', body_data: {}, form_data: {} } } }),
  },
  {
    path: [
      { titleKey: "macro.presets.expert.title", icon: "mdi-function" },
      { titleKey: "macro.presets.expert.apiRequest.title", icon: "mdi-api" },
    ],
    titleKey: "macro.presets.expert.apiRequest.patch",
    icon: "mdi-file-edit-outline",
    order: 139,
    create: () => ({ type: 'task', task: { channel: 'api_request', method: 'patch', data: { url: '', result_variable: 'api_response', headers: {}, query: {}, timeout: 30000, fail_on_error: false, body_type: 'json', body_data: {}, form_data: {} } } }),
  },
  {
    path: [
      { titleKey: "macro.presets.expert.title", icon: "mdi-function" },
      { titleKey: "macro.presets.expert.apiRequest.title", icon: "mdi-api" },
    ],
    titleKey: "macro.presets.expert.apiRequest.delete",
    icon: "mdi-delete-outline",
    order: 140,
    create: () => ({ type: 'task', task: { channel: 'api_request', method: 'delete', data: { url: '', result_variable: 'api_response', headers: {}, query: {}, timeout: 30000, fail_on_error: false, body_type: 'json', body_data: {}, form_data: {} } } }),
  },
]
