"use client";

import api, { setAuthToken } from "@/app/axios";
import { Severity, useSnackbar } from "@/app/contexts/SnackbarProvider";
import { Box, Button, Divider, Grid, MenuItem, Paper, Select, TextField, Typography } from "@mui/material";
import { t } from "i18next";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const {showMessage} = useSnackbar();

  const router = useRouter();

  const handleLogin = async () => {
    try{
      const res = await api.post("/api/auth/login", {
        email: email,
        password: password,
      });
      console.log(res.data);
      setAuthToken(res.data.access_token);
      showMessage(t("successful_login"), Severity.success);
      router.push("/");
    }catch(err){
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
