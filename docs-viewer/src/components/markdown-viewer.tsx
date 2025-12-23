"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import { Typography, Paper } from "@mui/material";

interface MarkdownViewerProps {
  content: string;
  title?: string;
}

export function MarkdownViewer({
  content,
  title,
}: MarkdownViewerProps): React.JSX.Element {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 4,
        bgcolor: "background.paper",
        borderRadius: 2,
        maxWidth: "100%",
        "& h1": {
          color: "primary.main",
          fontSize: "2.5rem",
          fontWeight: 700,
          mb: 3,
          mt: 2,
        },
        "& h2": {
          color: "primary.main",
          fontSize: "2rem",
          fontWeight: 600,
          mb: 2,
          mt: 3,
          borderBottom: "2px solid",
          borderColor: "primary.main",
          pb: 1,
        },
        "& h3": {
          color: "secondary.main",
          fontSize: "1.5rem",
          fontWeight: 600,
          mb: 2,
          mt: 2.5,
        },
        "& h4": {
          fontSize: "1.25rem",
          fontWeight: 600,
          mb: 1.5,
          mt: 2,
          color: "text.primary",
        },
        "& p": {
          mb: 2,
          lineHeight: 1.7,
          color: "text.primary",
        },
        "& ul, & ol": {
          mb: 2,
          pl: 3,
        },
        "& li": {
          mb: 1,
          lineHeight: 1.6,
        },
        "& code": {
          bgcolor: "grey.100",
          color: "error.main",
          px: 1,
          py: 0.5,
          borderRadius: 1,
          fontSize: "0.875rem",
          fontFamily: "monospace",
        },
        "& pre": {
          bgcolor: "grey.900",
          color: "grey.100",
          p: 2,
          borderRadius: 2,
          overflow: "auto",
          mb: 2,
          "& code": {
            bgcolor: "transparent",
            color: "inherit",
            px: 0,
            py: 0,
          },
        },
        "& blockquote": {
          borderLeft: "4px solid",
          borderColor: "primary.main",
          pl: 2,
          py: 1,
          bgcolor: "grey.50",
          fontStyle: "italic",
          mb: 2,
        },
        "& table": {
          width: "100%",
          borderCollapse: "collapse",
          mb: 2,
          border: "1px solid",
          borderColor: "grey.300",
        },
        "& th, & td": {
          border: "1px solid",
          borderColor: "grey.300",
          px: 2,
          py: 1,
        },
        "& th": {
          bgcolor: "grey.100",
          fontWeight: 600,
        },
        "& a": {
          color: "primary.main",
          textDecoration: "none",
          "&:hover": {
            textDecoration: "underline",
          },
        },
      }}
    >
      {title != null ? (
        <Typography variant="h1" component="h1">
          {title}
        </Typography>
      ) : null}
      <ReactMarkdown>{content}</ReactMarkdown>
    </Paper>
  );
}
