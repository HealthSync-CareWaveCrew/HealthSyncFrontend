import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Outlet } from "react-router-dom";

const stripeKey =
  import.meta.env.REACT_APP_STRIPE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

const stripePromise = stripeKey ? loadStripe(stripeKey) : null;

const PaymentLayout = () => (
  <Elements stripe={stripePromise}>
    <Outlet />
  </Elements>
);

export default PaymentLayout;
