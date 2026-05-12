export default class User {
  _id;
  name;
  email;
  password;

  constructor(name, email, password) {
    this.name = name;
    this.email = email;
    this.password = password;
  }

  constructor(_id, name, email, password){
    this._id = _id;
    this.name = name;
    this.email = email;
    this.password = password;
  }

}