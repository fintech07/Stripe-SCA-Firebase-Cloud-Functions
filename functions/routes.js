'use strict';

const admin = require('firebase-admin');
admin.initializeApp();

const config = require('./config');
const express = require('express');
const router = express.Router();
const stripe = require('stripe')(config.stripe.secretKey);

router.post('/confirm_payment', async (request, response) => {
  try {
    let intent;

    if (request.body.payment_method_id) {
      // Create the PaymentIntent
      intent = await stripe.paymentIntents.create({
        payment_method: request.body.payment_method_id,
        amount: request.body.amount * 100,
        currency: 'usd',
        confirmation_method: 'manual',
        description: request.body.name,
        confirm: true
      });
    } else if (request.body.payment_intent_id) {
      intent = await stripe.paymentIntents.confirm(
        request.body.payment_intent_id
      );
    }
    // Send the response to the client
    response.send(generate_payment_response(intent));
  } catch (e) {
    // Display error on client
    return response.send({ error: e.message });
  }
});

const generate_payment_response = (intent) => {

  if (
    intent.status === 'requires_action' &&
    intent.next_action.type === 'use_stripe_sdk'
  ) {
    // Tell the client to handle the action
    return {
      requires_action: true,
      payment_intent_client_secret: intent.client_secret
    };
  } else if (intent.status === 'succeeded') {
    // The payment didn’t need any additional actions and completed!
    // Handle post-payment fulfillment
    return {
      success: true
    };
  } else {
    // Invalid status
    return {
      error: 'Invalid PaymentIntent status'
    }
  }
};

// Expose the Stripe publishable key and other pieces of config via an endpoint.
router.get('/config', (req, res) => {
  res.json({
    stripePublishableKey: config.stripe.publishableKey,
    stripeCountry: config.stripe.country,
    country: config.country,
    currency: config.currency,
    paymentMethods: config.paymentMethods,
    shippingOptions: config.shippingOptions,
  });
});

router.get('/customers', (req, res) => {

  const database = admin.database().ref("customers");
  let customers = [];
  database.on("value", function(snapshot) {
    snapshot.forEach(function(childSnapshot) {
      var childData = childSnapshot.val();
      var customer = childData.customerName;

      customers.push({
        customer: customer
      });
    });

    res.status(200).json(customers);
  }, (error) => {
    res.status(500).json({
      error: `Something went wrong. ${error}`
    })
  });

});

module.exports = router;
