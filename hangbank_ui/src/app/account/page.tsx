"use client";

import { useEffect, useState } from "react";
import api from "../axios";
import { useSession } from "next-auth/react";
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
} from "@mui/material";
import { t } from "i18next";
import { Severity, useSnackbar } from "../contexts/SnackbarProvider";

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
  const { data: session } = useSession();
  const { language, setLanguage } = useLanguage();
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageType | null>(null);
  const [selectedLanguageId, setSelectedLanguageId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const { showMessage } = useSnackbar();
  const [availableLanguages, setAvailableLanguages] = useState<LanguageType[]>([]);

  useEffect(() => {
    async function fetchUserSettings() {
      try {
        const res = await api.get<UserSettingsType>(
          `/user-settings/${session?.user.id}`
        ); //TODO: rewrite with token access (FE does nothing...?)
        setUserSettings(res.data);
        setIsLoading(false);
      } catch (err) {
        showMessage(t("fetch_settings_fail"), Severity.error);
      }
    }

    async function fetchAvailableLanguages() {
        try {
            const res = await api.get<LanguageType[]>(
              `/language`
            );
            setAvailableLanguages(res.data.filter(l => l.isTranslated));
            console.log(res.data.filter(l => l.isTranslated));
            setIsLoading(false);
          } catch (err) {
            showMessage(t("fetch_languages_fail"), Severity.error);
          }
    }

    fetchAvailableLanguages();
    fetchUserSettings();
  }, []);

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
    try{
        const res = await api.put(`/user-settings/${session?.user.id}`, {languageId: language.id});
        //TODO: add LanguageType when i retrieve the languages
        //then when i select a new language, set with setLanguage(language.language)
        //Then save with api(...language.id...)
    } catch(err){
        showMessage(t("settings_update_fail"), Severity.error);
    }

    setIsLoading(false);
  };

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
                }}
              >
                <Typography variant="h6">{t("language")}:</Typography>
                <FormControl sx={{ minWidth: 120 }} size="small">
                <Select
  value={selectedLanguageId}
  onChange={(e) => {
    const langId = e.target.value;
    setSelectedLanguageId(langId);

    const lang = availableLanguages.find((l) => l.id === langId);
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
            </Paper>
          </Box>
        </>
      )}
    </>
  );
}
