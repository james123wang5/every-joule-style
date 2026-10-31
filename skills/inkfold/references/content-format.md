# 内容格式：config.js、lessons.js、quiz.js

目录
1. 写作要点
2. `src/content/config.js`（整本书）
3. `src/content/lessons.js`（每课）
4. `src/content/quiz.js`（测验）
5. 字数预算
6. 行内公式

## 1. 写作要点

- **一句话一个意思**。短句、平实、具体，不用“我们知道”“显然”。
- **左页文字少，右页装置是主角**。左页只讲这一课的一个核心想法。
- **预测题针对误解**：三个选项里放一个学生最常见的错误想法；答案不能一眼看出来。
- **“为什么？”回答预测题**：先说结论，再说道理，最后点破那个误解。
- **挑战必须用装置完成**：给一个具体目标（“让它正好 2.0 m/s”“把小旗插到最高峰”），完成时程序判定并盖章。
- **数值一致**：文字里的数（高度、速度、等高距……）要和装置的模型、读数、测验答案对得上。
- 中文用全角标点；英文书 `lang: 'en'`，引擎的栏目名、按钮、附页说明会自动换成英文。

## 2. config.js

```js
export default {
  lang: 'zh',                        // 'zh' | 'en'
  title: '抛体运动',                  // 封面烫金、书脊、扉页、右页页眉（建议 ≤ 8 个汉字 / 24 个字母）
  subtitle: '一本会动的书',            // 封面和扉页书名下一行
  series: '高中物理 · 第五章',         // 封面底部、扉页（年级、学科、章节）
  edition: '第一版 · 2026',
  copyright: '© 2026 抛体运动',        // 屏幕右下角小字
  runningHead: null,                 // 右页页眉，默认用 title
  cover: { cloth: '#c8961e', sheen: '#f3d79a', foil: [0.96, 0.5, 0.24], plate: null },
  stampMotto: null,                  // 印章下沿小字，默认“★ 书名 ★”
  emblem: null,                      // 可选：翻盖背面的徽记 (g, cx, cy, r) => {}，毫米坐标
  frontArt: null,                    // 可选：扉页装饰 (g, cx, y) => {}
  legend: [ /* 见下 */ ],
  extraTerms: [{ term: '自由落体', n: 3 }],   // 索引里补充的词条（n 是第几课，可加 def）
  sources: ['……', 'Every Joule（iamtechartist.com/every-joule）．本书的版式和“立起来的插图”的做法受它启发；文字、插图和程序都是重新写的．'],
  notes: [{ label: '数值约定', text: '书中 g 取 9.8 m/s²……' }],   // 来源页下方的说明
  teacher: { intro: '……', notes: [['第 1 课', '……']], misconceptions: ['……'] },
  matter: { before: ['front', 'contents'], after: ['index', 'quiz', 'sources'] },  // 附页，可删
  strings: {},                       // 覆盖界面文字，见 template/src/content/strings.js
};
```

`cover.plate(g, w, h)` 可以自己画封面中间的插画板（默认 90×102 毫米的米色卡纸，已经画好边框；你只画里面的墨线小图，用 `g.strokeStyle = '#15161a'`、细线 0.1–0.3）。不写就用模板自带的“立体书”小图。画一幅和本书主题相关的小图会更好。

**图例 `legend`**：解释本书里颜色、线型、读数的固定含义（第 2 个跨页左页，最多 10 项）。全书的颜色要统一：同一种颜色在每一课都表示同一种东西。

| kind | 字段 | 样子 |
|---|---|---|
| `arrow` | `color`、`dir`：`'h'` 横 / `'v'` 竖 / `'d'` 斜 | 一支箭头 |
| `strobe` | | 一串频闪小圆圈 |
| `dash` | | 一段虚线弧 |
| `tube` | `colors: [c1, c2]` | 两支发光液柱 |
| `tag` | `sample: ['标题', '读数']` | 一张纸签 |
| `hand` | `sample: '手写文字'` | 页边手写字 |
| `stamp` | | 盖章的虚线圈 |
| `switch` | `sample: ['关', '开']`（可选） | 带下划线的开关字 |

每项还要 `name`（几个字）和 `desc`（一句话）。

**界面文字 `strings`**：例如非理科的书把“公式”换成“要点”：`strings: { equation: '要点', recapTitle: '要点一览', indexEntry: '索引 · 要点一览' }`。可以覆盖的键见 `strings.js`。

## 3. lessons.js

```js
export const LESSONS = [{
  n: 1,                              // 课号，从 1 连续编号；装置在 src/lessons/index.js 按它登记
  title: '曲线运动',                  // 左页大标题、目录
  short: '曲线',                      // 可选：标题太长时用于页眉和控制条
  textbook: '5.1',                   // 可选：对应教材 / 课标的节号，目录里显示“教材 5.1”
  explanation: ['……', '……'],         // 1–2 段（最多 3 段）导语，加粗大字
  equation: { symbols: '$v = \\sqrt(2gh)$', words: '……' },   // 可选：核心框。symbols 可以是公式，也可以是定义、年代、原文
  keywords: [{ term: '切线', def: '……' }],                   // 3–4 个，进索引
  predict: { question: '……', options: ['……', '……', '……'], answer: 1 },  // 2–4 个选项，answer 从 0 开始
  explain: '……',                     // “为什么？”，藏在翻盖下面
  challenge: { text: '……', done: '……' },   // 页边挑战；done 是完成时弹出的短语
  figure: '冰面上的冰球',             // 图注（只有一个装置时用）
  figureNote: '红色箭头是作用在冰球上的力',
  tryHint: '拖动红色箭头……',          // 图注下面一行动手提示
  switches: [                        // 图注右边的开关
    { id: 'ex', label: '装置', options: ['砂轮', '链球', '冰球'] },     // id 为 'ex' 的是装置切换
    { id: 'water', label: '水速', options: ['慢', '中', '快'], ex: 0 }, // ex：只在第 0 个装置显示
  ],
  exhibits: [                        // 有“装置”开关时必填，和 options 一一对应
    { figure: '砂轮的火花', note: '红线是接触点的切线', hint: '点砂轮开动……' },
  ],
  demo: ['……', '……', '……', '……', '轮到你：……'],   // 自动演示字幕，和装置 shots() 的镜头一一对应（通常 5 句）
}];
```

`equation` 不写就没有核心框，`predict` 不写就没有预测题（不推荐），`challenge` 不写就没有挑战和盖章圈。

## 4. quiz.js

```js
export const QUIZ = [
  { q: '题干', options: ['A', 'B', 'C'], answer: 0, why: '答完后手写出现的理由', n: 1 },
];
```

每课 1–2 题，总数 ≤ 10（左右两页各放一半）。题目原创；数值题给出 g 等常数的取值。

## 5. 字数预算

排版放不下时 `check.mjs` 会报“左页放不下 / 偏挤 / 图注太长”。按这个预算写，一般不会超：

| 字段 | 中文 | 英文 |
|---|---|---|
| title | ≤ 8 字 | ≤ 24 字母 |
| explanation | 2 段，每段 ≤ 45 字 | 2 段，每段 ≤ 30 词 |
| equation.words | ≤ 40 字 | ≤ 25 词 |
| keywords | 3–4 个，def ≤ 20 字 | def ≤ 12 词 |
| predict.question | ≤ 40 字 | ≤ 25 词 |
| predict.options | 每个 ≤ 12 字 | ≤ 6 词 |
| explain | ≤ 130 字 | ≤ 80 词 |
| challenge.text | ≤ 28 字 | ≤ 14 词 |
| figure + note | 合计 ≤ 22 字 | ≤ 12 词 |
| tryHint / hint | ≤ 24 字 | ≤ 12 词 |
| demo | 每句 ≤ 16 字，最后一句“轮到你：……” | ≤ 8 词，最后 “Your turn: …” |

## 6. 行内公式

书页文字（explanation、equation、keywords、predict、explain、quiz）里用 `$...$` 写简单公式：`_` 下标、`^` 上标、`{}` 分组、`\rm{…}` 直立字，以及 `\times \cdot \theta \alpha \beta \varphi \phi \Delta \sqrt \approx \pi \ge \le \pm \ne \to \Rightarrow \omega \mu \half \deg \quad`。字母一律斜体；函数名、单位、中文下标用 `\rm{…}`（如 `\rm{sin}`、`v_{\rm{合}}`）。**不认识的命令会被直接丢掉**（`\frac`、`\cos` 都不支持），分数写成 `a/b` 或 `÷`，根号写 `\sqrt(…)`（只画一个 √ 加括号）。JS 字符串里反斜杠要写两个：`'$v_0 \\rm{sin}\\theta$'`。

页边手写的“你的数据”（`setNumbers`）、纸签、演示字幕**不解析** `$...$`，直接用 Unicode：`v₀ = 2.0 m/s`、`√(2gh)`、`θ = 30°`、`gT² ≈ 0.098 m`。
