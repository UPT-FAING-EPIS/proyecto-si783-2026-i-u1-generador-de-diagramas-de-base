const { parseMySQL } = require('./test-out/dialects/mysql.js');

const sql = `
CREATE TABLE Roles (
  id_rol INT AUTO_INCREMENT PRIMARY KEY,
  descripcion TEXT
);

CREATE TABLE Usuarios (
  id_usuario INT,
  id_rol INT REFERENCES Roles(id_rol)
);
`;

console.log(JSON.stringify(parseMySQL(sql), null, 2));
