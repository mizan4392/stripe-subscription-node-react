/* eslint-disable react/prop-types */
import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, useStripe, useElements, CardElement } from "@stripe/react-stripe-js";

const stripePromise = loadStripe("pk_test_51QSKfNE3A2mfWUXGBq41yD724xjXnoJaTvsLJgqM8xwmLBUTPzQ3JwhVtI8WJAE5f50X9RNYLmD5UemWmInMKA4k00yaAvK5aD"); // Replace with your Stripe publishable key

const CheckoutForm = ({ subscriptionId, onSubscriptionCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    const { error, paymentIntent } = await stripe.confirmCardPayment(subscriptionId, {
      payment_method: {
        card: elements.getElement(CardElement),
        billing_details: { name: "Customer Name" }, // Add customer details here
      },
    });

    if (error) {
      console.error(error.message);
    } else {
      console.log("Payment successful: ", paymentIntent);
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardElement />
      <button type="submit" disabled={!stripe || loading}>
        {loading ? "Processing..." : "Subscribe"}
      </button>
      <button
        type="button"
        onClick={onSubscriptionCancel}
        style={{ marginLeft: "10px" }}
      >
        Cancel Subscription
      </button>
    </form>
  );
};

const App = () => {
  const [subscriptionId, setSubscriptionId] = useState("");
  const [loading, setLoading] = useState(false);

  const createSubscription = async () => {
    setLoading(true);
    const response = await fetch("http://localhost:3001/create-subscription", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerId: "123", // Replace with actual customer ID
        priceId: "your-price-id", // Replace with your Stripe price ID
      }),
    });
    const data = await response.json();
    setSubscriptionId(data.subscriptionId);
    setLoading(false);
  };

  const cancelSubscription = async () => {
    setLoading(true);
    await fetch("http://localhost:3001/cancel-subscription", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subscriptionId }),
    });
    setSubscriptionId("");
    setLoading(false);
  };

  return (
    <Elements stripe={stripePromise}>
      <div>
        {!subscriptionId ? (
          <button onClick={createSubscription} disabled={loading}>
            {loading ? "Loading..." : "Start Subscription"}
          </button>
        ) : (
          <CheckoutForm
            subscriptionId={subscriptionId}
            onSubscriptionCancel={cancelSubscription}
          />
        )}
      </div>
    </Elements>
  );
};

export default App;
