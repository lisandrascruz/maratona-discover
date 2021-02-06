const Modal = {
    open() {
        document
        .querySelector('.modal-overlay')
        .classList
        .add('active');
    },

    close() {
        document
        .querySelector('.modal-overlay')
        .classList
        .remove('active');
    }
}

const Storage = {
    get() {
        return JSON.parse(localStorage.getItem('dev.finances:transections')) || [];
    },

    set(transections) {
        localStorage.setItem("dev.finances:transections", JSON.stringify(transections));
    }
}

const Transection = {
    all: Storage.get(),
    
    remove(index){
        Transection.all.splice(index, 1);
        
        App.reload();
    },

    add(transection) {
        Transection.all.push(transection);
        
        App.reload();
    },

    incomes() {
        let income = Transection.all.filter ((transection) => transection.amount > 0)
        .map(eachIncome => eachIncome.amount)
        .reduce ((acc, cur) => acc += cur, 0);

        return income;
    },

    expenses() {
        let expense = Transection.all.filter ((transection) => transection.amount < 0)
        .map(eachIncome => eachIncome.amount)
        .reduce ((acc, cur) => acc += cur, 0);

        return expense;
    },

    total() {
        return Transection.incomes() + Transection.expenses();
    }
}

const DOM = {
    transectionsContainer: document.querySelector('#data-table tbody'),

    addTransection(transection, index){
        const tr = document.createElement('tr');
        tr.innerHTML = DOM.innerHTMLTransection(transection, index);
        tr.dataset.index = index;

        DOM.transectionsContainer.appendChild(tr);
    },
    
    innerHTMLTransection(transection, index){
        const cssClass = transection.amount > 0 ? "income" : "expense";
        const amount = Utils.formatCurrency(transection.amount); 

        const html = `
        <td class="description">${transection.description}</td>
        <td class="${cssClass}">${amount}</td>
        <td class="date">${transection.date}</td>
        <td>
            <img onclick="Transection.remove(${index})" src="./assets/minus.svg" alt="Remover transação">
        </td>
        `
        return html;
    },
    
    updateBalande() {
        document
            .querySelector('#incomeDisplay')
            .innerHTML = Utils.formatCurrency(Transection.incomes());

        document
            .querySelector('#expenseDisplay')
            .innerHTML = Utils.formatCurrency(Transection.expenses());
        
        document
            .querySelector('#totalDisplay')
            .innerHTML = Utils.formatCurrency(Transection.total());

    },

    clearTransections() {
        DOM.transectionsContainer.innerHTML = "";
    }
}

const Utils = {

    formatCurrency(value) {
        const signal = Number(value) < 0 ? "-" : "";
        value = String(value).replace(/\D/g, "");
        value = Number(value)/100;

        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });
        
        return signal+value;
    },

    formatAmount(value) {
        value = Number(value.replace(/\,\./g, '')) * 100; 
        return value;
    },

    formatDate(value) {
        const splittedDate = value.split("-");
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`;
    }

}

const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    getValues() {
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value,
        };
    },

    validateFields() {
        const {description, amount, date} = Form.getValues();

        if(description.trim() === "" || amount.trim() === "" || date.trim() === "") {
            throw new Error("Por favor, preencha todos os campos");
        }
    },

    formatValues() {
        let {description, amount, date} = Form.getValues();
        amount = Utils.formatAmount(amount);
        date = Utils.formatDate(date);
        
        return {
            description,
            amount,
            date
        }
    },

    saveTransection(transection) {
        Transection.add(transection);
    },

    clearFields() {
        Form.description.value= "";
        Form.amount.value= "";
        Form.date.value = "";
    },

    submit(event) {
        event.preventDefault();

        try {
            Form.validateFields();
            
            const transection = Form.formatValues();
            Form.saveTransection(transection);
            Form.clearFields();

            Modal.close();

        } catch (error) {
            alert(error.message);            
        }


    },

}

const App = {

    init() {
        Transection.all.forEach(DOM.addTransection);
        // Transection.all.forEach(el, index => DOM.addTransection(el, index));
        
        DOM.updateBalande();
        Storage.set(Transection.all)
    },

    reload(){
        DOM.clearTransections();
        App.init();
    }
}

App.init();