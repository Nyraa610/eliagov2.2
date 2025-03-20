
import { PrimaryActivityNode } from "../../../nodes/PrimaryActivityNode";
import { SupportActivityNode } from "../../../nodes/SupportActivityNode";
import { ExternalFactorNode } from "../../../nodes/ExternalFactorNode";
import { CustomNode } from "../../../nodes/CustomNode";

export const nodeTypes = {
  primary: PrimaryActivityNode,
  support: SupportActivityNode,
  external: ExternalFactorNode,
  custom: CustomNode
};
