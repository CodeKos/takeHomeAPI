import * as yup from 'yup';
import express, {request, response} from 'express';
import { v4 as uuidv4 } from 'uuid';
const  router = express.Router();
import { UserController } from '../controller/userController.js'
import {User} from "../Users/User.js";
import {AccountController} from "../controller/AccountController.js";
/**
 * No Persistance Layer -> Create File
 * Hosted DB Planet Scale MySQL Instance
 * Hosted MySQL FireBase
 * URL -> Hosted MySQL Connection String
 * READ ME How TO Use It
 * curl certain eund points
 * How To Set Up MY SQL DB end point
 * Multiple People and Accounts
 * 1- Many Accounts
 *  -> Multi Owner
 *  /user/1/ -> 2nd request -> /accounts to get account info
 *  MVC ->
 *      validation done in a routes file ->
 *      controlers doing the business logic
 *      console.info()
 *      pass in standard format Object , Object with message key
 *      Console.info(Object + routename + 3 keys )
 *
 *      L: post to user
 *      post/userid.accounts
 *      async inside can use await better syntax 43 - 47
 *      prepend wait to userschema
 *      let = await userschema.isValid
 *      dependent promises cannot do try catch
 *
 *      DB is not synchronous call -> make async
 *
 *      routes returning promises some not
 *      not returning promises are blocking B -> API is uneven
 *
 *      Split Controllers
 *      DB
 *      Fix end points
 *      representing the trnasfers
 *
 *      represent transfer table as a ledger
 *
 *      transactional mechanics try -> then update the balance
 *      every ledger entry has starting balance and ending balalnce
 *      account should have name and id transfer table = ledger most recent row of transfer balance
 *      all of transactions where
 */

/**
 * NODE Best Practices no modules remove from GIT
 * package-lock.json download fresh dependiecies
 * TAKE out .idea
 * Install dependencies with npm start etc... defualt running on PORT
 * Routes Server Code Business Code /controller
 * src/controller/
 * define enviornment variables low priority
 *
 *
 * je2dzdjy3odbnyf70rv8 USERNAME
 * pscale_pw_APJv4zY7As4NDws2pO2xFD7Jq9DbvhTi8hKbShJlleb PASSWORD
 */
let userSchema = yup.object().shape({
    firstName: yup.string().required(),
    lastName: yup.string().required(),
    amount: yup.number().moreThan(100).required(),
    email: yup.string().email().required()
})

let addBankSchema = yup.object().shape({
    amount: yup.number().required()
})

let transferSchema = yup.object().shape({
    amount: yup.number().required(),
    fromAccount: yup.string().required(),
    toAccount: yup.string().required()
})

let accountSchema = yup.object().shape({
    accountId: yup.string().required(),
    userId: yup.string().required()
})

// first name: last name: amount:
let users = new Map();
// accountId, userId, amount
let accounts = new Map();
// userId -> {accountId : amount}
let userAccounts = new Map();
// account -> List.of(transferId)
let accountTransfers = new Map();
//transferId -> fromAccount: accountId, toAccount: accountId, amount: amount,  balance: balanceAmount, date: date
//transferId should match the from userId
let transferHistories = new Map();
/**
 * Write to accounts.json file
 * Postgress and MySQL in memory => SQLLITE
 * Provision1 Cloud Service Connection URL within application
 *
 * Notion of Security Validation
 * REad User Account must know
 *
 * Provide well structured JSON
 *
 * JEST test framework for doing assertions creating mock data etc.
 * Test Transfer amount to any accounts
 * encapsulate with funciton
 * v11.2.1
 */


router.get('/', async (request,response) => {
    console.log("Finding Users");
    let output = [];
    const users =  UserController.getUsers();
    users.then((list) => {
        // console.log("LIST: " + list)
        list.forEach((user) => {
            console.log("row: " + User.toJson(user))
            output.push(user)
        })
    }).then(() => response.send(output))
})

// user should have first name last name, phone number
router.post('/createUser', async (request, response) => {
    console.log(request.body)
    const user = request.body;
    console.log("async call pot createUser")
    try {
        const validUser = await userSchema.isValid({
            firstName: user.firstName,
            lastName: user.lastName,
            amount: user.amount
        })

        await UserController.createUser(user)
        return response.send("User Created")
    } catch (err) {
        console.error(err)
        response.send(err)
    }

    //     .then((valid) => {
    //     if (valid && user.amount > 0) {
    //         const userId = uuidv4()
    //         const accountId = uuidv4()
    //         const addedUser = {firstName : user.firstName, lastName: user.lastName}
    //         // add to account DB
    //         accounts.set(accountId, {userId: userId, amount: user.amount})
    //         /// add to user DB
    //         users.set(userId, addedUser)
    //         userAccounts.set(userId, new Map())
    //         userAccounts.get(userId).set(accountId, user.amount)
    //         console.log("USERS")
    //         console.log(users)
    //         console.log("Accounts")
    //         console.log(accounts)
    //         console.log("USER_ACCOUNTS")
    //         console.log(userAccounts)
    //         // initialize row for Db
    //         accountTransfers.set(accountId, [])
    //         response.send("Made User")
    //     } else {
    //         console.log("Could Not Create User")
    //         response.send("User Not Created")
    //     }
    // })
});

router.get('/:userId/accounts', (request, response) => {
    const user = request.params
    if (users.has(user.userId)) {
        let accounts = userAccounts.get(user.userId)
        console.log("*USER_ACCOUNTS*")
        console.log(userAccounts)
        console.log("ACCOUNTS")
        console.log(accounts)
        accounts.forEach((amount, account, accounts) => {
            console.log("account: " + account + " amount: " + amount)
        })
         return response.send('Here are your accounts!!!')
    } else {
         return response.send('Account not found -_-')
    }
})
/** *
 * Should be doing web stuff collecting the params and the body and the parameters
 * Then calling the controller to actually execute transaction
 * Handlers to return error and HTTP Status code that make sense
 * Return 400 type error code put it on the response object error message
 */

router.post('/:userId/createAccount', (request, response) => {
    //validate account
    //send account
    const userId = request.params.userId
    const body = request.body

    addBankSchema.isValid({amount: body.amount})
        .then((valid) => {
            console.log("valid: " + valid + " hasUser: " + users.has(userId) + " amount: " + body.amount)
            console.log("USERS:")
            console.log(users)
            if (valid && users.has(userId) && body.amount > 0) {
                const id = uuidv4()
                let allAccounts = userAccounts.get(userId)
                accounts.set(id, userId)
                allAccounts.set(id, body.amount)
                console.log("ALL_ACCOUNTS")
                console.log(allAccounts)
                accountTransfers.set(id, [])
                response.send("ACCOUNT MADE")
            } else {
                response.send("NO ACCOUNT MADE")
            }
        })
})

//gets a
router.get('/:userId/accounts/:accountId', async (request, response) => {

    try {
        const valid = await accountSchema.isValid({
            accountId: request.params.accountId,
            userId: request.params.userId
        })

        const userId = request.params.userId
        const accountId = request.params.accountId
        const transactions = AccountController.getTransactionsAccount(userId, accountId, 1)

        transactions.then((x) => {
            if (x.length >= 1) {
                return response.send(x)
            } else {
                return response.send("TRANSACTIONS NOT FOUND")
            }
        })

    } catch (err) {
        response.send(err)
    }
});

router.get('/:userId/accounts/transfers', (request, response) => {
    const userId = request.params.userId
    const accountId = request.body.accountId
    if (users.has(userId) && accounts.has(accountId)) {
        let list = accountTransfers.get(accountId)
        list.forEach((transferId) => {
            let transaction = transferHistories.get(transferId)
            console.log("transaction: " + transaction.amount + " balance: " + transaction.balance + " date: " + transaction.date)
        })
    }
})

router.post('/:userId/transferAmount', async (request, response) => {
    const userId = request.params.userId
    const body = request.body
    transferSchema.isValid(({
        amount: body.amount,
        fromAccount: body.fromAccount,
        toAccount: body.toAccount
    }))
        .then(async (valid) => {
            const amount = body.amount;
            const fromAccount = body.fromAccount;
            const toAccount = body.toAccount;
            await AccountController.transferAmount(150, "0cd98e6c-c25c-41ff-ab6a-350950a3181c", "4cbd4a92-d085-49ed-80d9-78c54dfd7ca3")
            if (valid && amount > 0 && accounts.has(toAccount) && accounts.has(fromAccount)) {
                // add to Route
                const transferIdTo = uuidv4()
                const transferIdFrom = uuidv4()
                //transferId -> amount: amount, fromAccount: accountId, toAccount: accountId, balance: balanceAmount, date: date
                if (accounts.get(fromAccount) >= amount) {
                    accountTransfers.set(fromAccount, transferIdFrom)
                    accountTransfers.set(toAccount, transferIdTo)
                    let balance = accounts.get(fromAccount);
                    accounts.set(fromAccount, balance - amount)
                    balance = accounts.get(fromAccount)
                    // record of the amount being sent to sender the negative means you know it is being withdrawn
                    transferHistories.set(transferIdFrom, {
                        amount: -amount,
                        fromAccount: fromAccount,
                        toAccount: toAccount,
                        balance: balance,
                        date: Date.now()
                    })
                    let receivedBalance = accounts.get(toAccount) + amount
                    // record of the amount being received from sender
                    transferHistories.set(transferIdTo, {
                        amount: amount,
                        fromAccount: toAccount,
                        toAccount: fromAccount,
                        balance: receivedBalance,
                        date: Date.now()
                    })
                    console.log(transferHistories)
                    return response.send("TRANSFER SUCCESSFUL")
                } else {
                    return response.send("NOT ENOUGH MONEY")
                }
            } else {
                response.send("TRANSFERRED FAILED")
            }
        })
})
export  default  router;