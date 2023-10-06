## Installation

```shell
npm install --save mysql2
npm install express
npm install yup

```

https://planetscale.com/docs/concepts/planetscale-environment-setup
https://github.com/jquense/yup

## API

Hello welcome to the whitespace API this api is used to do the follow:
- Create a new bank account for a customer, with an initial deposit amount.
- Create multiple bank accounts for a customer
- Transfer amounts between any two accounts,
- Transfer amounts owned by  different customers.
- Retrieve balances for a given account.
- Retrieve transfer history for a given account.

To Set up this project locally and connect to the DB please install the packages above.
In this example I used `Planet Scale` to set up our DB. For set up please refer to the planet scale link posted above. You can look for the project example here https://github.com/CodeKos/takeHomeAPI

## Calls
To make a request all calls go through `localhost:8080/users` within the github. You can change the port inside the code base. To call the API for each methodology are placed below.



- Create a new bank account for a customer, with an initial deposit amount.
   ```
   Route: http://localhost:8080/users/createUser
   Within the request body it accepts the following to create an account
      {
          firstName: string,
          lastName: string,
          amount: number > 100
      }

    The response will send back the user who was created in a JSON
   ```

- Create multiple bank accounts for a customer
   ```
   Route: http://localhost:8080/users/{userId}/createAccount
   Within the request body it accepts the following to create an account
      {
          amount: number > 100
      }	 
   ```
- Transfer amounts between any two accounts,
   ```
   Route: http://localhost:8080/users/{userId}/tranferAmount
   Within the request body it accepts the following to create an account
      {
          toAccount: string,
          fromAccount: string
          amount: number 
      }	 
  From account represents the senders user id and to account represents the end user. If you are sending it to yourself the account id's are the same.	 
   ```
- Transfer amounts owned by  different customers.
   ```
   Route: http://localhost:8080/users/{userId}/tranferAmount
   Within the request body it accepts the following to create an account
      {
          toAccount: string,
          fromAccount: string
          amount: number 
      }	 
  From account represents the senders user id and to account represents the end user

   ```
- Retrieve balances for a given account.
   ```
  Route: http://localhost:8080/users/{userId}/accounts/{accountId}
  
  Pulls balance for a given account

   ```
- Retrieve transfer history for a given account.
   ```
   Route: http://localhost:8080/users/{userId}/accounts/transfers
   Within the request body it accepts the following to create an account
      {
          accountId: string, 
      }	 
  
   Pulls all transactions from a given account

   ```