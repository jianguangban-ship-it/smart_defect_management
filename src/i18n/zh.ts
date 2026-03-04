export default {
  header: {
    title: '智能缺陷管理',
    themeDark: '切换深色模式',
    themeLight: '切换浅色模式'
  },
  nav: {
    defects: '缺陷列表',
    dashboard: '仪表盘',
    settings: '设置'
  },
  defect: {
    title: '标题',
    description: '描述',
    severity: '严重度',
    priority: '优先级',
    status: '状态',
    category: '分类',
    detectedPhase: '发现阶段',
    vehicle: '车型',
    product: '产品',
    layer: '分层',
    component: '组件',
    reporter: '报告人',
    assignee: '经办人',
    rootCause: '根本原因',
    correctiveAction: '纠正措施',
    createdAt: '创建时间',
    updatedAt: '更新时间',
    id: 'ID'
  },
  form: {
    createDefect: '新建缺陷',
    editDefect: '编辑缺陷',
    titlePlaceholder: '简要缺陷标题...',
    descriptionPlaceholder: '详细描述、复现步骤、预期与实际行为...',
    rootCausePlaceholder: '根本原因分析...',
    correctiveActionPlaceholder: '纠正措施 / 修复方案描述...',
    componentPlaceholder: '组件名',
    searchPerson: '搜索姓名或工号...',
    members: '人',
    noResults: '未找到匹配',
    save: '保存',
    cancel: '取消',
    create: '创建',
    update: '更新',
    required: '必填',
    select: '选择'
  },
  filter: {
    search: '搜索缺陷...',
    allSeverities: '所有严重度',
    allStatuses: '所有状态',
    allCategories: '所有分类',
    allPhases: '所有阶段',
    allPriorities: '所有优先级',
    reset: '重置筛选',
    showing: '显示',
    of: '/',
    defects: '个缺陷',
    noResults: '未找到缺陷',
    noResultsHint: '请调整筛选条件或新建缺陷',
    total: '共计'
  },
  table: {
    id: 'ID',
    title: '标题',
    severity: '严重度',
    status: '状态',
    category: '分类',
    assignee: '经办人',
    date: '日期',
    actions: '操作',
    sortAsc: '升序排列',
    sortDesc: '降序排列'
  },
  detail: {
    title: '缺陷详情',
    edit: '编辑',
    delete: '删除',
    back: '返回列表',
    basicInfo: '基本信息',
    classification: '分类信息',
    people: '人员',
    analysis: '分析',
    timeline: '时间线'
  },
  dashboard: {
    title: '仪表盘',
    overview: '概览',
    totalDefects: '缺陷总数',
    openDefects: '待处理',
    inProgress: '处理中',
    fixedDefects: '已修复',
    bySeverity: '按严重度',
    byStatus: '按状态',
    byCategory: '按分类',
    byPhase: '按阶段',
    byPriority: '按优先级',
    recentTrend: '近期趋势'
  },
  confirm: {
    deleteTitle: '删除缺陷',
    deleteMessage: '确定要删除此缺陷吗？此操作为软删除。',
    cancel: '取消',
    confirm: '删除'
  },
  toast: {
    createSuccess: '缺陷创建成功',
    updateSuccess: '缺陷更新成功',
    deleteSuccess: '缺陷删除成功',
    error: '操作失败'
  },
  hotkeys: {
    title: '键盘快捷键',
    newDefect: '新建缺陷',
    search: '聚焦搜索',
    escape: '关闭弹窗 / 面板',
    showCheatsheet: '显示快捷键列表'
  },
  pagination: {
    prev: '上一页',
    next: '下一页',
    page: '第',
    of: '页 / 共'
  },
  settings: {
    title: '设置',
    save: '保存',
    cancel: '取消',
    saved: '设置已保存'
  }
} as const
