import { CACHE_KEYS, readCache, writeCache } from '../../utils/cache'
import { RULES_DATA, type RuleItem } from '../../data/rules-data'

type RuleSelection = {
  ruleId: string
  ruleName: string
  options: string[]
  selectedIndex: number
}

type GeneratorForm = {
  gameDate: string
  gameTime: string
  location: string
  rounds: string
  payTypeIndex: number
  contact: string
  note: string
  ruleIndexes: Record<string, number>
}

const defaultForm: GeneratorForm = {
  gameDate: '',
  gameTime: '19:30',
  location: '',
  rounds: '8圈',
  payTypeIndex: 0,
  contact: '',
  note: '',
  ruleIndexes: {},
}

Component({
  data: {
    payTypeOptions: ['AA', '赢家请客', '到场均摊'],
    form: defaultForm,
    ruleSelections: [] as RuleSelection[],
    generatedText: '',
  },
  lifetimes: {
    attached() {
      const cachedForm = readCache<GeneratorForm>(CACHE_KEYS.generatorForm, defaultForm)
      const mergedForm = this.getMergedForm(cachedForm)
      this.setData({
        form: mergedForm,
        ruleSelections: this.buildRuleSelections(mergedForm.ruleIndexes),
      })
    },
  },
  methods: {
    getMergedForm(cached: GeneratorForm) {
      const cachedRuleIndexes = cached.ruleIndexes || {}
      const nextRuleIndexes: Record<string, number> = {}
      RULES_DATA.ruleItems.forEach((item) => {
        const maybe = cachedRuleIndexes[item.id]
        const isValid = typeof maybe === 'number' && maybe >= 0 && maybe < item.options.length
        nextRuleIndexes[item.id] = isValid ? maybe : 0
      })
      return {
        ...defaultForm,
        ...cached,
        ruleIndexes: nextRuleIndexes,
      }
    },
    buildRuleSelections(ruleIndexes: Record<string, number>) {
      return RULES_DATA.ruleItems.map((item) => ({
        ruleId: item.id,
        ruleName: item.name,
        options: item.options,
        selectedIndex: ruleIndexes[item.id],
      }))
    },
    syncForm(nextForm: GeneratorForm) {
      this.setData({
        form: nextForm,
        ruleSelections: this.buildRuleSelections(nextForm.ruleIndexes),
      })
      writeCache(CACHE_KEYS.generatorForm, nextForm)
    },
    updateField(key: keyof GeneratorForm, value: string | number | Record<string, number>) {
      const nextForm = {
        ...this.data.form,
        [key]: value,
      }
      this.syncForm(nextForm)
    },
    onInput(event: WechatMiniprogram.BaseEvent) {
      const key = event.currentTarget.dataset.key as keyof GeneratorForm
      const value = event.detail.value as string
      this.updateField(key, value)
    },
    onPickDate(event: WechatMiniprogram.CustomEvent<{ value: string }>) {
      this.updateField('gameDate', event.detail.value)
    },
    onPickTime(event: WechatMiniprogram.CustomEvent<{ value: string }>) {
      this.updateField('gameTime', event.detail.value)
    },
    onPickPayType(event: WechatMiniprogram.CustomEvent<{ value: string }>) {
      this.updateField('payTypeIndex', Number(event.detail.value))
    },
    onPickRule(event: WechatMiniprogram.BaseEvent) {
      const ruleId = event.currentTarget.dataset.ruleId as string
      const selectedIndex = Number(event.detail.value)
      const nextRuleIndexes = {
        ...this.data.form.ruleIndexes,
        [ruleId]: selectedIndex,
      }
      this.updateField('ruleIndexes', nextRuleIndexes)
    },
    onGenerate() {
      const form = this.data.form
      if (!form.gameDate || !form.location) {
        wx.showToast({ title: '请填写日期和地点', icon: 'none' })
        return
      }

      const payType = this.data.payTypeOptions[form.payTypeIndex]
      const ruleLines = this.data.ruleSelections.map((item) => {
        const value = item.options[item.selectedIndex]
        return `${item.ruleName}：${value}`
      })

      const lines = [
        '【杭州麻将组局】',
        `时间：${form.gameDate} ${form.gameTime}`,
        `地点：${form.location}`,
        `局数：${form.rounds}`,
        '规则设置：',
      ]
        .concat(ruleLines.map((line) => `- ${line}`))
        .concat([
          `费用：${payType}`,
          form.contact ? `联系：${form.contact}` : '',
          form.note ? `备注：${form.note}` : '',
          '回复“+1”报名。',
        ])
        .filter((line) => line)

      this.setData({ generatedText: lines.join('\n') })
    },
    onCopy() {
      if (!this.data.generatedText) {
        wx.showToast({ title: '请先生成消息', icon: 'none' })
        return
      }
      wx.setClipboardData({
        data: this.data.generatedText,
        success: () => {
          wx.showToast({ title: '已复制', icon: 'success' })
        },
      })
    },
    onReset() {
      const resetForm = this.getMergedForm(defaultForm)
      this.setData({
        generatedText: '',
      })
      this.syncForm(resetForm)
    },
  },
})
