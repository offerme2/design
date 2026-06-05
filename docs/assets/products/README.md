# 產品圖存放區 Product Images

把各產品線的商品圖（建議**去背 PNG**，方便合成）放進對應資料夾：

| 產品線 | 資料夾 |
|--------|--------|
| 維他命C | `dermacept-vitaminc/` |
| Stem Lift | `dermacept-stemlift/` |
| 五重酸 | `dermacept-acid/` |

## 命名建議
`<產品線>-<品項>-<視角>.png`，例如：
- `acid-serum-front.png`（五重酸精華 正面）
- `acid-serum-45.png`（45 度）
- `vitaminc-c25-front.png`

## 放好之後怎麼用
存進來、push 之後，每張圖都會有固定網址，生圖時直接引用：

- Pages 網址：`https://offerme2.github.io/design/assets/products/<資料夾>/<檔名>`
- Raw 網址：`https://raw.githubusercontent.com/offerme2/design/<branch>/docs/assets/products/<資料夾>/<檔名>`

跟設計部的 Claude 說「用某張產品圖生 XX」，它就會把這裡的圖當參考圖餵進 Magnific。
