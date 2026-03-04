import { RULES_DATA, type RuleItem } from '../../data/rules-data'

type RuleViewItem = RuleItem & {
  optionsText: string
}

Component({
  data: {
    title: '',
    version: '',
    intro: '',
    ruleItems: [] as RuleViewItem[],
    basicNotes: [] as string[],
  },
  lifetimes: {
    attached() {
      this.setData({
        title: RULES_DATA.title,
        version: RULES_DATA.version,
        intro: RULES_DATA.intro,
        ruleItems: RULES_DATA.ruleItems.map((item) => ({
          ...item,
          optionsText: item.options.join(' / '),
        })),
        basicNotes: RULES_DATA.basicNotes,
      })
    },
  },
})
