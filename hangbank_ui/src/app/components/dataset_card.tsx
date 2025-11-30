import {
  AutoStories,
  Delete,
  OpenInNew,
  SmartToy,
} from "@mui/icons-material";
import { Box, IconButton, Paper, Tooltip, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import ConfirmationDialog from "./dialogs/confirm-dialog";
import api from "../axios";
import { Severity, useSnackbar } from "../contexts/SnackbarProvider";

export enum ProjectType {
  Corpus = 1,
  Convo = 2,
}

interface DatasetCardProps {
  id: string;
  title: string;
  corpusName?: string;
  language: string;
  actualBlocks?: number;
  totalBlocks?: number;
  speakerName: string;
  type: ProjectType;
}

export default function DatasetCard({
  id,
  title,
  type,
  corpusName,
  language,
  actualBlocks,
  totalBlocks,
  speakerName,
}: DatasetCardProps) {
  const { t } = useTranslation("common");
  const { showMessage } = useSnackbar();
  const router = useRouter();
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  const deleteDataset = async () => {
    try{
      const res = await api.delete(`/dataset/${id}`);
      showMessage(t("delete_success", Severity.info));
      window.location.reload();
    } catch(err){
      showMessage(t("delete_fail", Severity.error));
    }
  };

  return (
    <>
      <Paper
      elevation={3}
      sx={{
        padding: 2,
        width: "23vw",
        height: "21vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* === TOP ROW === */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6">{title}</Typography>

        {type === ProjectType.Corpus ? <AutoStories /> : <SmartToy />}
      </Box>

      {/* === MIDDLE EXPANDING SECTION === */}
      <Box
        sx={{
          flexGrow: 1,     // <-- THIS makes the middle expand
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",  // Center contents vertically inside the free space
          gap: 0.5,
        }}
      >
        {corpusName && (
          <Typography variant="h6">Corpus: {corpusName}</Typography>
        )}

        {actualBlocks != null && totalBlocks != null && (
          <Typography variant="body1">
            {actualBlocks}/{totalBlocks}
          </Typography>
        )}

        
      </Box>

      {/* === BOTTOM ROW === */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
        <Typography variant="body1">{language}</Typography>
        <Typography variant="body1">
          {t("speaker")}: {speakerName}
        </Typography>
        </div>

        <div style={{
          alignSelf: "end",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: 3,
        }}>
        <Tooltip title={t("delete")}>
        <IconButton
          onClick={() => setConfirmDialogOpen(true)}
          size="large"
          color="primary"
          sx={{ padding: 0, margin: 0, alignSelf: "end" }}
        >
          <Delete />
        </IconButton>
        </Tooltip>
        <Tooltip title={t("open")}>
        <IconButton
          onClick={() => router.push(`/my_datasets/overview/${id}/${type === ProjectType.Corpus ? "corpus" : "convo"}`)}
          size="large"
          color="primary"
          sx={{ padding: 0, margin: 0, alignSelf: "end" }}
        >
          <OpenInNew />
        </IconButton>
        </Tooltip>
        </div>
      </Box>
    </Paper>
    <ConfirmationDialog 
      open={confirmDialogOpen}
      title={t("delete_confirm_title")}
      message={t("delete_confirm_message")}
      confirmText={t("confirm")}
      cancelText={t("cancel")}
      onConfirm={() => {
        setConfirmDialogOpen(false);
        deleteDataset();
      }}
      onCancel={() => setConfirmDialogOpen(false)}
    />
    </>
  );
}
