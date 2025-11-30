import { Box, Typography } from "@mui/material";

interface ChatBubbleProps {
  text: string;
  side: "left" | "right";
  color?: string;
}

export default function ChatBubble({ text, side, color = "#e0e0e0" }: ChatBubbleProps) {
  const isLeft = side === "left";

  return (
    <Box
      sx={{
        display: "flex",
        width: "100%",
        justifyContent: isLeft ? "flex-start" : "flex-end",
        my: 1,
      }}
    >
      <Box
        sx={{
          position: "relative",
          maxWidth: "70%",
          bgcolor: color,
          color: "#000",
          px: 2,
          py: 1.2,
          borderRadius: 2,
          borderTopLeftRadius: isLeft ? 0 : 16,
          borderTopRightRadius: isLeft ? 16 : 0,
        }}
      >
        <Typography>{text}</Typography>

        {/* Tail */}
        <Box
          sx={{
            content: '""',
            position: "absolute",
            top: 0,
            [isLeft ? "left" : "right"]: -8,
            width: 0,
            height: 0,
            border: "8px solid transparent",
            borderTopColor: color,
            transform: isLeft
              ? "translateX(0)"
              : "translateX(0)",
          }}
        />
      </Box>
    </Box>
  );
}
