"use client";

import { useEffect, useState } from "react";
import api, { getAuthToken, getUserByToken } from "../axios";
import { Language, useLanguage } from "../contexts/LanguageContext";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Typography,
  Grid,
  Box,
  CircularProgress,
  Button,
  TextField,
} from "@mui/material";
import { t } from "i18next";
import { Severity, useSnackbar } from "../contexts/SnackbarProvider";
import { useAuth } from "../contexts/AuthContext";
import { useRouter } from "next/navigation";
import { UpdateUserDto } from "@/dto/update-user-dto";

export interface LanguageType {
  id: string;
  code: string; //e.g. en-US
  name: string; //e.g. English (US)
  isTranslated?: boolean;
}

export interface UserSettingsType {
  language: LanguageType;
}

export default function AccountPage() {
  const [userSettings, setUserSettings] = useState<UserSettingsType | null>(
    null
  );
  const { language, setLanguage } = useLanguage();
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageType | null>(
    null
  );
  const [selectedLanguageId, setSelectedLanguageId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const { showMessage } = useSnackbar();
  const [availableLanguages, setAvailableLanguages] = useState<LanguageType[]>(
    []
  );
  const { user, loading } = useAuth();
  const [name, setName] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (!user) return;
    console.log("Loading: ", loading);
    console.log("User: ", user);
    async function fetchUserSettings() {
      try {
        const token = getAuthToken();
        const res = await api.get<UserSettingsType>(`/user-settings`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserSettings(res.data);
        setIsLoading(false);
      } catch (err) {
        console.error(err);
        showMessage(t("fetch_settings_fail"), Severity.error);
      }
    }

    async function fetchAvailableLanguages() {
      try {
        const res = await api.get<LanguageType[]>(`/language`);
        setAvailableLanguages(res.data.filter((l) => l.isTranslated));
        console.log(res.data.filter((l) => l.isTranslated));
        setIsLoading(false);
      } catch (err) {
        showMessage(t("fetch_languages_fail"), Severity.error);
      }
    }

    fetchAvailableLanguages();
    fetchUserSettings();
  }, [user, loading]);

  useEffect(() => {
    if (userSettings?.language) {
      setSelectedLanguageId(userSettings.language.id);
    }
  }, [userSettings]);

  const updateLanguageSettings = async (language: LanguageType) => {
    setIsLoading(true);
    //set new language on the frontend
    setLanguage(language.code.split("-")[0]);

    //update user settings on backend
    try {
      const token = await getAuthToken();
      const res = await api.put(
        `/user-settings`,
        {
          languageId: language.id,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      //TODO: add LanguageType when i retrieve the languages
      //then when i select a new language, set with setLanguage(language.language)
      //Then save with api(...language.id...)
    } catch (err) {
      showMessage(t("settings_update_fail"), Severity.error);
    }

    setIsLoading(false);
  };

  const setNewName = async () => {
    try{
      const data: UpdateUserDto = {
        name: name,
      };
      await api.put("/user", data, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`
        }
      });

      setName("");
      showMessage(t("save_success"), Severity.success);
    }catch(err){
      showMessage(t("save_fail"), Severity.success);
    }
  }

  return (
    <>
      {isLoading ? (
        <div style={{ alignSelf: "center" }}>
          <CircularProgress />
        </div>
      ) : (
        <>
          <Box
            sx={{
              position: "relative",
              width: "100%",
              height: "100vh",
              display: "flex",
              justifyContent: "center",
              alignItems: "start",
            }}
          >
            <Paper elevation={3} sx={{ p: 4, width: "50%" }}>
              <Typography align="center" variant="h4" sx={{ mb: 4 }}>
                {t("settings")}
              </Typography>
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 32,
                  marginTop: 32,
                  marginBottom: 16
                }}
              >
                <Typography variant="h6">{t("name")}:</Typography>

                <TextField
                  size="small"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t("enter_new_name")}
                  sx={{ width: "100%", maxWidth: 300 }} // expands but never exceeds 300px
                />
                <Button onClick={() => setNewName()} variant="contained">
                  {t("submit")}
                </Button>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 32,
                }}
              >
                <Typography variant="h6">{t("language")}:</Typography>
                <FormControl sx={{ minWidth: 120 }} size="small">
                  <Select
                    value={selectedLanguageId}
                    onChange={(e) => {
                      const langId = e.target.value;
                      setSelectedLanguageId(langId);

                      const lang = availableLanguages.find(
                        (l) => l.id === langId
                      );
                      if (lang) updateLanguageSettings(lang);
                    }}
                  >
                    {availableLanguages.map((l) => (
                      <MenuItem key={l.id} value={l.id}>
                        {l.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginTop: 32,
                }}
              >
                <Button onClick={() => router.push("account/password")} variant="contained">{t("change_password")}</Button>
              </div>
            </Paper>
          </Box>
        </>
      )}
    </>
  );
}
