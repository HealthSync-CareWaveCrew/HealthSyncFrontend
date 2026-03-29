export const getStripeErrorMessage = (stripeError) => {
  const code = stripeError?.code || stripeError?.decline_code;
  switch (code) {
    case "card_declined":
      return "Your card was declined. Please try another card.";
    case "insufficient_funds":
      return "Insufficient funds. Please try another card.";
    case "expired_card":
      return "Your card has expired.";
    case "incorrect_cvc":
      return "Incorrect CVC. Please check and try again.";
    default:
      return stripeError?.message || "Payment failed. Please try again.";
  }
};
