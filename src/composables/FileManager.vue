<template>
  <div class="file-manager">
    <h3>文件列表</h3>
    <div class="file-list">
      <div 
        v-for="(file, name) in files" 
        :key="name"
        class="file-item"
        @click="openFile(name)"
      >
        <span>{{ name }}</span>
        <span class="file-time">{{ formatTime(file.saveTime) }}</span>
      </div>
    </div>
    <button @click="createNewFile">新建文件</button>
    <button @click="renameFile">重命名当前文件</button>
  </div>
</template>

<script setup>
import { ref, watchEffect } from 'vue';
import { useEditor } from '../composables/editor/useEditor';

const { editor, autoSaveManager } = useEditor();
const files = ref({});

// 加载本地文件列表
const loadFiles = () => {
  files.value = JSON.parse(localStorage.getItem('md_editor_files') || '{}');
};

// 初始化加载
loadFiles();

// 打开文件
const openFile = (name) => {
  const file = files.value[name];
  editor.value.setValue(file.content); // 显示文件内容
  autoSaveManager.value.setFileName(name); // 更新当前文件名
};

// 新建文件
const createNewFile = () => {
  const newName = `未命名文件_${new Date().getTime()}`;
  editor.value.setValue(''); // 清空编辑器
  autoSaveManager.value.setFileName(newName); // 设置新文件名
  autoSaveManager.value.save(); // 立即保存
  loadFiles(); // 刷新列表
};

// 重命名文件
const renameFile = () => {
  const oldName = autoSaveManager.value.getFileName();
  const newName = prompt('请输入新文件名', oldName);
  if (newName && newName !== oldName) {
    const filesData = JSON.parse(localStorage.getItem('md_editor_files') || '{}');
    filesData[newName] = filesData[oldName]; // 复制数据
    delete filesData[oldName]; // 删除旧数据
    localStorage.setItem('md_editor_files', JSON.stringify(filesData));
    autoSaveManager.value.setFileName(newName); // 更新当前文件名
    loadFiles(); // 刷新列表
  }
};

// 格式化时间显示
const formatTime = (timeStr) => {
  return new Date(timeStr).toLocaleString();
};
</script>

<style scoped>
.file-manager {
  padding: 16px;
  border: 1px solid #eee;
  border-radius: 8px;
}
.file-list {
  margin: 16px 0;
  max-height: 300px;
  overflow-y: auto;
}
.file-item {
  padding: 8px 12px;
  margin: 4px 0;
  background: #f5f5f5;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
}
.file-time {
  font-size: 12px;
  color: #666;
}
button {
  margin-right: 8px;
  padding: 6px 12px;
  cursor: pointer;
}
</style>