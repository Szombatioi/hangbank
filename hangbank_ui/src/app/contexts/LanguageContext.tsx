"use client";

import { createContext, useContext, useEffect, useState } from "react";
import i18n from "../i18n";
import { LanguageType } from "../account/page";
import api from "../axios";
import { Severity, useSnackbar } from "./SnackbarProvider";
import { useTranslation } from "react-i18next";

export type Language = string; //TODO: update this everytime you translate the page

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
});

export const useLanguage = () => useContext(LanguageContext);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
  const [availableLanguages, setAvailableLanguages] = useState<LanguageType[]>(
    []
  );
  const {showMessage} = useSnackbar();
  const {t} = useTranslation("common");

  useEffect(() => {
    async function fetchAvailableLanguages() {
      try {
        const res = await api.get<LanguageType[]>(`/language`);
        setAvailableLanguages(res.data.filter((l) => l.isTranslated));
        console.log(res.data.filter((l) => l.isTranslated));
      } catch (err) {
        showMessage(t("fetch_languages_fail"), Severity.error);
      }
    }

    fetchAvailableLanguages();
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("language") as Language;
    if (availableLanguages.some(l => l.code.split("-")[0] === stored)) {
      setLanguage(stored);
      i18n.changeLanguage(stored);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    i18n.changeLanguage(lang);
    localStorage.setItem("language", lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}
