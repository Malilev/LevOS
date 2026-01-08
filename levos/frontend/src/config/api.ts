export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const apiEndpoints = {
  health: `${API_BASE_URL}/api/health`,
  schedule: {
    autoBlocks: `${API_BASE_URL}/api/schedule/auto-blocks`,
    applyScenario: `${API_BASE_URL}/api/schedule/apply-scenario`,
    detectScenario: `${API_BASE_URL}/api/schedule/detect-scenario`,
  },
  reports: {
    daily: `${API_BASE_URL}/api/reports/daily`,
    weekly: `${API_BASE_URL}/api/reports/weekly`,
    project: `${API_BASE_URL}/api/reports/project`,
  },
  export: {
    json: `${API_BASE_URL}/api/export`,
    import: `${API_BASE_URL}/api/import`,
  },
};
