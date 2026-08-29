// src/pages/LoginRegister.jsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box } from "@mui/material";
import { styled, keyframes } from "@mui/system";
import Login from "../components/Login";
import logoImage from "../assets/favicon.png";
import LoginForm from "../components/LoginForm";
import Register from "../components/auth/Register";
import { useAuth } from "../hooks/useAuth";

const moveCloudLeftToCenter = keyframes`
  0% { transform: translateX(0px); }
  50% { transform: translateX(110px); }
  100% { transform: translateX(0px); }
`;

const moveCloudRightToCenter = keyframes`
  0% { transform: translateX(0px); }
  50% { transform: translateX(-110px); }
  100% { transform: translateX(0px); }
`;

const moveOrangeCloudLeft = keyframes`
  0% { transform: translateX(0px) scale(0.9); }
  50% { transform: translateX(95px) scale(0.92); }
  100% { transform: translateX(0px) scale(0.9); }
`;

const moveOrangeCloudRight = keyframes`
  0% { transform: translateX(0px) scale(0.9); }
  50% { transform: translateX(-95px) scale(0.92); }
  100% { transform: translateX(0px) scale(0.9); }
`;

const flyBird = keyframes`
  0% { transform: translateX(-70px) translateY(0px) scale(1.2); opacity: 0.7; }
  50% { transform: translateX(180px) translateY(-22px) scale(1.5); opacity: 1; }
  100% { transform: translateX(400px) translateY(3px) scale(1.2); opacity: 0.7; }
`;

const flyAirplane = keyframes`
  0% { transform: translateX(-120px) translateY(20px) scale(0.9); }
  50% { transform: translateX(450px) translateY(-10px) scale(0.95); }
  100% { transform: translateX(950px) translateY(5px) scale(0.9); }
`;

const floatBalloon = keyframes`
  0% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-12px) rotate(1.5deg); }
  100% { transform: translateY(0px) rotate(0deg); }
`;

const boatFloat = keyframes`
  0% { transform: translateY(0px) rotate(-1deg); }
  50% { transform: translateY(-3px) rotate(2deg); }
  100% { transform: translateY(0px) rotate(-1deg); }
`;

const dolphinDive1 = keyframes`
  0% { transform: translateY(40px) scale(0.8); opacity: 0; }
  30% { transform: translateY(-10px) scale(1); opacity: 1; }
  60% { transform: translateY(30px) scale(0.9); opacity: 1; }
  100% { transform: translateY(45px) scale(0.7); opacity: 0; }
`;

const dolphinDive2 = keyframes`
  0% { transform: translateY(35px) scale(0.7); opacity: 0; }
  40% { transform: translateY(-15px) scale(1); opacity: 1; }
  70% { transform: translateY(25px) scale(0.9); opacity: 1; }
  100% { transform: translateY(40px) scale(0.7); opacity: 0; }
`;

const waveSwellBack = keyframes`
  0% { transform: translateY(4px) scaleY(0.98); }
  100% { transform: translateY(-8px) scaleY(1.05); }
`;

const waveSwellFront = keyframes`
  0% { transform: translateY(0px) scaleY(1); }
  100% { transform: translateY(-14px) scaleY(1.08); }
`;

const LandingHero = styled(Box)(({ theme }) => ({
  position: "relative",
  width: "100vw",
  minHeight: "100vh",
  background: "linear-gradient(180deg, #eaf2fc 0%, #c4e0f9 100%)",
  overflowX: "hidden",
  overflowY: "auto",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  "&::before": {
    content: '""',
    position: "absolute",
    top: "30px",
    left: "30px",
    width: "250px",
    height: "75px",
    background: "rgba(135, 175, 205, 0.85)",
    borderRadius: "50px",
    boxShadow: "65px 20px 0 15px rgba(125, 165, 195, 0.8), 140px -8px 0 10px rgba(110, 150, 180, 0.7)",
    zIndex: 1,
    animation: `${moveCloudLeftToCenter} 10s ease-in-out infinite`,
  },
  "&::after": {
    content: '""',
    position: "absolute",
    top: "30px",
    right: "30px",
    width: "230px",
    height: "70px",
    background: "rgba(130, 170, 200, 0.85)",
    borderRadius: "50px",
    boxShadow: "-65px 18px 0 14px rgba(120, 160, 190, 0.8), -140px -10px 0 10px rgba(105, 145, 175, 0.7)",
    zIndex: 1,
    animation: `${moveCloudRightToCenter} 10s ease-in-out infinite`,
  },
}));

const OrangeCloudLeft = styled("div")({
  position: "absolute",
  top: "55px",
  left: "220px",
  width: "190px",
  height: "60px",
  background: "rgba(224, 150, 95, 0.75)",
  borderRadius: "50px",
  boxShadow: "45px 12px 0 10px rgba(210, 135, 80, 0.7)",
  zIndex: 1,
  animation: `${moveOrangeCloudLeft} 11s ease-in-out infinite alternate`,
  pointerEvents: "none",
});

const OrangeCloudRight = styled("div")({
  position: "absolute",
  top: "50px",
  right: "210px",
  width: "180px",
  height: "55px",
  background: "rgba(224, 150, 95, 0.75)",
  borderRadius: "50px",
  boxShadow: "-45px 10px 0 10px rgba(210, 135, 80, 0.7)",
  zIndex: 1,
  animation: `${moveOrangeCloudRight} 11s ease-in-out infinite alternate`,
  pointerEvents: "none",
});

const StyledPageContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "100vh",
  width: "100%",
  position: "relative",
  padding: theme.spacing(3),
  zIndex: 3,
}));

const LandingEyebrow = styled("div")({
  fontFamily: "sans-serif",
  fontSize: "1.25rem",
  letterSpacing: "6px",
  color: "#123259",
  fontWeight: "bold",
  textTransform: "uppercase",
  marginTop: "15px",
  marginBottom: "15px",
  zIndex: 3,
  textAlign: "center",
});

const HotAirBalloon = styled("svg")({
  position: "absolute",
  top: "160px",
  right: "18%",
  width: "60px",
  height: "auto",
  zIndex: 2,
  transformOrigin: "center center",
  animation: `${floatBalloon} 6s ease-in-out infinite`,
});

const Airplane = styled("svg")({
  position: "absolute",
  top: "115px",
  left: "5%",
  width: "75px",
  height: "auto",
  zIndex: 2,
  animation: `${flyAirplane} 14s linear infinite`,
});

const BirdContainer1 = styled("div")({
  position: "absolute",
  top: "125px",
  left: "26%",
  zIndex: 2,
  animation: `${flyBird} 8s ease-in-out infinite`,
});

const BirdContainer2 = styled("div")({
  position: "absolute",
  top: "95px",
  left: "31%",
  zIndex: 2,
  animation: `${flyBird} 9.5s ease-in-out infinite 1.2s`,
});

const BirdContainer3 = styled("div")({
  position: "absolute",
  top: "140px",
  right: "32%",
  zIndex: 2,
  animation: `${flyBird} 8.5s ease-in-out infinite 2.5s`,
});

const WavesFooter = styled("div")({
  position: "absolute",
  bottom: 0,
  left: 0,
  width: "100vw",
  height: "170px",
  pointerEvents: "none",
  zIndex: 2,
  overflow: "hidden",
});

const Boat = styled("svg")({
  position: "absolute",
  bottom: "10px",
  left: "16%",
  width: "72px",
  height: "auto",
  zIndex: 4,
  transformOrigin: "bottom center",
  animation: `${boatFloat} 4s ease-in-out infinite`,
});

const Dolphin1 = styled("svg")({
  position: "absolute",
  bottom: "20px",
  right: "24%",
  width: "55px",
  height: "auto",
  zIndex: 4,
  animation: `${dolphinDive1} 4s ease-in-out infinite`,
});

const Dolphin2 = styled("svg")({
  position: "absolute",
  bottom: "10px",
  right: "18%",
  width: "48px",
  height: "auto",
  zIndex: 4,
  animation: `${dolphinDive2} 4.5s ease-in-out infinite 1.2s`,
});

const WaveLayer = styled("div")({
  position: "absolute",
  bottom: 0,
  left: 0,
  width: "100vw",
  height: "100%",
  "& svg": {
    width: "100vw",
    height: "140px",
    position: "absolute",
    bottom: 0,
    left: 0,
  },
});

const WaveBack = styled(WaveLayer)({
  opacity: 0.75,
  zIndex: 2,
  animation: `${waveSwellBack} 5s ease-in-out infinite alternate`,
});

const WaveFront = styled(WaveLayer)({
  zIndex: 3,
  animation: `${waveSwellFront} 3.5s ease-in-out infinite alternate`,
});

// Aviso posicionado más arriba (bottom: 95px) y con color negro (#000000)
const LandingTagline = styled("p")({
  position: "absolute",
  bottom: "95px",
  left: "50%",
  transform: "translateX(-50%)",
  width: "90%",
  textAlign: "center",
  fontSize: "0.95rem",
  fontWeight: "bold",
  color: "#000000",
  zIndex: 5,
  fontFamily: "sans-serif",
  textShadow: "0 1px 3px rgba(255,255,255,0.7)",
  margin: 0,
});

const LoginRegister = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState(null);
  const [view, setView] = useState("presentation");
  const logoUrl = logoImage;

  const handleRegistroClick = () => setView("register");
  const handleLoginClick = () => setView("login");

  const handleLoginSubmit = async ({ email, password }) => {
    setError(null);
    try {
      const result = await login(email, password);
      if (result.success) {
        navigate("/home", { state: { fromLogin: true } });
      } else {
        setError(result.error);
      }
    } catch {
      setError("Error inesperado al iniciar sesión");
    }
  };

  const handleRegisterSubmit = (formData) => {
    console.log("Datos de registro enviados:", formData);
  };

  const handleBackToLogin = () => setView("presentation");

  const content = (
    <StyledPageContainer>
      {view === "presentation" && (
        <>
          <LandingEyebrow>Bienvenido a</LandingEyebrow>

          <OrangeCloudLeft />
          <OrangeCloudRight />

          <HotAirBalloon viewBox="0 0 100 130" xmlns="http://www.w3.org/2000/svg">
            <path d="M50 5 C25 5, 10 30, 20 65 C25 82, 40 95, 47 100 L50 105 L53 100 C60 95, 75 82, 80 65 C90 30, 75 5, 50 5 Z" fill="#e8631f" />
            <path d="M50 5 C40 5, 32 30, 36 65 C38 78, 45 92, 47 100 L50 105 L50 5 Z" fill="#f7f2e7" opacity="0.9" />
            <path d="M50 5 C60 5, 68 30, 64 65 C62 78, 55 92, 53 100 L50 105 L50 5 Z" fill="#f7f2e7" opacity="0.6" />
            <line x1="46" y1="103" x2="44" y2="114" stroke="#123259" strokeWidth="1.5" />
            <line x1="54" y1="103" x2="56" y2="114" stroke="#123259" strokeWidth="1.5" />
            <rect x="42" y="114" width="16" height="12" rx="2" fill="#8b5a2b" stroke="#123259" strokeWidth="1.5" />
          </HotAirBalloon>

          <Airplane viewBox="0 0 100 60" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 30 L90 30 L75 22 L25 22 Z" fill="#ffffff" stroke="#123259" strokeWidth="2" strokeLinejoin="round" />
            <path d="M40 22 L60 8 L65 22 Z" fill="#f7f2e7" stroke="#123259" strokeWidth="2" strokeLinejoin="round" />
            <path d="M35 30 L55 45 L60 30 Z" fill="#e8631f" stroke="#123259" strokeWidth="2" strokeLinejoin="round" />
            <rect x="85" y="27" width="5" height="6" fill="#123259" />
          </Airplane>

          <BirdContainer1>
            <svg width="45" height="22" viewBox="0 0 30 15" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 12 Q 15 2, 28 12 Q 15 6, 2 12 Z" fill="#123259" opacity="0.85" />
            </svg>
          </BirdContainer1>
          <BirdContainer2>
            <svg width="35" height="18" viewBox="0 0 30 15" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 12 Q 15 2, 28 12 Q 15 6, 2 12 Z" fill="#123259" opacity="0.75" />
            </svg>
          </BirdContainer2>
          <BirdContainer3>
            <svg width="40" height="20" viewBox="0 0 30 15" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 12 Q 15 2, 28 12 Q 15 6, 2 12 Z" fill="#123259" opacity="0.8" />
            </svg>
          </BirdContainer3>

          <WavesFooter>
            <WaveBack>
              <svg viewBox="0 0 1440 320" preserveAspectRatio="none">
                <path fill="#2875c7" d="M0,192L48,197.3C96,203,192,213,288,197.3C384,181,480,139,576,138.7C672,139,768,181,864,197.3C960,213,1056,203,1152,197.3C1248,192,1344,192,1392,192L1440,192L1440,320L0,320Z"></path>
              </svg>
            </WaveBack>
            
            <Boat viewBox="0 0 100 90" xmlns="http://www.w3.org/2000/svg">
              <path d="M50 10 L50 55 L20 55 Z" fill="#f7f2e7" stroke="#123259" strokeWidth="2" strokeLinejoin="round" />
              <path d="M50 10 L50 55 L74 55 Z" fill="#ffffff" stroke="#123259" strokeWidth="2" strokeLinejoin="round" />
              <path d="M8 58 Q50 82 92 58 L82 70 Q50 86 18 70 Z" fill="#e8631f" stroke="#123259" strokeWidth="2" strokeLinejoin="round" />
              <rect x="48" y="8" width="3" height="4" fill="#123259" />
            </Boat>

            <Dolphin1 viewBox="0 0 110 85" xmlns="http://www.w3.org/2000/svg">
              <path d="M12,65 A60,60 0 0,1 90,28 A45,45 0 0,0 12,65 Z" fill="#0f4f9c" />
              <path d="M45,25 L51,5 L59,23 Z" fill="#0f4f9c" />
              <path d="M80,27 L103,15 L89,29 L103,41 L80,32 Z" fill="#0f4f9c" />
              <circle cx="21" cy="57" r="1.6" fill="#eaf5ff" />
            </Dolphin1>

            <Dolphin2 viewBox="0 0 110 85" xmlns="http://www.w3.org/2000/svg">
              <path d="M12,65 A60,60 0 0,1 90,28 A45,45 0 0,0 12,65 Z" fill="#1f6fc2" />
              <path d="M45,25 L51,5 L59,23 Z" fill="#1f6fc2" />
              <path d="M80,27 L103,15 L89,29 L103,41 L80,32 Z" fill="#1f6fc2" />
              <circle cx="21" cy="57" r="1.6" fill="#eaf5ff" />
            </Dolphin2>

            <WaveFront>
              <svg viewBox="0 0 1440 320" preserveAspectRatio="none">
                <path fill="#0f4f9c" d="M0,256L48,250.7C96,245,192,235,288,213.3C384,192,480,160,576,165.3C672,171,768,213,864,234.7C960,256,1056,256,1152,245.3C1248,235,1344,213,1392,202.7L1440,192L1440,320L0,320Z"></path>
              </svg>
            </WaveFront>
            <LandingTagline>Iniciá sesión para descubrir tu próxima gran aventura.</LandingTagline>
          </WavesFooter>
        </>
      )}

      <Box sx={{ zIndex: 3, display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
        <img
          src={logoUrl}
          alt="La gran OCASIÓN Logo"
          style={{
            maxWidth: "100%",
            height: "auto",
            marginBottom: "20px",
            display: "block",
            width: "300px",
          }}
        />

        {view === "presentation" ? (
          <Login imageUrl={logoUrl} onRegisterClick={handleRegistroClick} onLoginClick={handleLoginClick} />
        ) : view === "login" ? (
          <LoginForm onLoginSubmit={handleLoginSubmit} error={error} />
        ) : view === "register" ? (
          <Register onRegisterSubmit={handleRegisterSubmit} onBackToLogin={handleBackToLogin} />
        ) : null}
      </Box>
    </StyledPageContainer>
  );

  return view === "presentation" ? <LandingHero>{content}</LandingHero> : <Box sx={{ minHeight: "100vh", background: "linear-gradient(180deg, #eaf2fc 0%, #c4e0f9 100%)" }}>{content}</Box>;
};

export default LoginRegister;