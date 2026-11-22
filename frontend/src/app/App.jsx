import { useEffect } from "react";
import { useDispatch } from "react-redux";
import AppRouter from "../routes/AppRouter";
import { restoreSession } from "../features/auth/authSlice";
import "../styles/application.css";
import "../styles/responsive-navigation.css";

export default function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(restoreSession());
  }, [dispatch]);

  return <AppRouter />;
}
