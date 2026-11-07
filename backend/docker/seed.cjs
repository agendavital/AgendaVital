const bcrypt = require('bcryptjs');
const sql = require('mssql');

const roles = [
  ['ADMINISTRADOR', 'Administrador', 'Administracion general del sistema'],
  ['RRHH', 'Recursos Humanos', 'Gestion empresarial y de candidatos'],
  ['CLINICA', 'Clinica', 'Gestion operativa de la clinica'],
  ['MEDICO', 'Medico', 'Evaluaciones y conceptos ocupacionales'],
  ['CANDIDATO', 'Candidato', 'Consulta del proceso ocupacional'],
];

async function seed() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    throw new Error('ADMIN_EMAIL y ADMIN_PASSWORD son obligatorios.');
  }

  const pool = await sql.connect({
    server: process.env.DB_SERVER,
    port: Number(process.env.DB_PORT ?? 1433),
    database: process.env.DB_DATABASE,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    options: {
      encrypt: true,
      trustServerCertificate: true,
    },
  });

  const transaction = new sql.Transaction(pool);
  await transaction.begin();

  try {
    for (const [code, name, description] of roles) {
      await new sql.Request(transaction)
        .input('code', sql.VarChar(40), code)
        .input('name', sql.NVarChar(80), name)
        .input('description', sql.NVarChar(250), description).query(`
          IF NOT EXISTS (SELECT 1 FROM dbo.Rol WHERE Codigo = @code)
          BEGIN
            INSERT INTO dbo.Rol (Codigo, Nombre, Descripcion)
            VALUES (@code, @name, @description);
          END
        `);
    }

    const passwordHash = await bcrypt.hash(adminPassword, 10);
    const userRequest = new sql.Request(transaction)
      .input('email', sql.NVarChar(254), adminEmail.trim().toLowerCase())
      .input('passwordHash', sql.NVarChar(255), passwordHash)
      .input('firstName', sql.NVarChar(100), 'Administrador')
      .input('lastName', sql.NVarChar(100), 'AgendaVital');

    const userResult = await userRequest.query(`
      IF NOT EXISTS (SELECT 1 FROM dbo.Usuario WHERE Correo = @email)
      BEGIN
        INSERT INTO dbo.Usuario
          (Correo, HashContrasena, Nombres, Apellidos, Activo)
        VALUES
          (@email, @passwordHash, @firstName, @lastName, 1);
      END
      ELSE
      BEGIN
        UPDATE dbo.Usuario
        SET HashContrasena = @passwordHash, Activo = 1
        WHERE Correo = @email;
      END

      SELECT UsuarioId FROM dbo.Usuario WHERE Correo = @email;
    `);

    const userId = userResult.recordset[0].UsuarioId;

    await new sql.Request(transaction).input('userId', sql.Int, userId).query(`
        DECLARE @roleId SMALLINT = (
          SELECT RolId FROM dbo.Rol WHERE Codigo = 'ADMINISTRADOR'
        );

        IF NOT EXISTS (
          SELECT 1
          FROM dbo.UsuarioRol
          WHERE UsuarioId = @userId AND RolId = @roleId
        )
        BEGIN
          INSERT INTO dbo.UsuarioRol (UsuarioId, RolId)
          VALUES (@userId, @roleId);
        END
      `);

    await transaction.commit();
    console.log('Roles y administrador inicial preparados.');
  } catch (error) {
    await transaction.rollback();
    throw error;
  } finally {
    await pool.close();
  }
}

seed().catch((error) => {
  console.error('No fue posible sembrar los datos iniciales:', error.message);
  process.exit(1);
});
