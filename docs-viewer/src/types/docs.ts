export interface DocSection {
  id: string;
  title: string;
  path: string;
  files: DocFile[];
}

export interface DocFile {
  id: string;
  title: string;
  path: string;
  section: string;
}

export interface DocContent {
  sections: DocSection[];
}
