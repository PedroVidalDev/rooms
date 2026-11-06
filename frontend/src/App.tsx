import { AuthProvider } from "./contexts/AuthContext/provider";
import { AppRoutes } from "./Routes";

export const App = () => {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
};

