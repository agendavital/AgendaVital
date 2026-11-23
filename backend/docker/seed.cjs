const bcrypt = require('bcryptjs');
const sql = require('mssql');

const roles = [
  ['ADMINISTRADOR', 'Administrador', 'Administracion general del sistema'],
  ['RRHH', 'Recursos Humanos', 'Gestion empresarial y de candidatos'],
  ['CLINICA', 'Clinica', 'Gestion operativa de la clinica'],
  ['MEDICO', 'Medico', 'Evaluaciones y conceptos ocupacionales'],
  ['CANDIDATO', 'Candidato', 'Consulta del proceso ocupacional'],
];

const processStates = [
  ['PENDIENTE', 'Pendiente'],
  ['EN_PROCESO', 'En proceso'],
  ['FINALIZADO', 'Finalizado'],
  ['CANCELADO', 'Cancelado'],
];

const examTypes = [
  ['INGRESO', 'Ingreso'],
  ['PERIODICO', 'Periódico'],
  ['EGRESO', 'Egreso'],
];

const examRequestStates = [['SOLICITADA', 'Solicitada']];

const appointmentStates = [
  ['PROGRAMADA', 'Programada'],
  ['REALIZADA', 'Realizada'],
];

const occupationalConcepts = [
  ['APTO', 'Apto'],
  ['APTO_CON_RESTRICCIONES', 'Apto con restricciones'],
  ['NO_APTO', 'No apto'],
];

const permissions = [
  ['dashboard:read', 'Ver panel principal', 'Acceder al resumen del perfil'],
  ['candidates:read', 'Consultar candidatos', 'Ver candidatos autorizados por empresa o clínica'],
  ['candidates:create', 'Registrar candidatos', 'Crear perfiles de candidatos'],
  ['processes:read', 'Consultar procesos', 'Ver procesos ocupacionales autorizados'],
  ['processes:create', 'Crear procesos', 'Iniciar procesos ocupacionales'],
  ['exam-requests:read', 'Consultar solicitudes', 'Ver solicitudes de exámenes autorizadas'],
  ['exam-requests:create', 'Crear solicitudes', 'Solicitar tipos de examen'],
  ['appointments:read', 'Consultar citas', 'Ver citas autorizadas por empresa o clínica'],
  ['appointments:create', 'Programar citas', 'Asignar solicitudes a horarios disponibles'],
  ['clinic-management:manage', 'Administrar clínicas y horarios', 'Gestionar clínicas y disponibilidad'],
  ['medical-staff:manage', 'Administrar personal médico', 'Registrar profesionales y vincularlos a clínicas'],
  ['audit:read', 'Consultar auditoría', 'Leer la trazabilidad del sistema'],
  ['documents:read', 'Consultar documentos', 'Ver metadatos de documentos autorizados'],
  ['medical-results:read', 'Consultar resultados médicos', 'Ver evaluaciones de la clínica asignada'],
  ['medical-results:create', 'Registrar resultados médicos', 'Emitir conceptos ocupacionales'],
  ['reports:read', 'Consultar reportes', 'Leer indicadores operativos autorizados'],
  ['notifications:read', 'Consultar notificaciones', 'Leer y marcar notificaciones propias'],
  ['candidate-portal:read', 'Consultar mi proceso', 'Ver el proceso y las citas propias'],
  ['access-control:manage', 'Administrar permisos por rol', 'Cambiar permisos de perfiles no administrativos'],
];

const rolePermissionDefaults = {
  ADMINISTRADOR: permissions.map(([code]) => code).filter((code) => code !== 'candidate-portal:read'),
  RRHH: [
    'dashboard:read', 'candidates:read', 'candidates:create', 'processes:read',
    'processes:create', 'exam-requests:read', 'exam-requests:create',
    'appointments:read', 'appointments:create', 'documents:read',
    'reports:read', 'notifications:read',
  ],
  CLINICA: [
    'dashboard:read', 'candidates:read', 'appointments:read', 'documents:read',
    'notifications:read',
  ],
  MEDICO: [
    'dashboard:read', 'appointments:read', 'documents:read',
    'medical-results:read', 'medical-results:create', 'notifications:read',
  ],
  CANDIDATO: [
    'dashboard:read', 'candidate-portal:read', 'documents:read',
    'notifications:read',
  ],
};

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

    for (const [code, name, description] of permissions) {
      await new sql.Request(transaction)
        .input('code', sql.VarChar(80), code)
        .input('name', sql.NVarChar(120), name)
        .input('description', sql.NVarChar(250), description).query(`
          IF NOT EXISTS (SELECT 1 FROM dbo.Permiso WHERE Codigo = @code)
          BEGIN
            INSERT INTO dbo.Permiso (Codigo, Nombre, Descripcion)
            VALUES (@code, @name, @description);
          END
        `);
    }

    for (const [roleCode, permissionCodes] of Object.entries(rolePermissionDefaults)) {
      const roleResult = await new sql.Request(transaction)
        .input('roleCode', sql.VarChar(40), roleCode)
        .query('SELECT RolId FROM dbo.Rol WHERE Codigo = @roleCode');
      const roleId = roleResult.recordset[0]?.RolId;
      if (!roleId) continue;

      const assignmentResult = await new sql.Request(transaction)
        .input('roleId', sql.SmallInt, roleId)
        .query('SELECT COUNT(*) AS Total FROM dbo.RolPermiso WHERE RolId = @roleId');
      if (assignmentResult.recordset[0].Total > 0) continue;

      for (const permissionCode of permissionCodes) {
        await new sql.Request(transaction)
          .input('roleId', sql.SmallInt, roleId)
          .input('permissionCode', sql.VarChar(80), permissionCode)
          .query(`
            INSERT INTO dbo.RolPermiso (RolId, PermisoId)
            SELECT @roleId, PermisoId FROM dbo.Permiso WHERE Codigo = @permissionCode
          `);
      }
    }

    for (const [code, name] of processStates) {
      await new sql.Request(transaction)
        .input('code', sql.VarChar(40), code)
        .input('name', sql.NVarChar(80), name).query(`
          IF NOT EXISTS (SELECT 1 FROM dbo.EstadoProceso WHERE Codigo = @code)
          BEGIN
            INSERT INTO dbo.EstadoProceso (Codigo, Nombre)
            VALUES (@code, @name);
          END
        `);
    }

    for (const [code, name] of examRequestStates) {
      await new sql.Request(transaction)
        .input('code', sql.VarChar(40), code)
        .input('name', sql.NVarChar(80), name).query(`
          IF NOT EXISTS (SELECT 1 FROM dbo.EstadoSolicitud WHERE Codigo = @code)
          BEGIN
            INSERT INTO dbo.EstadoSolicitud (Codigo, Nombre)
            VALUES (@code, @name);
          END
        `);
    }

    for (const [code, name] of examTypes) {
      await new sql.Request(transaction)
        .input('code', sql.VarChar(30), code)
        .input('name', sql.NVarChar(80), name).query(`
          IF NOT EXISTS (SELECT 1 FROM dbo.TipoExamen WHERE Codigo = @code)
          BEGIN
            INSERT INTO dbo.TipoExamen (Codigo, Nombre)
            VALUES (@code, @name);
          END
        `);
    }

    await new sql.Request(transaction)
      .input('nit', sql.VarChar(20), 'TEST-AV-001')
      .input('name', sql.NVarChar(150), 'Empresa de Prueba AgendaVital').query(`
        IF NOT EXISTS (SELECT 1 FROM dbo.Empresa WHERE Nit = @nit)
        BEGIN
          INSERT INTO dbo.Empresa (Nit, RazonSocial)
          VALUES (@nit, @name);
        END
      `);

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

    for (const [code, name] of appointmentStates) {
      await new sql.Request(transaction)
        .input('code', sql.VarChar(40), code)
        .input('name', sql.NVarChar(80), name).query(`
          IF NOT EXISTS (SELECT 1 FROM dbo.EstadoCita WHERE Codigo = @code)
          BEGIN
            INSERT INTO dbo.EstadoCita (Codigo, Nombre)
            VALUES (@code, @name);
          END
        `);
    }

    for (const [code, name] of occupationalConcepts) {
      await new sql.Request(transaction)
        .input('code', sql.VarChar(30), code)
        .input('name', sql.NVarChar(80), name).query(`
          IF NOT EXISTS (
            SELECT 1 FROM dbo.ConceptoOcupacional WHERE Codigo = @code
          )
          BEGIN
            INSERT INTO dbo.ConceptoOcupacional (Codigo, Nombre)
            VALUES (@code, @name);
          END
        `);
    }

    await transaction.commit();
    console.log('Roles, estados y catálogos iniciales del sistema preparados.');
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
