import { CACHE_KEYS, readCache, writeCache } from '../../utils/cache'
import { ALERT_LIST } from '../../data/alert-data'

type SingleOption = '财敲' | '自摸'
type GangBaiOption = '无白杠白不开' | '无白杠白开'
type GenZhuangOption = '硬跟' | '软跟'
type CapOption = '128' | '256' | '不封顶'
type TimeMode = '指定时间' | '人齐开'
type PeopleOption = '173' | '272' | '371'
type SmokeOption = '无烟' | '少烟' | '有烟'
type MultiOptionView = {
  label: string
  selected: boolean
}

type GeneratorForm = {
  playMode: SingleOption
  chiPeng: string[]
  fanPan: string[]
  shouZhuang: string[]
  gangBai: GangBaiOption
  genZhuang: GenZhuangOption
  cap: CapOption
  moneySize: number
  timeMode: TimeMode
  startTime: string
  durationPreset: number
  people: PeopleOption
  smoke: SmokeOption
  remark: string
}

const durationPresetOptions = [3, 4, 5, 6, 7, 8]

const playModeOptions: SingleOption[] = ['财敲', '自摸']
const chiPengOptions = ['吃两摊', '碰无限']
const fanPanOptions = ['三财翻', '四财翻']
const shouZhuangOptions = ['跳碰亮白']
const gangBaiOptions: GangBaiOption[] = ['无白杠白不开', '无白杠白开']
const genZhuangOptions: GenZhuangOption[] = ['硬跟', '软跟']
const capOptions: CapOption[] = ['128', '256', '不封顶']
const timeModeOptions: TimeMode[] = ['指定时间', '人齐开']
const peopleOptions: PeopleOption[] = ['173', '272', '371']
const smokeOptions: SmokeOption[] = ['无烟', '少烟', '有烟']
const timeHourOptions = Array.from({ length: 24 }).map((_, idx) => `${idx}`.padStart(2, '0'))
const timeMinuteOptions = ['00', '10', '20', '30', '40', '50']

const defaultForm: GeneratorForm = {
  playMode: '财敲',
  chiPeng: ['吃两摊', '碰无限'],
  fanPan: ['三财翻', '四财翻'],
  shouZhuang: ['跳碰亮白'],
  gangBai: '无白杠白不开',
  genZhuang: '硬跟',
  cap: '256',
  moneySize: 1,
  timeMode: '人齐开',
  startTime: '12:00',
  durationPreset: 3,
  people: '173',
  smoke: '无烟',
  remark: '',
}

Component({
  data: {
    form: defaultForm,
    generatedText: '',
    alertText: '',
    chiPengViews: [] as MultiOptionView[],
    fanPanViews: [] as MultiOptionView[],
    shouZhuangViews: [] as MultiOptionView[],
    playModeOptions,
    chiPengOptions,
    fanPanOptions,
    shouZhuangOptions,
    gangBaiOptions,
    genZhuangOptions,
    capOptions,
    timeModeOptions,
    timeHourOptions,
    timeMinuteOptions,
    timeColumns: [timeHourOptions, timeMinuteOptions] as string[][],
    timePickerValue: [12, 0] as [number, number],
    peopleOptions,
    smokeOptions,
    durationPresetOptions,
  },
  lifetimes: {
    attached() {
      const cachedForm = readCache<Partial<GeneratorForm>>(CACHE_KEYS.generatorForm, {})
      const mergedForm = this.getMergedForm(cachedForm)
      this.setData({
        alertText: this.getRandomAlert(),
      })
      this.syncForm(mergedForm)
    },
  },
  methods: {
    getRandomAlert() {
      if (!ALERT_LIST.length) {
        return '今日手气最佳，祝你把把顺胡'
      }
      const idx = Math.floor(Math.random() * ALERT_LIST.length)
      return ALERT_LIST[idx]
    },
    getMergedForm(cached: Partial<GeneratorForm>) {
      const form = {
        ...defaultForm,
        ...cached,
      }

      const sanitizeMulti = (arr: unknown, options: string[], fallback: string[]) => {
        if (!Array.isArray(arr)) {
          return fallback
        }
        return arr.filter((item) => options.indexOf(String(item)) >= 0).map((item) => String(item))
      }

      const isOneOf = <T extends string>(value: unknown, options: T[], fallback: T): T => {
        return options.indexOf(value as T) >= 0 ? (value as T) : fallback
      }

      const moneySize = Number(form.moneySize)
      const durationPreset = Number(form.durationPreset)

      return {
        ...form,
        playMode: isOneOf(form.playMode, playModeOptions, defaultForm.playMode),
        chiPeng: sanitizeMulti(form.chiPeng, chiPengOptions, defaultForm.chiPeng),
        fanPan: sanitizeMulti(form.fanPan, fanPanOptions, defaultForm.fanPan),
        shouZhuang: sanitizeMulti(form.shouZhuang, shouZhuangOptions, defaultForm.shouZhuang),
        gangBai: isOneOf(form.gangBai, gangBaiOptions, defaultForm.gangBai),
        genZhuang: isOneOf(form.genZhuang, genZhuangOptions, defaultForm.genZhuang),
        cap: isOneOf(form.cap, capOptions, defaultForm.cap),
        moneySize: moneySize >= 1 && moneySize <= 10 ? moneySize : defaultForm.moneySize,
        timeMode: isOneOf(form.timeMode, timeModeOptions, defaultForm.timeMode),
        people: isOneOf(form.people, peopleOptions, defaultForm.people),
        smoke: isOneOf(form.smoke, smokeOptions, defaultForm.smoke),
        durationPreset: durationPresetOptions.indexOf(durationPreset) >= 0 ? durationPreset : defaultForm.durationPreset,
        startTime: typeof form.startTime === 'string' && form.startTime ? form.startTime : defaultForm.startTime,
        remark: typeof form.remark === 'string' ? form.remark : '',
      }
    },
    normalizeMoneySize(value: unknown) {
      const maybe = Number(value)
      if (!Number.isFinite(maybe)) {
        return this.data.form.moneySize
      }
      if (maybe < 1) {
        return 1
      }
      if (maybe > 10) {
        return 10
      }
      return Math.floor(maybe)
    },
    buildResult(form: GeneratorForm) {
      const timeText = form.timeMode === '指定时间' ? form.startTime : '人齐开'
      const durationHour = form.durationPreset
      const capText = form.cap === '不封顶' ? '不封顶' : `封顶${form.cap}`
      const ruleParts = [
        form.playMode,
        form.chiPeng.length ? form.chiPeng.join('、') : '',
        form.fanPan.length ? form.fanPan.join('、') : '',
        form.shouZhuang.length ? form.shouZhuang.join('、') : '',
        form.gangBai,
        form.genZhuang,
        capText,
      ].filter((part) => part)

      const lines = [
        '✨杭麻组局✨',
        ruleParts.join('、'),
        `🕰时间：${timeText}`,
        `⌛️时长：${durationHour}h`,
        `🙋‍♀️人数：${form.people}`,
        `💰大小：${form.moneySize}`,
        `🚬抽烟：${form.smoke}`,
        form.remark.trim() ? `💬备注：${form.remark.trim()}` : '',
      ].filter((line) => line)

      return lines.join('\n')
    },
    buildMultiViews(selected: string[], options: string[]) {
      return options.map((label) => ({
        label,
        selected: selected.indexOf(label) >= 0,
      }))
    },
    getTimePickerValue(startTime: string) {
      const [hourRaw, minuteRaw] = startTime.split(':')
      const hour = typeof hourRaw === 'string' ? hourRaw : '12'
      const minute = typeof minuteRaw === 'string' ? minuteRaw : '00'
      const hourIdx = Math.max(0, timeHourOptions.indexOf(hour))
      const minuteIdx = Math.max(0, timeMinuteOptions.indexOf(minute))
      return [hourIdx, minuteIdx] as [number, number]
    },
    syncForm(nextForm: GeneratorForm) {
      const mergedForm = this.getMergedForm(nextForm)
      this.setData({
        form: mergedForm,
        generatedText: this.buildResult(mergedForm),
        timePickerValue: this.getTimePickerValue(mergedForm.startTime),
        chiPengViews: this.buildMultiViews(mergedForm.chiPeng, chiPengOptions),
        fanPanViews: this.buildMultiViews(mergedForm.fanPan, fanPanOptions),
        shouZhuangViews: this.buildMultiViews(mergedForm.shouZhuang, shouZhuangOptions),
      })
      writeCache(CACHE_KEYS.generatorForm, mergedForm)
    },
    onSelectSingle(event: WechatMiniprogram.BaseEvent) {
      const key = event.currentTarget.dataset.key as keyof GeneratorForm
      const value = event.currentTarget.dataset.value as string
      const nextForm = {
        ...this.data.form,
        [key]: value,
      }
      this.syncForm(nextForm)
    },
    onToggleMulti(event: WechatMiniprogram.BaseEvent) {
      const key = event.currentTarget.dataset.key as 'chiPeng' | 'fanPan' | 'shouZhuang'
      const value = event.currentTarget.dataset.value as string
      const current = this.data.form[key]
      const has = current.indexOf(value) >= 0
      const selectedValues = has
        ? current.filter((item) => item !== value)
        : current.concat(value)
      const nextForm = {
        ...this.data.form,
        [key]: selectedValues,
      }
      this.syncForm(nextForm)
    },
    onAdjustMoneySize(event: WechatMiniprogram.BaseEvent) {
      const delta = Number(event.currentTarget.dataset.delta) as -1 | 1
      const nextForm = {
        ...this.data.form,
        moneySize: this.normalizeMoneySize(this.data.form.moneySize + delta),
      }
      this.syncForm(nextForm)
    },
    onPickTime(event: WechatMiniprogram.CustomEvent<{ value: [number, number] }>) {
      const [hourIdx, minuteIdx] = event.detail.value
      const hour = timeHourOptions[hourIdx] || '12'
      const minute = timeMinuteOptions[minuteIdx] || '00'
      const nextForm = {
        ...this.data.form,
        startTime: `${hour}:${minute}`,
      }
      this.syncForm(nextForm)
    },
    onAdjustDurationPreset(event: WechatMiniprogram.BaseEvent) {
      const delta = Number(event.currentTarget.dataset.delta) as -1 | 1
      let nextDuration = this.data.form.durationPreset + delta
      if (nextDuration < 3) {
        nextDuration = 3
      }
      if (nextDuration > 8) {
        nextDuration = 8
      }
      const nextForm = {
        ...this.data.form,
        durationPreset: nextDuration,
      }
      this.syncForm(nextForm)
    },
    onInputRemark(event: WechatMiniprogram.CustomEvent<{ value: string }>) {
      const nextForm = {
        ...this.data.form,
        remark: event.detail.value,
      }
      this.syncForm(nextForm)
    },
    onCopy() {
      wx.setClipboardData({
        data: this.data.generatedText,
        success: () => {
          wx.showToast({ title: '已复制', icon: 'success' })
        },
      })
    },
    onReset() {
      this.syncForm(defaultForm)
    },
    onShareAppMessage() {
      return {
        title: this.data.generatedText || '✨杭麻组局✨',
        path: '/pages/generate/index',
      }
    },
    onShareTimeline() {
      return {
        title: this.data.generatedText || '✨杭麻组局✨',
        query: '',
      }
    },
  },
})
