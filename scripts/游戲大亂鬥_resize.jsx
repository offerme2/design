#target photoshop

/*
  遊戲大亂鬥 Banner Resize
  架構參考 Resize_Banner_Batch_v4，改為遊戲大亂鬥版位規格
  - resizeImage (cover) + crop 保留完整圖層
  - 裁完後修正 遊戲標章 / Copyright 固定位置
*/

function main() {
    if (app.documents.length === 0) {
        alert("請先開啟 970x250 母版！");
        return;
    }

    var doc = app.activeDocument;

    try { var docPath = doc.path; } catch (e) {
        alert("請先儲存母版檔案，腳本才能在同目錄建立新檔案。");
        return;
    }

    var targets = [
        { name: "焦點看版_300x250",     width: 300, height: 250 },
        { name: "橫幅看板_320x50",      width: 320, height: 50  },
        { name: "原生推薦文章_460x260", width: 460, height: 260 }
    ];

    var startRulerUnits = app.preferences.rulerUnits;
    app.preferences.rulerUnits = Units.PIXELS;

    var outputFolder = new Folder(docPath + "/遊戲大亂鬥_Banner");
    if (!outputFolder.exists) outputFolder.create();

    for (var i = 0; i < targets.length; i++) {
        processSize(doc, targets[i], outputFolder);
    }

    app.preferences.rulerUnits = startRulerUnits;
    alert("完成！三個版位已存至「遊戲大亂鬥_Banner」資料夾。");
}

function processSize(sourceDoc, spec, outputFolder) {
    var targetW = spec.width;
    var targetH = spec.height;

    var origW = sourceDoc.width.value;
    var origH = sourceDoc.height.value;

    // ── 複製文件（圖層完整保留）──────────────────────────────
    var newDoc = sourceDoc.duplicate(spec.name);
    app.activeDocument = newDoc;

    // ── Cover 縮放：長寬比取大值，確保填滿目標尺寸 ────────────
    var ratioW = targetW / origW;
    var ratioH = targetH / origH;
    var scale  = Math.max(ratioW, ratioH);

    newDoc.resizeImage(
        UnitValue(origW * scale, "px"),
        UnitValue(origH * scale, "px"),
        null,
        ResampleMethod.BICUBIC
    );

    // ── 置中裁切 ────────────────────────────────────────────
    var scaledW = newDoc.width.value;
    var scaledH = newDoc.height.value;
    var cropLeft = (scaledW - targetW) / 2;
    var cropTop  = (scaledH - targetH) / 2;

    newDoc.crop([
        UnitValue(cropLeft,           "px"),
        UnitValue(cropTop,            "px"),
        UnitValue(cropLeft + targetW, "px"),
        UnitValue(cropTop  + targetH, "px")
    ]);

    // ── 修正固定圖層位置 ─────────────────────────────────────
    fixFixedLayers(newDoc, targetW, targetH);

    // ── 存 PSD（保留圖層）────────────────────────────────────
    var saveOptions = new PhotoshopSaveOptions();
    saveOptions.layers = true;
    saveOptions.embedColorProfile = true;

    var saveFile = new File(outputFolder + "/" + spec.name + ".psd");
    newDoc.saveAs(saveFile, saveOptions, true, Extension.LOWERCASE);
    newDoc.close(SaveOptions.DONOTSAVECHANGES);
}

// ── 遊戲標章 & Copyright 固定位置修正 ───────────────────────

function fixFixedLayers(doc, W, H) {
    var layers = doc.layers;
    for (var i = 0; i < layers.length; i++) {
        var layer = layers[i];
        var name  = layer.name;

        if (name === '遊戲標章') {
            resizeLayerTo(layer, 20, 20);
            moveLayerTo(layer, 0, H - 20);

        } else if (name === 'Copyright') {
            var b  = getBounds(layer);
            var lh = b.bottom - b.top;
            if (lh === 0) continue;
            var sc = (10 / lh) * 100;
            layer.resize(sc, sc, AnchorPosition.TOPLEFT);
            var b2 = getBounds(layer);
            moveLayerTo(layer, W - (b2.right - b2.left), H - 10);
        }
    }
}

// ── 輔助函式 ─────────────────────────────────────────────────

function getBounds(layer) {
    var b = layer.bounds;
    return { left: b[0].as('px'), top: b[1].as('px'), right: b[2].as('px'), bottom: b[3].as('px') };
}

function moveLayerTo(layer, x, y) {
    var b = getBounds(layer);
    layer.translate(UnitValue(x - b.left, 'px'), UnitValue(y - b.top, 'px'));
}

function resizeLayerTo(layer, w, h) {
    var b  = getBounds(layer);
    var lw = b.right - b.left;
    var lh = b.bottom - b.top;
    if (lw === 0 || lh === 0) return;
    layer.resize((w / lw) * 100, (h / lh) * 100, AnchorPosition.TOPLEFT);
}

main();
