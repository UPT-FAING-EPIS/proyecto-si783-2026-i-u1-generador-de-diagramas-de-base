"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseMongoDB = parseMongoDB;
var layout_1 = require("../utils/layout");
function parseMongoDB(code) {
    var result = {
        nodes: [],
        edges: [],
        errors: []
    };
    try {
        // 1. Normalizar comentarios
        var normalized = code.replace(/\/\/.*$/gm, '');
        normalized = normalized.replace(/\/\*[\s\S]*?\*\//g, '');
        // 2. Extraer bloques mongoose.Schema({ ... })
        // Buscamos: const ModelNameSchema = new mongoose.Schema({ ... })
        var schemaRegex = /(?:const|let|var)\s+(\w+)Schema\s*=\s*new\s+(?:mongoose\.)?Schema\s*\(\s*\{([\s\S]*?)\}\s*\)/gi;
        var match = void 0;
        var rawSchemas = [];
        while ((match = schemaRegex.exec(normalized)) !== null) {
            var name_1 = match[1].trim();
            if (name_1.toLowerCase().endsWith('schema')) {
                name_1 = name_1.substring(0, name_1.length - 6);
            }
            var body = match[2].trim();
            rawSchemas.push({ name: name_1, body: body });
        }
        var positions_1 = (0, layout_1.calculateLayout)(rawSchemas.length);
        rawSchemas.forEach(function (_a, index) {
            var name = _a.name, body = _a.body;
            var id = name.toLowerCase();
            var columns = [];
            // Separamos por comas en el primer nivel (muy básico)
            var fieldRegex = /([\w_]+)\s*:\s*\{([^}]+)\}|([\w_]+)\s*:\s*(\w+)/g;
            var fieldMatch;
            while ((fieldMatch = fieldRegex.exec(body)) !== null) {
                if (fieldMatch[1] && fieldMatch[2]) {
                    // Object syntax: field: { type: String, ref: 'User' }
                    var fieldName = fieldMatch[1].trim();
                    var fieldConfig = fieldMatch[2].trim();
                    var colType = 'String';
                    var typeMatch = fieldConfig.match(/type\s*:\s*([\w.]+)/i);
                    if (typeMatch)
                        colType = typeMatch[1].replace('Schema.Types.', '');
                    var isForeignKey = false;
                    var references = undefined;
                    var refMatch = fieldConfig.match(/ref\s*:\s*['"](\w+)['"]/i);
                    if (refMatch) {
                        isForeignKey = true;
                        var refTable = refMatch[1];
                        references = { table: refTable, column: '_id' };
                        result.edges.push({
                            id: "rel-".concat(id, "-").concat(fieldName, "-").concat(refTable.toLowerCase(), "-_id"),
                            source: id,
                            sourceHandle: "".concat(fieldName, "-source"),
                            target: refTable.toLowerCase(),
                            targetHandle: "_id-target",
                            type: 'relationship',
                            animated: false,
                            style: { stroke: '#00D4FF' }
                        });
                    }
                    columns.push({
                        name: fieldName,
                        type: colType,
                        isPrimaryKey: fieldName === '_id',
                        isForeignKey: isForeignKey,
                        references: references
                    });
                }
                else if (fieldMatch[3] && fieldMatch[4]) {
                    // Shorthand syntax: field: String
                    var fieldName = fieldMatch[3].trim();
                    var colType = fieldMatch[4].trim();
                    columns.push({
                        name: fieldName,
                        type: colType,
                        isPrimaryKey: fieldName === '_id',
                        isForeignKey: false
                    });
                }
            }
            // Add implicit _id if not exists
            if (!columns.some(function (c) { return c.name === '_id'; })) {
                columns.unshift({
                    name: '_id',
                    type: 'ObjectId',
                    isPrimaryKey: true,
                    isForeignKey: false
                });
            }
            result.nodes.push({
                id: id,
                type: 'nosqlNode',
                position: positions_1[index] || { x: 0, y: 0 },
                data: {
                    tableName: name,
                    columns: columns
                }
            });
        });
        return result;
    }
    catch (error) {
        result.errors.push({
            message: error instanceof Error ? error.message : 'Error al parsear MongoDB'
        });
        return result;
    }
}
