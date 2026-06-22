const { parseMongoDB } = require('./test-out/dialects/mongodb.js');

const sql = `
const RolesSchema = new mongoose.Schema({
  id_rol: { type: Number },
  descripcion: { type: String }
});

const Roles = mongoose.model('Roles', RolesSchema);

const UsuariosSchema = new mongoose.Schema({
  id_usuario: { type: Number },
  id_rol: { type: Schema.Types.ObjectId, ref: 'Roles', required: true }
});

const Usuarios = mongoose.model('Usuarios', UsuariosSchema);
`;

console.log(JSON.stringify(parseMongoDB(sql), null, 2));
