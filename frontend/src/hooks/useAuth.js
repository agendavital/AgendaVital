import { useDispatch, useSelector } from "react-redux";
import { logout } from "../features/auth/authSlice";

export function useAuth() {
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);

  return {
    ...auth,
    isAuthenticated: Boolean(auth.user),
    signOut: () => dispatch(logout())
  };
}
