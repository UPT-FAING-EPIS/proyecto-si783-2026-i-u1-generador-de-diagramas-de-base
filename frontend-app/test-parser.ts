import { parseSQLServer } from './lib/parsers/dialects/sqlserver.ts';
import { parsePostgreSQL } from './lib/parsers/dialects/postgresql.ts';
import { parseMySQL } from './lib/parsers/dialects/mysql.ts';

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
