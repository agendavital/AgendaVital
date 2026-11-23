require('dotenv').config({ path: require('node:path').resolve(__dirname, '../.env') });
const sql = require('mssql');

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

const defaults = {
  ADMINISTRADOR: permissions.map(([code]) => code).filter((code) => code !== 'candidate-portal:read'),
  RRHH: ['dashboard:read', 'candidates:read', 'candidates:create', 'processes:read', 'processes:create', 'exam-requests:read', 'exam-requests:create', 'appointments:read', 'appointments:create', 'documents:read', 'reports:read', 'notifications:read'],
  CLINICA: ['dashboard:read', 'candidates:read', 'appointments:read', 'documents:read', 'notifications:read'],
  MEDICO: ['dashboard:read', 'appointments:read', 'documents:read', 'medical-results:read', 'medical-results:create', 'notifications:read'],
  CANDIDATO: ['dashboard:read', 'candidate-portal:read', 'documents:read', 'notifications:read'],
};

async function run() {
  const config = {
    server: process.env.DB_SERVER,
    port: Number(process.env.DB_PORT ?? 1433),
    database: process.env.DB_DATABASE,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    options: { encrypt: true, trustServerCertificate: true },
  };
  if (!config.server || !config.database || !config.user || !config.password) {
    throw new Error('Configura DB_SERVER, DB_DATABASE, DB_USER y DB_PASSWORD en backend/.env.');
  }

  const pool = await sql.connect(config);
  const transaction = new sql.Transaction(pool);
  await transaction.begin();
  try {
    for (const [code, name, description] of permissions) {
      await new sql.Request(transaction)
        .input('code', sql.VarChar(80), code)
        .input('name', sql.NVarChar(120), name)
        .input('description', sql.NVarChar(250), description)
        .query(`IF NOT EXISTS (SELECT 1 FROM dbo.Permiso WHERE Codigo = @code)
          INSERT INTO dbo.Permiso (Codigo, Nombre, Descripcion) VALUES (@code, @name, @description);`);
    }

    for (const [roleCode, permissionCodes] of Object.entries(defaults)) {
      const roleResult = await new sql.Request(transaction)
        .input('roleCode', sql.VarChar(40), roleCode)
        .query('SELECT RolId FROM dbo.Rol WHERE Codigo = @roleCode');
      const roleId = roleResult.recordset[0]?.RolId;
      if (!roleId) continue;

      const countResult = await new sql.Request(transaction)
        .input('roleId', sql.SmallInt, roleId)
        .query('SELECT COUNT(*) AS Total FROM dbo.RolPermiso WHERE RolId = @roleId');
      const isAdmin = roleCode === 'ADMINISTRADOR';
      if (!isAdmin && countResult.recordset[0].Total > 0) continue;

      for (const permissionCode of permissionCodes) {
        await new sql.Request(transaction)
          .input('roleId', sql.SmallInt, roleId)
          .input('permissionCode', sql.VarChar(80), permissionCode)
          .query(`INSERT INTO dbo.RolPermiso (RolId, PermisoId)
            SELECT @roleId, p.PermisoId FROM dbo.Permiso p
            WHERE p.Codigo = @permissionCode
              AND NOT EXISTS (SELECT 1 FROM dbo.RolPermiso rp WHERE rp.RolId = @roleId AND rp.PermisoId = p.PermisoId);`);
      }
    }
    await new sql.Request(transaction).query(`
      DELETE rp
      FROM dbo.RolPermiso rp
      INNER JOIN dbo.Rol r ON r.RolId = rp.RolId
      INNER JOIN dbo.Permiso p ON p.PermisoId = rp.PermisoId
      WHERE r.Codigo IN ('ADMINISTRADOR', 'ADMIN')
        AND p.Codigo = 'candidate-portal:read';
    `);
    await transaction.commit();
    console.log('Catálogo de permisos y asignaciones iniciales preparados sin cambiar credenciales.');
  } catch (error) {
    await transaction.rollback();
    throw error;
  } finally {
    await pool.close();
  }
}

run().catch((error) => {
  console.error('No fue posible preparar los permisos:', error.message);
  process.exit(1);
});
