import { AdapterIdentifier } from "./adapter-identifier.js";

export interface AdapterIdentifierFactory {
  readonly id: string;

  create(): Promise<AdapterIdentifier>;
}
