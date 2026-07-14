(function () {
  window.ZeroGreenhouse = window.ZeroGreenhouse || {};

  window.ZeroGreenhouse.rooms = {
    corridor: {
      id: "corridor",
      name: "西侧走廊",
      background: "scene-corridor",
      image: "assets/scenes/corridor.png",
      text: "走廊灯只剩应急电。地面干湿不均，靠墙有一排温室用靴。",
      objects: [
        { id: "corridor-boots", label: "靴架", clue: "mud", note: "第三双靴底夹着半干黄泥，纹路完整；旁边几双鞋底只有潮湿灰尘。" },
        { id: "corridor-water", label: "墙边积水", image: "assets/evidence/corridor-water.png", note: "水线从门厅方向漫过来，到温室入口前变浅，没有外来脚步穿过。" },
        { id: "corridor-log", label: "值夜记录夹", clue: "patrol", note: "记录夹被雨水打湿，最后一页只剩 23:50 后的巡夜签名。" }
      ],
      hotspots: [
        { id: "corridor-boots-hotspot", label: "靴架", x: 0, y: 38, width: 42, height: 44, cursorText: "靴底夹着东西", objectId: "corridor-boots" },
        { id: "corridor-water-hotspot", label: "墙边积水", x: 36, y: 62, width: 58, height: 32, cursorText: "水线在这里变浅", objectId: "corridor-water" },
        { id: "corridor-log-hotspot", label: "值夜记录夹", x: 41, y: 38, width: 12, height: 28, cursorText: "纸页被雨水泡开", objectId: "corridor-log" }
      ]
    },
    northdoor: {
      id: "northdoor",
      name: "北门",
      background: "scene-northdoor",
      image: "assets/scenes/northdoor.png",
      text: "北门通向花圃。门外雨很大，门内的水迹却像一条没有被切断的细线。",
      objects: [
        { id: "northdoor-threshold", label: "门缝", clue: "rain", note: "门缝下的积水连续贴着门槛，没有被鞋底截断的空白。" },
        { id: "northdoor-cardbox", label: "门禁盒", clue: "card", note: "外壳边缘有新鲜划痕。刷卡记录停在 00:05，卡号属于沈砚。" },
        { id: "northdoor-soil", label: "门外泥土", image: "assets/evidence/northdoor-soil.png", note: "花圃土是深黑色，和西侧走廊靴底里的浅黄泥不一样。" }
      ],
      hotspots: [
        { id: "northdoor-threshold-hotspot", label: "门缝", x: 33, y: 60, width: 31, height: 13, cursorText: "水线没有断开", objectId: "northdoor-threshold" },
        { id: "northdoor-cardbox-hotspot", label: "门禁盒", x: 65, y: 28, width: 9, height: 18, cursorText: "外壳边缘有划痕", objectId: "northdoor-cardbox" },
        { id: "northdoor-soil-hotspot", label: "门外泥土", x: 34, y: 14, width: 34, height: 38, cursorText: "门外泥土颜色更深", objectId: "northdoor-soil" }
      ]
    },
    control: {
      id: "control",
      name: "控制台",
      background: "scene-control",
      image: "assets/scenes/control.png",
      text: "屏幕仍靠备用电池亮着。曲线、录音和门禁记录都挤在同一台机器里。",
      objects: [
        {
          id: "control-thermo",
          title: "温控曲线",
          label: "温控曲线",
          clue: "thermo",
          visual: "object-thermo",
          note: "曲线从 23:42 开始缓慢下滑；停电记录却写着 23:58。",
          stages: [
            { id: "screen", label: "查看屏幕曲线", text: "屏幕还亮着，温度线从午夜前就开始慢慢下滑。" },
            { id: "timestamp", label: "核对时间戳", requires: ["screen"], evidenceId: "thermo", text: "曲线从 23:42 开始下降，停电记录在 23:58。低温不是停电后才出现的。" }
          ]
        },
        { id: "control-recorder", label: "录音文件", clue: "recorder", note: "标记为 22:48 的录音里，背景有低频机械声，像备用发电机。" },
        { id: "control-panel", label: "维护面板", clue: "outage", note: "面板螺丝被拧过，备用电源日志记录主电在 23:58 中断。" }
      ],
      hotspots: [
        { id: "control-thermo-hotspot", label: "温控曲线", x: 36, y: 15, width: 26, height: 29, cursorText: "曲线开始下降得太早", objectId: "control-thermo" },
        { id: "control-recorder-hotspot", label: "录音文件", x: 37, y: 40, width: 28, height: 17, cursorText: "波形里夹着低频噪声", objectId: "control-recorder" },
        { id: "control-panel-hotspot", label: "维护面板", x: 62, y: 38, width: 24, height: 32, cursorText: "螺丝最近被动过", objectId: "control-panel" }
      ]
    },
    heater: {
      id: "heater",
      name: "加热管",
      background: "scene-heater",
      image: "assets/scenes/heater.png",
      text: "加热区比主温室更冷。管壁没有余温，架子上有被挪动过的药盒压痕。",
      objects: [
        { id: "heater-valve", label: "阀门", clue: "heater", note: "备用加热阀被旋到关闭位置，手轮边缘残留温室手套纤维。" },
        {
          id: "heater-shelf",
          title: "高架",
          label: "高架",
          clue: "medicine",
          visual: "object-shelf",
          note: "高架上有一只心脏药盒的方形灰印；沈砚外套口袋里没有药。",
          stages: [
            { id: "dust-print", label: "查看灰印", text: "高架灰尘里留着一个方形空位，尺寸像随身药盒。" },
            { id: "pocket-check", label: "对照外套口袋", requires: ["dust-print"], evidenceId: "medicine", text: "沈砚外套口袋里没有药。药盒曾被挪到他伸手够不到的高架上。" }
          ]
        },
        { id: "heater-gauge", label: "压力表", image: "assets/evidence/heater-gauge.png", note: "压力表没有爆裂痕迹，加热管本身没有发生泄漏。" }
      ],
      hotspots: [
        { id: "heater-valve-hotspot", label: "阀门", x: 25, y: 35, width: 17, height: 25, cursorText: "手轮被关死", objectId: "heater-valve" },
        { id: "heater-shelf-hotspot", label: "高架", x: 72, y: 18, width: 22, height: 19, cursorText: "架上有方形灰印", objectId: "heater-shelf" },
        { id: "heater-gauge-hotspot", label: "压力表", x: 25, y: 16, width: 15, height: 19, cursorText: "指针没有异常冲击", objectId: "heater-gauge" }
      ]
    },
    greenhouse: {
      id: "greenhouse",
      name: "主温室",
      background: "scene-greenhouse",
      image: "assets/scenes/greenhouse.png",
      text: "沈砚倒在实验台旁。植物架、茶盘和记事本都在触手可及的位置。",
      objects: [
        {
          id: "greenhouse-cup",
          title: "破碎茶杯",
          label: "茶杯",
          clue: "tea",
          visual: "object-cup",
          note: "杯沿有林澈的指纹，却没有沈砚的唾液反应；杯底只有植物汁液残留。",
          stages: [
            { id: "rim", label: "观察杯沿", text: "杯沿有一枚较清晰的指纹，但没有被死者饮用后留下的湿痕。" },
            { id: "residue", label: "检查杯底残留", requires: ["rim"], evidenceId: "tea", text: "杯底只有植物汁液残留，没有沈砚唾液反应。这只杯子更像被摆出来误导视线。" }
          ]
        },
        { id: "greenhouse-notebook", label: "实验记事本", clue: "note", note: "夜间低温试验旁写着一行小字：'他若离药太远，心律会乱。问药盒位置的人知道这一点。'" },
        { id: "greenhouse-plant", label: "植物架", image: "assets/evidence/greenhouse-plant.png", note: "苦杏仁味来自剪断的枝条，气味强，剂量却很低。" }
      ],
      hotspots: [
        { id: "greenhouse-cup-hotspot", label: "茶杯", x: 50, y: 43, width: 10, height: 11, cursorText: "杯沿很干净", objectId: "greenhouse-cup" },
        { id: "greenhouse-notebook-hotspot", label: "实验记事本", x: 61, y: 42, width: 18, height: 12, cursorText: "纸页摊在实验台上", objectId: "greenhouse-notebook" },
        { id: "greenhouse-plant-hotspot", label: "植物架", x: 78, y: 16, width: 20, height: 43, cursorText: "枝条被剪断", objectId: "greenhouse-plant" }
      ]
    },
    cabinet: {
      id: "cabinet",
      name: "药剂柜",
      background: "scene-cabinet",
      image: "assets/scenes/cabinet.png",
      text: "柜门没有被撬开。玻璃上有旧指纹，钥匙盒里积着一层薄灰。",
      objects: [
        {
          id: "cabinet-keybox",
          title: "备用钥匙盒",
          label: "备用钥匙盒",
          clue: "key",
          visual: "object-keybox",
          note: "钥匙盒灰层完整，没有被抽取后留下的断痕。",
          stages: [
            { id: "surface", label: "观察盒盖", text: "盒盖积着一层薄灰，边缘没有新鲜手印。" },
            { id: "dust", label: "细看灰层", requires: ["surface"], evidenceId: "key", text: "灰层连续，没有被打开或抽取钥匙后留下的断痕。" }
          ]
        },
        { id: "cabinet-fingerprint", label: "柜门指纹", clue: "fingerprint", note: "指纹在柜门侧边，方向像登记样本时按上去，不像今晚开柜。" },
        { id: "cabinet-list", label: "试剂清单", image: "assets/evidence/cabinet-list.png", note: "清单没有短缺，今晚没有新取出致命药剂的记录。" }
      ],
      hotspots: [
        { id: "cabinet-keybox-hotspot", label: "备用钥匙盒", x: 78, y: 31, width: 12, height: 23, cursorText: "这里似乎积着一层灰", objectId: "cabinet-keybox" },
        { id: "cabinet-fingerprint-hotspot", label: "柜门指纹", x: 34, y: 18, width: 29, height: 52, cursorText: "玻璃侧边有一枚旧指纹", objectId: "cabinet-fingerprint" },
        { id: "cabinet-list-hotspot", label: "试剂清单", x: 68, y: 66, width: 25, height: 27, cursorText: "清单夹在柜门内侧", objectId: "cabinet-list" }
      ]
    }
  };
})();
