"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateLayout = calculateLayout;
var COLS = 3;
var NODE_WIDTH = 280;
var NODE_HEIGHT_BASE = 120;
var GAP_X = 80;
var GAP_Y = 60;
function calculateLayout(nodeCount) {
    return Array.from({ length: nodeCount }, function (_, i) { return ({
        x: (i % COLS) * (NODE_WIDTH + GAP_X),
        y: Math.floor(i / COLS) * (NODE_HEIGHT_BASE + GAP_Y)
    }); });
}
