import { useSelector } from "react-redux";
import Card from "../components/ui/Card";

export default function NotificationsPage() {
  const notifications = useSelector((state) => state.data.notifications);

  return (
    <section className="page-stack">
      <div className="page-header">
        <div>
          <p className="eyebrow">Comunicaciones</p>
          <h1>Notificaciones</h1>
        </div>
      </div>
      {notifications.length ? (
        notifications.map((notification) => (
          <Card key={notification.id}>
            <h2>{notification.title}</h2>
            <p>{notification.message}</p>
          </Card>
        ))
      ) : (
        <Card>
          <p>No tienes notificaciones por ahora.</p>
        </Card>
      )}
    </section>
  );
}
