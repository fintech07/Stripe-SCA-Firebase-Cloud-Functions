
'use strict';

module.exports = {
  // Default country for the checkout form.
  country: 'US',

  // Store currency.
  currency: 'usd',

  paymentMethods: [
    // 'ach_credit_transfer', // usd (ACH Credit Transfer payments must be in U.S. Dollars)
    'alipay', // aud, cad, eur, gbp, hkd, jpy, nzd, sgd, or usd.
    'bancontact', // eur (Bancontact must always use Euros)
    'card', // many (https://stripe.com/docs/currencies#presentment-currencies)
    'eps', // eur (EPS must always use Euros)
    'ideal', // eur (iDEAL must always use Euros)
    'giropay', // eur (Giropay must always use Euros)
    'multibanco', // eur (Multibanco must always use Euros)
    // 'sepa_debit', // Restricted. See docs for activation details: https://stripe.com/docs/sources/sepa-debit
    'sofort', // eur (SOFORT must always use Euros)
    'wechat', // aud, cad, eur, gbp, hkd, jpy, sgd, or usd.
  ],

  // Configuration for Stripe.
  // API Keys: https://dashboard.stripe.com/account/apikeys
  // Webhooks: https://dashboard.stripe.com/account/webhooks
  // Storing these keys and secrets as environment variables is a good practice.
  // You can fill them in your own `.env` file.
  stripe: {
    // The two-letter country code of your Stripe account (required for Payment Request).
    country: process.env.STRIPE_ACCOUNT_COUNTRY || 'US',
    // API version to set for this app (Stripe otherwise uses your default account version).
    apiVersion: '2019-03-14',
    // Use your test keys for development and live keys for real charges in production.
    // For non-card payments like iDEAL, live keys will redirect to real banking sites.
    publishableKey: 'pk_test_w9kpFx6D5QFqOEJ4FfZSfTHY00U34jqYnI',
    secretKey: 'sk_test_3fdKfwx6hZftPNPw9KP5rYx700EP6Itype',
    // Setting the webhook secret is good practice in order to verify signatures.
    // After creating a webhook, click to reveal details and find your signing secret.
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  },

  // Server port.
  port: process.env.PORT || 8000,
};
