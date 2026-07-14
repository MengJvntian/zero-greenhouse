# 零点温室

一个静态网页推理解密游戏。玩家在暴雨夜的温室山庄中调查房间、检查物件、收集物证、询问人物、指出证词矛盾，并通过证据连线、时间轴和分阶段结案流程还原真相。

## 玩法概览

- 点击地图中的房间图片进入近景调查。
- 在房间场景中点击透明热点，打开物件放大检查。
- 通过多阶段观察获得物证，物证会自动加入案卷。
- 询问嫌疑人，在关键证词处出示物证指出矛盾。
- 在推理板中连接证据，形成永久推论卡。
- 使用时间轴标记记录时间、真实时间和不可信时间。
- 最终进入分阶段结案流程，锁定凶手、手法、伪造证据和完整行动链。

## 当前内容

- 6 个可调查房间：西侧走廊、北门、控制台、加热管、主温室、药剂柜。
- 13 项案卷物证。
- 4 名可询问人物。
- 6 个证据连线推理节点。
- 证据出示与证词矛盾系统。
- 案件时间轴系统。
- 分阶段结案演出。
- 桌面端、平板端、手机端响应式布局。

## 运行方式

这是纯静态项目，不需要安装依赖或构建。

直接用浏览器打开：

```text
index.html
```

也可以用任意静态服务器运行，例如：

```bash
python -m http.server 8000
```

然后访问：

```text
http://localhost:8000
```

## 项目结构

```text
.
├── index.html
├── styles.css
├── assets/
│   ├── scenes/       # 房间场景图
│   ├── evidence/     # 物证与可调查物件图
│   └── characters/   # 人物立绘
└── src/
    ├── data/
    │   ├── rooms.js
    │   ├── evidence.js
    │   ├── people.js
    │   ├── deductions.js
    │   ├── timeline.js
    │   └── solution.js
    ├── state/
    │   └── gameState.js
    ├── modules/
    │   ├── scene.js
    │   ├── inspection.js
    │   ├── evidence.js
    │   ├── dialogue.js
    │   ├── reasoning.js
    │   ├── timeline.js
    │   └── verdict.js
    ├── ui/
    │   ├── modal.js
    │   ├── toast.js
    │   └── animations.js
    └── main.js
```

## 设计说明

核心数据和逻辑分离：

- `src/data/rooms.js`：房间、物件、热点和场景图片。
- `src/data/evidence.js`：案卷物证、图片、分类、来源和时间轴信息。
- `src/data/people.js`：人物、话题、证词和可指出的矛盾。
- `src/data/deductions.js`：证据连线推理节点。
- `src/state/gameState.js`：统一状态与本地存储恢复。

所有图片路径统一位于 `assets/` 下。主目录不依赖额外预览图。

## 存档

游戏使用 `localStorage` 保存进度，包括：

- 已发现物证
- 已调查物件
- 房间调查状态
- 已破解证词矛盾
- 推理板槽位与已完成推论
- 时间轴标记

页面刷新后会自动恢复进度。点击“重置案件”可清空当前浏览器中的本地进度。
