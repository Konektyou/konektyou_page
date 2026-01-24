Okay, let me break it down clearly for you. Your client is basically saying:

1. **Subscription is required**:

   * Every user **must subscribe before booking a provider**.
   * Start with **$50/month**.
   * After subscribing once, the user **does not need to pay again** for booking other providers in the same month.

2. **Recurring payment**:

   * It’s a monthly subscription. So after the first month, the system will **automatically charge** the user every month for continued access.

3. **Admin control**:

   * The **admin should be able to change the subscription price** from the backend, so they can test different amounts.

4. **User flow**:

   * When a client logs in and sees available talent, they **must see a subscription pop-up** before they can book.
   * Pop-up shows **benefits of Premium**, title, and “Get Premium” button (as per your earlier note).

✅ In short: They want **mandatory subscription before booking**, recurring monthly payments, and **admin-adjustable price**.


**draw a simple flow diagram**
User logs in
      │
      ▼
Sees available talent in their area
      │
      ▼
Clicks "Book Now" on a provider
      │
      ▼
Subscription Check ──► Has Active Subscription? ──► Yes ─► Proceed to Booking Form
      │                                   
      │ No
      ▼
Show Premium Subscription Pop-up
      │
      ▼
User clicks "Get Premium"
      │
      ▼
Payment processed ($50/month or admin-set amount)
      │
      ▼
Subscription activated
      │
      ▼
Proceed to Booking Form
      │
      ▼
Booking Completed
      │
      ▼
Next month? ──► Automatic Monthly Deduction for Subscription
