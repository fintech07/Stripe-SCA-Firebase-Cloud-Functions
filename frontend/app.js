const fb_host = 'https://us-central1-buskerbank.cloudfunctions.net/webApi'

var cus_select = document.getElementById("customers");

// get customers from firebase cloud
fetch(fb_host + "/customers", { method: 'GET' })
  .then(function (result) {
    result.json().then(json => {
      if (json.error) {
        //show errors
      } else {
        let cus_options = "";
        json.forEach(customer => {
          name = customer.customer;
          cus_options +=
            "<option value=" + "'" + name + "'" + ">" + name + "</option>";
        });
        cus_select.innerHTML = cus_options;
      }
    })
  })

var stripe = Stripe("pk_test_w9kpFx6D5QFqOEJ4FfZSfTHY00U34jqYnI");

// Create an instance of Elements.
var elements = stripe.elements();

// Create an instance of the card Element.
var card = elements.create("card");

// Add an instance of the card Element into the `card-element` <div>.
card.mount("#card-element");

// Handle real-time validation errors from the card Element.
card.addEventListener("change", function (event) {
  var displayError = document.getElementById("card-errors");
  if (event.error) {
    displayError.textContent = event.error.message;
  } else {
    displayError.textContent = "";
  }
});

const submitButton = document.getElementById("payment-submit");
submitButton.addEventListener("click", function (event) {
  event.preventDefault();
  const amount = document.getElementById("amount").value;
  const name = document.getElementById("name").value;
  stripe
    .createPaymentMethod("card", card, {
      billing_details: {
        name: name
      }
    })
    .then(function (result) {
      if (result.error) {
        var displayError = document.getElementById("card-errors");
        displayError.textContent = result.error.message;
      } else {
        fetch(fb_host + "/confirm_payment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            payment_method_id: result.paymentMethod.id,
            amount: amount,
            name: cus_select.value
          })
        }).then(function (result) {
          result.json().then(function (json) {
            handleServerResponse(json);
          });
        });
      }
    });
});

function handleServerResponse(response) {
  if (response.error) {
    var displayError = document.getElementById("card-errors");
    displayError.textContent = response.error.message;
  } else if (response.requires_action) {
    stripe
      .handleCardAction(response.payment_intent_client_secret)
      .then(function (result) {
        if (result.error) {
          var displayError = document.getElementById("card-errors");
          displayError.textContent = result.error.message;
        } else {
          fetch(fb_host + "/confirm_payment", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              payment_intent_id: result.paymentIntent.id
            })
          })
            .then(function (confirmResult) {
              return confirmResult.json();
            })
            .then(handleServerResponse);
        }
      });
  } else {
    var displayError = document.getElementById("card-errors");
    displayError.textContent = "Thank you! Payment successed.";
  }
}
