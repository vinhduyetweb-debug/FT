# FTOKX SIMPLE PWA V2.1 CONFIG180 WATCHLIST

PWA tĩnh HTML/CSS/JS dùng dữ liệu public OKX để soi BTC/USDT-SWAP theo bộ tham chiếu **LÃO SHORT TREND V1.4.2 — WATCHLIST CONFIG 180**.

App không đặt lệnh, không đọc tài khoản, không private API, không auto trade, không backend. Bản này mặc định **WATCHLIST / OBSERVATION_ONLY / NO_LIVE** để kiểm chứng thêm bộ thông số backtest trước khi dùng thật.

## Tinh thần

Backtest chỉ là bộ lọc. App này giúp ông mở lên là biết: thị trường có đang đúng cửa SHORT Trend hay không, nếu khớp thì ghi paper/watchlist, nếu không khớp thì khóa tay.

## Bộ thông số V2.1 CONFIG180

- Pair: BTC/USDT-SWAP
- Signal TF: 4H closed candles only
- Execution TF: 15M
- Direction: SHORT only
- Position notional: 500 USD
- Leverage: x5
- Margin required: 100 USDT
- Mode: Isolated
- Regime: Trend Down only
- Grade: A only
- Min Fitness: 92
- ATR: 0.6% đến 2.0%
- EMA20 distance: 1.0% đến 2.8%
- No Chase: 0.15%
- TP1: 0.70%
- TP2: 0.70%
- SL: 0.30%
- Expiry: 12 nến 15M / 180 phút
- Daily Max Loss: 3 USDT
- One Trade Per Day: ON
- Kill Switch: ON
- Volume Filter: ON

## Nâng cấp chính so với V2.0

- Chuyển từ BTC x20 hai chiều sang **SHORT-only x5 Config 180**.
- Thêm `STRATEGY_PROFILE` trong `app.js` để khóa cấu hình vào một hồ sơ rõ ràng.
- Mặc định **Paper Mode / NO_LIVE**; khi setup đẹp sẽ hiện `WATCHLIST_HIT`, không khuyến nghị vào live.
- Siết bộ lọc: Trend Down, Grade A, Fitness ≥ 92, ATR 0.6–2.0%, EMA20 distance 1.0–2.8%, volume ratio ≥ 0.8x.
- Cập nhật vốn: margin/lệnh 100 USDT, notional 500 USD, Daily Max Loss 3 USDT.
- Cập nhật TP/SL: TP1 0.70%, TP2 0.70%, SL 0.30%.
- Cập nhật PWA cache name lên `ftokx-simple-pwa-v2.1.0-config180`.
- Giữ nguyên localStorage key cũ để không phá lịch sử.

## Chạy local

```bash
npm run check
npm run validate
```

Có thể mở trực tiếp `index.html` để xem shell và lịch sử local. Dữ liệu live OKX cần deploy có rewrite `/api/okx/*` như trong `vercel.json`.

## Deploy Vercel qua GitHub

```bash
npm run check
npm run validate
git status
git add .
git commit -m "Release V2.1 Config180 Watchlist"
git push origin main
```

Nếu dùng Vercel CLI:

```bash
npx vercel --prod
```

## Dữ liệu

App lưu dữ liệu local trên máy bằng localStorage:

- `ftokx_simple_pwa_v1_session`
- `ftokx_simple_pwa_v1_settings`
- `ftokx_simple_pwa_v1_history`
- `ftokx_simple_pwa_v1_alert_log`
- `ftokx_simple_pwa_v1_paper_tests`
- `ftokx_simple_pwa_v2_pretrade_contract`

Giữ key cũ để không phá dữ liệu V1/V2.0. Khi mở V2.1 lần đầu, settings được migrate sang profile Config 180.

## Giới hạn

- Đây là app quan sát, không phải bot giao dịch.
- Bộ Config 180 lấy từ backtest tham chiếu, chưa được xác nhận hoàn hảo.
- Không bảo đảm lợi nhuận.
- App không tự biết tài khoản OKX, margin thật, liquidation thật.
- Nếu OKX public API lỗi/chậm, app sẽ khóa rủi ro.

Slogan: Bộ lọc tốt không làm ta nóng tay; nó bắt ta chờ đúng cửa.
