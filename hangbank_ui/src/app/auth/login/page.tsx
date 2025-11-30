"use client";

import api from "@/app/axios"; // setAuthToken-t kivettük, nem itt használjuk
import { Severity, useSnackbar } from "@/app/contexts/SnackbarProvider";
import { useAuth } from "@/app/contexts/AuthContext"; // Importáljuk a hook-ot
import { Box, Button, Grid, Paper, TextField, Typography } from "@mui/material";
import { t } from "i18next";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { showMessage } = useSnackbar();
  
  // A Contextből vesszük a login függvényt
  const { login } = useAuth(); 
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const res = await api.post("/api/auth/login", {
        email: email,
        password: password,
      });

      // ITT A VÁLTOZÁS:
      // Nem mi állítjuk be a tokent és a routert, hanem átadjuk a contextnek.
      // Ez biztosítja, hogy a User state frissüljön, mielőtt az oldal vált.
      await login(res.data.access_token);
      
      showMessage(t("successful_login"), Severity.success);
      // A router.replace("/") már a context-ben történik
      
    } catch (err) {
      console.error(err);
      showMessage(t("invalid_credentials"), Severity.error);
    }
  };

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Background */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundImage: "url('/reg_bg.webp')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(4px)",
          zIndex: 0,
        }}
      />

      {/* Paper */}
      <Paper
        sx={{
          width: "30%",
          // minHeight: "50%",
          padding: 4,
          zIndex: 1,
        }}
        elevation={3}
      >
        <Typography variant="h4" align="center" gutterBottom>
          {t("login")}
        </Typography>

        <Grid container spacing={2}>
          {/* Email */}
          <Grid size={12}>
            <TextField
              fullWidth
              variant="outlined"
              label={t("email")}
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Grid>

          {/* Password */}
          <Grid size={12}>
            <TextField
              fullWidth
              variant="outlined"
              label={t("password")}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Grid>

          {/* Register Button */}
          <Grid
            size={12}
            sx={{ display: "flex", justifyContent: "center", mt: 2, flexDirection: "column" }}
          >
            <Button
              variant="contained"
              color="primary"
              onClick={handleLogin}
            >
              {t("login")}
            </Button>
            <Button onClick={()=>router.push("/auth/register")}>{t("register")}</Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}
