(function () {
  window.ZeroGreenhouse = window.ZeroGreenhouse || {};

  window.ZeroGreenhouse.evidence = [
    {
      id: "mud",
      title: "靴底黄泥",
      image: "assets/evidence/mud.png",
      text: "第三双温室靴底夹着半干黄泥；北门外花圃是黑色腐殖土。",
      category: "现场痕迹",
      sourceRoom: "西侧走廊",
      sourceObject: "靴架",
      important: true,
      relatedEvidence: ["rain"]
    },
    {
      id: "rain",
      title: "北门门槛水线",
      image: "assets/evidence/rain.png",
      text: "门槛水线连续，没有鞋底切断过的痕迹。",
      category: "现场痕迹",
      sourceRoom: "北门",
      sourceObject: "门缝",
      important: true,
      relatedEvidence: ["card", "mud"]
    },
    {
      id: "card",
      title: "00:05 门禁记录",
      image: "assets/evidence/card.png",
      text: "记录属于沈砚的卡号；门禁盒外壳有新鲜划痕。",
      category: "电子记录",
      sourceRoom: "北门",
      sourceObject: "门禁盒",
      important: true,
      relatedEvidence: ["rain"],
      timeline: {
        time: "00:05",
        kind: "记录时间",
        label: "北门刷卡触发",
        reliability: "questionable",
        note: "只能证明门禁被触发，不能证明门真的打开。"
      }
    },
    {
      id: "thermo",
      title: "温控曲线",
      image: "assets/evidence/thermo.png",
      text: "温度从 23:42 开始下降，停电记录在 23:58。",
      category: "电子记录",
      sourceRoom: "控制台",
      sourceObject: "温控曲线",
      important: true,
      relatedEvidence: ["heater", "medicine"],
      timeline: {
        time: "23:42",
        kind: "真实变化",
        label: "温室温度开始下降",
        reliability: "solid",
        note: "温度下降早于停电。"
      }
    },
    {
      id: "recorder",
      title: "22:48 录音",
      image: "assets/evidence/recorder.png",
      text: "录音背景里有备用发电机的低频声。",
      category: "电子记录",
      sourceRoom: "控制台",
      sourceObject: "录音文件",
      important: false,
      relatedEvidence: ["thermo"],
      timeline: {
        time: "22:48",
        kind: "记录时间",
        label: "标记为 22:48 的录音",
        reliability: "questionable",
        note: "背景里有备用发电机声，时间戳需要重新判断。"
      }
    },
    {
      id: "patrol",
      title: "23:50 巡夜记录",
      image: "assets/evidence/patrol.png",
      text: "值夜记录显示 23:50 周弥曾经过西侧走廊，之后记录页被雨水打湿。",
      category: "电子记录",
      sourceRoom: "西侧走廊",
      sourceObject: "值夜记录夹",
      important: false,
      relatedEvidence: ["mud", "thermo"],
      timeline: {
        time: "23:50",
        kind: "记录时间",
        label: "周弥经过西侧走廊",
        reliability: "solid",
        note: "她有机会接触温室靴和旧花房路线。"
      }
    },
    {
      id: "outage",
      title: "23:58 停电记录",
      image: "assets/evidence/outage.png",
      text: "备用电源日志记录主电在 23:58 中断，发电机随后接入。",
      category: "电子记录",
      sourceRoom: "控制台",
      sourceObject: "维护面板",
      important: true,
      relatedEvidence: ["thermo", "recorder"],
      timeline: {
        time: "23:58",
        kind: "真实变化",
        label: "主电中断，备用发电机接入",
        reliability: "solid",
        note: "录音里若出现发电机声，就不可能早于这之后录成。"
      }
    },
    {
      id: "heater",
      title: "加热阀状态",
      image: "assets/evidence/heater.png",
      text: "备用加热阀关闭，手轮边缘残留温室手套纤维。",
      category: "现场痕迹",
      sourceRoom: "加热管",
      sourceObject: "阀门",
      important: true,
      relatedEvidence: ["thermo", "medicine"]
    },
    {
      id: "medicine",
      title: "心脏药位置",
      image: "assets/evidence/medicine.png",
      text: "高架上有药盒压痕；沈砚外套口袋里没有药。",
      category: "医学",
      sourceRoom: "加热管",
      sourceObject: "高架",
      important: true,
      relatedEvidence: ["note", "thermo"]
    },
    {
      id: "tea",
      title: "破碎茶杯",
      image: "assets/evidence/tea.png",
      text: "杯沿有林澈指纹，没有沈砚唾液反应；杯底只有植物汁液残留。",
      category: "现场痕迹",
      sourceRoom: "主温室",
      sourceObject: "茶杯",
      important: true,
      relatedEvidence: ["fingerprint"]
    },
    {
      id: "key",
      title: "备用钥匙盒",
      image: "assets/evidence/key.png",
      text: "钥匙盒灰层完整，没有被抽取过的断痕。",
      category: "现场痕迹",
      sourceRoom: "药剂柜",
      sourceObject: "备用钥匙盒",
      important: false,
      relatedEvidence: ["fingerprint"]
    },
    {
      id: "fingerprint",
      title: "柜门旧指纹",
      image: "assets/evidence/fingerprint.png",
      text: "指纹位置与开柜动作不符，更像早前登记样本留下。",
      category: "现场痕迹",
      sourceRoom: "药剂柜",
      sourceObject: "柜门指纹",
      important: false,
      relatedEvidence: ["key"]
    },
    {
      id: "note",
      title: "实验记事本",
      image: "assets/evidence/note.png",
      text: "记事本写着：'他若离药太远，心律会乱。问药盒位置的人知道这一点。'",
      category: "证词",
      sourceRoom: "主温室",
      sourceObject: "实验记事本",
      important: true,
      relatedEvidence: ["medicine"]
    }
  ];
})();
