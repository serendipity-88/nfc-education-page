// NFC 教育页面 - 碰一下安全感教育页
// 专注于：金融安全 + 技术成熟

// 状态管理
let nfcStatus = null;

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
  console.log('碰一下安全感教育页已加载');

  // 初始化滚动监听
  initScrollListener();

  // 初始化安全距离滑块
  initSafetySlider();
});

// 滚动进度条 + 滚动触发动画
function initScrollListener() {
  const progressBar = document.getElementById('scroll-progress');

  window.addEventListener('scroll', function() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = (scrollTop / docHeight) * 100;

    // 更新进度条
    progressBar.style.width = scrollPercent + '%';

    // 触发滚动揭示动画
    revealOnScroll();
  });

  // 初次检查可见元素
  setTimeout(revealOnScroll, 100);
}

// 滚动揭示动画
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
// 安全距离滑块互动
// =====================
function initSafetySlider() {
  const track = document.getElementById('safety-slider-track');
  const fill = document.getElementById('safety-slider-fill');
  const thumb = document.getElementById('safety-slider-thumb');
  const distanceDisplay = document.getElementById('safety-distance');
  const statusDisplay = document.getElementById('safety-status');

  let isDragging = false;

  // 更新滑块状态
  function updateSlider(clientX) {
    const rect = track.getBoundingClientRect();
    let percent = (clientX - rect.left) / rect.width;
    percent = Math.max(0, Math.min(1, percent));

    fill.style.width = (percent * 100) + '%';
    thumb.style.left = (percent * 100) + '%';

    // 计算距离（0-10cm）
    const distance = Math.round(percent * 10 * 10) / 10;
    distanceDisplay.textContent = distance.toFixed(1) + 'cm';

    // 更新状态
    if (distance <= 4) {
      statusDisplay.textContent = '✅ 安全通信中';
      statusDisplay.className = 'text-xs text-green-600 mt-1';
      fill.className = 'slider-fill bg-green-500';
    } else if (distance <= 6) {
      statusDisplay.textContent = '⚠️ 信号不稳定';
      statusDisplay.className = 'text-xs text-yellow-600 mt-1';
      fill.className = 'slider-fill bg-yellow-500';
    } else {
      statusDisplay.textContent = '❌ 信号已中断';
      statusDisplay.className = 'text-xs text-red-600 mt-1';
      fill.className = 'slider-fill bg-red-500';
    }
  }

  // 鼠标/触摸事件
  thumb.addEventListener('mousedown', startDrag);
  thumb.addEventListener('touchstart', startDrag, { passive: true });

  function startDrag(e) {
    isDragging = true;
    thumb.classList.add('active');
  }

  document.addEventListener('mousemove', function(e) {
    if (isDragging) {
      updateSlider(e.clientX);
    }
  });

  document.addEventListener('touchmove', function(e) {
    if (isDragging) {
      updateSlider(e.touches[0].clientX);
    }
  }, { passive: true });

  document.addEventListener('mouseup', endDrag);
  document.addEventListener('touchend', endDrag);

  function endDrag() {
    isDragging = false;
    thumb.classList.remove('active');
  }

  // 点击轨道也可以拖动
  track.addEventListener('click', function(e) {
    updateSlider(e.clientX);
  });
}

// =====================
// NFC 状态检测（预留）
// =====================
function openNFCSettings() {
  const isAlipay = /Alipay/i.test(navigator.userAgent);

  if (!isAlipay) {
    // 非支付宝环境：提示用户
    alert('请在手机设置中开启 NFC 功能：\n\n1. 下拉通知栏\n2. 找到 "NFC" 开关\n3. 点击开启');
    console.log('NFC 设置按钮被点击（非支付宝环境）');
    return;
  }

  // 支付宝 JSAPI：跳转到 NFC 设置页
  if (window.AlipayJSBridge) {
    callOpenSettings();
  } else {
    document.addEventListener('AlipayJSBridgeReady', callOpenSettings);
  }

  // 埋点
  console.log('埋点：nfc_open_button_clicked');
}

function callOpenSettings() {
  window.AlipayJSBridge.call('nfcOpenSettings', {}, function(result) {
    console.log('打开 NFC 设置结果:', result);

    if (result && result.success) {
      // 用户返回后重新检测状态
      setTimeout(detectNFCStatus, 1000);
    }
  });
}

function detectNFCStatus() {
  const isAlipay = /Alipay/i.test(navigator.userAgent);

  if (!isAlipay) {
    // 非支付宝环境：模拟已开启（用于 Demo 测试）
    showNFCEnabled();
    return;
  }

  if (window.AlipayJSBridge) {
    callNFCStatus();
  } else {
    document.addEventListener('AlipayJSBridgeReady', callNFCStatus);
  }
}

function callNFCStatus() {
  window.AlipayJSBridge.call('nfcCheckStatus', {}, function(result) {
    console.log('NFC 状态检测结果:', result);

    if (result && result.enabled) {
      showNFCEnabled();
    } else {
      // 保持未开启状态，不操作
    }
  });
}

function showNFCEnabled() {
  nfcStatus = 'enabled';
  localStorage.setItem('nfcStatus', 'enabled');

  // 隐藏未开启卡片，显示已开启卡片
  document.querySelector('.bg-yellow-50').classList.add('hidden');
  document.getElementById('nfc-enabled').classList.remove('hidden');
}