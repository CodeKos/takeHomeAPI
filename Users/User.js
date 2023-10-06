import bodyParser from "body-parser";

export class User {
    constructor(userId, firstName, lastName, email) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.userId = userId;
    }

    init(result) {
        console.log(result)
        this.firstName = result[0]['firstName'];
        this.lastName = result[0]['lastName'];
        this.email = result[0]['email'];
        this.userId = result[0]['userId'];
        return this
    }

    toString() {
        return "firstName: " + this.firstName + "," + " lastName: " + this.lastName
            + "," + " email: " + this.email + "," + " userId: " + this.userId
    }

    static toJson(user) {
        return JSON.stringify(user)
    }
}

