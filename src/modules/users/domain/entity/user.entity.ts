import { UUID } from "crypto";

export class User {
  constructor(
    public readonly id: UUID,
    public readonly username: string,
    public readonly email: string,
    public readonly password: string,
    public readonly displayName: string,
    public readonly isVerified: boolean,
    public readonly followers: string[],
    public readonly following: string[]
  ) {}
}
