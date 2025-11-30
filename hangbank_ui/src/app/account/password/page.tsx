"use client";

import { useState } from "react";
import {
  Box,
  Paper,
  TextField,
  Typography,
  Button,
  CircularProgress,
} from "@mui/material";
import { t } from "i18next";
import { useRouter } from "next/navigation";
import api, { getAuthToken } from "@/app/axios";
import { useAuth } from "@/app/contexts/AuthContext";
import { useSnackbar, Severity } from "@/app/contexts/SnackbarProvider";

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { showMessage } = useSnackbar();
  const router = useRouter();
  const { user } = useAuth();

  const handleSubmit = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      showMessage(t("pls_fill_all_fields"), Severity.error);
      return;
    }

    if (newPassword !== confirmPassword) {
      showMessage(t("passwords_do_not_match"), Severity.error);
      return;
    }

    setLoading(true);

    try {
      const token = getAuthToken();

      await api.put(
        "/user/change-password",
        {
          oldPassword: currentPassword,
          newPassword,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      showMessage(t("password_changed_successfully"), Severity.success);
      router.push("/account");
    } catch (error) {
      showMessage(t("password_change_failed"), Severity.error);
    }

    setLoading(false);
  };

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "start",
        paddingTop: "10vh",
      }}
    >
      <Paper elevation={3} sx={{ p: 4, width: "420px" }}>
        <Typography align="center" variant="h4" sx={{ mb: 4 }}>
          {t("change_password")}
        </Typography>

        <TextField
          label={t("current_password")}
          type="password"
          fullWidth
          sx={{ mb: 3 }}
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />

        <TextField
          label={t("new_password")}
          type="password"
          fullWidth
          sx={{ mb: 3 }}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />

        <TextField
          label={t("confirm_password")}
          type="password"
          fullWidth
          sx={{ mb: 4 }}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <Button
          variant="contained"
          fullWidth
          disabled={loading}
          onClick={handleSubmit}
        >
          {loading ? <CircularProgress size={20} /> : t("change_password")}
        </Button>
      </Paper>
    </Box>
  );
}
