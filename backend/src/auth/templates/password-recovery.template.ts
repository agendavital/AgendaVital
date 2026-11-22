type PasswordRecoveryEmailInput = {
  name: string;
  recoveryUrl: string;
  logoUrl: string;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function buildPasswordRecoveryEmail({
  name,
  recoveryUrl,
  logoUrl,
}: PasswordRecoveryEmailInput) {
  const safeName = escapeHtml(name);
  const safeRecoveryUrl = escapeHtml(recoveryUrl);
  const safeLogoUrl = escapeHtml(logoUrl);

  return {
    text: [
      `Hola ${name},`,
      '',
      'Recibimos una solicitud para restablecer la contraseña de tu cuenta de AgendaVital.',
      '',
      'Para continuar, abre este enlace. Es válido durante 15 minutos:',
      recoveryUrl,
      '',
      'Si no solicitaste este cambio, ignora este correo. Tu contraseña actual seguirá siendo válida.',
      '',
      'AgendaVital | Gestión de salud ocupacional',
    ].join('\n'),
    html: `
      <!doctype html>
      <html lang="es">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <meta name="color-scheme" content="light">
          <title>Recupera tu acceso a AgendaVital</title>
        </head>
        <body style="margin:0;padding:0;background-color:#f1f5f8;font-family:Arial,Helvetica,sans-serif;color:#17324d;">
          <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
            Restablece tu contraseña de AgendaVital mediante un enlace seguro válido durante 15 minutos.
          </div>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f1f5f8;padding:32px 12px;">
            <tr>
              <td align="center">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;background-color:#ffffff;border:1px solid #dce5ec;border-radius:16px;overflow:hidden;">
                  <tr>
                    <td style="padding:24px 32px;background-color:#0b2d45;border-bottom:4px solid #0f766e;">
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                          <td valign="middle" style="padding-right:14px;">
                            <img src="${safeLogoUrl}" width="48" height="48" alt="Logo de AgendaVital" style="display:block;width:48px;height:48px;border:0;border-radius:10px;">
                          </td>
                          <td valign="middle" style="font-size:24px;line-height:1.2;font-weight:700;color:#ffffff;">
                            AgendaVital
                            <div style="margin-top:5px;font-size:12px;line-height:1.4;font-weight:400;letter-spacing:0.5px;color:#c7d9e6;">
                              GESTIÓN DE SALUD OCUPACIONAL
                            </div>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:36px 32px 16px;">
                      <p style="margin:0 0 10px;font-size:13px;line-height:1.4;font-weight:700;letter-spacing:0.8px;text-transform:uppercase;color:#0f766e;">
                        Recuperación de acceso
                      </p>
                      <h1 style="margin:0 0 20px;font-size:28px;line-height:1.25;color:#102a43;">
                        Restablece tu contraseña
                      </h1>
                      <p style="margin:0 0 16px;font-size:16px;line-height:1.65;color:#334e68;">
                        Hola ${safeName},
                      </p>
                      <p style="margin:0 0 24px;font-size:16px;line-height:1.65;color:#334e68;">
                        Recibimos una solicitud para cambiar la contraseña de tu cuenta de AgendaVital. Usa el botón para crear una nueva contraseña y volver a ingresar de forma segura.
                      </p>
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 auto 24px;">
                        <tr>
                          <td align="center" bgcolor="#0d6e4e" style="border-radius:9px;">
                            <a href="${safeRecoveryUrl}" target="_blank" style="display:inline-block;padding:15px 28px;border:1px solid #0d6e4e;border-radius:9px;color:#ffffff;font-size:16px;line-height:1.2;font-weight:700;text-decoration:none;">
                              Recuperar contraseña
                            </a>
                          </td>
                        </tr>
                      </table>
                      <p style="margin:0 0 8px;font-size:14px;line-height:1.6;color:#52677c;">
                        El enlace vence en <strong>15 minutos</strong> y solo se puede usar una vez.
                      </p>
                      <p style="margin:0;font-size:14px;line-height:1.6;color:#52677c;">
                        Si el botón no funciona, copia y pega este enlace en tu navegador:
                      </p>
                      <p style="margin:8px 0 0;word-break:break-all;font-size:13px;line-height:1.6;">
                        <a href="${safeRecoveryUrl}" target="_blank" style="color:#0f766e;text-decoration:underline;">${safeRecoveryUrl}</a>
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:20px 32px 28px;">
                      <div style="height:1px;background-color:#e2e8f0;"></div>
                      <p style="margin:20px 0 8px;font-size:14px;line-height:1.6;color:#52677c;">
                        Si no solicitaste este cambio, ignora este correo. Tu contraseña actual seguirá siendo válida.
                      </p>
                      <p style="margin:0;font-size:12px;line-height:1.6;color:#718096;">
                        Este mensaje fue generado automáticamente por AgendaVital. Por seguridad, no respondas a este correo.
                      </p>
                    </td>
                  </tr>
                </table>
                <p style="margin:18px 0 0;font-size:12px;line-height:1.5;color:#718096;text-align:center;">
                  AgendaVital · Gestión de salud ocupacional
                </p>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  };
}
