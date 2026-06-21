# FTOKX SIMPLE PWA V1.3.5 — Kill Switch & Capital Guard

App PWA tĩnh HTML/CSS/JS dùng dữ liệu public OKX để lập phiếu futures thủ công cho **BTC/USDT**.

Tinh thần: **Always Plan, Conditional Trade** — luôn có kế hoạch, không ép xuống tiền.

## Nguyên tắc

- Chỉ dùng `BTCUSDT` / `BTC-USDT-SWAP`.
- Futures **Isolated x20**.
- Lệnh thủ công kiểu **Limit**.
- Không backend.
- Không private API.
- Không auto trade.
- Không kết nối tài khoản OKX.
- Không DCA futures, không martingale, không dời SL.

## V1.3.5 có gì mới

- **Kill Switch thật sự**: One Trade Per Day và Daily Max Loss.
- **Capital Guard**: nhập quỹ futures, margin/lệnh và ngưỡng lỗ ngày.
- **Copy Ticket to OKX**: copy nhanh phiếu gồm hướng, Limit, TP1, TP2, SL, No Chase và PnL.
- Nếu quỹ futures quá nhỏ so với margin/lệnh, Grade yếu sẽ bị `LOCKED_RISK`.
- Nếu hôm nay đã dùng một lệnh hoặc đã chạm Daily Max Loss, app vẫn dựng bản đồ nhưng khóa hành động.

## Survival TP1/TP2

- TP1: chốt 50% vị thế.
- Sau TP1: phần còn lại gợi ý dời SL về hòa vốn.
- TP2: chốt phần còn lại.
- SL: cắt lỗ, không dời xa hơn.

## Mặc định vốn

- Quỹ futures: `100 USDT`.
- Margin/lệnh: `50 USDT`.
- Đòn bẩy: `x20`.
- Vị thế danh nghĩa tham chiếu: khoảng `1.000 USDT`.
- Daily Max Loss: `6 USDT`.
- One Trade Per Day: bật.

## Lệnh kiểm tra

```bash
npm run check
npm run validate
```

## Deploy

```bash
npm run check
npm run validate
git status
git add .
git commit -m "Add V1.3.5 Kill Switch Capital Guard"
git push origin main
```

## Slogan

TP1 để bớt tham, Kill Switch để còn sống.
