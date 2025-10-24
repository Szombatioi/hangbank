"use client";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  Select,
  Divider,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { useSnackbar, Severity } from "@/app/contexts/SnackbarProvider";
import api from "@/app/axios";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const { t } = useTranslation("common");
  const router = useRouter();
  const { showMessage } = useSnackbar();

  // State for all fields
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [gender, setGender] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const handleRegister = async () => {
    // Basic validation
    if (
      !username ||
      !name ||
      !birthdate ||
      !gender ||
      !email ||
      !password ||
      !passwordConfirm
    ) {
      showMessage(t("pls_fill_all_fields"), Severity.error);
      return;
    }

    if (password !== passwordConfirm) {
      showMessage(t("passwords_do_not_match"), Severity.error);
      return;
    }
    console.log("He");
    //API call
    try{
        const res = await api.post("/api/auth/register", {username,
            name,
            birthdate,
            gender,
            email,
            password,
        });
        console.log("Success");
        showMessage(t("registration_success"), Severity.success);        
        router.push("/");
    } catch(err){
        console.log("Error");
        showMessage(t("user_aready_exists"), Severity.error);
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
          minHeight: "50%",
          padding: 4,
          zIndex: 1,
        }}
        elevation={3}
      >
        <Typography variant="h4" align="center" gutterBottom>
          {t("register")}
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

          {/* Password Confirm */}
          <Grid size={12}>
            <TextField
              fullWidth
              variant="outlined"
              label={t("confirm_password")}
              type="password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
            />
          </Grid>

          <Grid size={12}>
            <Divider />
          </Grid>

          {/* Username */}
          <Grid size={12}>
            <TextField
              fullWidth
              variant="outlined"
              label={t("username")}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </Grid>

          {/* Name */}
          <Grid size={12}>
            <TextField
              fullWidth
              variant="outlined"
              label={t("name")}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Grid>

          {/* Birthdate */}
          <Grid size={12}>
            <TextField
              fullWidth
              variant="outlined"
              label={t("birthdate")}
              type="date"
              InputLabelProps={{ shrink: true }}
              value={birthdate}
              onChange={(e) => setBirthdate(e.target.value)}
            />
          </Grid>

          {/* Gender */}
          <Grid size={12}>
            <Select
              fullWidth
              id="gender-select"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              displayEmpty
            >
              <MenuItem disabled value="">
                <em>{t("select_a_gender")}</em>
              </MenuItem>
              <MenuItem value="Male">{t("male")}</MenuItem>
              <MenuItem value="Female">{t("female")}</MenuItem>
              <MenuItem value="Other">{t("other")}</MenuItem>
            </Select>
          </Grid>

          {/* Register Button */}
          <Grid
            size={12}
            sx={{ display: "flex", justifyContent: "center", mt: 2 }}
          >
            <Button
              variant="contained"
              color="primary"
              onClick={handleRegister}
            >
              {t("register")}
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}
