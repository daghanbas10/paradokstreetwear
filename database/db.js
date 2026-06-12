// Veritabanı kurulumu - sql.js ile better-sqlite3 uyumlu wrapper
// sql.js pure JavaScript/WASM tabanlıdır, native derleme gerektirmez
const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

// Veritabanı dosya yolu
const DB_PATH = path.join(__dirname, '..', 'database.sqlite');

// Dahili sql.js veritabanı referansı
let sqlDb = null;
let inTransaction = false;

// ── Veritabanını dosyaya kaydet ────────────────────────────────────

function save() {
  if (!inTransaction && sqlDb) {
    const data = sqlDb.export();
    fs.writeFileSync(DB_PATH, Buffer.from(data));
  }
}

// ── better-sqlite3 uyumlu prepare() wrapper ───────────────────────

function prepare(sql) {
  return {
    /**
     * SQL çalıştır (INSERT, UPDATE, DELETE)
     * @param {...any} params - Pozisyonel parametreler
     * @returns {{ changes: number }}
     */
    run(...params) {
      sqlDb.run(sql, params.length > 0 ? params : undefined);
      save();
      return { changes: sqlDb.getRowsModified() };
    },

    /**
     * Tek satır döndür (SELECT ... LIMIT 1)
     * @param {...any} params - Pozisyonel parametreler
     * @returns {Object|undefined}
     */
    get(...params) {
      let result = undefined;
      const stmt = sqlDb.prepare(sql);
      try {
        if (params.length > 0) stmt.bind(params);
        if (stmt.step()) {
          result = stmt.getAsObject();
        }
      } finally {
        stmt.free();
      }
      return result;
    },

    /**
     * Tüm satırları döndür (SELECT)
     * @param {...any} params - Pozisyonel parametreler
     * @returns {Object[]}
     */
    all(...params) {
      const results = [];
      const stmt = sqlDb.prepare(sql);
      try {
        if (params.length > 0) stmt.bind(params);
        while (stmt.step()) {
          results.push(stmt.getAsObject());
        }
      } finally {
        stmt.free();
      }
      return results;
    }
  };
}

// ── SQL çalıştır (DDL - CREATE TABLE vb.) ─────────────────────────

function exec(sql) {
  sqlDb.run(sql);
  save();
}

// ── Pragma (sql.js'de sınırlı destek) ─────────────────────────────

function pragma(str) {
  try {
    sqlDb.run(`PRAGMA ${str}`);
  } catch (e) {
    // sql.js'de bazı pragma'lar desteklenmez, yok say
  }
}

// ── Transaction wrapper ───────────────────────────────────────────

function transaction(fn) {
  return function (...args) {
    sqlDb.run('BEGIN TRANSACTION');
    inTransaction = true;
    try {
      const result = fn(...args);
      sqlDb.run('COMMIT');
      inTransaction = false;
      save();
      return result;
    } catch (e) {
      sqlDb.run('ROLLBACK');
      inTransaction = false;
      throw e;
    }
  };
}

// ── Veritabanı başlatma (async) ───────────────────────────────────

async function init() {
  const SQL = await initSqlJs();

  // Mevcut veritabanı dosyası varsa yükle, yoksa yeni oluştur
  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    sqlDb = new SQL.Database(fileBuffer);
  } else {
    sqlDb = new SQL.Database();
  }

  // ── Tabloları oluştur ──────────────────────────────────────────

  // Mesajlar tablosu
  sqlDb.run(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      subject TEXT NOT NULL,
      message TEXT NOT NULL,
      is_read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Blog yazıları tablosu
  sqlDb.run(`
    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      content TEXT NOT NULL,
      excerpt TEXT,
      cover_image TEXT,
      is_published INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Site içerik tablosu
  sqlDb.run(`
    CREATE TABLE IF NOT EXISTS site_content (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT UNIQUE NOT NULL,
      value TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Admin kullanıcıları tablosu
  sqlDb.run(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    )
  `);

  // ── Varsayılan site içeriklerini ekle ──────────────────────────

  const defaultContents = [
    ['hero_title', 'Profesyonel Hizmetler'],
    ['hero_subtitle', 'İşletmenizi büyütmek için yanınızdayız. Modern çözümlerle fark yaratın.'],
    ['about_text', 'Yılların deneyimi ve uzman kadromuzla müşterilerimize en kaliteli hizmeti sunuyoruz. Müşteri memnuniyeti bizim için her şeyden önemlidir.'],
    ['contact_email', 'info@example.com'],
    ['contact_phone', '+90 555 123 4567'],
    ['contact_address', 'İstanbul, Türkiye'],
    ['footer_text', '© 2024 Hizmet Tanıtım. Tüm hakları saklıdır.']
  ];

  for (const [key, value] of defaultContents) {
    sqlDb.run('INSERT OR IGNORE INTO site_content (key, value) VALUES (?, ?)', [key, value]);
  }

  // Dosyaya kaydet
  save();

  console.log('✓ Veritabanı başarıyla başlatıldı');
  return dbModule;
}

// ── Modül dışa aktarımı ───────────────────────────────────────────

const dbModule = module.exports = {
  prepare,
  exec,
  pragma,
  transaction,
  init
};
