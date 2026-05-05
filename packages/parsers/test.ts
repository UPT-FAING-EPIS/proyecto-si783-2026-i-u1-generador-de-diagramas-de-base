import { parseSQL } from './src/index'

const ddl = `
CREATE TABLE users (id UUID PRIMARY KEY, email TEXT);
CREATE TABLE posts (id UUID PRIMARY KEY, user_id UUID REFERENCES users(id));
`

const result = parseSQL(ddl, 'postgresql')
console.log(JSON.stringify(result, null, 2))
