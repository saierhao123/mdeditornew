/**
 * @file src/core/editor/auto-save.js
 * @description 编辑器自动保存管理器
 */
export class AutoSaveManager {
  /**
   * 初始化自动保存管理器
   * @param {Object} options - 配置选项
   * @param {Function} options.getEditorView - 获取编辑器视图的方法
   * @param {Function} options.getContent - 获取编辑器内容的方法
   * @param {number} [options.interval=10000] - 自动保存间隔（毫秒），默认10秒
   */
  constructor(options) {
    this.getEditorView = options.getEditorView;
    this.getContent = options.getContent;
    this.interval = null; // 定时器实例
    this.saveInterval = options.interval || 10000; // 10秒自动保存
    this.currentFileName = null; // 当前文件名
  }

  /**
   * 启动自动保存
   */
  start() {
    // 防止重复启动
    if (this.interval) clearInterval(this.interval);
    
    // 立即保存一次（初始化时）
    this.save();
    
    // 设置定时器
    this.interval = setInterval(() => {
      this.save();
    }, this.saveInterval);
  }

  /**
   * 停止自动保存
   */
  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  /**
   * 执行保存操作
   */
  save() {
    const content = this.getContent(); // 获取当前内容
    if (!content) return; // 空内容不保存
    
    const fileName = this.getFileName(); // 获取文件名
    const saveTime = new Date().toISOString(); // 保存时间
    
    // 从localStorage获取现有文件
    const files = JSON.parse(localStorage.getItem('md_editor_files') || '{}');
    
    // 更新当前文件
    files[fileName] = {
      content,
      saveTime,
      lastOpenTime: new Date().toISOString()
    };
    
    // 保存回localStorage
    localStorage.setItem('md_editor_files', JSON.stringify(files));
    console.log(`自动保存成功: ${fileName} (${new Date().toLocaleTimeString()})`);
  }

  /**
   * 获取当前文件名（默认自动生成）
   */
  getFileName() {
    if (!this.currentFileName) {
      // 生成默认文件名（未命名+时间戳）
      this.currentFileName = `未命名文件_${new Date().getTime()}`;
    }
    return this.currentFileName;
  }

  /**
   * 设置当前文件名
   * @param {string} name - 新文件名
   */
  setFileName(name) {
    if (name && name.trim()) {
      this.currentFileName = name.trim();
    }
  }
}