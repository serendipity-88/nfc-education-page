// NFC 电量教育页 - 互动逻辑

// =====================
// 全局状态
// =====================
const STATE = {
  // 实验 1
  experiment1: {
    tapCount: 0,
    totalDrainPercent: 0,
    isHolding: false,
    holdInterval: null,
    HOLD_INTERVAL_MS: 100  // 长按时每 100ms 计一次
  },
  // 实验 2
  experiment2: {
    DURATION_CONFIG: [
      { hours: 1, drainPercent: 0.001, label: '喝杯咖啡的功夫，耗电 0.001%' },
      { hours: 2, drainPercent: 0.002, label: '看一部电影的时间，耗电 0.002%' },
      { hours: 4, drainPercent: 0.003, label: '短途旅行的车程，耗电 0.003%' },
      { hours: 8, drainPercent: 0.007, label: '睡一觉起来，耗电 0.007%' },
      { hours: 12, drainPercent: 0.01, label: '半个白天，耗电 0.01%' },
      { hours: 24, drainPercent: 0.02, label: '整整一天，耗电 0.02%' }
    ]
  }
};

// 电池总量假设为 500mAh
const BATTERY_CAPACITY = 500;

// =====================
// 页面加载
// =====================
document.addEventListener('DOMContentLoaded', function() {
  console.log('NFC 电量教育页已加载');
  initScrollListener();
  initExperiment1();
  initExperiment2();
  initExperiment3();
});

// =====================
// 滚动进度条
// =====================
function initScrollListener() {
  const progressBar = document.getElementById('scroll-progress');
  window.addEventListener('scroll', function() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = (scrollTop / docHeight) * 100;
    progressBar.style.width = scrollPercent + '%';
    revealOnScroll();
  });
  setTimeout(revealOnScroll, 100);
}

function revealOnScroll() {
  const elements = document.querySelectorAll('.scroll-reveal');
  elements.forEach(el => {
    const rect = el.getBoundingClientRect();
    const triggerPoint = window.innerHeight * 0.75;
    if (rect.top < triggerPoint) {
      el.classList.add('visible');
    }
  });
}

// =====================
// 实验 1: 长按模拟碰一下
// =====================
function initExperiment1() {
  const tapButton = document.getElementById('tap-button-a');
  const tapCountEl = document.getElementById('tap-count-a');
  const batteryPercentEl = document.getElementById('battery-percent-a');
  const batteryBarEl = document.getElementById('battery-bar-a');
  const powerResultEl = document.getElementById('power-result-a');

  const DRAIN_PER_TAP_PERCENT = 0.001;  // 每次碰一下 0.001%（100 次 0.1%）
  let currentBattery = 100;

  // 长按开始 - 快速连续碰
  function startHold(e) {
    e.preventDefault();
    if (STATE.experiment1.isHolding) return;

    STATE.experiment1.isHolding = true;
    tapButton.textContent = '松手结束';
    tapButton.classList.add('holding');

    // 立即执行一次
    doTap();

    // 然后连续执行
    STATE.experiment1.holdInterval = setInterval(function() {
      doTap();
    }, STATE.experiment1.HOLD_INTERVAL_MS);
  }

  // 长按结束
  function endHold(e) {
    if (!STATE.experiment1.isHolding) return;
    STATE.experiment1.isHolding = false;
    clearInterval(STATE.experiment1.holdInterval);
    tapButton.textContent = '长按模拟碰一下';
    tapButton.classList.remove('holding');
  }

  tapButton.addEventListener('touchstart', startHold, { passive: false });
  tapButton.addEventListener('mousedown', startHold);
  document.addEventListener('touchend', endHold);
  document.addEventListener('mouseup', endHold);

  // 执行一次碰一下
  function doTap() {
    STATE.experiment1.tapCount++;
    STATE.experiment1.totalDrainPercent += DRAIN_PER_TAP_PERCENT;
    currentBattery = Math.max(0, 100 - STATE.experiment1.totalDrainPercent);

    // 更新显示
    tapCountEl.textContent = STATE.experiment1.tapCount;
    batteryPercentEl.textContent = currentBattery.toFixed(2);
    batteryBarEl.style.width = currentBattery + '%';

    // 结果提示
    const drainText = STATE.experiment1.totalDrainPercent.toFixed(3);
    if (STATE.experiment1.tapCount === 1) {
      powerResultEl.textContent = '碰一下只耗电 0.001%！';
    } else {
      powerResultEl.textContent = `已模拟${STATE.experiment1.tapCount}次，总耗电${drainText}%，几乎不费电！`;
    }
  }
}

// =====================
// 实验 2: 时长选择器
// =====================
function initExperiment2() {
  const durationBtns = document.querySelectorAll('.duration-btn');
  const batteryLevel = document.getElementById('battery-level-b');
  const batteryPercent = document.getElementById('battery-percent-b');
  const durationResult = document.getElementById('duration-result');

  durationBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      // 移除其他选中状态
      durationBtns.forEach(b => {
        b.classList.remove('bg-yellow-200');
        b.classList.add('bg-white');
      });

      // 选中当前
      this.classList.remove('bg-white');
      this.classList.add('bg-yellow-200');

      const hours = parseInt(this.dataset.hours);
      const config = STATE.experiment2.DURATION_CONFIG.find(c => c.hours === hours);
      const drainPercent = config ? config.drainPercent : hours * 0.02;
      const label = config ? config.label : '';

      const remainingPercent = 100 - drainPercent;
      const newPercent = Math.max(0, remainingPercent);  // 电池进度条百分比

      batteryLevel.style.width = newPercent + '%';
      batteryPercent.textContent = remainingPercent.toFixed(2);
      durationResult.textContent = label;
    });
  });
}

// =====================
// 实验 3：折腾这么久，省了多少？
// =====================
function initExperiment3() {
  const freqBtns = document.querySelectorAll('.freq-btn');
  const monthScenarioEl = document.getElementById('month-scenario');

  // 硬编码场景映射表 - 每个次数对应不同场景，单位差异化
  const SCENE_MAP = {
    1:  "📱 这点电，只够刷 2 分钟短视频",
    3:  "📞 这点电，只够打 4 分钟电话",
    5:  "🎵 这点电，只够听 1 首歌",
    10: "📺 这点电，只够看半集电视剧",
    20: "🗺️ 这点电，只够导航 3.5 分钟"
  };

  const DRAIN_PER_SWITCH = 0;  // 开关一次 0.0001%（用于计算背景说明）
  const DRAIN_PER_DAY = 0.02;  // 常开一天 0.02%
  const DAYS_PER_MONTH = 30;

  function getScenario(freq) {
    // 根据次数直接查表，如果没有预设则使用默认文案
    return SCENE_MAP[freq] || "💡 这点电，值得每天折腾吗？";
  }

  function updateCalculation(freq) {
    // 更新场景显示
    monthScenarioEl.textContent = getScenario(freq);

    // 更新按钮选中状态
    freqBtns.forEach(btn => {
      const btnFreq = parseInt(btn.dataset.freq);
      if (btnFreq === freq) {
        btn.classList.remove('bg-white');
        btn.classList.add('bg-orange-100');
      } else {
        btn.classList.remove('bg-orange-100');
        btn.classList.add('bg-white');
      }
    });
  }

  freqBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      if (this.dataset.freq === 'custom') {
        const customFreq = prompt('请输入每天开关次数：', '5');
        if (customFreq && !isNaN(parseInt(customFreq))) {
          const customFreqNum = parseInt(customFreq);
          this.textContent = `${customFreqNum}次`;
          this.dataset.customFreq = customFreqNum;
          updateCalculation(customFreqNum);
        }
      } else {
        const freq = parseInt(this.dataset.freq);
        updateCalculation(freq);
      }
    });
  });

  // 默认选中 3 次（普通人日常）
  updateCalculation(3);
}


// =====================
// NFC 设置（预留）
// =====================
function openNFCSettings() {
  console.log('打开 NFC 设置');
}