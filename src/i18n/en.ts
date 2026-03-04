export default {
  header: {
    title: 'Smart Defect Management',
    themeDark: 'Switch to dark mode',
    themeLight: 'Switch to light mode'
  },
  nav: {
    defects: 'Defects',
    dashboard: 'Dashboard',
    settings: 'Settings'
  },
  defect: {
    title: 'Title',
    description: 'Description',
    severity: 'Severity',
    priority: 'Priority',
    status: 'Status',
    category: 'Category',
    detectedPhase: 'Detected Phase',
    vehicle: 'Vehicle',
    product: 'Product',
    layer: 'Layer',
    component: 'Component',
    reporter: 'Reporter',
    assignee: 'Assignee',
    rootCause: 'Root Cause',
    correctiveAction: 'Corrective Action',
    createdAt: 'Created',
    updatedAt: 'Updated',
    id: 'ID'
  },
  form: {
    createDefect: 'New Defect',
    editDefect: 'Edit Defect',
    titlePlaceholder: 'Brief defect title...',
    descriptionPlaceholder: 'Detailed description, reproduction steps, expected vs actual behavior...',
    rootCausePlaceholder: 'Root cause analysis...',
    correctiveActionPlaceholder: 'Corrective action / fix description...',
    componentPlaceholder: 'Component name',
    searchPerson: 'Search by name or ID...',
    members: 'members',
    noResults: 'No results for',
    save: 'Save',
    cancel: 'Cancel',
    create: 'Create',
    update: 'Update',
    required: 'Required',
    select: 'Select'
  },
  filter: {
    search: 'Search defects...',
    allSeverities: 'All Severities',
    allStatuses: 'All Statuses',
    allCategories: 'All Categories',
    allPhases: 'All Phases',
    allPriorities: 'All Priorities',
    reset: 'Reset Filters',
    showing: 'Showing',
    of: 'of',
    defects: 'defects',
    noResults: 'No defects found',
    noResultsHint: 'Try adjusting your filters or create a new defect',
    total: 'Total'
  },
  table: {
    id: 'ID',
    title: 'Title',
    severity: 'Severity',
    status: 'Status',
    category: 'Category',
    assignee: 'Assignee',
    date: 'Date',
    actions: 'Actions',
    sortAsc: 'Sort ascending',
    sortDesc: 'Sort descending'
  },
  detail: {
    title: 'Defect Detail',
    edit: 'Edit',
    delete: 'Delete',
    back: 'Back to list',
    basicInfo: 'Basic Information',
    classification: 'Classification',
    people: 'People',
    analysis: 'Analysis',
    timeline: 'Timeline'
  },
  dashboard: {
    title: 'Dashboard',
    overview: 'Overview',
    totalDefects: 'Total Defects',
    openDefects: 'Open',
    inProgress: 'In Progress',
    fixedDefects: 'Fixed',
    bySeverity: 'By Severity',
    byStatus: 'By Status',
    byCategory: 'By Category',
    byPhase: 'By Phase',
    byPriority: 'By Priority',
    recentTrend: 'Recent Trend'
  },
  confirm: {
    deleteTitle: 'Delete Defect',
    deleteMessage: 'Are you sure you want to delete this defect? This action will soft-delete the record.',
    cancel: 'Cancel',
    confirm: 'Delete'
  },
  toast: {
    createSuccess: 'Defect created successfully',
    updateSuccess: 'Defect updated successfully',
    deleteSuccess: 'Defect deleted successfully',
    error: 'An error occurred'
  },
  hotkeys: {
    title: 'Keyboard Shortcuts',
    newDefect: 'New Defect',
    search: 'Focus Search',
    escape: 'Close modal / panel',
    showCheatsheet: 'Show this cheat sheet'
  },
  pagination: {
    prev: 'Previous',
    next: 'Next',
    page: 'Page',
    of: 'of'
  },
  settings: {
    title: 'Settings',
    save: 'Save',
    cancel: 'Cancel',
    saved: 'Settings saved'
  }
} as const
