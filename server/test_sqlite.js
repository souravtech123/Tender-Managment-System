const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:');

db.serialize(() => {
  db.run("CREATE TABLE lorem (info TEXT)");
  const stmt = db.prepare("INSERT INTO lorem VALUES ($1)");
  stmt.run({ $1: 'Ipsum' });
  stmt.finalize();

  db.all("SELECT rowid AS id, info FROM lorem WHERE info = $1", { $1: 'Ipsum' }, (err, rows) => {
      console.log("Found:", rows);
  });
});
db.close();
