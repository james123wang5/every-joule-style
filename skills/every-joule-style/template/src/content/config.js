// 整本书的设置：语言、书名、封面、附页里的说明文字。
// 每课的文字在 lessons.js，测验在 quiz.js，每课的立体装置在 ../lessons/ 下、由 ../lessons/index.js 登记。

export default {
  /** 界面语言：'zh' 中文 | 'en' 英文（书页栏目名、翻盖卡、控制条、附页固定说明都跟着换） */
  lang: 'zh',

  /** 书名：封面烫金、书脊、扉页、右页页眉 */
  title: '动手看世界',
  /** 副标题：封面和扉页书名下面的一行斜体 */
  subtitle: '一本会动的书',
  /** 系列 / 年级 / 章节：封面底部、扉页 */
  series: '模板示例 · 物理一课 · 地理一课',
  /** 扉页底部 */
  edition: '第一版 · 2026',
  /** 页面左下角的版权小字 */
  copyright: '© 2026 动手看世界 · 互动书',
  /** 右页页眉（默认用书名） */
  runningHead: null,

  /**
   * 封面：布面颜色、布面高光、烫金颜色（RGB 0–1）。
   * plate(g, w, h)：可选，自己画封面中间那块插画板（毫米坐标，默认 90×102）；不写就用模板自带的“立体书”小图。
   */
  cover: { cloth: '#c8961e', sheen: '#f3d79a', foil: [0.96, 0.5, 0.24], plate: null },

  /** 挑战印章下沿的小字（默认 ★ 书名 ★） */
  stampMotto: null,

  /**
   * 第 2 个跨页“本书的记号”：解释书里每种颜色、线型、读数的意思。
   * kind：arrow（color、dir：'h' 横 | 'v' 竖 | 'd' 斜）、strobe（频闪小圆圈）、dash（虚线）、
   *       tube（发光液柱，colors 两种颜色）、tag（纸签，sample: [标题, 读数]）、hand（手写，sample）、stamp、switch
   */
  legend: [
    { kind: 'arrow', color: '#2a5db0', dir: 'h', name: '蓝色', desc: '速度，箭头越长越快。' },
    { kind: 'arrow', color: '#b8412e', dir: 'v', name: '红色', desc: '高度和下落的方向。' },
    { kind: 'dash', name: '虚线', desc: '辅助线和走过的路径。' },
    { kind: 'tube', colors: ['#2f7bff', '#ff7a1c'], name: '发光液柱', desc: '读数的大小：液面越高数越大，下面的纸签写着读数。' },
    { kind: 'tag', sample: ['高度 h', '0.40 m'], name: '纸签', desc: '插图里随时更新的读数。' },
    { kind: 'hand', sample: 'v = 2.8 m/s', name: '手写字', desc: '页边“你的数据”，随你的操作改写。' },
    { kind: 'stamp', name: '虚线圈', desc: '挑战完成后在这里盖章。' },
    { kind: 'switch', name: '开关', desc: '图注右边的小字；带下划线的是当前的选择。' },
  ],

  /** 索引里除了各课关键词之外，再补的词条：{ term, n（第几课）, def（可选） } */
  extraTerms: [{ term: '能量守恒', n: 1 }, { term: '等高线', n: 2 }],

  /** 参考来源（最后一个跨页左页），按顺序编号 */
  sources: [
    '示例来源：把你用到的教材、课标、论文、网站写在这里，每条一行。',
    'Every Joule（iamtechartist.com/every-joule）．本书的版式和“立起来的插图”的做法受它启发；文字、插图和程序都是重新写的．',
  ],
  /** 参考来源下面的几段说明：{ label, text }，例如数值约定、模型简化 */
  notes: [
    { label: '数值约定', text: '书中 g 取 9.8 m/s²。第 1 课不计摩擦和空气阻力。第 2 课的地形是虚构的，等高距 20 m。' },
  ],
  /** 给老师（最后一个跨页右页） */
  teacher: {
    intro: '每课一个跨页，大约对应一课时。建议的顺序是：先让学生独立勾预测，再在投影上一起摆弄插图，最后掀开翻盖讨论。挑战适合留作课后。',
    notes: [
      ['第 1 课', '先让学生猜陡坡快还是缓坡快，再用开关对比。'],
      ['第 2 课', '让学生先在地图上找山顶，再拖小旗验证。'],
    ],
    misconceptions: ['坡越陡，滑到底越快。', '等高线越密，山越高。'],
  },

  /** 覆盖引擎自带的界面文字（见 strings.js），例如 { equation: '核心', recapTitle: '要点一览' } */
  strings: {},
};
