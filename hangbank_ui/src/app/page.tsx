"use client";
import Image from "next/image";
import styles from "./page.module.css";
import {
  Button,
  CircularProgress,
  Grid,
  IconButton,
  Paper,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowCircleUp, Close, Upload } from "@mui/icons-material";
import axios from "axios";
import api from "./axios";
import { Severity, useSnackbar } from "./contexts/SnackbarProvider";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { t } = useTranslation("common");

  const [corpusName, setCorpusName] = useState<string>("");
  const [corpusLanguage, setCorpusLanguage] = useState<string>("");
  const [corpusType, setCorpusType] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleReset = () => {
    setFile(null);
    if (inputRef.current) {
      inputRef.current.value = ""; // reset the DOM input
    }
  };

  const { showMessage } = useSnackbar();

  const handleUpload = () => {
    if (!file) {
      showMessage(t("pls_upload_file"), Severity.error);
      return;
    }

    if(!corpusName || !corpusLanguage){
      showMessage(t("pls_fill_all_fields"), Severity.error);
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("name", corpusName);
    formData.append("language", corpusLanguage);
    if(corpusType) formData.append("type", corpusType);
    
    try {
      api.post("/corpus/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("Success");
    } catch (err) {
      console.log("Fail");
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        padding: "20px",
        margin: "20px",
        minHeight: "300px",
      }}
    >
      {isUploading ? (
        <>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <CircularProgress size="3rem" />
          </div>
        </>
      ) : (
        <>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Typography variant="h4" gutterBottom>
              {t("upload_corpus")}
            </Typography>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <div style={{ display: "flex", flexDirection: "row" }}>
                <input
                  accept=".txt,.doc,.docx,.pdf"
                  id="upload-file"
                  type="file"
                  key={file ? file.name : "empty"}
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                />
                <label htmlFor="upload-file">
                  <Button variant="contained" component="span">
                    {t("upload_file")}
                  </Button>
                </label>
                {file && (
                  <Tooltip title={t("start_uploading")}>
                    <IconButton disabled={!file} onClick={handleUpload}>
                      <ArrowCircleUp />
                    </IconButton>
                  </Tooltip>
                )}
              </div>

              <div>
                {file && (
                  <>
                    <span style={{ marginLeft: "10px" }}>{file.name}</span>
                    <IconButton onClick={() => setFile(null)}>
                      <Close />
                    </IconButton>
                  </>
                )}
              </div>
            </div>
            {/* Text fields */}
            <div style={{margin: 16, width: "50%"}}>
              <Grid container spacing={2}>
                {/* Name */}
                <Grid size={3} />
                <Grid size={3}>
                  <Typography variant="h6">{t("name")}</Typography>
                </Grid>
                <Grid size={6}>
                  <TextField
                    variant="outlined"
                    size="small"
                    fullWidth
                    placeholder="Enter title"
                    value={corpusName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setCorpusName(e.target.value);
                    }}
                  />
                </Grid>

                {/* Language */}
                <Grid size={3} />
                <Grid size={3}><Typography variant="h6">{t("language")}</Typography></Grid>
                <Grid size={6}>
                  <TextField
                    variant="outlined"
                    size="small"
                    fullWidth
                    placeholder="Enter title"
                    value={corpusLanguage}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setCorpusLanguage(e.target.value);
                    }}
                  />
                </Grid>

                {/* Type - e.g. good for news reading */}
                <Grid size={3} />
                <Grid size={3}><Typography variant="h6">{t("type")}</Typography></Grid>
                <Grid size={6}>
                  <TextField
                    variant="outlined"
                    size="small"
                    fullWidth
                    placeholder="Enter title"
                    value={corpusType}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setCorpusType(e.target.value);
                    }}
                  />
                </Grid>
              </Grid>
            </div>
          </div>
        </>
      )}
    </Paper>
  );
}
