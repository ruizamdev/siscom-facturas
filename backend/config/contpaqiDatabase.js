const sql = require('mssql');

// Configuración de conexión a la base de datos ContPAQi en SQL Server
const contpaqiConfig = {
  server: process.env.CONTPAQI_DB_SERVER,
  port: parseInt(process.env.CONTPAQI_DB_PORT || '1433'),
  database: process.env.CONTPAQI_DB_DATABASE,
  user: process.env.CONTPAQI_DB_USER,
  password: process.env.CONTPAQI_DB_PASSWORD,
  options: {
    encrypt: process.env.CONTPAQI_DB_ENCRYPT === 'true',
    trustServerCertificate: process.env.CONTPAQI_DB_TRUST_CERT === 'true',
    enableArithAbort: true,
    connectionTimeout: 30000,
    requestTimeout: 30000,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

// Pool de conexiones para reutilizar
let poolPromise;

/**
 * Obtiene el pool de conexiones a ContPAQi SQL Server
 * @returns {Promise<sql.ConnectionPool>}
 */
const getContpaqiPool = async () => {
  if (!poolPromise) {
    poolPromise = new sql.ConnectionPool(contpaqiConfig)
      .connect()
      .then(pool => {
        console.log('✓ Conectado a ContPAQi SQL Server');
        return pool;
      })
      .catch(err => {
        console.error('✗ Error al conectar a ContPAQi SQL Server:', err.message);
        poolPromise = null; // Reset para permitir reintentos
        throw err;
      });
  }
  return poolPromise;
};

/**
 * Ejecuta un query en la base de datos ContPAQi
 * @param {string} query - Query SQL a ejecutar
 * @param {Object} params - Parámetros para el query
 * @returns {Promise<sql.IResult>}
 */
const executeQuery = async (query, params = {}) => {
  try {
    const pool = await getContpaqiPool();
    const request = pool.request();

    // Agregar parámetros al request
    Object.entries(params).forEach(([key, value]) => {
      request.input(key, value);
    });

    const result = await request.query(query);
    return result;
  } catch (error) {
    console.error('Error ejecutando query en ContPAQi:', error.message);
    throw error;
  }
};

/**
 * Cierra el pool de conexiones
 */
const closeContpaqiPool = async () => {
  if (poolPromise) {
    const pool = await poolPromise;
    await pool.close();
    poolPromise = null;
    console.log('✓ Conexión a ContPAQi SQL Server cerrada');
  }
};

// Cerrar pool al terminar el proceso
process.on('SIGINT', async () => {
  await closeContpaqiPool();
  process.exit(0);
});

module.exports = {
  getContpaqiPool,
  executeQuery,
  closeContpaqiPool,
  sql, // Exportar sql para usar tipos como sql.BigInt, sql.VarChar, etc.
};
