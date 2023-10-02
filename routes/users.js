import * as yup from 'yup';
import express, {request, response} from 'express';
import { v4 as uuidv4 } from 'uuid';
const  router = express.Router();

let userSchema = yup.object().shape({
    firstName: yup.string().required(),
    lastName: yup.string().required(),
    amount: yup.number().required()
})

let addBankSchema = yup.object().shape({
    amount: yup.number().required()
})

let transferSchema = yup.object().shape({
    amount: yup.number().required(),
    fromAccount: yup.string().required(),
    toAccount: yup.string().required()
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


router.get('/', (request,response) => {
    console.log(users);
    response.send('Hey Bud: User Home Page');
})

// user should have first name last name, phone number
router.post('/createUser', (request, response) => {
    const user = request.body;

    userSchema.isValid({
        firstName: user.firstName,
        lastName: user.lastName,
        amount: user.amount
    }).then((valid) => {
        if (valid && user.amount > 0) {
            const userId = uuidv4()
            const accountId = uuidv4()
            const addedUser = {firstName : user.firstName, lastName: user.lastName}
            // add to account DB
            accounts.set(accountId, {userId: userId, amount: user.amount})
            /// add to user DB
            users.set(userId, addedUser)
            userAccounts.set(userId, new Map())
            userAccounts.get(userId).set(accountId, user.amount)
            console.log("USERS")
            console.log(users)
            console.log("Accounts")
            console.log(accounts)
            console.log("USER_ACCOUNTS")
            console.log(userAccounts)
            // initialize row for Db
            accountTransfers.set(accountId, [])
            response.send("Made User")
        } else {
            console.log("Could Not Create User")
            response.send("User Not Created")
        }
    })
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

        response.send('Here are your accounts!!!')
    } else {
        response.send('Account not found -_-')
    }
});

router.post('/:userId/createAccount', (request, response) => {
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

router.get('/:userId/accounts/accountId', (request, response) => {
    const userId = request.params.userId
    const accountId = request.body.accountId
    if (users.has(userId) && accounts.has(accountId)) {
        //TODO make accounts simple map
        console.log(accountId + "," + accounts.get(accountId))
        response.send("Ihave it")
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

router.post('/:userId/transferAmount', (request, response) => {
    const userId = request.params.userId
    const body = request.body
    transferSchema.isValid(({
        amount: body.amount,
        fromAccount: body.fromAccount,
        toAccount: body.toAccount
    }))
        .then((valid) => {
            const amount = body.amount; const fromAccount = body.fromAccount;
            const toAccount = body.toAccount;
            if (valid && amount > 0 && accounts.has(toAccount) && accounts.has(fromAccount)) {
                // add to Route
                const transferIdTo = uuidv4()
                const transferIdFrom = uuidv4()
                //transferId -> amount: amount, fromAccount: accountId, toAccount: accountId, balance: balanceAmount, date: date
                if (accounts.get(fromAccount) >= amount){
                    accountTransfers.set(fromAccount, transferIdFrom)
                    accountTransfers.set(toAccount, transferIdTo)
                    let balance = accounts.get(fromAccount);
                    accounts.set(fromAccount, balance - amount)
                    balance = accounts.get(fromAccount)
                    // record of the amount being sent to sender the negative means you know it is being withdrawn
                    transferHistories.set(transferIdFrom, {amount: -amount, fromAccount: fromAccount, toAccount: toAccount, balance: balance, date: Date.now()})
                    let receivedBalance = accounts.get(toAccount) + amount
                    // record of the amount being received from sender
                    transferHistories.set(transferIdTo, {amount: amount, fromAccount: toAccount, toAccount: fromAccount, balance: receivedBalance, date: Date.now()})
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