# 写装置：右页的立体插图

目录
1. 骨架和登记
2. 坐标和尺寸
3. 生命周期（什么时候调用什么）
4. 材质：纸面 + 排线
5. 墨线：静态线、动态线、钢笔时间表
6. 零件清单
7. 读数：仪表架、纸签、手写数据
8. 交互：拖、点、开关
9. 挑战、提示、声音
10. 自动演示镜头
11. 多个装置
12. 完整示例在哪

## 1. 骨架和登记

每课一个类，继承 `DioramaLesson`，放在 `src/lessons/<名字>.js`，然后在 `src/lessons/index.js` 按课号登记：`export const APPARATUS = { 1: RampLesson, 2: ContourLesson }`。

```js
import { DioramaLesson } from './diorama.js';
import { box, InkSphere, InkLathe } from '../ink/shapes.js';
import { V, RED, BLUE, ORANGE, dashes, arrow, ringXY, ringXZ, ticks, makeTag } from '../ink/kit.js';
import { MeterTube, Sparks, Streaks, glowMaterial } from '../ink/glow.js';

const Y0 = 5;        // 底座板上表面的 y
const S = 100;       // 每米画成多少毫米（按装置大小选）

export class MyLesson extends DioramaLesson {
  exhibitDefs() { return [{ name: '主装置', rect: [x0, x1, z0, z1], scale: 1.5 }]; }
  build(ex) { /* 搭第 ex 个装置：形体、墨线、读数 */ }
  reset() { /* 回到初始状态，然后 this.placeAll() */ }
  placeAll() { /* 把模型状态画出来：位置、读数、动态线、setNumbers */ }
  tick(dt) { /* 推进模型，然后 this.placeAll() */ }
  handles() { return [/* 能拖、能点的东西 */]; }
  shots() { return [/* 5 个演示镜头 */]; }
}
```

**模型和画面分开**：把状态放在普通字段里（`this.run = { t, x, v, phase }`、`this.h`），`tick` 只改这些数，`placeAll` 只负责把它们画出来。这样演示、静止模式、拖动都走同一条路。

## 2. 坐标和尺寸

- 插图坐标，单位**毫米**：x 沿页面向右，y 向上，z 朝读者（装置都在 z < 0，书页折线后面）。
- 底座板上表面 `y = Y0 = 5`（`this.L.Y0`）。所有东西都放在底座板上面。
- `exhibitDefs()` 的 `rect: [x0, x1, z0, z1]` 是装置占地范围；引擎在它外面扩一圈画底座板，按 `scale` 放大后居中摆到右页上。**仪表架、纸签、挑战卡也要在 rect 里。**
- 可用范围（**放大后**的页面尺寸）：宽约 185 毫米（rect 宽 × scale ≤ 185），深约 85 毫米（rect 深 × scale ≤ 85）。rect 本身的坐标可以随意，引擎会把它居中摆好。纵向（y）不限，但太高会顶出页面。
- `scale` 建议 1.3–2：装置要大。宽装置（150 毫米以上）只能 1.0–1.15，那就把装置做得更紧凑、高一些。
- 一般把“1 米画成 S 毫米”定一个常数，模型用米、秒，画的时候乘 S。

## 3. 生命周期

| 时机 | 调用 | 你要做的 |
|---|---|---|
| 构造时，每个装置一次 | `build(ex)` | 建形体和静态墨线；动态线组、球、杯子等存到字段（多装置时存到 `this.rigs[ex]`） |
| 构造完、进入这一页、换装置后 | `reset()` | 状态归零，`placeAll()` |
| 插图立起来后，每帧 | `tick(dt)` | 推进模型（可乘慢放倍数），`placeAll()` |
| 读者拖、点 | `handles()` 里的回调 | 改状态 |
| 换参数开关 | `onSwitch(id, i)` | `id === 'ex'` 交给 `super.onSwitch`；其他开关读 `this.state.switches[id]` 后 `reset()` |

注意：`build()` 在构造函数里调用，**子类的字段初始化器（class fields）还没执行**。所有字段都在 `build()` 里建，或用 `this.x ??= …`。

`this.drawTime`（秒，默认 3.6）是钢笔把整幅插图画完的时间，在 `build()` 里设，3–4 秒最好。

## 4. 材质：纸面 + 排线

所有表面都用 `this.pop.paper({...})`：纸色底子，暗面用排线表示，排线固定在物体上。

| 参数 | 含义 | 常用值 |
|---|---|---|
| `color` | 纸色 | 木头 `#f3e4c8`，金属 `#eceef0`，卡纸 `#f7f2e6`，暖色物体 `#f6e9e4`，冷色 `#e9eef6` |
| `hatchA`、`hatchB` | 两层排线方向（物体坐标里的向量） | 木头 `[1,0,0.12]` + `[0.2,0.3,1]`（顺纹）；金属 `[0,1,0.2]` + `[1,0.2,0.3]`（竖向）；球 `[0.9,0.12,-0.42]` + `[0.2,0.9,0.4]` |
| `spacing` | 排线间距（毫米） | 1.1–2.4，小物体密、大平面疏 |
| `hatch` | 排线强度 0–1 | 底座和大平面 0.3–0.5，主体 1 |
| `shade` | 暗面整体压暗 | 默认 0.16 |
| `seed` | 噪声种子 | 每种材质不同 |

`glowMaterial(pop, { color, glow, radius })` 是发光材质（液体、灯泡、能量），发光体要登记到 `this.glows`（见第 7 节），会把彩色光溢到周围纸面上。

## 5. 墨线

插图里每一条线都是单独的钢笔笔画（有粗细变化、出头、抖动），按时间表一笔一笔画出来。

- **静态线**：`this.ink.add(points, opts)`（主线）、`this.faint.add(points, opts)`（细线：刻度、纹理、等高线）。`points` 是 `V(x,y,z)` 数组。`opts`：`sched`（必填，见下）、`width`（0.5–1.2，主轮廓 1 左右）、`closed`、`taper: false`（直尺画的线、刻度）、`overshoot`（出头，0.5 左右用于棱）。
- **钢笔时间表**：每条静态线都要 `sched: this.pen.next(长度毫米)`，按添加顺序依次画出。先画大轮廓，再画细节。
- **彩色静态线**：`const s = this.stat(RED, 1.4); s.add(...)`。
- **动态线**（每帧改写，比如轨迹、弹簧、箭头、虚线）：`const d = this.dyn(color, widthPx, capacity)`，在 `placeAll` 里 `d.setLines([{ points, width, taper, closed }, ...])`。`capacity` 是最多多少段，轨迹要给大一点（400–1200）。
- **需要等时间表缩放后再生成的东西**（自己 new 的 `InkLathe`、`MeterTube`）：`this.deferred.push(() => obj.build())`。
- 小工具（`../ink/kit.js`）：`dashes(points, on, off)` 切成虚线段，`arrow(from, vec, { head, width, plane })` 返回箭头的两条线，`ringXY(c, r)` 竖直圆，`ringXZ(c, r)` 水平圆，`ticks(a, b, n, len, dir)` 刻度。

## 6. 零件清单

| 零件 | 用法 | 适合 |
|---|---|---|
| `box(pop, this.ink, min, max, { mat, pen, width, hide })` | 长方体 + 12 条棱 | 底座、台子、挡板、墙、书本 |
| `this.prism(pts, a, b, { axis, mat, width })` | 多边形截面拉伸：axis `'y'` 时 pts 是 `[x,z]`，`'z'` 时是 `[x,y]`，`'x'` 时是 `[z,y]` | 楔形、房子、地块、台阶、L 形支架、齿条 |
| `new InkSphere(pop, { r, centre, mat, sched })` | 球，轮廓每帧按视角重算；**要 `this.lifters.push(球)`**；移动改 `球.mesh.position` | 小球、原子、行星、细胞核 |
| `new InkLathe(pop, profile, { mat, pen, rims, width })` | 回转体，`profile` 是 `[[半径, 高度], ...]`；`rims` 画哪几圈口沿；要 `lifters.push` 和 `deferred.push(() => l.build())`；摆放改 `l.group` | 杯子、烧杯、桶、瓶子、灯罩、炮管、圆柱 |
| `this.tube(path, r, { mat, width })` | 沿一串点的圆管，轮廓自动算；返回对象的 `curve.getPointAt(t)` 可以让东西沿管子走 | 水管、血管、导线、河道、肠道、轨道 |
| `this.terrain({ x0, x1, z0, z1, height, interval, n })` | 地形块：顶面 + 剖面墙 + 等高线；`height(x, z)` 返回毫米；返回 `heightAt(x, z)` | 地形、流域、二元函数曲面、能量面 |
| `this.molecule(atoms, bonds)` | 球棍模型：`atoms [{ p, r, color }]`，`bonds [[i, j, 键数]]` | 分子、晶格、简单结构 |
| `this.card(w, h, draw)` | 立着的纸卡片，`draw(g, w, h, 字体)` 用毫米画字或图；返回 `{ mesh, redraw }` | 原文卡、时间轴、算式、图表、数字选项卡 |
| `this.callout(target, at, 标题, 值)` | 纸签 + 虚线引到目标点 | 结构名称、地物、仪器名 |
| `makeTag(pop, w, h)` | 纸签，`tag.set(标题, 读数)`，摆放改 `tag.mesh.position` | 实时读数 |
| `new Sparks(pop, { max, size })` / `new Streaks(pop, { max, tail })` | 发光粒子 / 带尾巴的发光粒子：`emit(p, v, color, life, gravity, size, drag)`，每帧 `update(dt, 地面y)`；`pop.group.add(x.points)`，`this.glows.push(x)` | 火花、水流、气体分子、电子、光子 |

形体不要穿插：两个物体接触时让表面刚好相切（例如球心离坡面 r）。

## 7. 读数

**仪表架**（这种风格的标志）：`this.rack({ cx, z, legH, r, h, items })` 在 (cx, z) 摆一个搁板架，上面排几只玻璃杯，液面发光，杯子下方挂纸签。`items: [{ color, label, unit, capacity, digits }]`（digits 是读数保留几位小数，默认 1），返回杯子数组，`cup.setValue(数)`，液面高度 = 数 / capacity。颜色按图例统一（全书同一个量用同一种颜色）。

**纸签**：`makeTag`，放在被测物体附近但不压住它，跟着物体走时注意别穿进别的东西。

**页边手写的“你的数据”**：`this.setNumbers(['h = 0.30 m', 'v = √(2gh) = 2.42 m/s'])`，每行一个字符串，最多 8 行左右。随操作实时改写。**不解析 `$...$`**，用 Unicode 字符。

**发光体登记**：`this.glows.push(x)`，`x.lightInfo(out)` 返回 `{ pos, color, strength }`。`MeterTube`、`Sparks`、`Streaks` 自带。

## 8. 交互

```js
handles() {
  return [{
    object: this.ball.mesh,          // 被拾取的网格（InkSphere 用 .mesh，InkLathe 用 .mesh 或 group 里的网格）
    cursor: 'grab',                  // 或 'pointer'（只点不拖）
    onDown: () => { … },             // 可选
    onMove: (ray) => {               // 拖动中：世界射线
      const p = this.rayToPlane(ray, V(0, 0, Z), V(0, 0, 1));   // 和插图坐标里的平面求交，返回插图坐标点或 null
      if (p) this.x = clamp(p.x, …);
    },
    onUp: () => this.release(),      // 松手 / 点击
  }];
}
```

- 拖装置本身，不要做滑块。拖的时候限制在合理范围内，并把值取整到好读的精度（0.01 m、1°）。
- 在地形、曲面上拖：先和水平面求交，再用 `heightAt` 修正高度，迭代两三次。
- 只在当前装置里的东西能被拾取（引擎自动过滤隐藏的装置）。
- 拾取靠射线打中网格表面：`InkLathe` 的 profile 末点半径不为 0 时顶上是空的，从上方点不中，要拾取就让 profile 首尾回到半径 0（封口），或另放一个透明度很低的盒子当拾取面。
- 小东西（< 5 毫米）、转得快的东西不好抓：把拾取对象换成它所在的更大的部件（滑轨、底座），或者点一下先停下来。

**跟着一起动的东西**（转盘上的小球、小车上的货物）：建一个 `THREE.Group` 加进 `this.pop.group`，然后把零件挂上去，转动或移动这个组即可。
- `box(pop, set, min, max, { parent: 组 })`，`set` 用 `this.stat(color, w, 组)` 建的线组（`this.ink` 不跟着组动）；
- `new InkSphere(pop, { ..., parent: 组 })`；`new InkLathe(pop, profile, { ..., parent: 组 })`；
- 动态线 `this.dyn()` 的点用插图坐标，每帧自己算好位置。

**开关**（`lessons.js` 的 `switches`）：当前值在 `this.state.switches[id]`（没点过时是 `undefined`，用 `?? 0`）。要默认选中别的项，在 `build()` 里写 `this.state.switches.id ??= 2`（页面第一次绘制在装置建好之后，会显示这个默认值）。重写 `onSwitch(id, i) { if (id === 'ex') super.onSwitch(id, i); else this.reset(); }`。

## 9. 挑战、提示、声音

- 达成挑战：`this.earnStamp()`（只盖一次，会弹出 `challenge.done`、播盖章声）。判定要有合理容差。
- 提示：`this.app.toast('再看看频闪……')`，用于答错时引导。
- 声音：`this.app.sound?.play(名字)`，名字有 `page pen tick flap stamp launch thud plop whoosh grind`。发射用 launch，落地 thud，落进容器 plop，点选 tick。别的声音可以把 CC0 录音放进 `public/audio/<名字>.mp3`（在 `public/audio/README.md` 记出处），然后 `play('<名字>')`。

## 10. 自动演示镜头

`shots()` 返回 5 个左右镜头，每个 2 秒，和 `lessons.js` 的 `demo` 字幕一一对应：

```js
shots() {
  return [
    { cam: () => this.near(x, y, z, V(-20, 150, 250)), act: () => { this.switchExhibit(0, true); this.reset(); … } },
    { cam: () => this.near(…), act: () => this.release() },
    …,
    { cam: null },   // 最后一个回到默认机位，字幕“轮到你：……”
  ];
}
```

- `this.near(x, y, z, off)`：盯住插图坐标 (x, y, z)，相机放在离它 `off`（世界毫米）的地方。`off` 常用 `V(-30…30, 110…190, 180…260)`：越大越远。
- `act` 要能重复执行、不依赖上一次的结果；换装置用 `switchExhibit(i, true)`（立即换，不重画）。
- 静止模式会依次执行除最后一个以外所有镜头的 `act` 并快进，所以 `act` 之后模型要能自己跑完。
- 第一次翻到一课会自动播一遍演示。
- 最后一个镜头（`cam: null`）也可以带 `act`，但静止模式不执行它。所以前面的镜头里换过装置时，**最后一个镜头不要再换回来**，让两种模式结束时停在同一个状态；或者让第一个镜头负责摆好初始状态。

## 11. 多个装置

一课要讲的东西多时，做 2–3 个装置，用“装置”开关切换：`exhibitDefs()` 返回多项，`build(ex)` 按序号分别搭（每个装置有自己的 `pen`、`ink`、`faint`，引擎在调用前已经切好），`lessons.js` 里加 `{ id: 'ex', label: '装置', options: [...] }` 和对应的 `exhibits`。

- 每个装置的东西存到 `this.rigs[ex]`，用 `get rig() { return this.rigs[this.ex]; }` 取当前的。
- `handles()` 可以返回所有装置的，引擎只让当前装置的被拾取。
- 读者切换时，钢笔先把旧装置“折回”纸面，再画新装置。

## 12. 完整示例

- `template/src/lessons/ramp.js`：两个装置、拖动、仪表架、纸签、动态虚线、挑战、演示（约 170 行）。
- `template/src/lessons/contour.js`：非物理学科，地形块、在曲面上拖小旗、地图视图（约 150 行）。
- `examples/`：第一期五课，更复杂的写法（火花、水流、轨迹、箭头、量角器、剖面、图表卡），见 `examples/README.md`。
