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
exports.parseSQLServer = parseSQLServer;
var layout_1 = require("../utils/layout");
function removeSqlServerBrackets(str) {
    return str.replace(/\[([^\]]+)\]/g, '$1');
}
function removeSchemaPrefix(name) {
    return name.includes('.') ? name.split('.').pop() : name;
}
function parseSQLServer(ddl) {
    var result = { nodes: [], edges: [], errors: [] };
    try {
        var normalized = ddl.replace(/--.*$/gm, '');
        normalized = normalized.replace(/\/\*[\s\S]*?\*\//g, '');
        normalized = removeSqlServerBrackets(normalized);
        var tableRegex = /CREATE\s+TABLE\s+([\w\.]+)\s*\(([\s\S]*?)\)(?:;|$)/gi;
        var match = void 0;
        var rawTables = [];
        while ((match = tableRegex.exec(normalized)) !== null) {
            rawTables.push({ tableName: removeSchemaPrefix(match[1].trim()), body: match[2].trim() });
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
            for (var _b = 0, parts_2 = parts; _b < parts_2.length; _b++) {
                var part = parts_2[_b];
                var p = part.trim();
                if (!p)
                    continue;
                if (/^CONSTRAINT/i.test(p) && !/FOREIGN\s+KEY/i.test(p)) {
                    if (/PRIMARY\s+KEY/i.test(p)) {
                        var pkMatch = p.match(/PRIMARY\s+KEY\s*\(\s*([^)]+)\s*\)/i);
                        if (pkMatch) {
                            pkColumns.push.apply(pkColumns, pkMatch[1].split(',').map(function (c) { return c.trim(); }));
                        }
                    }
                    continue;
                }
                if (/^PRIMARY\s+KEY/i.test(p) || /^UNIQUE/i.test(p) || /^CHECK/i.test(p)) {
                    continue;
                }
                var columnRegex = /^(\w+)\s+([A-Za-z]+(?:\s*\([^)]+\))?)(.*)/i;
                var colMatch = p.match(columnRegex);
                if (colMatch && !/^(CONSTRAINT|FOREIGN)/i.test(p)) {
                    var colName = colMatch[1];
                    var colType = colMatch[2].toUpperCase().replace(/\s+/g, '');
                    var rest = colMatch[3] || '';
                    var isPrimaryKey = pkColumns.includes(colName) || /PRIMARY\s+KEY/i.test(rest);
                    var isIdentity = /IDENTITY\s*\(\s*\d+\s*,\s*\d+\s*\)/i.test(rest);
                    var isForeignKey = false;
                    var references = undefined;
                    var inlineRefMatch = rest.match(/REFERENCES\s+([\w\.]+)\s*\(\s*(\w+)\s*\)/i);
                    if (inlineRefMatch) {
                        isForeignKey = true;
                        var refTable = removeSchemaPrefix(inlineRefMatch[1]);
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
                    columns.push(__assign({ name: colName, type: colType, isPrimaryKey: isPrimaryKey, isForeignKey: isForeignKey, references: references }, (isIdentity ? { isIdentity: true } : {})));
                }
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
        var alterRegex = /ALTER\s+TABLE\s+([\w\.]+)\s+(?:ADD\s+CONSTRAINT\s+\w+\s+)?FOREIGN\s+KEY\s*\(\s*(\w+)\s*\)\s*REFERENCES\s+([\w\.]+)\s*\(\s*(\w+)\s*\)/gi;
        var alterMatch = void 0;
        var _loop_1 = function () {
            var sourceTable = removeSchemaPrefix(alterMatch[1].trim()).toLowerCase();
            var sourceCol = alterMatch[2].trim();
            var targetTable = removeSchemaPrefix(alterMatch[3].trim()).toLowerCase();
            var targetCol = alterMatch[4].trim();
            var sourceNode = result.nodes.find(function (n) { return n.id === sourceTable; });
            if (sourceNode) {
                var column = sourceNode.data.columns.find(function (c) { return c.name === sourceCol; });
                if (column) {
                    column.isForeignKey = true;
                    column.references = { table: targetTable, column: targetCol };
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
        while ((alterMatch = alterRegex.exec(normalized)) !== null) {
            _loop_1();
        }
        return result;
    }
    catch (error) {
        result.errors.push({
            message: error instanceof Error ? error.message : 'Error desconocido al parsear SQL Server'
        });
        return result;
    }
}
