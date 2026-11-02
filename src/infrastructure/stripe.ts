import Stripe from "stripe";

// if(!process.env.STRIPE_SECRET_KEY) {
//     throw new Error("Missing STRIPE_SECRET_KEY in environment variables");
// }
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || "dummy_key_for_development";

export const stripe = new Stripe(stripeSecretKey, {
    apiVersion: '2026-05-27.dahlia',
    typescript: true,
})