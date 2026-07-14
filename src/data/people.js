(function () {
  window.ZeroGreenhouse = window.ZeroGreenhouse || {};

  window.ZeroGreenhouse.people = [
    {
      name: "林澈",
      role: "投资人",
      image: "assets/characters/lin-che.png",
      motive: "沈砚准备撤回专利授权。",
      topics: [
        {
          id: "where",
          title: "案发时位置",
          unlocked: true,
          dialogue: ["我 23:40 后一直在会客厅。", "停电时我还在和许照确认发电机。"]
        },
        {
          id: "tea",
          title: "关于茶杯",
          requiresEvidence: ["tea"],
          dialogue: ["林澈：那只杯子能说明我碰过它。", "林澈：但如果你说沈砚喝过，我不认。"],
          contradiction: {
            statementId: "lin-tea-claim",
            contradictionEvidence: "tea",
            successDialogue: ["玩家：杯底只有植物汁液，杯沿没有沈砚唾液反应。", "林澈：所以杯子只是被摆出来嫁祸我。"],
            unlockTopic: "lin-alibi-follow"
          }
        },
        {
          id: "lin-alibi-follow",
          title: "茶杯后的追问",
          requiresStatement: "lin-tea-claim",
          dialogue: ["林澈：我碰杯子的时间在晚餐前。", "你该查的是谁后来把它放回实验台。"]
        },
        {
          id: "patent",
          title: "专利撤回",
          unlocked: true,
          dialogue: ["撤回授权当然会影响我。", "但我需要的是谈判，不是让项目死在暴雨夜里。"]
        }
      ]
    },
    {
      name: "顾南",
      role: "药剂师",
      image: "assets/characters/gu-nan.png",
      motive: "药剂采购账目被沈砚质疑。",
      topics: [
        {
          id: "cabinet",
          title: "药剂柜",
          unlocked: true,
          dialogue: ["我今晚没有开柜。", "柜门上有我的指纹不奇怪，登记样本时按过。"]
        },
        {
          id: "keybox",
          title: "备用钥匙盒",
          requiresEvidence: ["key"],
          dialogue: ["玩家：钥匙盒灰层完整。", "顾南：那就说明没人从那里取钥匙。真正的问题不在药剂柜。"]
        },
        {
          id: "generator",
          title: "发电机声音",
          unlocked: true,
          dialogue: ["顾南：发电机是 23:58 后启动的。", "顾南：如果录音里有那个声音，时间戳就不可信。"],
          contradiction: {
            statementId: "gu-generator-claim",
            contradictionEvidence: "recorder",
            successDialogue: ["玩家：22:48 录音里确实有低频发电机声。", "顾南：那段录音至少不是 22:48 录下的。"],
            unlockTopic: "gu-recording-follow"
          }
        },
        {
          id: "gu-recording-follow",
          title: "录音后的追问",
          requiresStatement: "gu-generator-claim",
          dialogue: ["顾南：伪造录音不需要药剂知识。", "但需要知道停电后机器会自动切换备用电。"]
        }
      ]
    },
    {
      name: "周弥",
      role: "实验助理",
      image: "assets/characters/zhou-mi.png",
      motive: "低温试验论文署名被沈砚取消。",
      topics: [
        {
          id: "thermo",
          title: "温控台",
          unlocked: true,
          dialogue: ["我只在 23:30 调过温控。", "之后我没有再碰控制台。"]
        },
        {
          id: "medicine",
          title: "心脏药",
          requiresEvidence: ["medicine"],
          dialogue: ["周弥：沈老师的药一直在外套里。", "周弥：我不知道药盒后来去了哪里。"],
          contradiction: {
            statementId: "zhou-medicine-claim",
            contradictionEvidence: "medicine",
            successDialogue: ["玩家：但药盒压痕在高架上，外套口袋里没有药。", "周弥：……我只是猜测。"],
            unlockTopic: "zhou-pressure"
          }
        },
        {
          id: "zhou-pressure",
          title: "心脏药后的追问",
          requiresStatement: "zhou-medicine-claim",
          dialogue: ["周弥：我知道低温会影响他的心律。", "但我没有想过事情会变成这样。"]
        },
        {
          id: "low-temp",
          title: "低温试验",
          requiresEvidence: ["note"],
          dialogue: ["夜间低温试验确实可能影响他的心律。", "但知道这一点的人不止我一个。"]
        }
      ]
    },
    {
      name: "许照",
      role: "山庄管家",
      image: "assets/characters/xu-zhao.png",
      motive: "替周弥隐瞒私自实验事故。",
      topics: [
        {
          id: "northdoor",
          title: "北门记录",
          unlocked: true,
          dialogue: ["许照：我最先看到的是北门记录。", "许照：所以我一开始以为有人从外面进出。"],
          contradiction: {
            statementId: "xu-northdoor-claim",
            contradictionEvidence: "rain",
            successDialogue: ["玩家：门槛水线没有被开门和脚步切断。", "许照：那记录只能说明门禁被触发，不说明门真的开过。"],
            unlockTopic: "xu-wiring-follow"
          }
        },
        {
          id: "xu-wiring-follow",
          title: "北门后的追问",
          requiresStatement: "xu-northdoor-claim",
          dialogue: ["许照：能短接门禁的人不多。", "周弥修过系统，她知道线序。"]
        },
        {
          id: "mud",
          title: "旧花房黄泥",
          requiresEvidence: ["mud"],
          dialogue: ["旧花房有浅黄泥。", "今晚有人去那里取过温室靴，这点我能确认。"]
        },
        {
          id: "wiring",
          title: "门禁线序",
          requiresEvidence: ["card"],
          dialogue: ["门禁盒可以短接，但要知道备用线在哪。", "周弥帮我修过那套系统，她知道线序。"]
        }
      ]
    }
  ];
})();
