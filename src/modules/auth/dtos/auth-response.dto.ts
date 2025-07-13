import { UUID } from "crypto";

export interface AuthResponseDTO {
  token: string;
  refreshToken?: string;
  user: {
    id: UUID;
    username: string;
    email: string;
    displayName: string;
  };
}