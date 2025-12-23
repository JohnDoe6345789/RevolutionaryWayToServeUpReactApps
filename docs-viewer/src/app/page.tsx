"use client";

import { useState, useEffect } from "react";
import { Box, Container, Typography, CircularProgress } from "@mui/material";
import { DocsNavigation } from "@/components/docs-navigation";
import { MarkdownViewer } from "@/components/markdown-viewer";
import { DOCS_STRUCTURE, getDocFile } from "@/lib/docs-structure";

export default function Home() {
  const [currentSection, setCurrentSection] = useState<string>(
    DOCS_STRUCTURE[0]?.id || ""
  );
  const [currentFile, setCurrentFile] = useState<string>(
    DOCS_STRUCTURE[0]?.files[0]?.id || ""
  );
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadDocument = async (sectionId: string, fileId: string) => {
    setLoading(true);
    setError(null);

    try {
      const docFile = getDocFile(sectionId, fileId);
      if (!docFile) {
        setError("Document not found");
        return;
      }

      const response = await fetch(`/docs/${docFile.path}`);
      if (!response.ok) {
        throw new Error(`Failed to load document: ${response.statusText}`);
      }

      const markdownContent = await response.text();
      setContent(markdownContent);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load document");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentSection && currentFile) {
      loadDocument(currentSection, currentFile);
    }
  }, [currentSection, currentFile]);

  const handleFileSelect = (sectionId: string, fileId: string) => {
    setCurrentSection(sectionId);
    setCurrentFile(fileId);
  };

  const currentDocFile = getDocFile(currentSection, currentFile);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <DocsNavigation
        currentSection={currentSection}
        currentFile={currentFile}
        onFileSelect={handleFileSelect}
      />
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Container maxWidth="lg" sx={{ py: 4, flex: 1 }}>
          {loading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: 200,
              }}
            >
              <CircularProgress />
            </Box>
          ) : error ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography variant="h6" color="error">
                Error loading document
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {error}
              </Typography>
            </Box>
          ) : (
            <MarkdownViewer
              content={content}
              title={currentDocFile?.title}
            />
          )}
        </Container>
      </Box>
    </Box>
  );
}
