import * as mysql from "mysql2";
import express, {query, request, response} from 'express';
import { v4 as uuidv4 } from 'uuid';
import {UserController} from "./UserController.js";
import {Transfer} from "../Transactions/Transfer.js";
const connection = mysql.createConnection(process.env.DATABASE_URL)
connection.query('show tables', function (err, results, fields) {
    console.log(results) // results contains rows returned by server
    console.log(fields) // fields contains extra metadata about results, if available
})

export class AccountController {
    static async createAccount(userId, amount) {
        const accountId = uuidv4()
        const transferId = uuidv4()

        await connection.promise().query(`INSERT INTO accounts SET userId="${userId}", accountId="${accountId}"`)

        await connection.promise().query(`INSERT INTO transfers SET fromAccount="${accountId}",` +
            `toAccount="${accountId}", date="${new Date().toISOString().slice(0, 19).replace('T', ' ')}",` +
            `transferId="${transferId}", balance="${amount}", amount="${amount}"`)

    }
    static async getTransactionsAccount(accountId, allAmounts) {
        let list = []

        await connection.promise().query(`SELECT * FROM accounts where accountId="${accountId}" `)
            .then(([rows,field]) => {
                rows.forEach((row) => {
                    console.log("FOUND: " + JSON.stringify(row))
                    if (!Object.is(null, row)) {
                        list.push(row)
                    }
                })
            })
        // did not find account
        if (list.length < 1) {
            return []
        }

        list = []

        let date = new Date()
        date = AccountController.addDate(date, -1, 'years')
        date = AccountController.dateTimeMe(date)
        let query;
        if (allAmounts) {
            // pull up until the last year
            query = `SELECT * FROM transfers where fromAccount="${accountId}" and date >="${date}"ORDER BY DATE DESC `
        } else {
            // pull current balance
            query = `SELECT * FROM transfers where fromAccount="${accountId}" ORDER BY DATE DESC LIMIT 1`
        }

        await connection.promise().query(query)
            .then(([rows, fields]) => {
                rows.forEach((row) => {
                    console.log("TransferRow: " + JSON.stringify(row))
                    list.push(new Transfer(row))
                })
            })

        return list
    }

    static async getAccounts(userId) {
        const user = await UserController.getUser("6f883101-4ed3-4c1f-9956-4c0d449d4617")

        console.log("USER FOUND")
        console.log(user)
        let list = []

        await connection.promise().query(`SELECT * FROM accounts where userId="${user.userId}"`)
            .then(([rows,field]) => {
                rows.forEach((row) => {
                    list.push(row)
                })
            })

        return list
    }

    static async transferAmount(amount, fromAccount, toAccount) {
        const from = await AccountController.getTransactionsAccount(fromAccount, false)
        const to = await AccountController.getTransactionsAccount(toAccount, false)

        if (from.length < 1 || to.length < 1) {
            return [];
        }

        let start =  new Transfer(from[0])
        let end = new Transfer(to[0])
        if (start.amount < amount) {
            return response.send("NOT ENOUGH MONEY").sendStatus(200)
        }
        if (start.fromAccount != end.fromAccount) {
            let postDeduction = start.balance - amount
            let transferId = uuidv4()

            await connection.promise().query(`INSERT INTO transfers SET fromAccount="${start.fromAccount}",` +
                `toAccount="${end.accountId}", date="${new Date().toISOString().slice(0, 19).replace('T', ' ')}",` +
                `transferId="${transferId}", balance="${postDeduction}", amount="${-amount}"`)

            let addedBalance = end.balance + amount
            let transferId1 = uuidv4()

            await connection.promise().query(`INSERT INTO transfers SET fromAccount="${start.fromAccount}",` +
                `toAccount="${end.fromAccount}", date="${new Date().toISOString().slice(0, 19).replace('T', ' ')}",` +
                `transferId="${transferId1}", balance="${addedBalance}", amount="${amount}"`)

            return response.send("TRANSFER SUCCESSFUL").sendStatus(200)

        } else {
            let addedBalance = end.balance + amount
            let transferId1 = uuidv4()
            //adding a deposit
            await connection.promise().query(`INSERT INTO transfers SET fromAccount="${start.fromAccount}",` +
                `toAccount="${end.fromAccount}", date="${new Date().toISOString().slice(0, 19).replace('T', ' ')}",` +
                `transferId="${transferId1}", balance="${addedBalance}", amount="${amount}"`)

            return response.send("TRANSFER SUCCESSFUL").sendStatus(200)
        }

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

    static addDate(dt, amount, dateType) {
        switch (dateType) {
            case 'days':
                return dt.setDate(dt.getDate() + amount) && dt;
            case 'weeks':
                return dt.setDate(dt.getDate() + (7 * amount)) && dt;
            case 'months':
                return dt.setMonth(dt.getMonth() + amount) && dt;
            case 'years':
                return dt.setFullYear( dt.getFullYear() + amount) && dt;
        }
    }

    static dateTimeMe(date) {
        return date.toISOString().slice(0, 19).replace('T', ' ')
    }
}