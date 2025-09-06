export type DeveloperApp = {
  id: string;
  name: string;
  website: string;
  description: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
};

export enum AppFormVariant {
  CREATE = "create",
  EDIT = "edit"
}
