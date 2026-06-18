const APP_VERSION = "1.1.0";
const SESSION_KEY = "ftokx_simple_pwa_v1_session";
const SETTINGS_KEY = "ftokx_simple_pwa_v1_settings";
const HISTORY_KEY = "ftokx_simple_pwa_v1_history";
const CACHE_BUSTER = () => `ts=${Date.now()}`;
const FOUR_HOURS_MS = 4 * 60 * 60 * 1000;
const POSITION_USDT = 50;
const LEVERAGE = 5;
const MARGIN_USDT = 10;
const FEE_USDT = 0.05;
const WAIT_MINUTES = 20;
const REVIEW_AFTER_FILL_MINUTES = 60;
const DAILY_WIN = "+4.85";
const DAILY_LOSS = "-3.40";
const STOP_DAY_LOSS = "-4";
const CANDLES_API = "/api/okx/candles";
const TICKER_API = "/api/okx/ticker";

const ORDER_CONFIG = [
  {
    symbol: "BTCUSDT",
    instId: "BTC-USDT-SWAP",
    label: "BTC",
    decimals: 1,
    tpPct: 0.03,
    slPct: 0.02,
    netWin: "+1.45",
    netLoss: "-1.05"
  },
  {
    symbol: "ETHUSDT",
    instId: "ETH-USDT-SWAP",
    label: "ETH",
    decimals: 2,
    tpPct: 0.03,
    slPct: 0.02,
    netWin: "+1.45",
    netLoss: "-1.05"
  },
  {
    symbol: "OKBUSDT",
    instId: "OKB-USDT-SWAP",
    label: "OKB",
    decimals: 3,
    tpPct: 0.04,
    slPct: 0.025,
    netWin: "+1.95",
    netLoss: "-1.30"
  }
];

const STATUS_OPTIONS = [
  "Chờ đặt",
  "Đã đặt Limit",
  "Đã khớp",
  "Không khớp đã hủy",
  "Đã TP",
  "Đã SL"
];

const RESULT_OPTIONS = [
  { value: "NONE", label: "Chưa chốt", pnl: "" },
  { value: "SKIPPED", label: "Không giao dịch", pnl: "0" },
  { value: "NOT_FILLED", label: "Không khớp đã hủy", pnl: "0" },
  { value: "WIN", label: "Thắng cả 3", pnl: "4.85" },
  { value: "LOSS", label: "Thua cả 3", pnl: "-3.40" },
  { value: "MIXED", label: "Kết quả hỗn hợp", pnl: "" }
];

const els = {
  networkStatus: document.querySelector("#networkStatus"),
  dataStatus: document.querySelector("#dataStatus"),
  refreshBtn: document.querySelector("#refreshBtn"),
  clearSessionBtn: document.querySelector("#clearSessionBtn"),
  messageArea: document.querySelector("#messageArea"),
  ticketArea: document.querySelector("#ticketArea"),
  tabTodayBtn: document.querySelector("#tabTodayBtn"),
  tabHistoryBtn: document.querySelector("#tabHistoryBtn"),
  todayView: document.querySelector("#todayView"),
  historyView: document.querySelector("#historyView"),
  historyArea: document.querySelector("#historyArea"),
  historyImportInput: document.querySelector("#historyImportInput")
};

let currentSession = loadSession();
let activeView = "today";
let hasReloadedForServiceWorker = false;

function init() {
  saveSettingsOnce();
  bindEvents();
  updateNetworkStatus();
  renderSession();
  renderHistory();
  registerServiceWorker();
}

function saveSettingsOnce() {
  const existing = localStorage.getItem(SETTINGS_KEY);
  if (!existing) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ version: APP_VERSION, createdAt: new Date().toISOString() }));
  }
}

function bindEvents() {
  els.refreshBtn.addEventListener("click", handleRefresh);
  els.clearSessionBtn.addEventListener("click", clearSession);
  els.tabTodayBtn.addEventListener("click", () => switchView("today"));
  els.tabHistoryBtn.addEventListener("click", () => switchView("history"));
  els.historyImportInput.addEventListener("change", importHistoryFile);
  window.addEventListener("online", updateNetworkStatus);
  window.addEventListener("offline", updateNetworkStatus);
}

function switchView(view) {
  activeView = view;
  const showingToday = activeView === "today";
  els.todayView.classList.toggle("hidden", !showingToday);
  els.historyView.classList.toggle("hidden", showingToday);
  els.tabTodayBtn.classList.toggle("active", showingToday);
  els.tabHistoryBtn.classList.toggle("active", !showingToday);
  if (!showingToday) {
    renderHistory();
  }
}

function updateNetworkStatus() {
  if (navigator.onLine) {
    els.networkStatus.textContent = "Đang online";
    els.networkStatus.className = "pill good";
  } else {
    els.networkStatus.textContent = "Offline — chỉ xem lại phiên đã lưu";
    els.networkStatus.className = "pill bad";
  }
}

async function handleRefresh() {
  if (!navigator.onLine) {
    showMessage("Không lấy được dữ liệu. Nghỉ là đúng luật.", "Offline chỉ xem lại phiếu đã lưu, không cập nhật được giá mới.", "bad");
    return;
  }

  const todayId = getLocalDateId(new Date());
  const existingToday = loadHistory().find((item) => item.id === todayId || item.date === todayId);
  if (existingToday && !window.confirm("Hôm nay đã có phiếu. Ghi đè phiên hôm nay?")) {
    return;
  }

  setLoading(true);
  hideMessage();

  try {
    const [btcCandles, ethCandles, tickers] = await Promise.all([
      fetchClosedCandles("BTC-USDT-SWAP"),
      fetchClosedCandles("ETH-USDT-SWAP"),
      fetchTickers(ORDER_CONFIG.map((item) => item.instId))
    ]);

    const analysis = analyzeMarket(btcCandles, ethCandles);
    const now = new Date();
    const session = buildSession(analysis, tickers, now);
    currentSession = session;
    saveSession(session);
    upsertHistoryFromSession(session, existingToday);
    renderSession();
    renderHistory();
  } catch (error) {
    console.error(error);
    showMessage("Không lấy được dữ liệu. Nghỉ là đúng luật.", "Không giả dữ liệu thị trường. Hôm nay xem thủ công hoặc nghỉ.", "bad");
  } finally {
    setLoading(false);
  }
}

function setLoading(isLoading) {
  els.refreshBtn.disabled = isLoading;
  els.refreshBtn.textContent = isLoading ? "ĐANG LẤY DỮ LIỆU CÔNG KHAI..." : "CẬP NHẬT DỮ LIỆU & LẬP PHIẾU";
}

async function fetchClosedCandles(instId) {
  const url = `${CANDLES_API}?instId=${encodeURIComponent(instId)}&bar=4H&limit=100&${CACHE_BUSTER()}`;
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Candle fetch failed ${instId}`);
  }
  const payload = await response.json();
  if (!payload || payload.code !== "0" || !Array.isArray(payload.data)) {
    throw new Error(`Bad candle payload ${instId}`);
  }

  const now = Date.now();
  const candles = payload.data
    .map(parseCandle)
    .filter((item) => item.time + FOUR_HOURS_MS <= now)
    .sort((a, b) => a.time - b.time);

  if (candles.length < 55) {
    throw new Error(`Not enough closed candles ${instId}`);
  }

  return candles;
}

function parseCandle(row) {
  return {
    time: Number(row[0]),
    open: Number(row[1]),
    high: Number(row[2]),
    low: Number(row[3]),
    close: Number(row[4])
  };
}

async function fetchTickers(instIds) {
  const entries = await Promise.all(instIds.map(async (instId) => {
    const url = `${TICKER_API}?instId=${encodeURIComponent(instId)}&${CACHE_BUSTER()}`;
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Ticker fetch failed ${instId}`);
    }
    const payload = await response.json();
    const first = payload && Array.isArray(payload.data) ? payload.data[0] : null;
    const last = first ? Number(first.last) : NaN;
    if (!Number.isFinite(last) || last <= 0) {
      throw new Error(`Bad ticker payload ${instId}`);
    }
    return [instId, last];
  }));

  return Object.fromEntries(entries);
}

function analyzeMarket(btcCandles, ethCandles) {
  const btc = enrichCandles(btcCandles);
  const eth = enrichCandles(ethCandles);
  const latestBtc = btc.latest;
  const latestEth = eth.latest;
  const previousBtc = btc.previous;
  const extreme = latestBtc.range > btc.avgRange20 * 1.8;

  const btcLongLean = latestBtc.close > btc.ema20 && btc.ema20 > btc.ema50;
  const ethLongLean = latestEth.close > eth.ema20 && eth.ema20 > eth.ema50;
  const btcShortLean = latestBtc.close < btc.ema20 && btc.ema20 < btc.ema50;
  const ethShortLean = latestEth.close < eth.ema20 && eth.ema20 < eth.ema50;

  const longChecks = [
    latestBtc.close > btc.ema20,
    btc.ema20 > btc.ema50,
    latestBtc.close > latestBtc.open,
    latestBtc.close > previousBtc.close,
    latestEth.close > eth.ema20,
    eth.ema20 > eth.ema50,
    btcLongLean && ethLongLean,
    !extreme
  ];

  const shortChecks = [
    latestBtc.close < btc.ema20,
    btc.ema20 < btc.ema50,
    latestBtc.close < latestBtc.open,
    latestBtc.close < previousBtc.close,
    latestEth.close < eth.ema20,
    eth.ema20 < eth.ema50,
    btcShortLean && ethShortLean,
    !extreme
  ];

  const longScore = countTrue(longChecks);
  const shortScore = countTrue(shortChecks);
  const decision = decide(longScore, shortScore, extreme);

  return {
    decision: decision.value,
    reason: decision.reason,
    longScore,
    shortScore,
    closedAt: latestBtc.closeTimeIso,
    btc: summarizeTechnical(btc),
    eth: summarizeTechnical(eth),
    extreme
  };
}

function enrichCandles(candles) {
  const closes = candles.map((item) => item.close);
  const ranges = candles.map((item) => item.high - item.low);
  const latest = candles[candles.length - 1];
  const previous = candles[candles.length - 2];
  const ema20 = computeEma(closes, 20);
  const ema50 = computeEma(closes, 50);
  const lastRanges = ranges.slice(-20);
  const avgRange20 = lastRanges.reduce((sum, value) => sum + value, 0) / lastRanges.length;

  return {
    latest: {
      ...latest,
      range: latest.high - latest.low,
      closeTimeIso: new Date(latest.time + FOUR_HOURS_MS).toISOString()
    },
    previous,
    ema20,
    ema50,
    avgRange20
  };
}

function computeEma(values, period) {
  const multiplier = 2 / (period + 1);
  const seed = values.slice(0, period).reduce((sum, value) => sum + value, 0) / period;
  let ema = seed;
  for (let index = period; index < values.length; index += 1) {
    ema = (values[index] - ema) * multiplier + ema;
  }
  return ema;
}

function countTrue(items) {
  return items.filter(Boolean).length;
}

function decide(longScore, shortScore, extreme) {
  if (extreme) {
    return { value: "NO_TRADE", reason: "Nến BTC 4H quá cực đoan. Nghỉ là đúng luật." };
  }
  if (longScore >= 5 && longScore - shortScore >= 2) {
    return { value: "LONG", reason: "Long đủ điểm và lệch rõ hơn Short." };
  }
  if (shortScore >= 5 && shortScore - longScore >= 2) {
    return { value: "SHORT", reason: "Short đủ điểm và lệch rõ hơn Long." };
  }
  return { value: "NO_TRADE", reason: "Không rõ hướng thì nghỉ. Tiền mặt cũng là một vị thế." };
}

function summarizeTechnical(data) {
  return {
    close: roundForTech(data.latest.close),
    ema20: roundForTech(data.ema20),
    ema50: roundForTech(data.ema50),
    range: roundForTech(data.latest.range),
    avgRange20: roundForTech(data.avgRange20)
  };
}

function roundForTech(value) {
  return Number(value.toFixed(4));
}

function buildSession(analysis, tickers, now) {
  const reviewAt = new Date(now.getTime() + WAIT_MINUTES * 60 * 1000).toISOString();
  const prices = Object.fromEntries(ORDER_CONFIG.map((config) => [
    config.symbol,
    formatPrice(tickers[config.instId], config.decimals)
  ]));
  const orders = analysis.decision === "LONG" || analysis.decision === "SHORT"
    ? ORDER_CONFIG.map((config) => buildOrder(config, analysis.decision, tickers[config.instId]))
    : [];

  return {
    version: APP_VERSION,
    dayId: getLocalDateId(now),
    date: getLocalDateId(now),
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    reviewAt,
    decision: analysis.decision,
    reason: analysis.reason,
    analysis,
    prices,
    orders,
    rules: {
      positionUsdt: POSITION_USDT,
      leverage: LEVERAGE,
      marginUsdt: MARGIN_USDT,
      feeUsdt: FEE_USDT,
      waitMinutes: WAIT_MINUTES,
      dailyWin: DAILY_WIN,
      dailyLoss: DAILY_LOSS,
      stopDayLoss: STOP_DAY_LOSS
    }
  };
}

function buildOrder(config, direction, entry) {
  const takeProfit = direction === "LONG" ? entry * (1 + config.tpPct) : entry * (1 - config.tpPct);
  const stopLoss = direction === "LONG" ? entry * (1 - config.slPct) : entry * (1 + config.slPct);
  return {
    symbol: config.symbol,
    instId: config.instId,
    direction,
    entry: formatPrice(entry, config.decimals),
    tp: formatPrice(takeProfit, config.decimals),
    sl: formatPrice(stopLoss, config.decimals),
    tpPct: `${formatPercent(config.tpPct)}`,
    slPct: `${formatPercent(config.slPct)}`,
    netWin: config.netWin,
    netLoss: config.netLoss,
    status: STATUS_OPTIONS[0],
    reviewAt: ""
  };
}

function formatPercent(value) {
  return `${(value * 100).toFixed(value === 0.025 ? 1 : 0)}%`;
}

function formatPrice(value, decimals) {
  return Number(value).toFixed(decimals);
}

function renderSession() {
  if (!currentSession) {
    els.dataStatus.textContent = "CHƯA CẬP NHẬT DỮ LIỆU";
    els.dataStatus.className = "pill muted";
    els.ticketArea.innerHTML = "";
    return;
  }

  const created = formatTime(currentSession.createdAt);
  const label = currentSession.decision === "NO_TRADE" ? "KHÔNG GIAO DỊCH" : currentSession.decision;
  els.dataStatus.textContent = `Cập nhật ${created}`;
  els.dataStatus.className = "pill good";

  if (currentSession.decision === "NO_TRADE") {
    renderNoTrade(currentSession, label);
    return;
  }

  renderTicket(currentSession, label);
}

function renderNoTrade(session, label) {
  els.ticketArea.innerHTML = `
    <section class="ticket-card decision">
      <div class="decision-word decision-flat">${escapeHtml(label)}</div>
      <p class="reason">Lý do: ${escapeHtml(session.reason)}</p>
      <p>Không rõ hướng thì nghỉ. Tiền mặt cũng là một vị thế.</p>
      ${renderScoreDetails(session)}
    </section>
    ${renderDayResultPanel(session)}
  `;
  bindDayResultControls();
}

function renderTicket(session, label) {
  const actionTime = formatTime(session.reviewAt);
  els.ticketArea.innerHTML = `
    <section class="ticket-card decision">
      <div class="decision-word ${session.decision === "LONG" ? "decision-long" : "decision-short"}">HÔM NAY: ${escapeHtml(label)}</div>
      <p class="reason">Lý do: ${escapeHtml(session.reason)}</p>
      <h3>VIỆC LÀM NGAY</h3>
      <ol class="steps">
        <li>Nhập 3 lệnh Limit đúng bảng bên dưới.</li>
        <li>Chờ đến ${escapeHtml(actionTime)}.</li>
        <li>Không khớp thì hủy.</li>
        <li>Không sửa giá. Không đuổi giá.</li>
      </ol>
    </section>

    <section class="panel">
      <h3>BẢNG NHẬP OKX</h3>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Cặp</th>
              <th>Hướng</th>
              <th class="price">Limit</th>
              <th class="price">TP</th>
              <th class="price">SL</th>
              <th class="price">Lãi/Lỗ</th>
            </tr>
          </thead>
          <tbody>
            ${session.orders.map(renderOrderRow).join("")}
          </tbody>
        </table>
      </div>
    </section>

    <section class="panel">
      <h3>TỔNG NGÀY</h3>
      <div class="risk-grid">
        <div class="metric"><span>Nếu thắng cả 3</span><strong class="win">+4.85 USDT</strong></div>
        <div class="metric"><span>Nếu thua cả 3</span><strong class="loss">-3.40 USDT</strong></div>
        <div class="metric"><span>Luật dừng</span><strong>Lỗ thực tế chạm -4 USDT thì dừng</strong></div>
      </div>
      <p class="muted-text">Không có lệnh thứ 4. Không sửa giá. Không đuổi giá.</p>
    </section>

    <section class="panel">
      <h3>Theo dõi thủ công</h3>
      <div class="follow-grid">
        ${session.orders.map((order, index) => renderFollowRow(order, index)).join("")}
      </div>
    </section>

    <section class="panel">
      <h3>Thông số cố định X5</h3>
      <div class="rule-grid">
        <div class="metric"><span>Vị thế</span><strong>50 USDT / lệnh</strong></div>
        <div class="metric"><span>Đòn bẩy</span><strong>x5</strong></div>
        <div class="metric"><span>Ký quỹ ước tính</span><strong>10 USDT / lệnh</strong></div>
        <div class="metric"><span>Ký quỹ</span><strong>Cô lập</strong></div>
        <div class="metric"><span>Loại lệnh</span><strong>Limit</strong></div>
        <div class="metric"><span>Chờ khớp</span><strong>20 phút</strong></div>
      </div>
    </section>

    ${renderDayResultPanel(session)}
    ${renderScoreDetails(session)}
  `;

  bindStatusButtons();
  bindDayResultControls();
}

function renderOrderRow(order) {
  return `
    <tr>
      <td>${escapeHtml(order.symbol)}</td>
      <td>${escapeHtml(order.direction)}</td>
      <td class="price">${escapeHtml(order.entry)}</td>
      <td class="price">${escapeHtml(order.tp)}</td>
      <td class="price">${escapeHtml(order.sl)}</td>
      <td class="price"><span class="win">${escapeHtml(order.netWin)}</span> / <span class="loss">${escapeHtml(order.netLoss)}</span></td>
    </tr>
  `;
}

function renderFollowRow(order, index) {
  const reviewText = order.reviewAt ? `<p class="review-note">Xem lại lúc ${escapeHtml(formatTime(order.reviewAt))}</p>` : "";
  return `
    <div class="follow-row">
      <div class="follow-head">
        <strong>${escapeHtml(order.symbol)}</strong>
        <span class="pill muted">${escapeHtml(order.status)}</span>
      </div>
      <div class="follow-actions">
        ${STATUS_OPTIONS.map((status) => `
          <button class="small-btn" type="button" data-order-index="${index}" data-status="${escapeHtml(status)}">${escapeHtml(status)}</button>
        `).join("")}
      </div>
      ${reviewText}
    </div>
  `;
}

function renderDayResultPanel(session) {
  const record = getHistoryRecord(session.dayId || getLocalDateId(session.createdAt));
  const selectedResult = record ? record.result : "NONE";
  const netPnl = record && Number.isFinite(Number(record.netPnl)) ? String(record.netPnl) : "";
  const note = record ? record.note : "";

  return `
    <section class="panel day-result-panel">
      <h3>Kết quả ngày</h3>
      <p class="muted-text">App không đọc tài khoản OKX. Ông tự chốt kết quả để so sánh 7 ngày và 30 ngày.</p>
      <div class="form-grid">
        <label>
          <span>Kết quả</span>
          <select id="dayResultSelect">
            ${RESULT_OPTIONS.map((option) => `
              <option value="${escapeHtml(option.value)}" ${option.value === selectedResult ? "selected" : ""}>${escapeHtml(option.label)}</option>
            `).join("")}
          </select>
        </label>
        <label>
          <span>Net PnL USDT</span>
          <input id="dayNetPnlInput" type="number" step="0.01" inputmode="decimal" value="${escapeHtml(netPnl)}" placeholder="0" />
        </label>
      </div>
      <label class="full-label">
        <span>Ghi chú</span>
        <textarea id="dayNoteInput" rows="3" maxlength="280" placeholder="Ví dụ: đúng luật, bỏ qua vì không rõ hướng, hoặc tự đóng sớm.">${escapeHtml(note)}</textarea>
      </label>
      <button id="saveDayResultBtn" class="ghost-btn" type="button">Lưu kết quả ngày</button>
    </section>
  `;
}

function renderScoreDetails(session) {
  const analysis = session.analysis;
  const closedAt = analysis.closedAt ? formatDateTime(analysis.closedAt) : "Chưa có phiên mới";
  return `
    <details>
      <summary>Chi tiết kỹ thuật 4H</summary>
      <div class="score-grid">
        <div class="metric"><span>Long score</span><strong>${analysis.longScore}/8</strong></div>
        <div class="metric"><span>Short score</span><strong>${analysis.shortScore}/8</strong></div>
        <div class="metric"><span>Nến BTC đã đóng</span><strong>${escapeHtml(closedAt)}</strong></div>
      </div>
      <ul class="tech-list">
        <li>BTC close ${analysis.btc.close}, EMA20 ${analysis.btc.ema20}, EMA50 ${analysis.btc.ema50}</li>
        <li>ETH close ${analysis.eth.close}, EMA20 ${analysis.eth.ema20}, EMA50 ${analysis.eth.ema50}</li>
        <li>Extreme candle: ${analysis.extreme ? "Có" : "Không"}</li>
        <li>Public market data lấy mới, không cache API OKX.</li>
      </ul>
    </details>
  `;
}

function bindStatusButtons() {
  document.querySelectorAll("[data-order-index]").forEach((button) => {
    button.addEventListener("click", () => {
      const index = Number(button.dataset.orderIndex);
      const status = button.dataset.status;
      updateOrderStatus(index, status);
    });
  });
}

function bindDayResultControls() {
  const resultSelect = document.querySelector("#dayResultSelect");
  const pnlInput = document.querySelector("#dayNetPnlInput");
  const saveButton = document.querySelector("#saveDayResultBtn");
  if (!resultSelect || !pnlInput || !saveButton) {
    return;
  }

  resultSelect.addEventListener("change", () => {
    const option = RESULT_OPTIONS.find((item) => item.value === resultSelect.value);
    if (option && option.pnl !== "") {
      pnlInput.value = option.pnl;
    }
  });
  saveButton.addEventListener("click", saveDayResult);
}

function updateOrderStatus(index, status) {
  if (!currentSession || !currentSession.orders[index]) {
    return;
  }

  const now = new Date();
  const order = currentSession.orders[index];
  order.status = status;

  if (status === "Đã đặt Limit") {
    order.reviewAt = new Date(now.getTime() + WAIT_MINUTES * 60 * 1000).toISOString();
  } else if (status === "Đã khớp") {
    order.reviewAt = new Date(now.getTime() + REVIEW_AFTER_FILL_MINUTES * 60 * 1000).toISOString();
  } else if (status === "Không khớp đã hủy" || status === "Đã TP" || status === "Đã SL") {
    order.reviewAt = "";
  }

  currentSession.updatedAt = now.toISOString();
  saveSession(currentSession);
  upsertHistoryFromSession(currentSession, getHistoryRecord(currentSession.dayId));
  renderSession();
  renderHistory();
}

function saveDayResult() {
  if (!currentSession) {
    return;
  }

  const resultSelect = document.querySelector("#dayResultSelect");
  const pnlInput = document.querySelector("#dayNetPnlInput");
  const noteInput = document.querySelector("#dayNoteInput");
  const result = resultSelect ? resultSelect.value : "NONE";
  const netPnlRaw = pnlInput ? pnlInput.value.trim() : "";
  const netPnl = netPnlRaw === "" ? 0 : Number(netPnlRaw);

  if (!Number.isFinite(netPnl)) {
    showMessage("Chưa lưu kết quả ngày", "Net PnL phải là số, ví dụ 4.85 hoặc -3.40.", "bad");
    return;
  }

  const now = new Date().toISOString();
  const existing = getHistoryRecord(currentSession.dayId);
  const record = buildHistoryRecord(currentSession, existing);
  record.result = result;
  record.netPnl = Number(netPnl.toFixed(2));
  record.note = noteInput ? noteInput.value.trim() : "";
  record.finalStatus = resolveFinalStatus(record.decision, result);
  record.updatedAt = now;

  saveHistory(upsertHistoryRecord(record));
  showMessage("Đã lưu kết quả ngày", "Lịch sử đã cập nhật để so sánh 7 ngày và 30 ngày.", "");
  renderHistory();
}

function resolveFinalStatus(decision, result) {
  if (result === "NONE") {
    return decision === "NO_TRADE" ? "NO_TRADE" : "OPEN";
  }
  if (decision === "NO_TRADE" && result === "SKIPPED") {
    return "NO_TRADE";
  }
  return "DONE";
}

function clearSession() {
  if (!window.confirm("Xóa phiên hôm nay trên máy này? Lịch sử vẫn giữ nguyên.")) {
    return;
  }
  localStorage.removeItem(SESSION_KEY);
  currentSession = null;
  hideMessage();
  renderSession();
}

function loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.warn("Cannot read saved session", error);
    return null;
  }
}

function saveSession(session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function loadHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn("Cannot read saved history", error);
    return [];
  }
}

function saveHistory(history) {
  const normalized = history
    .filter((item) => item && item.date && item.decision)
    .sort((a, b) => String(b.date).localeCompare(String(a.date)));
  localStorage.setItem(HISTORY_KEY, JSON.stringify(normalized));
}

function getHistoryRecord(id) {
  return loadHistory().find((item) => item.id === id || item.date === id) || null;
}

function upsertHistoryFromSession(session, existing) {
  const record = buildHistoryRecord(session, existing);
  saveHistory(upsertHistoryRecord(record));
}

function upsertHistoryRecord(record) {
  const history = loadHistory();
  const index = history.findIndex((item) => item.id === record.id || item.date === record.date);
  if (index >= 0) {
    history[index] = record;
  } else {
    history.push(record);
  }
  return history;
}

function buildHistoryRecord(session, existing) {
  const previous = existing || {};
  return {
    id: session.dayId || session.date || getLocalDateId(session.createdAt),
    date: session.date || session.dayId || getLocalDateId(session.createdAt),
    time: formatClock(session.createdAt),
    decision: session.decision,
    longScore: session.analysis.longScore,
    shortScore: session.analysis.shortScore,
    btcPrice: session.prices ? session.prices.BTCUSDT : "",
    ethPrice: session.prices ? session.prices.ETHUSDT : "",
    okbPrice: session.prices ? session.prices.OKBUSDT : "",
    tickets: Array.isArray(session.orders) ? session.orders : [],
    finalStatus: previous.finalStatus || (session.decision === "NO_TRADE" ? "NO_TRADE" : "OPEN"),
    result: previous.result || "NONE",
    netPnl: Number.isFinite(Number(previous.netPnl)) ? Number(previous.netPnl) : 0,
    note: previous.note || "",
    createdAt: previous.createdAt || session.createdAt,
    updatedAt: session.updatedAt || new Date().toISOString()
  };
}

function renderHistory() {
  const history = loadHistory();
  if (!history.length) {
    els.historyArea.innerHTML = `
      <section class="panel">
        <h3>LỊCH SỬ</h3>
        <p class="muted-text">Chưa có lịch sử. Bấm cập nhật dữ liệu hôm nay để tạo bản ghi đầu tiên.</p>
      </section>
    `;
    return;
  }

  const sorted = [...history].sort((a, b) => String(b.date).localeCompare(String(a.date)));
  els.historyArea.innerHTML = `
    <section class="panel">
      <h3>LỊCH SỬ</h3>
      <div class="history-actions">
        <button id="exportHistoryBtn" class="ghost-btn" type="button">Xuất lịch sử JSON</button>
        <button id="importHistoryBtn" class="ghost-btn" type="button">Nhập lịch sử JSON</button>
        <button id="clearHistoryBtn" class="ghost-btn danger" type="button">Xóa lịch sử</button>
      </div>
    </section>
    ${renderStatsPanel("7 ngày", computeStats(sorted, 7))}
    ${renderStatsPanel("30 ngày", computeStats(sorted, 30))}
    <section class="panel">
      <h3>Danh sách ngày</h3>
      <div class="history-list">
        ${sorted.map(renderHistoryItem).join("")}
      </div>
    </section>
  `;
  bindHistoryButtons();
}

function renderStatsPanel(title, stats) {
  return `
    <section class="panel">
      <h3>${escapeHtml(title)}</h3>
      <div class="summary-grid">
        <div class="metric"><span>Có dữ liệu</span><strong>${stats.total}</strong></div>
        <div class="metric"><span>LONG / SHORT</span><strong>${stats.longDays} / ${stats.shortDays}</strong></div>
        <div class="metric"><span>NO TRADE</span><strong>${stats.noTradeDays}</strong></div>
        <div class="metric"><span>Tổng Net PnL</span><strong class="${stats.pnl >= 0 ? "win" : "loss"}">${formatSigned(stats.pnl)} USDT</strong></div>
        <div class="metric"><span>Win / Loss</span><strong>${stats.winDays} / ${stats.lossDays}</strong></div>
        <div class="metric"><span>Kỷ luật ghi kết quả</span><strong>${stats.doneDays}/${stats.total}</strong></div>
      </div>
    </section>
  `;
}

function renderHistoryItem(item) {
  const decisionLabel = item.decision === "NO_TRADE" ? "KHÔNG GIAO DỊCH" : item.decision;
  const resultLabel = getResultLabel(item.result);
  const pnl = Number(item.netPnl || 0);
  return `
    <article class="history-item">
      <div>
        <strong>${escapeHtml(formatDateShort(item.date))}</strong>
        <p class="muted-text">${escapeHtml(item.time || "Đã lưu")} · ${escapeHtml(decisionLabel)} · ${escapeHtml(item.longScore)}/${escapeHtml(item.shortScore)}</p>
        ${item.note ? `<p>${escapeHtml(item.note)}</p>` : ""}
      </div>
      <div class="history-result">
        <span class="pill muted">${escapeHtml(resultLabel)}</span>
        <strong class="${pnl >= 0 ? "win" : "loss"}">${formatSigned(pnl)} USDT</strong>
      </div>
    </article>
  `;
}

function computeStats(history, days) {
  const start = startOfLocalDay(new Date());
  start.setDate(start.getDate() - days + 1);
  const records = history.filter((item) => {
    const date = parseDateId(item.date);
    return date && date >= start;
  });
  const total = records.length;
  const doneDays = records.filter((item) => item.finalStatus === "DONE" || item.finalStatus === "NO_TRADE").length;
  return {
    total,
    longDays: records.filter((item) => item.decision === "LONG").length,
    shortDays: records.filter((item) => item.decision === "SHORT").length,
    noTradeDays: records.filter((item) => item.decision === "NO_TRADE").length,
    pnl: Number(records.reduce((sum, item) => sum + Number(item.netPnl || 0), 0).toFixed(2)),
    winDays: records.filter((item) => item.result === "WIN").length,
    lossDays: records.filter((item) => item.result === "LOSS").length,
    openDays: total - doneDays,
    doneDays
  };
}

function bindHistoryButtons() {
  const exportButton = document.querySelector("#exportHistoryBtn");
  const importButton = document.querySelector("#importHistoryBtn");
  const clearButton = document.querySelector("#clearHistoryBtn");
  if (exportButton) {
    exportButton.addEventListener("click", exportHistory);
  }
  if (importButton) {
    importButton.addEventListener("click", () => els.historyImportInput.click());
  }
  if (clearButton) {
    clearButton.addEventListener("click", clearHistory);
  }
}

function exportHistory() {
  const history = loadHistory();
  const blob = new Blob([JSON.stringify(history, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `ftokx-history-${getLocalDateId(new Date())}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

async function importHistoryFile(event) {
  const file = event.target.files && event.target.files[0];
  event.target.value = "";
  if (!file) {
    return;
  }

  try {
    const text = await file.text();
    const imported = JSON.parse(text);
    if (!Array.isArray(imported)) {
      throw new Error("History file must be an array");
    }

    const current = loadHistory();
    const merged = mergeHistory(current, imported.map(normalizeImportedRecord));
    saveHistory(merged);
    renderHistory();
    showMessage("Đã nhập lịch sử", "Dữ liệu lịch sử đã được merge theo ngày.", "");
  } catch (error) {
    console.error(error);
    showMessage("Không nhập được lịch sử", "File JSON không đúng cấu trúc tối thiểu: cần date và decision.", "bad");
  }
}

function normalizeImportedRecord(item) {
  if (!item || !item.date || !item.decision) {
    throw new Error("Bad history record");
  }
  const id = item.id || item.date;
  return {
    id,
    date: item.date,
    time: item.time || "Đã nhập",
    decision: item.decision,
    longScore: Number(item.longScore || 0),
    shortScore: Number(item.shortScore || 0),
    btcPrice: item.btcPrice || "",
    ethPrice: item.ethPrice || "",
    okbPrice: item.okbPrice || "",
    tickets: Array.isArray(item.tickets) ? item.tickets : [],
    finalStatus: item.finalStatus || "OPEN",
    result: item.result || "NONE",
    netPnl: Number.isFinite(Number(item.netPnl)) ? Number(item.netPnl) : 0,
    note: item.note || "",
    createdAt: item.createdAt || new Date().toISOString(),
    updatedAt: item.updatedAt || new Date().toISOString()
  };
}

function mergeHistory(current, imported) {
  const map = new Map();
  current.forEach((item) => map.set(item.id || item.date, item));
  imported.forEach((item) => {
    const key = item.id || item.date;
    const existing = map.get(key);
    if (!existing || String(item.updatedAt || "") >= String(existing.updatedAt || "")) {
      map.set(key, item);
    }
  });
  return [...map.values()];
}

function clearHistory() {
  if (!window.confirm("Xóa toàn bộ lịch sử? Phiên hôm nay vẫn giữ nguyên.")) {
    return;
  }
  localStorage.removeItem(HISTORY_KEY);
  renderHistory();
}

function showMessage(title, body, tone) {
  els.messageArea.className = `message-card ${tone === "bad" ? "bad-box" : ""}`;
  els.messageArea.innerHTML = `
    <h3>${escapeHtml(title)}</h3>
    <p>${escapeHtml(body)}</p>
  `;
}

function hideMessage() {
  els.messageArea.className = "message-card hidden";
  els.messageArea.innerHTML = "";
}

function formatTime(iso) {
  const date = new Date(iso);
  return date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
}

function formatClock(iso) {
  const date = new Date(iso);
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");
  return `${hour}:${minute}`;
}

function formatDateTime(iso) {
  const date = new Date(iso);
  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function formatDateShort(dateId) {
  const date = parseDateId(dateId);
  if (!date) {
    return "Đã lưu";
  }
  return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function getLocalDateId(input) {
  const date = input instanceof Date ? input : new Date(input);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function startOfLocalDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function parseDateId(dateId) {
  const match = String(dateId || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) {
    return null;
  }
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

function getResultLabel(value) {
  const option = RESULT_OPTIONS.find((item) => item.value === value);
  return option ? option.label : "Chưa chốt";
}

function formatSigned(value) {
  const number = Number(value || 0);
  return `${number >= 0 ? "+" : ""}${number.toFixed(2)}`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    return;
  }

  window.addEventListener("load", async () => {
    try {
      const registration = await navigator.serviceWorker.register("/service-worker.js");
      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;
        if (!newWorker) {
          return;
        }
        newWorker.addEventListener("statechange", () => {
          if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
            newWorker.postMessage({ type: "SKIP_WAITING" });
          }
        });
      });
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (hasReloadedForServiceWorker) {
          return;
        }
        hasReloadedForServiceWorker = true;
        window.location.reload();
      });
    } catch (error) {
      console.warn("Service worker registration failed", error);
    }
  });
}

init();
