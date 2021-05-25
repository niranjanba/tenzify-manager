module.exports = function genSku(name, category, id) {
    let newName = name.slice(0, 2)
    let newCategory = category.slice(0, 2)
    let newId = id.slice(-4, -1);
    sku = `${newCategory}-${newName}-${newId}`
    return sku
}