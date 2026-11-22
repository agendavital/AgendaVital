import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Card from "../components/ui/Card";
import { fetchNotifications, markNotificationRead } from "../features/data/dataSlice";
import { formatDate } from "../utils/formatters";
import "../styles/notifications.css";

export default function NotificationsPage() {
  const dispatch = useDispatch();
  const notifications = useSelector((state) => state.data.notifications);
  const status = useSelector((state) => state.data.notificationsStatus);
  const error = useSelector((state) => state.data.notificationsError);
  const unreadCount = notifications.filter((notification) => !notification.read).length;

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  return (
    <section className="page-stack notifications-page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Comunicaciones</p>
          <h1>Notificaciones</h1>
          <p className="notifications-page__description">
            Consulta avisos de tus procesos y citas de AgendaVital.
          </p>
        </div>
        <div className="notifications-page__header-actions">
          <span className="notifications-page__count">
            {unreadCount} sin leer
          </span>
          <button
            className="button button-secondary"
            type="button"
            onClick={() => dispatch(fetchNotifications())}
            disabled={status === "loading"}
          >
            {status === "loading" ? "Actualizando…" : "Actualizar"}
          </button>
        </div>
      </div>
      {error ? <p className="notifications-page__error" role="alert">{error}</p> : null}
      {status === "loading" && notifications.length === 0 ? (
        <div className="empty-state">Cargando notificaciones…</div>
      ) : notifications.length ? (
        <div className="notifications-page__list">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              className={`notification-card${notification.read ? "" : " notification-card--unread"}`}
            >
              <div className="notification-card__heading">
                <div>
                  <h2>{notification.title}</h2>
                  <time dateTime={notification.date}>{formatDate(notification.date)}</time>
                </div>
                {!notification.read ? (
                  <span className="notification-card__new">Nueva</span>
                ) : null}
              </div>
              <p>{notification.message}</p>
              {!notification.read ? (
                <button
                  className="button button-secondary notification-card__action"
                  type="button"
                  onClick={() => dispatch(markNotificationRead(notification.id))}
                >
                  Marcar como leída
                </button>
              ) : null}
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <p>{status === "failed" ? "No se pudieron cargar las notificaciones." : "No tienes notificaciones por ahora."}</p>
        </Card>
      )}
    </section>
  );
}
