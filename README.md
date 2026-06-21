# FTOKX SIMPLE PWA V1.3.3 — BTC 20X Discipline Ticket

App PWA tĩnh HTML/CSS/JS dùng dữ liệu thị trường công khai OKX để lập phiếu futures thủ công cho **BTC/USDT**.

Triết lý V1.3.3:

> Always Plan, Conditional Trade — mở app lúc nào cũng có kế hoạch, nhưng không phải kế hoạch nào cũng đáng xuống tiền.

## Điểm mới V1.3.3

- Thêm **ATR Smart TP/SL**: TP/SL không còn quá chặt kiểu 0.50% / 0.30% mặc định cũ.
- Bộ TP/SL mới hợp hơn cho BTC/USDT x20:
  - Grade A: TP 1.20% / SL 0.60%.
  - Grade B: TP 1.00% / SL 0.50%.
  - Grade C: TP 0.80% / SL 0.45%.
  - Grade D: TP 0.60% / SL 0.40%.
  - Grade F: TP 0.50% / SL 0.35%, chủ yếu để nhìn kế hoạch.
- Nếu ATR 4H trong vùng cao nhưng còn hợp lệ, app nới TP/SL có kiểm soát, không để SL quá sát BTC.
- Nếu ATR quá thấp hoặc quá cao, app vẫn dựng phiếu để nhìn, nhưng trạng thái `LOCKED_RISK` vẫn khóa hành động.
- Thêm mục **Thiết lập vốn futures**:
  - Quỹ futures kế hoạch mặc định: 100 USDT.
  - Ký quỹ mỗi lệnh mặc định: 50 USDT.
  - Vị thế danh nghĩa ở x20: khoảng 1.000 USDT.
- Khối **VỊ THẾ ĐỀ XUẤT** hiển thị thêm:
  - TP/SL mode.
  - Tác động lên quỹ futures.
  - Lãi nếu TP, lỗ nếu SL, ROI trên margin.
- Giữ giao diện compact: phần cần đọc sâu vẫn thu gọn bằng mục mở rộng.

## Cảnh báo

- App chỉ lập phiếu. Người giữ tay.
- Không hứa lợi nhuận.
- Không auto trade.
- Không private API.
- Không kết nối tài khoản sàn.
- Không đọc số dư, vị thế hoặc lịch sử giao dịch OKX.
- Không khuyến khích all-in, martingale, DCA futures hoặc gỡ lỗ bằng đòn bẩy.
- Không dùng BTC Tangem hoặc tiền DCA BTC hằng tháng để cứu futures.
- 20x là rủi ro cao. Nếu không chấp nhận SL thì không dùng futures.

## App làm gì

- Lấy nến 4H đã đóng và ticker public của `BTC-USDT-SWAP` qua rewrite Vercel `/api/okx/*`.
- Chỉ dùng **BTC/USDT Futures**.
- Mặc định **Isolated x20**.
- Luôn dựng 01 phiếu phân tích BTC.
- Chấm **Fitness %** so với bộ phiếu chuẩn 100 điểm.
- Gắn **Grade A/B/C/D/F**.
- Gắn **Action** rõ ràng:
  - `EXECUTABLE`: có thể xem xét thủ công.
  - `WAIT_TRIGGER`: chỉ chờ giá về vùng, không chase.
  - `PLAN_ONLY`: có phiếu để nhìn, ưu tiên không xuống tiền.
  - `LOCKED_RISK`: khóa rủi ro, có lời/lỗ giả định nhưng không vào thật.
- Có slogan/câu nhắc của Lão phù hợp từng trạng thái.
- Có Morning Review để tự ghi kết quả và bài học.
- Có Watch Mode quét 5 phút/lần khi app đang mở; chỉ hú chuông khi action = `EXECUTABLE`.
- Có lịch sử 7 ngày / 30 ngày, export/import JSON.

## Thông số giao dịch V1.3.3

| Mục | Giá trị |
| --- | --- |
| Cặp | BTC/USDT Futures |
| Instrument | `BTC-USDT-SWAP` |
| Margin | Isolated / Cô lập |
| Leverage | x20 |
| Loại lệnh | Limit |
| Quỹ futures kế hoạch | 100 USDT mặc định, có thể chỉnh |
| Vốn ký quỹ/lệnh | 50 USDT mặc định, có thể chỉnh |
| Vị thế danh nghĩa mặc định | 1.000 USDT |
| Số phiếu mỗi lần mở app | 01 phiếu |
| No Chase | 0.25% khỏi Limit |
| Chờ Limit | 20 phút |
| Private API | Không |
| Auto trade | Không |

## Cách app tính lời/lỗ

Với vốn ký quỹ mặc định **50 USDT** và đòn bẩy **x20**:

- Vị thế danh nghĩa = `50 x 20 = 1.000 USDT`.
- Lãi gộp nếu TP = `notional x TP%`.
- Lỗ gộp nếu SL = `notional x SL%`.
- Phí ước tính = `notional x feeRate x 2`.
- Lãi/lỗ ròng = lãi/lỗ gộp trừ phí.

Ví dụ Grade B với TP 1.00% và SL 0.50%:

- Gross TP khoảng `+10.00 USDT`.
- Gross SL khoảng `-5.00 USDT`.
- Phí ước tính khoảng `1.00 USDT`.
- Net TP khoảng `+9.00 USDT`.
- Net SL khoảng `-6.00 USDT`.

## TP/SL mặc định theo Grade

| Grade | TP | SL | Ý nghĩa |
| --- | ---: | ---: | --- |
| A | 1.20% | 0.60% | Phiếu rất đẹp, vẫn không all-in |
| B | 1.00% | 0.50% | Mặc định cân bằng nhất |
| C | 0.80% | 0.45% | Chờ trigger kỹ |
| D | 0.60% | 0.40% | Chủ yếu tham khảo |
| F | 0.50% | 0.35% | Không đáng xuống tiền |

Với 20x, SL phải đủ rộng để tránh nhiễu, nhưng đủ gần để không mất mạng. Không dời SL. Không gồng lỗ.

## ATR Smart TP/SL

- ATR 4H dưới 1.0%: `LOCKED_RISK`, biến động thấp dễ nhiễu.
- ATR 4H từ 1.0% đến dưới 1.5%: dùng TP/SL chuẩn theo Grade.
- ATR 4H từ 1.5% đến 2.0%: nếu không bị khóa, app nới TP/SL có kiểm soát.
- ATR 4H trên 2.0%: `LOCKED_RISK`, biến động quá loạn cho x20.

## Hard veto / LOCKED_RISK

App vẫn dựng phiếu phân tích và tính lời/lỗ giả định, nhưng khóa hành động nếu có:

- Dữ liệu không fresh.
- ATR% dưới 1.0% hoặc trên 2.0%.
- Volume không đủ tin cậy.
- Nến 4H quá cực đoan.
- Đang cooldown sau ngày lỗ mà điểm chưa đủ mạnh.
- Long/Short quá nhiễu, chưa xác định được bên ít xấu hơn.

## Slogan theo trạng thái

- `EXECUTABLE`: “Lệnh đẹp vẫn phải nhỏ, vì thị trường không nợ ta điều gì.”
- `WAIT_TRIGGER`: “Giá chạy mất thì để nó chạy; tiền còn là cơ hội còn.”
- `PLAN_ONLY`: “Phiếu yếu là bản đồ, không phải lời mời xuống tiền.”
- `LOCKED_RISK`: “Khi rủi ro khóa cửa, người sống sót không phá khóa.”
- Cooldown: “Sau một lệnh thua, việc đầu tiên là giữ tay.”
- Lỗi dữ liệu: “Không có dữ liệu sạch thì không có quyết định sạch.”

## Lệnh kiểm tra

```bash
npm run check
npm run validate
```

## Deploy

Nếu Vercel đã nối GitHub:

```bash
npm run check
npm run validate
git status
git add .
git commit -m "Add V1.3.3 ATR Smart TP SL"
git push origin main
```

## Nguyên tắc sống còn

App chỉ đưa bản đồ. Người giữ tay. Futures x20 không tha lỗi dời SL.
