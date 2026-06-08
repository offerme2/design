#target photoshop

// 遊戲大亂鬥 Banner Resize
// 母版 970x250 需先打開，執行後產生 3 份獨立文件，圖層完整保留

var sourceDoc = app.activeDocument;

var targets = [
    { name: "焦點看版_300x250",     width: 300, height: 250 },
    { name: "橫幅看板_320x50",      width: 320, height: 50  },
    { name: "原生推薦文章_460x260", width: 460, height: 260 }
];

for (var i = 0; i < targets.length; i++) {
    processSize(targets[i]);
}

alert("完成！已建立 " + targets.length + " 份文件，圖層完整保留。");

// ─── 主流程 ──────────────────────────────────────────────────

function processSize(spec) {
    // duplicate() 不帶第二參數 → 圖層完整複製，不合併
    var newDoc = sourceDoc.duplicate(spec.name);
    app.activeDocument = newDoc;

    var W = spec.width;
    var H = spec.height;

    newDoc.resizeCanvas(
        UnitValue(W, 'px'),
        UnitValue(H, 'px'),
        AnchorPosition.MIDDLECENTER
    );

    var layers = newDoc.layers;
    for (var i = 0; i < layers.length; i++) {
        transformLayer(layers[i], W, H);
    }

    app.activeDocument = sourceDoc;
}

// ─── 各圖層排版邏輯 ──────────────────────────────────────────

function transformLayer(layer, W, H) {
    var name = layer.name;

    if (name === 'bg') {
        scaleToCoverAndCenter(layer, W, H);

    } else if (name === '遊戲標章') {
        resizeLayerTo(layer, 20, 20);
        moveLayerTo(layer, 0, H - 20);

    } else if (name === 'Copyright') {
        var b = getBounds(layer);
        var lh = b.bottom - b.top;
        if (lh === 0) return;
        var scale = (10 / lh) * 100;
        layer.resize(scale, scale, AnchorPosition.TOPLEFT);
        var b2 = getBounds(layer);
        moveLayerTo(layer, W - (b2.right - b2.left), H - 10);

    } else {
        // 角色群組、LOGO、活動時間、星座 → 整組等比縮放對齊畫布寬度
        var b = getBounds(layer);
        var lw = b.right - b.left;
        if (lw === 0) return;
        var sc = (W / lw) * 100;
        layer.resize(sc, sc, AnchorPosition.MIDDLECENTER);
    }
}

// ─── 輔助函式 ────────────────────────────────────────────────

function getBounds(layer) {
    var b = layer.bounds;
    return {
        left:   b[0].as('px'),
        top:    b[1].as('px'),
        right:  b[2].as('px'),
        bottom: b[3].as('px')
    };
}

function moveLayerTo(layer, x, y) {
    var b = getBounds(layer);
    layer.translate(UnitValue(x - b.left, 'px'), UnitValue(y - b.top, 'px'));
}

function resizeLayerTo(layer, w, h) {
    var b = getBounds(layer);
    var lw = b.right - b.left;
    var lh = b.bottom - b.top;
    if (lw === 0 || lh === 0) return;
    layer.resize((w / lw) * 100, (h / lh) * 100, AnchorPosition.TOPLEFT);
}

function scaleToCoverAndCenter(layer, W, H) {
    var b = getBounds(layer);
    var lw = b.right - b.left;
    var lh = b.bottom - b.top;
    if (lw === 0 || lh === 0) return;
    var scale = Math.max(W / lw, H / lh) * 100;
    layer.resize(scale, scale, AnchorPosition.MIDDLECENTER);
    var b2 = getBounds(layer);
    var nw = b2.right - b2.left;
    var nh = b2.bottom - b2.top;
    moveLayerTo(layer, (W - nw) / 2, (H - nh) / 2);
}
