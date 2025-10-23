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
import { Icon, IconButton, Paper, Typography } from "@mui/material";
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
            <Typography>
              {t("block")}
              {sequence}
            </Typography>
          </div>
          <div style={{ margin: 4 }}>
            <Typography>{filename}</Typography>
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
                <CheckCircle htmlColor="#067809" />
              </>
            ) : status == CorpusBlockStatus.todo ? (
              <>
                <AccessTimeFilled htmlColor="#CA0000" />
              </>
            ) : (
              <>
                <Warning htmlColor="#F6BE00" /> {/*Warning*/}
              </>
            )}
          </Icon>
          <IconButton sx={{}}>
            <PlayArrow fontSize="large" htmlColor="#00BB00" />
          </IconButton>
        </div>
      </Paper>
    </>
  );
}
