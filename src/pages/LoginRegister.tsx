
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box } from "@mui/material";
import { styled } from "@mui/system";

import logoImage from "@/assets/logo.png";
import LoginForm from "@/components/forms/LoginForm";
import type { LoginCredentials } from "@/components/forms/LoginForm";
import Register from "@/components/auth/Register";
import { useAuth } from "@/hooks/useAuth";
import type { TipoErrorLogin } from "@/contexts/AuthContextDefinition";

const StyledPageContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "100vh",
  backgroundColor: "#FFFFFF",
  padding: theme.spacing(3),
}));

type ViewState = "login" | "register";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<TipoErrorLogin | null>(null);

  // Mostrar directamente el formulario de inicio de sesión
  const [view, setView] = useState<ViewState>("login");

  const handleLoginSubmit = async ({
    email,
    password,
  }: LoginCredentials) => {
    setError(null);
    setErrorType(null);

    try {
      const result = await login(email, password);

      if (result.success) {
        navigate("/home", {
          replace: true,
          state: { fromLogin: true },
        });
      } else {
        setError(
          result.error ??
            "No pudimos conectar con el servidor. Inténtalo en un momento."
        );

        setErrorType(result.errorType ?? "conexion");
      }
    } catch {
      setError(
        "No pudimos conectar con el servidor. Inténtalo en un momento."
      );
      setErrorType("conexion");
    }
  };

  const handleRegisterSubmit = (_formData: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => {
    
  };

  const handleBackToLogin = () => {
    setView("login");
    setError(null);
    setErrorType(null);
  };

  return (
    <StyledPageContainer>
      {/* Logo principal */}
      <Box
        component="img"
        src={logoImage}
        alt="La gran OCASIÓN Logo"
        sx={{
          maxWidth: "100%",
          height: "auto",
          marginBottom: "40px",
          display: "block",
          width: "350px",
        }}
      />

      {/* Formulario de acceso */}
      {view === "login" ? (
        <LoginForm
          onLoginSubmit={handleLoginSubmit}
          error={error}
          errorType={errorType}
        />
      ) : (
        <Register
          onRegisterSubmit={handleRegisterSubmit}
          onBackToLogin={handleBackToLogin}
        />
      )}
    </StyledPageContainer>
  );
};

export default LoginPage;
