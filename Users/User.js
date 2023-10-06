import bodyParser from "body-parser";

export class User {
    constructor(userId, firstName, lastName, email) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.userId = userId;
    }

    toString() {
        return "firstName: " + this.firstName + "," + " lastName: " + this.lastName
            + "," + " email: " + this.email + "," + " userId: " + this.userId
    }

    static toJson(user) {
        return JSON.stringify(user)
    }
}

