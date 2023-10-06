export class Transfer {
    constructor(json) {
        this.amount = json['amount']
        this.fromAccount = json['fromAccount']
        this.toAccount = json['toAccount']
        this.balance = json['balance']
        this.date = json['date']
    }

    toString() {
        return JSON.stringify(this)
    }
}