import { useEffect } from "react";
import { useDispatch } from "react-redux";
import AppRouter from "../routes/AppRouter";
import { restoreSession } from "../features/auth/authSlice";

export default function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(restoreSession());
  }, [dispatch]);

  return <AppRouter />;
}
