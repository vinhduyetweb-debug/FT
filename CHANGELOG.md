# Changelog

## 1.1.0 — 2026-06-18

- Thêm tab LỊCH SỬ.
- Thêm LocalStorage key `ftokx_simple_pwa_v1_history`.
- Lưu lịch sử từng ngày theo quyết định LONG / SHORT / KHÔNG GIAO DỊCH.
- Thêm khu vực Kết quả ngày với Net PnL USDT và ghi chú.
- Thêm thống kê so sánh 7 ngày và 30 ngày.
- Thêm xuất lịch sử JSON, nhập lịch sử JSON và xóa lịch sử.
- Tăng service worker cache lên `ftokx-simple-pwa-v1.1.0`.
- Cập nhật validator cho lịch sử và backup.

## 1.0.0 — 2026-06-18

- Tạo mới FTOKX SIMPLE PWA — X5 OKX TICKET.
- HTML/CSS/JavaScript thuần.
- PWA cơ bản với manifest và service worker version `ftokx-simple-pwa-v1.0.0`.
- Vercel rewrite cho OKX public candles/ticker.
- Chấm bối cảnh 4H bằng EMA20/EMA50.
- Lập phiếu thủ công cho BTCUSDT, ETHUSDT, OKBUSDT.
- Theo dõi trạng thái thủ công bằng LocalStorage.
- Validator dự án trong `tools/validate-app.js`.
