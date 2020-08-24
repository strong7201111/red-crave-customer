cart = {
  list: []
}

//take selected item and add it to the list and display it below
function addToCart(id) {
  //get item selected
  let quantity = parseInt(document.getElementById(id.toString()).value);
  let price = parseFloat(document.getElementById("price"+id.toString()).innerText);

  //check quantity selected is right
  if (quantity >= 1) {

    //check that item dosen't already exist
    //in the printList (or just list) to avoid duplicates
    inCart = false;
    for (var i = 0; i < cart.list.length; i++) {
      if (cart.list[i].id == id) {
        inCart = true;
        break;
      }
    }

    //if it's not in the list than add it
    if (inCart == false) {
      item = {
        id: id,
        quantity: quantity,
        price: price
      }
      //add to cart list
      cart.list.push(item);

      //store to cart refrences
      storeToLocalStorage();

      //add item to cart display
      let cart_card = document.getElementById("cart-display");

      //create cart item display
      let cart_item = document.createElement("div");
      let item_name = document.createElement("p");
      item_name.innerText = document.getElementById("name" + item.id.toString()).innerText + " | x" + quantity;
      cart_item.appendChild(item_name);
      cart_card.appendChild(cart_item);

      //enable back the order button
      let submitButton = document.getElementById("submit");
      submitButton.disabled = false;

    }else{
      alert("item already in cart");
    }

  }else{
    alert("quantity can't be less than 1 to add to the cart");
  }

  //print the list to check if it's working
  printList = "";
  for (var i = 0; i < cart.list.length; i++) {
    printList = printList + "id: " + cart.list[i].id + " || " + "quantity: " + cart.list[i].quantity + " || " + "price: " + cart.list[i].price + "\n";
  }
}

function clearCart(){
  let cart_card = document.getElementById("cart-display");
  let order = document.getElementById("orderDetails");
  let submitButton = document.getElementById("submit");

  //clear orderDetails that's going to be submitted to the server
  order.value = '';

  //disable submit button because well empty
  submitButton.disabled = true;

  //clear cart display
  while(cart_card.firstChild){
    cart_card.removeChild(cart_card.lastChild);
  }
  cart.list = [];


}

function storeToLocalStorage() {
  stringList = JSON.stringify(cart);
  let orderData = document.getElementById("orderDetails");
  orderData.value = stringList;
}

function submitForm() {

  if (cart.list === undefined || cart.list.length == 0) {
    alert("can't submit empty cart");
  }else{
    stringList = JSON.stringify(cart);
    let order = document.getElementById("orderDetails");
    order.value = stringList;
    document.getElementById("orderForm").submit();
    // alert("you can submit the form");
  }

}
