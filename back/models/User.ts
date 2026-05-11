export default class User {
  _id?: string;
  name: string;
  email: string;
  password?: string;

  constructor(name: string, email: string, password?: string) {
    this.name = name;
    this.email = email;
    this.password = password;
  }

  // Método auxiliar
  getDisplayName(): string {
    return `${this.name} <${this.email}>`;
  }

  // Método para atualizar dados
  updateInfo(updates: Partial<User>) {
    Object.assign(this, updates);
  }
}