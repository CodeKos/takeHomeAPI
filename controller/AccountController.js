import * as mysql from "mysql2";
import express, {query, request, response} from 'express';
import { v4 as uuidv4 } from 'uuid';
import {User} from "../Users/User.js";
const connection = mysql.createConnection(process.env.DATABASE_URL)
connection.query('show tables', function (err, results, fields) {
    console.log(results) // results contains rows returned by server
    console.log(fields) // fields contains extra metadata about results, if available
})

export class AccountController {
    static async getTransactionsAccount(accountId, num) {
        console.log("Body Recieved " + accountId)
        let isPresent = false;

        await connection.promise().query(`SELECT * FROM accounts where accountId="${accountId}" `)
            .then((rows) => {
                rows.forEach((row) => {
                    row.forEach((x) => {
                        console.log("FOUND: " + JSON.stringify(x))
                        console.log(x['accountId'])
                        // console.log(AccountController.getDifferences(x['accountId'], accountId))
                        isPresent = row.length >= 0
                    })
                })
            })

        let list = []
        // user not found exit out
        if (!isPresent) return list

        let limit = ''
        if (num === 1) {
            limit = ` LIMIT 1`
        }

        await connection.promise().query(`SELECT * FROM transfers where fromAccount="${accountId}" ORDER BY DATE DESC` + limit)
            .then(([rows, fields]) => {
                rows.forEach((row) => {
                    console.log("row: " + JSON.stringify(row))
                    list.push(row)
                })
            })

        return list
    }

    static async transferAmount(amount, fromAccount, toAccount) {
        const from = await AccountController.getTransactionsAccount(fromAccount, 1)
        const to = await AccountController.getTransactionsAccount(toAccount, 1)

        // if (from.length < 1 || to < length < 1) {
        //     return [];
        // }

        console.log("FROM")
        console.log(from)
        console.log("TO")
        console.log(to)

    }
    static getDifferences(a, b){

        let result = {
            state : true,
            diffs : []
        }

        if(a===b) return result;

        result.state = false;

        for (let index = 0; index < Math.max(a.length,b.length); index++) {
            if (a[index] !== b[index]) {
                result.diffs.push({index: index, old: a[index], new: b[index]})
            }
        }

        return result;
    }
}