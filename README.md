# FTOKX SIMPLE PWA — X5 OKX TICKET

Mini app PWA một màn hình để lập phiếu OKX thủ công. Mỗi ngày mở app, bấm **CẬP NHẬT DỮ LIỆU & LẬP PHIẾU**, app lấy dữ liệu thị trường công khai từ OKX, chấm bối cảnh 4H BTC/ETH, rồi đưa ra **LONG**, **SHORT**, hoặc **KHÔNG GIAO DỊCH**.

Câu lõi của app: **App chỉ lập phiếu. Người giữ tay.**

## App làm gì

- Lấy nến 4H đã đóng của `BTC-USDT-SWAP` và `ETH-USDT-SWAP`.
- Lấy ticker mới của `BTC-USDT-SWAP`, `ETH-USDT-SWAP`, `OKB-USDT-SWAP`.
- Tính EMA20, EMA50 bằng JavaScript thuần.
- Chấm Long/Short theo 8 tiêu chí.
- Nếu đủ điều kiện, lập bảng nhập Limit cho `BTCUSDT`, `ETHUSDT`, `OKBUSDT`.
- Lưu phiên gần nhất vào LocalStorage.
- Cho người dùng tự cập nhật trạng thái: Chờ đặt, Đã đặt Limit, Đã khớp, Không khớp đã hủy, Đã TP, Đã SL.

## App không làm gì

- Không đăng nhập sàn.
- Không cần khóa truy cập sàn.
- Không có endpoint tài khoản, tài sản, hoặc đặt lệnh.
- Không tự đặt lệnh thật.
- Không hứa lợi nhuận.
- Không đuổi giá.
- Không có lệnh thứ 4.

## Thông số X5 cố định

- Cặp: `BTCUSDT`, `ETHUSDT`, `OKBUSDT`.
- Vị thế: 50 USDT mỗi lệnh.
- Đòn bẩy: x5.
- Ký quỹ ước tính: 10 USDT mỗi lệnh.
- Chế độ ký quỹ: Cô lập.
- Loại lệnh: Limit.
- Thời gian chờ khớp: 20 phút.
- Phí dự phòng: 0.05 USDT mỗi lệnh.

| Cặp | TP | SL | Lãi sau phí | Lỗ sau phí |
| --- | ---: | ---: | ---: | ---: |
| BTCUSDT | 3% | 2% | +1.45 USDT | -1.05 USDT |
| ETHUSDT | 3% | 2% | +1.45 USDT | -1.05 USDT |
| OKBUSDT | 4% | 2.5% | +1.95 USDT | -1.30 USDT |

Tổng nếu thắng cả 3: **+4.85 USDT**.  
Tổng nếu thua cả 3: **-3.40 USDT**.  
Lỗ thực tế chạm **-4 USDT** thì dừng ngày.

## Logic 4H

App chỉ dùng nến 4H đã đóng. Nến có timestamp + 4 giờ <= thời điểm hiện tại mới được tính.

Quy tắc quyết định:

- Long score >= 5 và Long - Short >= 2: **LONG**.
- Short score >= 5 và Short - Long >= 2: **SHORT**.
- Còn lại: **KHÔNG GIAO DỊCH**.
- Nếu nến BTC cực đoan, nghỉ.
- Nếu không lấy được dữ liệu công khai, app báo nghỉ và không dựng dữ liệu giả.

## Chạy local

Dùng một static server bất kỳ:

```bash
npx serve .
```

Lưu ý: rewrite `/api/okx/*` hoạt động khi chạy qua Vercel. Khi chạy local bằng static server đơn giản, dữ liệu OKX có thể không cập nhật nếu không có proxy tương ứng.

## Test

```bash
node --check app.js
node --check service-worker.js
node --check tools/validate-app.js
node tools/validate-app.js
```

Hoặc:

```bash
npm run check
npm run validate
```

## Deploy Vercel

1. Đưa toàn bộ thư mục lên GitHub.
2. Import repo vào Vercel.
3. Framework preset: Other.
4. Build command: để trống.
5. Output directory: `.`.
6. Deploy.

`vercel.json` đã có rewrite:

- `/api/okx/candles` → OKX public candles.
- `/api/okx/ticker` → OKX public ticker.

## Cài PWA

- Trên Chrome/Brave desktop: mở app, bấm biểu tượng cài đặt trên thanh địa chỉ.
- Trên Android: mở app, chọn menu trình duyệt, chọn thêm vào màn hình chính.
- Trên iPhone Safari: Share, Add to Home Screen.

## Offline và cache

- Online: cập nhật dữ liệu thị trường mới.
- Offline: chỉ mở lại shell app và xem phiên đã lưu.
- Service worker chỉ cache shell app, không cache dữ liệu OKX.
- Cache version: `ftokx-simple-pwa-v1.0.0`.

Nếu thấy bản cũ:

1. Mở DevTools → Application → Service Workers.
2. Chọn Unregister.
3. Clear site data.
4. Tải lại trang.

## Cảnh báo

Đây không phải lời khuyên tài chính. App chỉ lập phiếu tham khảo để người dùng tự nhập thủ công vào OKX. Người dùng tự chịu trách nhiệm với mọi quyết định và rủi ro.
"# FT" 
