#target photoshop

// 遊戲大亂鬥 Banner Resize Script
// 母版: 970x250，自動產生其他三個版位

var targetSizes = [
    { name: "焦點看版_300x250",      width: 300, height: 250 },
    { name: "橫幅看板_320x50",       width: 320, height: 50  },
    { name: "原生推薦文章_460x260",  width: 460, height: 260 }
];

var sourceDoc = app.activeDocument;

for (var i = 0; i < targetSizes.length; i++) {
    processSize(targetSizes[i]);
}

alert("完成！已建立 " + targetSizes.length + " 個新文件。");

// ─── 主流程 ──────────────────────────────────────────────

function processSize(spec) {
    var newDoc = sourceDoc.duplicate(spec.name, true);
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
        processLayer(layers[i], W, H);
    }

    app.activeDocument = sourceDoc;
}

function processLayer(layer, W, H) {
    var name = layer.name;

    if (name === 'bg') {
        scaleToCoverAndCenter(layer, W, H);

    } else if (name === '遊戲標章') {
        resizeLayerTo(layer, 20, 20);
        moveLayerTo(layer, 0, H - 20);

    } else if (name === 'Copyright') {
        var b = getBounds(layer);
        var layerH = b.bottom - b.top;
        if (layerH === 0) return;
        var scale = (10 / layerH) * 100;
        layer.resize(scale, scale, AnchorPosition.TOPLEFT);
        var b2 = getBounds(layer);
        moveLayerTo(layer, W - (b2.right - b2.left), H - 10);

    } else {
        scaleToLongestEdge(layer, W, H);
    }
}

// ─── 輔助函式 ─────────────────────────────────────────────

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
    layer.translate(
        UnitValue(x - b.left, 'px'),
        UnitValue(y - b.top,  'px')
    );
}

function resizeLayerTo(layer, w, h) {
    var b = getBounds(layer);
    var lw = b.right  - b.left;
    var lh = b.bottom - b.top;
    if (lw === 0 || lh === 0) return;
    layer.resize((w / lw) * 100, (h / lh) * 100, AnchorPosition.TOPLEFT);
}

// bg: 等比縮放蓋滿畫布（cover），然後置中
function scaleToCoverAndCenter(layer, W, H) {
    var b = getBounds(layer);
    var lw = b.right  - b.left;
    var lh = b.bottom - b.top;
    if (lw === 0 || lh === 0) return;

    var scale = Math.max(W / lw, H / lh) * 100;
    layer.resize(scale, scale, AnchorPosition.MIDDLECENTER);

    var b2 = getBounds(layer);
    var nw = b2.right  - b2.left;
    var nh = b2.bottom - b2.top;
    moveLayerTo(layer, (W - nw) / 2, (H - nh) / 2);
}

// 裝飾/角色：等比縮放，長邊對齊畫布長邊
function scaleToLongestEdge(layer, W, H) {
    var b = getBounds(layer);
    var lw = b.right  - b.left;
    var lh = b.bottom - b.top;
    if (lw === 0 || lh === 0) return;

    var canvasLongest = Math.max(W, H);
    var layerLongest  = Math.max(lw, lh);
    var scale = (canvasLongest / layerLongest) * 100;
    layer.resize(scale, scale, AnchorPosition.MIDDLECENTER);
}
