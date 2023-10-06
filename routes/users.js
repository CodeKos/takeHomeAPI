import * as yup from 'yup';
import express, {request, response} from 'express';
const  router = express.Router();
import { UserController } from '../controller/UserController.js'
import {User} from "../Users/User.js";
import {AccountController} from "../controller/AccountController.js";

let userSchema = yup.object().shape({
    firstName: yup.string().required(),
    lastName: yup.string().required(),
    amount: yup.number().moreThan(100).required(),
    email: yup.string().email().required()
})

let addBankSchema = yup.object().shape({
    amount: yup.number().required().moreThan(100)
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

/// landing page for getting all users
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

});

// get all accounts for user
router.get('/:userId/accounts', async (request, response) => {
    const userId = request.params.userId
    const accounts = await AccountController.getAccounts("6f883101-4ed3-4c1f-9956-4c0d449d4617")
    response.send(accounts)
})

// created an account
router.post('/:userId/createAccount', async (request, response) => {
    //validate account
    //send account
    const userId = "6f883101-4ed3-4c1f-9956-4c0d449d4617"
    const body = request.body

    const valid = await addBankSchema.isValid({amount: body.amount});

    if (valid) {
        const user = await UserController.getUser(userId)
        console.log("USER: " + user);
        if (!Object.is(null, user)) {
            const account = await AccountController.createAccount(userId, body.amount)
            return response.send(account)
        }
    }

    return response.send("NO ACCOUNT MADE")
})

//gets account information for a user
router.get('/:userId/accounts/:accountId', async (request, response) => {

    try {
        const valid = await accountSchema.isValid({
            accountId: request.params.accountId,
            userId: request.params.userId
        })

        const userId = request.params.userId
        const accountId = request.params.accountId
        const transactions = await AccountController.getTransactionsAccount("474acaa3-ccd4-4d29-aa24-873a8419a877", false)

        if (transactions.length >= 1) {
            // pick the first one that is your balance
            return response.send(transactions[0])
        } else {
            return response.send("TRANSACTIONS NOT FOUND")
        }

    } catch (err) {
        response.send(err)
    }

});

// pull user information
router.get('/:userId', async (request, response) => {
    const userId = request.params.userId
    let result = await UserController.getUser("ee0de60a-d9f4-49ba-ae4c-a155dff1119a")
    console.log(result)
    response.send(result)
})

// pulls all transactions for a given account
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

// makes a deposit or sends someone money
router.post('/:userId/transferAmount', async (request, response) => {
    const userId = request.params.userId
    const body = request.body
    let valid = transferSchema.isValid(({
        amount: body.amount,
        fromAccount: body.fromAccount,
        toAccount: body.toAccount
    }))
        if (valid){
            const amount = body.amount;
            const fromAccount = body.fromAccount;
            const toAccount = body.toAccount;
            await AccountController.transferAmount(150, "0cd98e6c-c25c-41ff-ab6a-350950a3181c", "4cbd4a92-d085-49ed-80d9-78c54dfd7ca3")

            return response.send("TRANSFER SUCCESSFUL")
        }
})
export  default  router;