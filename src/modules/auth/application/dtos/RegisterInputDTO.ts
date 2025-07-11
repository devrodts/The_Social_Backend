export class RegisterInputDTO {
  username: string;
  email: string;
  password: string;
  displayName: string;

  constructor(
    username: string,
    email: string,
    password: string,
    displayName: string,
  ) {
    this.username = username;
    this.email = email;
    this.password = password;
    this.displayName = displayName;
  }
}
