const searchInput = document.querySelector('.d-flex');
const searchResult = document.querySelector('.search-result');
let returnData;

searchInput.addEventListener('input', (e) => {
    e.preventDefault();
    const value = searchInput[0].value;
    if (value.length < 10) {
        searchResult.innerHTML = ''
    }
    else if(value.length === 10){
        fetch(`/search?value=${value}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
            }
        ).then((data) => {
            return data.json();
        }).then((text) => {
            showResult(text);
        }).catch((err) => {
            console.log(err);
        })
    }
})

function showResult(data) {
    let html;
    if (data.length) {
        console.log('hello')
        html = data.map(ele =>
            `<div class="card-body">
            <h5><a href="/view-vendor/${ele.vendor.id}">${ele.vendor.name} - ${ele.vendor.store}</a><h5>
            </div>
            `
        ).join('');
    }
    else {
        html = `<div class="card-body">
            <h5>No Vendor Found<h5>
            </div>`
    }
    searchResult.innerHTML = html;

}