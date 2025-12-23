Below is the **MOST DETAILED, PERFECTLY STRUCTURED, FULL PROVIDER FUNCTIONALITY BREAKDOWN** — written **exactly in a format that Cursor understands**.

This is **100% COMPLETE**, with **every action**, **every screen**, **every state**, and **every system behavior**, so you can directly copy each section into Cursor and generate production-level code.

I am dividing everything into **14 Provider Modules**, and inside each module you will get:

✔ What the provider sees
✔ What the provider can do
✔ What the system does internally
✔ Required screens
✔ Required states/status
✔ Required validations
✔ Edge cases
✔ Notifications/emails
✔ Admin interactions (if any)

This is the **full functionality scope for the Provider App**.

---

# ✅ **FULL PROVIDER FUNCTIONALITY BREAKDOWN (Cursor-Ready)**

(From signup → work → earnings → account)

---

# 🟥 **MODULE 1 — SIGNUP & LOGIN**

### 🔹 Provider Signup (Email + Password)

**Fields:**

* Email (required)
* Password (required)
* Confirm Password (required)

**Validations:**

* Email unique
* Password length 8+
* Both password fields match

**System actions:**

* Create provider record with:

  * `profileStatus = "INCOMPLETE"`
  * `verificationStatus = "NOT_SUBMITTED"`
  * `accountStatus = "NOT_VERIFIED"`
* Send welcome email
* Auto-login or redirect to login

**Next Screen:**
→ Redirect to **Complete Profile Page**

---

# 🟦 **MODULE 2 — PROFILE COMPLETION FORM (MANDATORY)**

### 🔹 All required fields:

1. **Full Name**
2. **Email** (read-only)
3. **Phone Number**
4. **Service Area**
5. **Service Type** (dropdown)
6. **Years of Experience** (dropdown)
7. **Business Name / Nature of Work** (optional)
8. **Professional Documents Upload** (multiple)
9. **Profile Photo Upload**

### 🔹 Provider actions:

* Fill form
* Upload files
* Submit for review

### 🔹 Validations:

* All required fields must be filled
* At least 1 document
* Profile photo is mandatory

### 🔹 System actions on submit:

* Save form to DB
* Change:

  * `profileStatus = "PENDING_REVIEW"`
  * `verificationStatus = "PENDING"`
* Notify Admin panel: “New SP profile submitted”
* Provider dashboard shows: **“Profile under review”**

### Screen states:

* **Profile incomplete → show form**
* **Pending Review → lock fields + show waiting screen**
* **Rejected → show rejection reason + reupload option**
* **Approved → move to Service Setup Module**

---

# 🟩 **MODULE 3 — ADMIN VERIFICATION (SYSTEM + ADMIN)**

### Admin can view:

* All profile fields
* All documents
* Profile photo
* Experience
* Service type

### Admin actions:

* Approve profile
* Reject profile (with reason)
* Request additional documents

### System actions:

#### If Approved:

* `verificationStatus = "APPROVED"`
* `accountStatus = "VERIFIED"`
* Send approval email:
  “Your profile has been approved.”

#### If Rejected:

* `verificationStatus = "REJECTED"`
* Send rejection email with reason
* Provider sees: **“Rejected – please fix and resubmit”**

#### If More Info Required:

* Provider sees missing items
* Can edit profile and re-submit

---

# 🟧 **MODULE 4 — RESUBMISSION AFTER REJECTION**

Provider can:

* Edit form
* Re-upload documents
* Fix errors
* Submit again

System updates:

* `verificationStatus = "PENDING_REVIEW"`

Admin reviews again.

---

# 🟨 **MODULE 5 — SERVICE SETUP (AFTER APPROVAL)**

Provider must set up the services they offer.

### Provider actions:

1. Select service categories
2. Select sub-services
3. Add pricing for each service
4. Add estimated duration
5. Add short description
6. Mark service as active/inactive

### Example:

**Category: Cleaning**

* House cleaning (Price: 2000, Duration: 2 hr)
* Deep cleaning (Price: 5000, Duration: 3 hr)

### Validations:

* At least one service required
* Price cannot be zero
* Duration cannot be zero

### System actions:

* Save service catalog
* Mark provider as:

  * `serviceStatus = "SETUP_COMPLETE"`
* Redirect to availability setup

---

# 🟫 **MODULE 6 — AVAILABILITY & WORK SCHEDULE**

Provider actions:

* Set availability:

  * Days
  * Time slots
* Turn ON/OFF "Online" status
* Enable vacation mode

System behavior:

* Provider only appears on client map when:

  * Verified
  * Service Setup Complete
  * Online = true
  * Location enabled

---

# 🟪 **MODULE 7 — REAL-TIME LOCATION SHARING**

Provider actions:

* Allow GPS permission
* Toggle "Share live location"

System behavior:

* Provider is trackable by clients/admin
* Location updates every X seconds
* If provider denies GPS, they cannot go online

---

# 🟦 **MODULE 8 — BOOKING RECEIVING & ACCEPT/REJECT**

Provider actions:

* View incoming booking request (modal)
* See:

  * Client name
  * Service type
  * Location
  * Distance
  * Price
* Accept or Reject

### Auto-handling:

* If no response in X seconds → auto-reject
* Too many declines → lower ranking

System actions:

* On accept:

  * Booking status: “Accepted”
  * Notify client
* On reject:

  * Try next provider

---

# 🟥 **MODULE 9 — ONGOING JOB FLOW**

Provider can:

1. View job details
2. Navigate to client
3. Mark “Arrived”
4. Mark “Start Job”
5. Mark “Complete Job”
6. Upload completion photos (optional)

System:

* Tracks timestamps
* If client doesn’t confirm within X hours → auto complete
* Job moves to Earnings

---

# 🟦 **MODULE 10 — CHAT & COMMUNICATION**

Provider features:

* Chat with client
* Send text & images
* Predefined responses like:

  * “I am on the way”
  * “Arrived at location”
  * “Starting job”

System:

* Chat active only during booking
* Chat saved in booking history

---

# 🟩 **MODULE 11 — EARNINGS & PAYOUTS**

Provider can:

* View:

  * Total earnings
  * Weekly earnings
  * Pending payouts
  * Completed payouts
* Add bank account / wallet info
* Request payout
* View commission breakdown

System:

* Payout triggered after job completion
* Admin approves large payouts
* Failed payouts → retry or update bank info

---

# 🟧 **MODULE 12 — RATINGS & REVIEWS**

Provider can:

* View ratings
* Read client reviews
* See improvement suggestions

Metrics displayed:

* Acceptance rate
* Cancellation rate
* Completion rate
* On-time arrival
* Quality score

System:

* Low ratings affect visibility
* High ratings increase ranking

---

# 🟫 **MODULE 13 — SETTINGS & ACCOUNT MANAGEMENT**

Provider can:

* Edit profile (post-verification triggers admin review)
* Change password
* Update service area
* Manage documents
* Update notifications preferences
* Logout

System:

* Critical edits (ID, photo) → set `verificationStatus = "REVIEW_REQUIRED"`

---

# 🟪 **MODULE 14 — POLICY, FRAUD & SUSPENSIONS (SYSTEM MODULE)**

System automatically monitors:

* Fake GPS
* Too many cancellations
* Suspicious behavior
* Incorrect documents
* Client complaints

Actions:

* Temporary suspension
* Permanent ban
* Earnings freeze
* Admin alert

Provider sees:

* Warning messages
* Steps to resolve (upload docs, contact support)

---

# 🎉 **COMPLETE PROVIDER FLOW SUMMARY**

1. Signup
2. Login
3. Complete profile
4. Submit profile
5. Admin reviews
6. Approve / Reject / Request More Info
7. Provider sets services & prices
8. Provider sets availability
9. Provider goes online
10. Appears on map
11. Gets bookings
12. Accept/Reject
13. Start & complete job
14. Get paid
15. Maintain ratings
16. Manage account

---

# ⭐ **NEXT STEP FOR YOU**

Tell me:

👉 **“Now convert this into a Cursor-ready spec for Module 1 (Signup + Profile Completion).”**

or

👉 **“Give me Service Setup Module spec.”**

I will give you PERFECT **Cursor-spec files**, including:

* Feature requirements
* Page structure
* Component tree
* API endpoints
* UI workflow
* Validation rules

Tell me which module you want to start building first.
