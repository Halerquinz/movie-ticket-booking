#!/bin/bash
# Set the API Key (Consider passing this via environment variables or secure vault solutions)
export STRIPE_API_KEY=whsec_b970a079b33287edad0ef78bce20cc1467f3ae2799f125b7e402d3f3fed06438

# Start Stripe listen command
stripe listen --api-key $STRIPE_API_KEY --events checkout.session.completed,checkout.session.expired --forward-to http://localhost:20003/webhook