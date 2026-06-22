"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseMySQL = parseMySQL;
var layout_1 = require("../utils/layout");
function parseMySQL(ddl) {
    var result = { nodes: [], edges: [], errors: [] };
    try {
        var normalized = ddl.replace(/--.*$/gm, '');
        normalized = normalized.replace(/\/\*[\s\S]*?\*\//g, '');
        normalized = normalized.replace(/`([^`]+)`/g, '$1'); // Normalize backticks
        var tableRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(\w+)\s*\(([\s\S]*?)\)(?:\s+ENGINE[\s\S]*?)?;/gi;
        var match = void 0;
        var rawTables = [];
        while ((match = tableRegex.exec(normalized)) !== null) {
            rawTables.push({ tableName: match[1].trim(), body: match[2].trim() });
        }
        var positions_1 = (0, layout_1.calculateLayout)(rawTables.length);
        rawTables.forEach(function (_a, index) {
            var tableName = _a.tableName, body = _a.body;
            var id = tableName.toLowerCase();
            var columns = [];
            var parts = body.split(/,(?![^\(]*\))/);
            var pkColumns = [];
            for (var _i = 0, parts_1 = parts; _i < parts_1.length; _i++) {
                var part = parts_1[_i];
                var p = part.trim();
                var pkMatch = p.match(/PRIMARY\s+KEY\s*\(\s*([^)]+)\s*\)/i);
                if (pkMatch) {
                    pkColumns.push.apply(pkColumns, pkMatch[1].split(',').map(function (c) { return c.trim(); }));
                }
            }
            var _loop_2 = function (part) {
                var p = part.trim();
                if (!p)
                    return "continue";
                if (/^PRIMARY\s+KEY/i.test(p) || /^UNIQUE/i.test(p) || /^CHECK/i.test(p) || /^KEY/i.test(p) || /^INDEX/i.test(p)) {
                    return "continue";
                }
                var fkMatch = p.match(/CONSTRAINT\s+\w+\s+FOREIGN\s+KEY\s*\(\s*(\w+)\s*\)\s*REFERENCES\s+(\w+)\s*\(\s*(\w+)\s*\)/i);
                if (fkMatch) {
                    var colName_1 = fkMatch[1];
                    var refTable = fkMatch[2];
                    var refCol = fkMatch[3];
                    var col = columns.find(function (c) { return c.name === colName_1; });
                    if (col) {
                        col.isForeignKey = true;
                        col.references = { table: refTable, column: refCol };
                    }
                    result.edges.push({
                        id: "rel-".concat(id, "-").concat(colName_1, "-").concat(refTable.toLowerCase(), "-").concat(refCol),
                        source: id,
                        sourceHandle: "".concat(colName_1, "-source"),
                        target: refTable.toLowerCase(),
                        targetHandle: "".concat(refCol, "-target"),
                        type: 'relationship',
                        animated: false,
                        style: { stroke: '#1A6CF6', strokeWidth: 1.5 }
                    });
                    return "continue";
                }
                var columnRegex = /^(\w+)\s+([A-Za-z]+(?:\s*\([^)]+\))?)(.*)/i;
                var colMatch = p.match(columnRegex);
                if (colMatch && !/^CONSTRAINT/i.test(p)) {
                    var colName = colMatch[1];
                    var colType = colMatch[2].toUpperCase().replace(/\s+/g, '');
                    var rest = colMatch[3] || '';
                    var isPrimaryKey = pkColumns.includes(colName) || /PRIMARY\s+KEY/i.test(rest);
                    var isAutoIncrement = /AUTO_INCREMENT/i.test(rest);
                    var isForeignKey = false;
                    var references = undefined;
                    var inlineRefMatch = rest.match(/REFERENCES\s+(\w+)\s*\(\s*(\w+)\s*\)/i);
                    if (inlineRefMatch) {
                        isForeignKey = true;
                        var refTable = inlineRefMatch[1];
                        var refCol = inlineRefMatch[2];
                        references = { table: refTable, column: refCol };
                        result.edges.push({
                            id: "rel-".concat(id, "-").concat(colName, "-").concat(refTable.toLowerCase(), "-").concat(refCol),
                            source: id,
                            sourceHandle: "".concat(colName, "-source"),
                            target: refTable.toLowerCase(),
                            targetHandle: "".concat(refCol, "-target"),
                            type: 'relationship',
                            animated: false,
                            style: { stroke: '#1A6CF6', strokeWidth: 1.5 }
                        });
                    }
                    columns.push(__assign({ name: colName, type: colType, isPrimaryKey: isPrimaryKey, isForeignKey: isForeignKey, references: references }, (isAutoIncrement ? { isAutoIncrement: true } : {})));
                }
            };
            for (var _b = 0, parts_2 = parts; _b < parts_2.length; _b++) {
                var part = parts_2[_b];
                _loop_2(part);
            }
            columns.forEach(function (col) {
                if (pkColumns.includes(col.name)) {
                    col.isPrimaryKey = true;
                }
            });
            result.nodes.push({
                id: id,
                type: 'tableNode',
                position: positions_1[index] || { x: 0, y: 0 },
                data: {
                    tableName: tableName,
                    columns: columns
                }
            });
        });
        var alterTableRegex = /ALTER\s+TABLE\s+(\w+)\s+ADD\s+(?:CONSTRAINT\s+\w+\s+)?FOREIGN\s+KEY\s*\(\s*(\w+)\s*\)\s*REFERENCES\s+(\w+)\s*\(\s*(\w+)\s*\)/gi;
        var alterMatch = void 0;
        var _loop_1 = function () {
            var sourceTable = alterMatch[1].toLowerCase();
            var sourceCol = alterMatch[2];
            var targetTable = alterMatch[3].toLowerCase();
            var targetCol = alterMatch[4];
            var sourceNode = result.nodes.find(function (n) { return n.id === sourceTable; });
            if (sourceNode) {
                var col = sourceNode.data.columns.find(function (c) { return c.name === sourceCol; });
                if (col) {
                    col.isForeignKey = true;
                    col.references = { table: targetTable, column: targetCol };
                }
            }
            result.edges.push({
                id: "rel-".concat(sourceTable, "-").concat(sourceCol, "-").concat(targetTable, "-").concat(targetCol),
                source: sourceTable,
                sourceHandle: "".concat(sourceCol, "-source"),
                target: targetTable,
                targetHandle: "".concat(targetCol, "-target"),
                type: 'relationship',
                animated: false,
                style: { stroke: '#1A6CF6', strokeWidth: 1.5 }
            });
        };
        while ((alterMatch = alterTableRegex.exec(normalized)) !== null) {
            _loop_1();
        }
        return result;
    }
    catch (error) {
        result.errors.push({
            message: error instanceof Error ? error.message : 'Error desconocido al parsear MySQL'
        });
        return result;
    }
}
