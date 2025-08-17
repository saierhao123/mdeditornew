<template>
  <div class="markdown-editor">
    <div class="editor-toolbar">
      <div class="toolbar-left">
        <!-- 文件管理按钮组 -->
        <div class="toolbar-group">
          <ToolbarButton
            title="新建文件"
            icon="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z"
            @click="handleNewFile"
          />
          <ToolbarButton
            title="打开文件"
            icon="M14,2H6C4.89,2 4,2.89 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20M15,18V16H6V18H15M18,14V12H6V14H18Z"
            @click="handleOpenFile"
          />
          <ToolbarButton
            title="保存文件"
            icon="M15,9H5V5H15M12,19A3,3 0 0,1 9,16A3,3 0 0,1 12,13A3,3 0 0,1 15,16A3,3 0 0,1 12,19M17,3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V7L17,3Z"
            @click="handleSaveFile"
          />
        </div>
        <div class="toolbar-divider"></div>
        
        <template v-for="(group, groupIndex) in toolbarConfig" :key="groupIndex">
          <div v-if="group.type === 'group'" class="toolbar-group">
            <ToolbarButton
              v-for="item in group.items"
              :key="item.id"
              :title="item.title"
              :icon="item.icon"
              :width="item.width"
              :height="item.height"
              @click="item.action"
            />
          </div>
          <div v-else-if="group.type === 'divider'" class="toolbar-divider"></div>
          <ToolbarButton
            v-else
            :key="group.id"
            :title="group.title"
            :icon="group.icon"
            :width="group.width"
            :height="group.height"
            @click="group.action"
          />
        </template>
      </div>
      <div class="toolbar-right">
        <!-- 工具栏右侧预留 -->
      </div>
    </div>

    <div class="editor-container">
      <div ref="editorElement" class="codemirror-wrapper"></div>
    </div>
  </div>
</template>

<script>
import { watch, computed, ref } from 'vue'
import { useMarkdownEditor } from '../composables/index.js'
import ToolbarButton from './ToolbarButton.vue'
import { createToolbarConfig } from '../config/toolbar.js'

export default {
  name: 'MarkdownEditor',
  components: {
    ToolbarButton
  },
  props: {
    modelValue: {
      type: String,
      default: ''
    },
    theme: {
      type: String,
      default: 'light'
    },
    syncScrollEnabled: {
      type: Boolean,
      default: true
    }
  },
  emits: [
    'update:modelValue', 
    'showMarkdownGuide',
    'new-file',
    'open-file',
    'save-file',
    'file-content-loaded'
  ],
  setup(props, { emit }) {
    // 滚动同步处理
    const handleEditorScroll = (scrollPercentage) => {
      // 只有在启用同步滚动时才执行同步
      if (!props.syncScrollEnabled) return

      // 同步到预览区
      const previewElement = document.querySelector('.preview-rendered')
      if (previewElement) {
        const previewMaxScrollTop = Math.max(0, previewElement.scrollHeight - previewElement.clientHeight)
        const targetScrollTop = Math.round(previewMaxScrollTop * scrollPercentage)
        previewElement.scrollTop = targetScrollTop
      }
    }

    // 使用编辑器 composable
    const editor = useMarkdownEditor({
      initialValue: props.modelValue,
      theme: props.theme,
      onContentChange: (content) => {
        emit('update:modelValue', content)
      },
      onScroll: handleEditorScroll
    })

    // 监听 props 变化
    watch(() => props.modelValue, (newValue) => {
      editor.updateContent(newValue)
    })

    // 文件管理相关方法
    const handleNewFile = () => {
      emit('new-file')
      // 可以在这里添加默认行为，如清空编辑器
      if (confirm('确定要新建文件吗？当前内容可能会丢失')) {
        editor.updateContent('')
      }
    }

    const handleOpenFile = () => {
      // 创建文件输入元素
      const fileInput = document.createElement('input')
      fileInput.type = 'file'
      fileInput.accept = '.md,.markdown,text/plain'
      
      fileInput.onchange = (e) => {
        const file = e.target.files[0]
        if (file) {
          const reader = new FileReader()
          reader.onload = (event) => {
            const content = event.target.result
            editor.updateContent(content)
            emit('file-content-loaded', {
              content,
              filename: file.name
            })
          }
          reader.readAsText(file)
        }
      }
      
      fileInput.click()
      emit('open-file')
    }

    const handleSaveFile = () => {
      const content = editor.content.value
      const blob = new Blob([content], { type: 'text/markdown' })
      const url = URL.createObjectURL(blob)
      
      const a = document.createElement('a')
      a.href = url
      a.download = 'document.md'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      emit('save-file', content)
    }

    // 工具栏配置
    const toolbarConfig = computed(() => createToolbarConfig(editor))

    return {
      ...editor,
      toolbarConfig,
      handleNewFile,
      handleOpenFile,
      handleSaveFile
    }
  }
}
</script>