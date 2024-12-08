import {
  Elements,
  useStripe,
  useElements,
  CardElement,
  PaymentElement,
} from "@stripe/react-stripe-js";
import { useState } from "react";

export default function PaymentContainer() {
  const [isLoading, setIsLoading] = useState(false);
  const elements = useElements();
  const stripeHook = useStripe();

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!stripeHook && !elements) return;

    setIsLoading(true);
    const { error } = await stripeHook.confirmPayment({
      elements,
      confirmParams: {
        return_url: "http://localhost:3000/success",
      },
    });
    console.log(error);

    setIsLoading(false);
  };
  return (
    <form id="payment-form" onSubmit={handleSubmit}>
      <PaymentElement />
      <button id="submit" disabled={isLoading}>
        {isLoading ? "Loading..." : "Pay"}
      </button>
    </form>
  );
}
