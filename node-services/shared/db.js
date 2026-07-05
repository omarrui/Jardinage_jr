const mysql = require("mysql2/promise");

const databaseUrl = process.env.DATABASE_URL;

const pool = databaseUrl
  ? mysql.createPool(databaseUrl)
  : mysql.createPool({
      host: process.env.DB_HOST || "127.0.0.1",
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER || "jardinage",
      password: process.env.DB_PASSWORD || "password123",
      database: process.env.DB_NAME || "jardinage_db",
      waitForConnections: true,
      connectionLimit: Number(process.env.DB_POOL_LIMIT || 10)
    });

async function query(sql, params = []) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}

async function initDatabase() {
  await query(`
    CREATE TABLE IF NOT EXISTS admins (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(120) NOT NULL UNIQUE,
      password VARCHAR(200) NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS customers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(150) NOT NULL,
      email VARCHAR(150) NULL UNIQUE,
      password VARCHAR(200) NULL,
      phone VARCHAR(50) NOT NULL,
      has_account BOOLEAN DEFAULT FALSE,
      must_change_password BOOLEAN DEFAULT FALSE,
      reset_code VARCHAR(10) NULL,
      reset_code_expiry DATETIME NULL
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS service_requests (
      id INT AUTO_INCREMENT PRIMARY KEY,
      customer_id INT NOT NULL,
      preferred_date VARCHAR(100) NOT NULL,
      description TEXT NULL,
      address VARCHAR(200) NULL,
      status VARCHAR(50) DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      scheduled_start DATETIME NULL,
      scheduled_end DATETIME NULL,
      CONSTRAINT fk_service_requests_customer
        FOREIGN KEY (customer_id) REFERENCES customers(id)
        ON DELETE CASCADE
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS availability (
      id INT AUTO_INCREMENT PRIMARY KEY,
      date VARCHAR(50) NOT NULL UNIQUE
    )
  `);
}

module.exports = {
  pool,
  query,
  initDatabase
};
