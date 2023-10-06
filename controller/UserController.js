import * as mysql from "mysql2";
import { v4 as uuidv4 } from 'uuid';
import {User} from "../Users/User.js";
const connection = mysql.createConnection(process.env.DATABASE_URL)

export class UserController {
    static async getUser(userId) {
        let output
        await connection.promise().query(`SELECT * FROM users where userId="${userId}"`)
            .then((result) => {
                console.log(result[0])
                output = result[0]
            })
        console.log(output)
        return new User().init(output)
    }
    static async createUser(user)  {
        console.log("createUSER")
        const firstName = user.firstName
        const lastName = user.lastName
        const email = user.email
        const id = uuidv4()
        const amount = user.amount
        console.log(user)
        let result;
        connection.promise().query(`INSERT INTO users SET firstName="${firstName}", lastName="${lastName}", email="${email}", userId="${id}"`)
            .then((x) => {
            const accountId = uuidv4()
            connection.promise().query(`INSERT INTO accounts SET accountId="${accountId}", userId="${id}"`).then((x) => {
                const transferId = uuidv4()
                connection.query(`INSERT INTO transfers SET fromAccount="${accountId}",` +
                    `toAccount="${accountId}", date="${new Date().toISOString().slice(0, 19).replace('T', ' ')}",` +
                    `transferId="${transferId}", balance="${amount}", amount="${amount}"`)
            })
        })

        console.log("ending connection")
    }

    static async getUsers() {
        let list = []
        await connection.promise().query('SELECT * FROM users')
            .then( ([rows,fields]) => {
                rows.forEach((row) => {
                    console.log(row)
                    let user = new User(row['userId'],row['firstName'],row['lastName'],row['email'])
                    list.push(user)
                })
            })
        return list
    }
}


export default UserController.createUser

