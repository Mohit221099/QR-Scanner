const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
  host: 'localhost',
  port: 3306,
  user: 'root',        // Update with your MySQL username
  password: '',        // Update with your MySQL password
  database: 'majistic2k25', // Update with your database name
};

async function checkDatabaseConnection() {
  console.log('Checking database connection...');
  console.log('Config:', {
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    database: dbConfig.database
  });
  
  let connection;
  
  try {
    // Try to connect to the database
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connection successful!');
    
    // Check available databases
    const [databases] = await connection.execute('SHOW DATABASES');
    console.log('\nAvailable databases:');
    databases.forEach(db => console.log(`- ${Object.values(db)[0]}`));
    
    // Check if our database exists
    const databaseExists = databases.some(db => Object.values(db)[0] === dbConfig.database);
    if (!databaseExists) {
      console.error(`❌ Database '${dbConfig.database}' does not exist!`);
      console.log('You need to create the database first');
      return;
    }
    
    // Check tables in the database
    const [tables] = await connection.execute('SHOW TABLES');
    console.log(`\nTables in database '${dbConfig.database}':`);
    if (tables.length === 0) {
      console.log('No tables found in the database');
    } else {
      tables.forEach(table => console.log(`- ${Object.values(table)[0]}`));
    }
    
    // Check if registrations table exists
    const registrationsTableExists = tables.some(table => 
      Object.values(table)[0] === 'registrations' || 
      Object.values(table)[0] === 'registration');
    
    if (!registrationsTableExists) {
      console.error("❌ 'registrations' or 'registration' table not found!");
    } else {
      // Get the actual table name
      const tableName = tables.find(table => 
        Object.values(table)[0] === 'registrations' || 
        Object.values(table)[0] === 'registration');
      
      const actualTableName = Object.values(tableName)[0];
      
      // Check table structure
      console.log(`\nStructure of '${actualTableName}' table:`);
      const [columns] = await connection.execute(`DESCRIBE ${actualTableName}`);
      columns.forEach(col => {
        console.log(`- ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
      });
      
      // Sample data
      const [rows] = await connection.execute(`SELECT * FROM ${actualTableName} LIMIT 3`);
      console.log(`\nSample data from '${actualTableName}' (${rows.length} rows):`);
      console.log(rows);
    }
    
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('Check your username and password');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('Make sure MySQL server is running');
    }
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the check
checkDatabaseConnection();
