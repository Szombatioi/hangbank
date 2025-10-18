"use client";
import Image from "next/image";
import styles from "./page.module.css";
import {
  Button,
  CircularProgress,
  IconButton,
  Paper,
  Tooltip,
  Typography,
} from "@mui/material";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowCircleUp, Close, Upload } from "@mui/icons-material";
import axios from "axios";
import api from "./axios";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { t } = useTranslation("common");

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

  const handleUpload = () => {
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try{
      api.post("/corpus/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("Success");
    } catch(err){
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
          </div>
        </>
      )}
    </Paper>
  );
}
