/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  useStripe,
  useElements,
  CardElement,
} from "@stripe/react-stripe-js";
import PaymentContainer from "./PaymentContainer";

// const stripePromise = loadStripe("pk_test_51QSKfNE3A2mfWUXGBq41yD724xjXnoJaTvsLJgqM8xwmLBUTPzQ3JwhVtI8WJAE5f50X9RNYLmD5UemWmInMKA4k00yaAvK5aD"); // Replace with your Stripe publishable key

const CheckoutForm = ({ subscriptionId, onSubscriptionCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    const { error, paymentIntent } = await stripe.confirmCardPayment(
      subscriptionId,
      {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: { name: "Customer Name" }, // Add customer details here
        },
      }
    );

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
  const [stripePromise, setStripePromise] = useState(null);
  const [subscriptionId, setSubscriptionId] = useState("");
  const [loading, setLoading] = useState(false);
  const [packages, setPackages] = useState([]);
  const [clientSecrete, setClientSecrete] = useState("");

  const getPackages = async () => {
    const response = await fetch(
      "http://localhost:8000/admin/package/get-packages"
    );
    const data = await response.json();

    setPackages(data.data);
  };

  console.log(clientSecrete);

  useEffect(() => {
    getPackages();

    fetch("http://localhost:8000/payment/payment-config").then(async (r) => {
      const { data } = await r.json();
      console.log(data);
      setStripePromise(loadStripe(data));
    });
  }, []);

  const createSubscription = async (packageId) => {
    setLoading(true);
    const response = await fetch(
      "http://localhost:8000/payment/create-payment-intent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:
            "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3NTNiZmRlZDQxZTViYmQ1NjdkYTNkYyIsInVzZXJfdHlwZSI6InBhdGllbnQiLCJpYXQiOjE3MzM2MjMyMTAsImV4cCI6MTczNDIyODAxMH0.6SxPhXa6nj-LlTa0g5V07cQws2xiRjSlBfyga1qKO9Q",
        },
        body: JSON.stringify({
          packageId: packageId, // Replace with your Stripe price ID
        }),
      }
    );
    const data = await response.json();
    setClientSecrete(data.data.clientSecrete);
    // console.log(data.data.clientSecrete);
    // setSubscriptionId(data.subscriptionId);
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
    <div
      style={{
        display: "flex",
        padding: "5px",
        border: "1px solid red",
        gap: "5px",
        height: "100vh",
        width: "100vw",
      }}
    >
      <div style={{ flex: 1 }}>
        {packages.map((packageData) => (
          <div
            style={{
              cursor: "pointer",
              border: "1px solid white",
              padding: "5px",
            }}
            key={packageData.id}
            onClick={() => createSubscription(packageData._id)}
          >
            <h2>{packageData.name}</h2>
            <p>{packageData.description}</p>
          </div>
        ))}
      </div>
      {stripePromise && clientSecrete && (
        <div style={{ flex: 1, border: "1px solid red", padding: "10px" }}>
          <Elements
            stripe={stripePromise}
            options={{ clientSecret: clientSecrete }}
          >
            <PaymentContainer />
          </Elements>
        </div>
      )}
    </div>
  );
};

export default App;
