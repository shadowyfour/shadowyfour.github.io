/*
notes to self:
docker-compose up -d
docker-compose down
 */

class Action {
    constructor({ name, diceText, id }) {
        this.name = name;
        this.diceText = diceText
        let dice = diceText.replaceAll(" ", "");

        let d_index = dice.indexOf('d');
        if (d_index > 0) {
            this.numDice = parseInt(dice.substr(0,d_index + 1), 10);
        }
        else {
            this.numDice = 1;
        }
        dice = dice.substr(d_index + 1);

        let s_index = Math.max(dice.indexOf('+'), dice.indexOf('-'));
        if (s_index > 0) {
            this.diceSice = parseInt(dice.substr(0,s_index + 1), 10);
            this.modifier = parseInt(dice.substr(s_index), 10);
        }
        else {
            this.diceSice = parseInt(dice, 10);
            this.modifier = 0;
        }
        this.id = id;
    }
    toHTML() {
        return `
        <tr class="action">
            <td><button class="action-roll material-icon" onclick="doAction(${this.id})">replay</button></td>
            ${this.diceSice === 20 ? `<td><button class="action-special" onclick="doAdvantageAction(${this.id})">Adv</button></td>
            <td><button class="action-special" onclick="doDisadvantageAction(${this.id})">Disadv</button></td>` : `<td></td><td></td>`}
            <td><span class="action-name" id="name-${this.id}">${this.name}</span></td>
            <td><span class="action-dice" id="dice-${this.id}">${this.diceText}</span></td>
            <td><button class="action-delete material-icon" onclick="deleteAction(${this.id})">clear</button></td>
        </tr>
        `
    }
    advantage() {
        console.log('Rolling with advantage:');
        let result1 = this.act();
        let result2 = this.act();
        let result = Math.max(result1, result2)
        console.log('Better Result: ' + result);
        console.log('\n');
        return this.textOf(result);
    }
    disadvantage() {
        console.log('Rolling with disadvantage:');
        let result1 = this.act();
        let result2 = this.act();
        let result = Math.min(result1, result2)
        console.log('Worse Result: ' + result);
        console.log('\n');
        return this.textOf(result);
    }
    normal() {
        console.log('Rolling normally:');
        let result = this.act();
        console.log('\n');
        return this.textOf(result)
    }
    act() {
        console.log(`${this.name}:\nGetting ${this.numDice}d${this.diceSice} ${(this.modifier>0?"+":"")}${this.modifier?this.modifier:""}`);
        let sum = 0;
        for (let i=0; i < this.numDice; i++) {
            sum += roll(this.diceSice);
        }
        sum += this.modifier;
        console.log('Result: ' + sum);
        return sum;
    }
    textOf(result) {
        if(this.diceSice === 20) {
            if (result - this.modifier === 20) {
                return "Nat 20";
            }
            if (result - this.modifier === 1) {
                return "Nat 1";
            }
        }
        return result;
    }
}

function roll(dieSize) {
    let num = Math.floor(Math.random() * dieSize) + 1;
    console.log("Random Number from 1 to " + dieSize + ": " + num);
    return num;
}

let actions = []

function updateStorage(newData) {
    localStorage.setItem('database', JSON.stringify(newData));
}

function readStorage() {
    let result = JSON.parse(localStorage.getItem('database')) || [];
    result = result.map(actionData => new Action(actionData));
    result = result.filter(action => typeof action.id !== 'undefined');
    return result;
}

function createAction(event) {
    event.preventDefault();
    let formData = new FormData(event.currentTarget);
    clearForm();
    let entries = Object.fromEntries(formData);
    try {
        let action = new Action({name: entries.name, diceText: entries.dice, id: Date.now()});
        actions.push(action);
        updateStorage(actions);
        readActions();
    }
    catch (e) {
        console.log("Malformed diceText: " + entries.dice)
        //TODO: show error message
    }
}

function readActions() {
    actions = readStorage();
    let html = actions.map(task => task.toHTML()).reduce((list, li) => list + li, "");
    document.getElementById("actionlist").innerHTML = html;
    actions.forEach(function(action) {
        document.getElementById(`name-${action.id}`).innerText = action.name;
        document.getElementById(`dice-${action.id}`).innerText = action.diceText;
    });
}

function deleteAction(id) {
    actions = actions.filter(action => action.id !== id)
    updateStorage(actions);
    readActions();
}

function displayResult(result) {
    document.getElementById("actionResult").innerHTML = result;
}

function doStraightAction(dieSize) {
    let result = roll(dieSize);
    if (dieSize === 100) {
        result = ('00'+result).slice(-2);
    }
    displayResult(result);
}

function doAction(id) {
    let action = actions.find(action => action.id === id);
    let result = action.normal();
    displayResult(result);
}

function doAdvantageAction(id) {
    let action = actions.find(action => action.id === id);
    let result = action.advantage();
    displayResult(result);
}

function doDisadvantageAction(id) {
    let action = actions.find(action => action.id === id);
    let result = action.disadvantage();
    displayResult(result);
}

function storeForm() {
    localStorage.setItem('formName', document.getElementById("formName").value);
    localStorage.setItem('formDice', document.getElementById("formDice").value);
}

function loadForm() {
    document.getElementById("formName").value = localStorage.getItem('formName');
    document.getElementById("formDice").value = localStorage.getItem('formDice');
}

function clearForm() {
    localStorage.setItem('formName', "");
    localStorage.setItem('formDice', "");
    document.getElementById("formName").value = "";
    document.getElementById("formDice").value = "";
}

readActions();
loadForm();