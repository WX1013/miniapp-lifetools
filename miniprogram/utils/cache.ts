export const CACHE_KEYS = {
  generatorForm: 'hzmj_generator_form',
  supplementDraft: 'hzmj_supplement_draft',
  supplementList: 'hzmj_supplement_list',
  devIdeaDraft: 'hzmj_dev_idea_draft',
  devIdeaList: 'hzmj_dev_idea_list',
} as const

export const readCache = <T>(key: string, fallback: T): T => {
  try {
    const value = wx.getStorageSync(key) as T | undefined
    return value === undefined || value === null ? fallback : value
  } catch (_err) {
    return fallback
  }
}

export const writeCache = <T>(key: string, value: T) => {
  wx.setStorageSync(key, value)
}
