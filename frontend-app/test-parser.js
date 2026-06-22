const { parseSQLServer } = require('./test-out/dialects/sqlserver.js');

const sql = `
CREATE TABLE [Roles] (
  [id_rol] INT IDENTITY(1,1) PRIMARY KEY,
  [descripcion] NVARCHAR(MAX)
);

CREATE TABLE [Usuarios] (
  [id_usuario] INT,
  [id_rol] INT REFERENCES [Roles]([id_rol])
);
`;

console.log(JSON.stringify(parseSQLServer(sql), null, 2));
