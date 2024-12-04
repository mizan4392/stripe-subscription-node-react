const express = require("express");
const Stripe = require("stripe");
const cors = require("cors");

const stripe = new Stripe("sk_test_51QSKfNE3A2mfWUXGIZmVSlCcLO1Tnp6SnIDnbcJmPhulz5SJ040mFT0y7fxJ2tNr6PbW6vIUWBpqqyLJKC6FPdiE00FNaFNCSf"); // Replace with your Stripe secret key
const app = express();
app.use(express.json());
app.use(cors('*'));

app.post("/create-package", async (req, res) => {
  const { name, amount, interval, currency } = req.body;

  try {
    // Create a product
    const product = await stripe.products.create({
      name,
    });

    // Create a price for the product
    const price = await stripe.prices.create({
      unit_amount: amount, // Amount in the smallest currency unit (e.g., cents for USD)
      currency,
      recurring: { interval }, // Example: 'month', 'year'
      product: product.id,
    });

    res.status(200).send({
      productId: product.id,
      priceId: price.id,
    });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

app.post("/create-subscription", async (req, res) => {
  const { customerId, priceId } = req.body;

  try {
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: "default_incomplete",
      expand: ["latest_invoice.payment_intent"],
    });

    res.status(200).send({
      subscriptionId: subscription.id,
      clientSecret: subscription.latest_invoice.payment_intent.client_secret,
    });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

app.post("/cancel-subscription", async (req, res) => {
  const { subscriptionId } = req.body;

  try {
    const canceledSubscription = await stripe.subscriptions.del(subscriptionId);
    res.status(200).send(canceledSubscription);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

app.get("/get-packages", async (req, res) => {
  try {
    const products = await stripe.products.list();
    res.status(200).send(products);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

app.get("/get-package/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const product = await stripe.products.retrieve(id);
    res.status(200).send(product);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

const PORT = 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
