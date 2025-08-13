<template>
  <div class="code-editor" :style="{ height }">
    <div ref="editorContainer" class="editor-container"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import * as monaco from 'monaco-editor'

interface Props {
  modelValue: string
  language?: string
  theme?: 'vs' | 'vs-dark'
  height?: string
  readonly?: boolean
  options?: monaco.editor.IStandaloneEditorConstructionOptions
}

const props = withDefaults(defineProps<Props>(), {
  language: 'plaintext',
  theme: 'vs',
  height: '300px',
  readonly: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  change: [value: string]
}>()

const editorContainer = ref<HTMLElement>()
let editor: monaco.editor.IStandaloneCodeEditor | null = null

const defaultOptions: monaco.editor.IStandaloneEditorConstructionOptions = {
  automaticLayout: true,
  fontSize: 14,
  lineNumbers: 'on',
  roundedSelection: false,
  scrollBeyondLastLine: false,
  minimap: { enabled: false },
  wordWrap: 'on',
  folding: true,
  lineDecorationsWidth: 10,
  lineNumbersMinChars: 3,
  padding: { top: 10, bottom: 10 },
  contextmenu: true,
  selectOnLineNumbers: true,
  tabSize: 2,
  insertSpaces: true
}

const initEditor = () => {
  if (!editorContainer.value) return

  const options = {
    ...defaultOptions,
    ...props.options,
    value: props.modelValue,
    language: props.language,
    theme: props.theme,
    readOnly: props.readonly
  }

  editor = monaco.editor.create(editorContainer.value, options)

  // 监听内容变化
  editor.onDidChangeModelContent(() => {
    if (editor) {
      const value = editor.getValue()
      emit('update:modelValue', value)
      emit('change', value)
    }
  })

  // 自适应高度
  const resizeObserver = new ResizeObserver(() => {
    if (editor) {
      editor.layout()
    }
  })
  resizeObserver.observe(editorContainer.value)
}

// 监听外部值变化
watch(
  () => props.modelValue,
  (newValue) => {
    if (editor && editor.getValue() !== newValue) {
      editor.setValue(newValue)
    }
  }
)

// 监听语言变化
watch(
  () => props.language,
  (newLanguage) => {
    if (editor) {
      const model = editor.getModel()
      if (model) {
        monaco.editor.setModelLanguage(model, newLanguage)
      }
    }
  }
)

// 监听主题变化
watch(
  () => props.theme,
  (newTheme) => {
    if (editor) {
      monaco.editor.setTheme(newTheme)
    }
  }
)

// 监听只读状态
watch(
  () => props.readonly,
  (readonly) => {
    if (editor) {
      editor.updateOptions({ readOnly: readonly })
    }
  }
)

// 暴露方法
defineExpose({
  getEditor: () => editor,
  getValue: () => editor?.getValue() || '',
  setValue: (value: string) => editor?.setValue(value),
  focus: () => editor?.focus(),
  getSelection: () => editor?.getSelection(),
  setSelection: (selection: monaco.Range) => editor?.setSelection(selection)
})

onMounted(() => {
  nextTick(() => {
    initEditor()
  })
})

onUnmounted(() => {
  if (editor) {
    editor.dispose()
    editor = null
  }
})
</script>

<style lang="scss" scoped>
.code-editor {
  width: 100%;
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
  overflow: hidden;
  
  .editor-container {
    width: 100%;
    height: 100%;
  }
}

:deep(.monaco-editor) {
  .margin {
    background-color: var(--el-bg-color) !important;
  }
  
  .monaco-editor-background,
  .inputarea.ime-input {
    background-color: var(--el-bg-color) !important;
  }
  
  .current-line {
    background-color: var(--el-fill-color-light) !important;
  }
  
  .selected-text {
    background-color: var(--el-color-primary-light-8) !important;
  }
}

// 暗色主题适配
.dark :deep(.monaco-editor) {
  .margin {
    background-color: #1e1e1e !important;
  }
  
  .monaco-editor-background,
  .inputarea.ime-input {
    background-color: #1e1e1e !important;
  }
}
</style>
