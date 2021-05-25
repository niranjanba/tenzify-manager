const forms = document.querySelectorAll('.edit-form');
const modalForm = document.querySelector('.modal-form');
const input = modalForm.querySelectorAll('input');
const modal = document.querySelector('.bg-modal');
const sumbit = document.querySelector('.submit-button');
const formCategory = document.querySelector('#category');
const deleteBtn = document.querySelector('.delete-btn');

let id;
let table;
let edit = false;

function editProduct(data) {
    edit = true;
    let category = modalForm.querySelector('select');
    table = data.parentElement.parentElement.parentElement;
    const product = [];
    modal.style.display = 'flex';
    id = data.dataset.id;
    for (let i = 1; i <= 4; i++) {
        product.push(table.cells[i].innerHTML)
    }
    input[0].value = product[0];
    input[1].value = parseInt(product[1]);
    input[2].value = parseInt(product[2]);

    for (cat of formCategory) {
        if (cat.value + ' ' == product[3]) {
            cat.setAttribute('selected', true);
        }
    }
    
}
modalForm.addEventListener('submit', (e) => {
    e.preventDefault();
        let name = input[0].value;
        let price = parseInt(input[1].value);
        let quantity = parseInt(input[2].value);
        let category = modalForm.querySelector('select').value;
    
        const value = { name, price, quantity, category };
    if (edit) {
        fetch(`http://localhost:3000/product/${id}`,
            {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(value)
            }
        ).then((data) => {
            return data.text();
        }).then((text) => {
            console.log('sent');
        }).catch((err) => {
            console.log(err);
        })
            
        //after submitting
        table.cells[1].innerHTML = name;
        table.cells[2].innerHTML = price;
        table.cells[3].innerHTML = quantity;
        table.cells[4].innerHTML = category;

    } else {
        fetch(`/view-vendor/${vendorId}/product`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(value)
            }
        ).then((data) => {
            return data.text();
        }).then((text) => {
            console.log('added product');
        }).catch((err) => {
            console.log(err);
        })
        location.reload()
    }
    modal.style.display = 'none';
})
function myFunction() {
    modal.style.display = 'none';

}

function deleteProduct(data) {
    const vendor = data.dataset.vendor;
    const productId = data.dataset.id;
    console.log(vendor, productId);

    fetch(`/vendor/${vendor}/product/${productId}`,
        {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
        }
    ).then((data) => {
        location.reload()
    })
}