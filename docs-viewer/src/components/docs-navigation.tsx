"use client";

import {
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Collapse,
  Typography,
} from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import { useState } from "react";
import { DOCS_STRUCTURE } from "@/lib/docs-structure";
import type { DocSection } from "@/types/docs";

interface DocsNavigationProps {
  currentSection?: string;
  currentFile?: string;
  onFileSelect: (sectionId: string, fileId: string) => void;
}

export function DocsNavigation({
  currentSection,
  currentFile,
  onFileSelect,
}: DocsNavigationProps) {
  const [openSections, setOpenSections] = useState<Set<string>>(
    new Set(DOCS_STRUCTURE.map((section) => section.id))
  );

  const handleSectionToggle = (sectionId: string) => {
    const newOpenSections = new Set(openSections);
    if (newOpenSections.has(sectionId)) {
      newOpenSections.delete(sectionId);
    } else {
      newOpenSections.add(sectionId);
    }
    setOpenSections(newOpenSections);
  };

  return (
    <div className="w-64 bg-gray-50 border-r border-gray-200 h-full overflow-y-auto">
      <div className="p-4 border-b border-gray-200">
        <Typography variant="h6" component="h1">
          Documentation
        </Typography>
      </div>
      <List component="nav">
        {DOCS_STRUCTURE.map((section: DocSection) => (
          <div key={section.id}>
            <ListItem disablePadding>
              <ListItemButton onClick={() => handleSectionToggle(section.id)}>
                <ListItemText
                  primary={section.title}
                  primaryTypographyProps={{
                    variant: "subtitle1",
                    fontWeight: currentSection === section.id ? 600 : 400,
                  }}
                />
                {openSections.has(section.id) ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
            </ListItem>
            <Collapse in={openSections.has(section.id)} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {section.files.map((file) => (
                  <ListItem key={file.id} disablePadding>
                    <ListItemButton
                      sx={{ pl: 4 }}
                      selected={currentSection === section.id && currentFile === file.id}
                      onClick={() => onFileSelect(section.id, file.id)}
                    >
                      <ListItemText
                        primary={file.title}
                        primaryTypographyProps={{
                          variant: "body2",
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Collapse>
          </div>
        ))}
      </List>
    </div>
  );
}
