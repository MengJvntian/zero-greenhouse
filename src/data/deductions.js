(function () {
  window.ZeroGreenhouse = window.ZeroGreenhouse || {};

  window.ZeroGreenhouse.deductions = [
    {
      id: "northdoor-forgery",
      title: "北门是否真的开启",
      prompt: "00:05 的机器记录能否证明北门打开过？",
      slots: [
        { label: "电子记录", category: "电子记录" },
        { label: "现场痕迹", category: "现场痕迹" }
      ],
      acceptedEvidence: [["card", "rain"]],
      hint: "一边是机器留下的时间，另一边应该找门本身留下的痕迹。",
      conclusion: "门禁记录与门槛水线冲突，00:05 北门记录可能被伪造。"
    },
    {
      id: "temperature-before-outage",
      title: "低温从何时开始",
      prompt: "温室变冷是停电后的自然结果吗？",
      slots: [
        { label: "时间记录", category: "电子记录" },
        { label: "现场状态", category: "现场痕迹" }
      ],
      acceptedEvidence: [["thermo", "heater"]],
      hint: "先找温度开始变化的时间，再找让温度变化成立的现场条件。",
      conclusion: "温控曲线早于停电下降，备用加热阀关闭说明低温被提前制造。"
    },
    {
      id: "tea-misdirection",
      title: "茶杯指向什么",
      prompt: "破碎茶杯能否说明沈砚被茶水毒死？",
      slots: [
        { label: "杯子观察", category: "现场痕迹" },
        { label: "关联痕迹", category: "现场痕迹" }
      ],
      acceptedEvidence: [["tea", "fingerprint"]],
      hint: "重点不只是杯子上有什么，也要看杯子缺少什么。",
      conclusion: "茶杯能解释林澈指纹，却解释不了沈砚没有饮用痕迹，更像误导。"
    },
    {
      id: "recording-time",
      title: "录音时间是否可靠",
      prompt: "22:48 的录音时间戳能否采信？",
      slots: [
        { label: "声音记录", category: "电子记录" },
        { label: "时间参照", category: "电子记录" }
      ],
      acceptedEvidence: [["recorder", "thermo"]],
      hint: "找录音里不该在那个时间出现的背景条件。",
      conclusion: "录音含有停电后才会出现的发电机声，时间戳不可靠。"
    },
    {
      id: "medical-method",
      title: "真正的致命条件",
      prompt: "凶手需要毒物，还是需要让沈砚离药并处于低温？",
      slots: [
        { label: "医学条件", category: "医学" },
        { label: "知识来源", category: "证词" }
      ],
      acceptedEvidence: [["medicine", "note"]],
      hint: "找沈砚身体条件相关的物证，再找谁知道这个条件。",
      conclusion: "心脏药被移走与实验记事本互相印证，关键条件是低温和心律。"
    },
    {
      id: "mud-route",
      title: "鞋底泥指向哪里",
      prompt: "鞋底泥支持北门路线，还是旧花房路线？",
      slots: [
        { label: "鞋底痕迹", category: "现场痕迹" },
        { label: "门口痕迹", category: "现场痕迹" }
      ],
      acceptedEvidence: [["mud", "rain"]],
      hint: "比较鞋底泥与北门内外痕迹是否同一路线。",
      conclusion: "浅黄泥与北门水线不一致，现场准备更可能来自旧花房路线。"
    }
  ];
})();
