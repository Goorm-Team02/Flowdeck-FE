export interface User {
  email: string;
  name: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  visibility: "PUBLIC" | "PRIVATE";
  createdAt?: string;
  updatedAt?: string;
}

export interface ProjectMember {
  id: string;
  projectId: string;
  email: string;
  name: string;
  role: "OWNER" | "EDITOR";
  status: "PENDING" | "ACCEPTED";
}
