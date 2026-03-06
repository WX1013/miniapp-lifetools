type RuleEntry = {
  title: string
  detail: string
  options?: string
}

Component({
  data: {
    hufaList: [
      {
        title: '1. 平胡',
        detail: '没有财神的自摸',
        options: '选项：财敲：有财必敲 / 自摸：有财可自摸',
      },
      {
        title: '2. 爆头',
        detail: '单吊牌型，吊的是白板，抓任意牌都能胡。',
      },
      {
        title: '3. 飘财',
        detail: '在爆头的基础上，又抓进白板，打出去后再回来就是飘财。',
      },
      {
        title: '4. 杠开',
        detail: '杠牌后摸起的那张牌刚好胡了。',
      },
      {
        title: '5. 杠爆',
        detail: '已经爆头了，抓进了杠牌并杠。',
      },
      {
        title: '6. 七对',
        detail: '手里全是成对的牌，单吊白板时是七对爆头，没有白板时是清七。',
      },
      {
        title: '7. 豪七',
        detail: '在七对的基础上有杠，两个杠就是双豪七。',
      },
    ] as RuleEntry[],
    hufaNote:
      '备注：在以上胡法上可以叠加，比如飘杠、杠飘、七飘等。',
    ruleList: [
      {
        title: '1. 财神',
        detail: '白板是财神牌（赖子牌）。',
      },
      {
        title: '2. 吃两摊',
        detail: '最多只能吃上家两口。',
        options: '选项：吃两摊 / 三摊承包',
      },
      {
        title: '3. 三摊承包',
        detail:
          '如果吃上家三口形成“三摊”关系：你胡了对方付双倍；他胡了你付双倍；第三人胡了由你承担全额。',
        options: '选项：吃两摊 / 三摊承包',
      },
      {
        title: '4. 财神翻倍',
        detail: '有三财胡牌时翻倍，有四财胡牌时翻两倍。',
      },
      {
        title: '5. 杠白',
        detail: '杠出来的是白板。可提前确认无白板时杠白能否胡。',
        options: '选项：无白杠白不开 / 无白杠白开',
      },
      {
        title: '6. 跟庄',
        detail:
          '硬跟：庄家第一张牌后闲家跟打相同牌，庄家摇骰点数结算。软跟：最后一个闲家打白板，拿点数翻倍金额。',
        options: '选项：硬跟 / 软跟',
      },
      {
        title: '7. 十风',
        detail:
          '连续打十个风牌，当抓第十一个时等于爆头；若还有风牌可继续打，每多一个翻一番。',
        options: '选项：三财四财时不翻倍 / 三财四财时翻倍',
      },
      {
        title: '8. 跟飘不算飘',
        detail: '当别人飘财后，你抓到白板且可爆头时，这时飘出去不算飘财。',
      },
      {
        title: '9. 加杠',
        detail: '别人飘财时抓进杠张为加杠。',
        options: '选项：允许加杠 / 不允许加杠（仅手里暗杠可杠）',
      },
    ] as RuleEntry[],
    calcSummary: [
      '杭麻计算通常是连乘。',
      '庄家基础分是 8 分，闲家基础分是 1 分。',
      '倍数计算：倍数 = 2（翻倍项1）* 2（翻倍项2）* 2（翻倍项3）...（翻倍项如爆头、杠、七对、飘等）。',
      '庄家总得分 = 8 * 倍数 * 3。',
      '闲家总得分 = (8 + 2) * 倍数。',
    ] as string[],
    calcCases: [
      {
        title: '例子1',
        detail:
          '你是闲家，已经可以爆头，抓进杠张形成杠爆。翻倍项有爆头、杠，倍数 = 2 * 2 = 4，最终得分 = (8 + 2) * 4 = 40。',
      },
      {
        title: '例子2',
        detail:
          '你是庄家，已爆头后抓进杠张，杠起来是白板，飘出去后回来形成杠飘。翻倍项有爆头、杠、一飘，倍数 = 2 * 2 * 2 = 8，最终得分 = 8 * 8 * 3 = 192。',
      },
    ] as Array<{ title: string; detail: string }>,
  },
  methods: {
    onShareAppMessage() {
      return {
        title: '杭麻规则说明',
        path: '/pages/rules/index',
      }
    },
    onShareTimeline() {
      return {
        title: '杭麻规则说明',
        query: '',
      }
    },
  },
})
