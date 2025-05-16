
import { documentService } from "./documentService";
import { Document, DocumentFolder, Deliverable } from "./types";
import { genericDocumentService, type DocumentType, type UploadOptions, type ValidationRules, type UploadedDocument } from "./genericDocumentService";
import { companyFolderService } from "./companyFolderService";
import { storageBucketService } from "./storage/storageBucketService";
import { folderService } from "./storage/folderService";

export {
  documentService,
  genericDocumentService,
  companyFolderService,
  storageBucketService,
  folderService,
  type Document,
  type DocumentFolder,
  type Deliverable,
  type DocumentType,
  type UploadOptions, 
  type ValidationRules,
  type UploadedDocument
};
