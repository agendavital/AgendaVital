import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { restoreSession } from '../features/auth/authSlice';
import {
  getRoleAccessMatrix,
  saveRolePermissions,
} from '../services/accessControlService';
import '../styles/access-control.css';

const MODULE_LABELS = {
  dashboard: 'Panel principal',
  candidates: 'Candidatos',
  processes: 'Procesos',
  'exam-requests': 'Exámenes',
  appointments: 'Citas',
  'clinic-management': 'Clínicas y horarios',
  'medical-staff': 'Personal médico',
  audit: 'Auditoría',
  documents: 'Documentos',
  'medical-results': 'Resultados médicos',
  reports: 'Reportes',
  notifications: 'Notificaciones',
  'candidate-portal': 'Mi proceso',
  'access-control': 'Permisos por rol',
};

const ACTION_LABELS = {
  read: 'Consultar',
  create: 'Crear',
  manage: 'Administrar',
};

function groupPermissions(permissions) {
  const groups = new Map();
  for (const permission of permissions) {
    const [module, action] = permission.Codigo.split(':');
    const group = groups.get(module) ?? [];
    group.push({ ...permission, action });
    groups.set(module, group);
  }
  return [...groups.entries()].map(([key, items]) => ({
    key,
    label: MODULE_LABELS[key] ?? key,
    permissions: items,
  }));
}

export default function AccessControlPage() {
  const dispatch = useDispatch();
  const [matrix, setMatrix] = useState({ roles: [], permissions: [], adminOnlyPermissions: [], rolePermissionPolicies: {} });
  const [savedMatrix, setSavedMatrix] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [savingRoleId, setSavingRoleId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const groups = useMemo(
    () => groupPermissions(matrix.permissions),
    [matrix.permissions],
  );

  const loadMatrix = useCallback(async () => {
    setError('');
    const data = await getRoleAccessMatrix();
    setMatrix(data);
    setSavedMatrix(
      Object.fromEntries(
        data.roles.map((role) => [role.id, [...role.permissions].sort()]),
      ),
    );
  }, []);

  useEffect(() => {
    let isCurrent = true;
    getRoleAccessMatrix()
      .then((data) => {
        if (!isCurrent) return;
        setMatrix(data);
        setSavedMatrix(
          Object.fromEntries(
            data.roles.map((role) => [role.id, [...role.permissions].sort()]),
          ),
        );
      })
      .catch((loadError) => {
        if (isCurrent) {
          setError(loadError.message ?? 'No se pudo cargar la matriz de permisos.');
        }
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false);
      });
    return () => {
      isCurrent = false;
    };
  }, []);

  function togglePermission(roleId, code) {
    setSuccess('');
    setMatrix((current) => ({
      ...current,
      roles: current.roles.map((role) => {
        if (role.id !== roleId || role.locked) return role;
        const enabled = role.permissions.includes(code);
        return {
          ...role,
          permissions: enabled
            ? role.permissions.filter((permission) => permission !== code)
            : [...role.permissions, code],
        };
      }),
    }));
  }

  async function handleSave(role) {
    setSavingRoleId(role.id);
    setError('');
    setSuccess('');
    try {
      const permissions = [...role.permissions].sort();
      await saveRolePermissions(role.id, permissions);
      await loadMatrix();
      await dispatch(restoreSession()).unwrap();
      setSuccess(`Permisos de ${role.name} guardados correctamente.`);
    } catch (saveError) {
      setError(saveError.message ?? 'No se pudieron guardar los permisos.');
    } finally {
      setSavingRoleId(null);
    }
  }

  return (
    <section className="page-stack access-control-page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Seguridad y perfiles</p>
          <h1>Permisos por rol</h1>
          <p>Define qué módulos y acciones puede realizar cada perfil.</p>
        </div>
      </div>

      <p className="alert alert-warning">
        Los permisos también se verifican en el servidor. El perfil Administrador
        permanece protegido. Auditoría, administración de clínicas, personal médico
        y esta matriz se reservan a Administración porque permiten acciones globales.
      </p>
      {error ? <p className="alert alert-error" role="alert">{error}</p> : null}
      {success ? <p className="alert alert-success" role="status">{success}</p> : null}
      {isLoading ? <p role="status">Cargando perfiles y permisos…</p> : null}

      {!isLoading ? (
        <div className="access-control-page__roles">
          {matrix.roles.map((role) => {
            const current = [...role.permissions].sort();
            const initial = savedMatrix[role.id] ?? [];
            const isDirty = current.join('|') !== initial.join('|');

            return (
              <Card className="access-control-role" key={role.id}>
                <div className="access-control-role__heading">
                  <div>
                    <h2>{role.name}</h2>
                    <p>{role.description ?? 'Permisos del perfil'}</p>
                  </div>
                  {role.locked ? <span className="access-control-role__locked">Protegido</span> : null}
                </div>

                <div className="access-control-role__groups">
                  {groups.map((group) => (
                    <fieldset className="access-control-group" key={group.key}>
                      <legend>{group.label}</legend>
                      {group.permissions.map((permission) => (
                        <label key={permission.Codigo}>
                          <input
                            type="checkbox"
                            checked={role.permissions.includes(permission.Codigo)}
                            disabled={
                              role.locked || savingRoleId === role.id ||
                              matrix.adminOnlyPermissions?.includes(permission.Codigo) ||
                              (matrix.rolePermissionPolicies?.[permission.Codigo] &&
                                !matrix.rolePermissionPolicies[permission.Codigo].includes(role.code))
                            }
                            onChange={() => togglePermission(role.id, permission.Codigo)}
                          />
                          <span>
                            {ACTION_LABELS[permission.action] ?? permission.action}
                          </span>
                        </label>
                      ))}
                    </fieldset>
                  ))}
                </div>

                {!role.locked ? (
                  <div className="access-control-role__actions">
                    <Button
                      type="button"
                      onClick={() => handleSave(role)}
                      disabled={!isDirty || savingRoleId !== null}
                    >
                      {savingRoleId === role.id ? 'Guardando…' : 'Guardar permisos'}
                    </Button>
                  </div>
                ) : null}
              </Card>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}
