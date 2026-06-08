#target photoshop

// 遊戲大亂鬥 Banner Resize — 全部版位建在同一份文件的工作區域
// 母版: 970x250（需先打開）

var sourceDoc = app.activeDocument;
var GAP = 80;

var sizes = [
    { name: "焦點大看板_970x250",   width: 970, height: 250 },
    { name: "焦點看版_300x250",     width: 300, height: 250 },
    { name: "橫幅看板_320x50",      width: 320, height: 50  },
    { name: "原生推薦文章_460x260", width: 460, height: 260 }
];

// ── 計算新文件尺寸 ──────────────────────────────────────────
var canvasW = GAP;
var canvasH = 0;
for (var i = 0; i < sizes.length; i++) {
    canvasW += sizes[i].width + GAP;
    canvasH = Math.max(canvasH, sizes[i].height);
}
canvasH += GAP * 2;

// ── 建新文件 ────────────────────────────────────────────────
var newDoc = app.documents.add(
    UnitValue(canvasW, 'px'),
    UnitValue(canvasH, 'px'),
    sourceDoc.resolution,
    "遊戲大亂鬥_Banner_AllSizes",
    NewDocumentMode.RGB,
    DocumentFill.WHITE
);
app.activeDocument = newDoc;

// ── 逐一建工作區域並填入圖層 ────────────────────────────────
var offsetX = GAP;
for (var i = 0; i < sizes.length; i++) {
    var spec = sizes[i];
    var offsetY = GAP;
    var W = spec.width;
    var H = spec.height;

    // 建工作區域
    createArtboard(spec.name, offsetX, offsetY, W, H);
    var artboard = newDoc.layers[0]; // 剛建的在最上層

    // 把母版所有圖層複製進去
    app.activeDocument = sourceDoc;
    var sourceLayers = sourceDoc.layers;
    for (var j = sourceLayers.length - 1; j >= 0; j--) {
        sourceLayers[j].duplicate(artboard, ElementPlacement.PLACEATEND);
    }

    // 切回新文件，對工作區域內圖層做排版
    app.activeDocument = newDoc;
    var abLayers = artboard.layers;
    for (var k = 0; k < abLayers.length; k++) {
        transformLayer(abLayers[k], W, H, offsetX, offsetY);
    }

    offsetX += W + GAP;
}

alert("完成！四個版位已建立於工作區域中。");

// ── 建工作區域（Action Manager）────────────────────────────
function createArtboard(name, x, y, w, h) {
    var desc = new ActionDescriptor();
    var ref  = new ActionReference();
    ref.putClass(stringIDToTypeID("artboardSection"));
    desc.putReference(charIDToTypeID("null"), ref);
    var artDesc  = new ActionDescriptor();
    artDesc.putString(charIDToTypeID("Nm  "), name);
    var rectDesc = new ActionDescriptor();
    rectDesc.putDouble(stringIDToTypeID("top"),    y);
    rectDesc.putDouble(stringIDToTypeID("left"),   x);
    rectDesc.putDouble(stringIDToTypeID("bottom"), y + h);
    rectDesc.putDouble(stringIDToTypeID("right"),  x + w);
    artDesc.putObject(stringIDToTypeID("artboardRect"), stringIDToTypeID("artboardRect"), rectDesc);
    desc.putObject(charIDToTypeID("Usng"), stringIDToTypeID("artboardSection"), artDesc);
    executeAction(charIDToTypeID("Mk  "), desc, DialogModes.NO);
}

// ── 各圖層排版邏輯 ──────────────────────────────────────────
function transformLayer(layer, W, H, offsetX, offsetY) {
    var name = layer.name;

    if (name === 'bg') {
        scaleToCoverAndCenter(layer, W, H, offsetX, offsetY);

    } else if (name === '遊戲標章') {
        resizeLayerTo(layer, 20, 20);
        moveLayerTo(layer, offsetX, offsetY + H - 20);

    } else if (name === 'Copyright') {
        var b = getBounds(layer);
        var lh = b.bottom - b.top;
        if (lh === 0) return;
        var scale = (10 / lh) * 100;
        layer.resize(scale, scale, AnchorPosition.TOPLEFT);
        var b2 = getBounds(layer);
        moveLayerTo(layer, offsetX + W - (b2.right - b2.left), offsetY + H - 10);

    } else {
        // 其他（角色群組、LOGO、活動時間、星座等）等比縮放對齊畫布寬度
        var b = getBounds(layer);
        var lw = b.right - b.left;
        if (lw === 0) return;
        var sc = (W / lw) * 100;
        layer.resize(sc, sc, AnchorPosition.MIDDLECENTER);
    }
}

// ── 輔助函式 ────────────────────────────────────────────────
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

function scaleToCoverAndCenter(layer, W, H, offsetX, offsetY) {
    var b = getBounds(layer);
    var lw = b.right - b.left;
    var lh = b.bottom - b.top;
    if (lw === 0 || lh === 0) return;
    var scale = Math.max(W / lw, H / lh) * 100;
    layer.resize(scale, scale, AnchorPosition.MIDDLECENTER);
    var b2 = getBounds(layer);
    var nw = b2.right - b2.left;
    var nh = b2.bottom - b2.top;
    moveLayerTo(layer, offsetX + (W - nw) / 2, offsetY + (H - nh) / 2);
}
