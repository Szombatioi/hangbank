"use client";

import {
  AccessTime,
  AccessTimeFilled,
  CheckCircle,
  CheckCircleOutline,
  PlayArrow,
  Warning,
  WarningAmber,
  WarningOutlined,
} from "@mui/icons-material";
import { Icon, IconButton, Paper, Tooltip, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

export interface CorpusBlockCardProps {
  sequence: number;
  filename: string;
  status: CorpusBlockStatus; //This will be false on the Create Project: Overview screen
}

export enum CorpusBlockStatus {
  warning,
  todo,
  done,
}

export default function CorpusBlockCard({
  sequence,
  filename,
  status,
}: CorpusBlockCardProps) {
  const { t } = useTranslation("common");
  const filename_display =
    filename.length > 10
      ? filename.slice(0, 7) + "..." + filename.slice(-10)
      : filename;
  return (
    <>
      {/* Design: 
                Left side: Block nr, below Filename
                Right side: Status, below Start button
            */}
      <Paper
        elevation={3}
        sx={{
          padding: 1,
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        {/* Left side */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            flexDirection: "column",
          }}
        >
          <div style={{ margin: 4 }}>
            <Typography variant="h5">
              {t("block")}
              {sequence}
            </Typography>
          </div>
          <div style={{ margin: 4 }}>
            <Tooltip title={filename}>
            <Typography>{filename_display}</Typography>
            </Tooltip>
          </div>
        </div>

        {/* Right side */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Icon sx={{ m: 1 }}>
            {status == CorpusBlockStatus.done ? (
              <>
                <Tooltip title={t("block_is_recorded")}>
                  <CheckCircle htmlColor="#067809" />
                </Tooltip>
              </>
            ) : status == CorpusBlockStatus.todo ? (
              <>
                <Tooltip title={t("block_is_todo")}>
                  <AccessTimeFilled htmlColor="#CA0000" />
                </Tooltip>
              </>
            ) : (
              <>
                <Tooltip title={t("block_has_warnings")}>
                  {/*Warning*/}
                  <Warning htmlColor="#F6BE00" /> 
                </Tooltip>
              </>
            )}
          </Icon>
          <Tooltip title={t("resume_from_this_block")}>
          <IconButton sx={{}}>
            <PlayArrow fontSize="large" htmlColor="#00BB00" />
          </IconButton>
          </Tooltip>
        </div>
      </Paper>
    </>
  );
}
