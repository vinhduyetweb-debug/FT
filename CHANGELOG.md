# Changelog

## 1.2.4 — 2026-06-20

- Thêm Overnight Relaxed Mode từ 21:45 đến 23:59 theo giờ thiết bị.
- Thêm cấp `OVERNIGHT_READY_LONG` / `OVERNIGHT_READY_SHORT` với ngưỡng nới lỏng: score >= 6/8, gap >= 2, BTC core >= 4/5, EMA20 distance >= 0.25%.
- Thêm `BEST_EFFORT_LONG` / `BEST_EFFORT_SHORT` sau 21:45: nếu không đủ tín hiệu chuẩn, app vẫn dựng 01 phiếu tham khảo tối ưu nhất, gắn nhãn NOT_RECOMMENDED.
- BEST_EFFORT giảm vốn còn 25 USDT/lệnh, bắt buộc TP/SL, không bắt buộc vào lệnh.
- Thêm `NO_TRADE_LOCKED` cho hard veto: ATR ngoài vùng, volume lỗi, extreme candle hoặc cooldown sau ngày lỗ chưa đạt 8/8.
- Thêm Morning Review copy để sáng hôm sau ghi kết quả TP/SL/Không khớp/Tự đóng.
- Giữ no auto trade, no private API, no lệnh thứ 4.
- Tăng service worker cache lên `ftokx-simple-pwa-v1.2.4`.

## 1.2.3 — 2026-06-18

- Safe Optimized Signal Config theo kết quả backtest export ngày 18/06/2026.
- Nâng ngưỡng lập phiếu từ 6/8 lên 7/8.
- 5/8 và 6/8 là WATCH, không lập phiếu.
- Siết BTC dẫn hướng từ 4/5 lên 5/5 tiêu chí lõi.
- Siết vùng nhiễu sát EMA20 từ 0.25% lên 0.4%.
- Siết extreme candle multiplier từ 1.8 xuống 1.6.
- Siết cooldown sau ngày lỗ: phải đạt 8/8 mới lập phiếu.
- Siết V3.3 Safety Gate: ATR% từ 0.755%–3.0% thành 1.0%–2.0%, volume BTC > 0, LONG cần BTC 4H đóng xanh.
- Giữ Alert Discipline + Paper Result Pack từ V1.2.2: Watch Mode 5 phút, báo động một lần, log cảnh báo, giấy thử TP/SL giả lập.
- Không tăng vốn, không tăng đòn bẩy, không thêm lệnh thứ 4, không auto trade.
- Tăng service worker cache lên `ftokx-simple-pwa-v1.2.3`.
- Cập nhật README và validator cho V1.2.3.

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
