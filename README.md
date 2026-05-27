# Artisan-marketplace

Payment Gateway
1. User fills address
2. User selects UPI or Card
3. User clicks Pay
4. Checkout.jsx loads Razorpay script
5. Checkout.jsx calls /api/payments/create-order
6. Backend checks product and stock
7. Backend calculates amount
8. Backend creates Razorpay order
9. Frontend opens Razorpay popup
10. User completes payment
11. Razorpay returns payment_id, order_id, signature
12. Frontend sends these to /api/payments/verify
13. Backend verifies signature using RAZORPAY_KEY_SECRET
14. Backend creates Order with paymentStatus: "paid"
15. User is redirected to /my-orders