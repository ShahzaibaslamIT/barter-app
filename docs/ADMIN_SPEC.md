**Admin Web Interface Specification Document (Barter System MVP)**

**Purpose**

-   Provide a **web-based admin panel** to manage the Barter System
    mobile app.

-   Keep the marketplace **safe, clean, and usable** by reviewing users,
    listings, offers, chats (limited), and ratings.

-   Give admins **visibility** into activity (new users, new listings,
    reports, blocked content).

**1) Users of the Admin Panel**

**Admin Roles**

-   **Super Admin**

    -   Full access to everything (settings, roles, data export).

-   **Moderator**

    -   Reviews listings, handles reports, can suspend users.

-   **Support**

    -   View users and transactions, respond to issues, limited deletion
        powers.

**Role-Based Permissions (examples)**

-   Users:

    -   View ✅ / Edit ✅ / Suspend ✅ / Delete ❌ (Super Admin only)

-   Listings:

    -   View ✅ / Approve ✅ / Reject ✅ / Remove ✅

-   Reports:

    -   View ✅ / Resolve ✅

-   Settings:

    -   Edit ❌ (Super Admin only)

**2) Admin Panel Core Modules**

**2.1 Login & Access**

**Features**

-   Admin login (email + password)

-   Optional: 2-step login (code sent to email)

-   "Forgot password" flow

**Security Requirements**

-   Session timeout (example: 30 minutes of inactivity)

-   Account lock after repeated failed logins

-   Audit log for all admin actions (who did what, when)

**2.2 Dashboard (Home Screen)**

**What it shows (cards)**

-   New users (last 24h / 7d)

-   New listings awaiting review

-   Active listings count

-   Barter offers created (today/this week)

-   Open reports (spam, scam, abuse)

-   Message/report alerts (if you support chat reporting)

**Quick Actions**

-   "Review Listings Queue"

-   "Search User"

-   "View Reports"

-   "Export Data" (Super Admin only)

**2.3 User Management**

**Search & Filters**

-   Search by: name, email, phone, user ID

-   Filter by:

    -   Status: Active / Suspended / Banned

    -   Type: Service Provider / Item Owner / Both

    -   Location (city) or radius (optional)

**User Profile View (Admin)**

-   Basic info:

    -   Name, contact method, email/phone (masked view optional)

    -   User type

    -   Created date

    -   Last login date (if tracked)

    -   Location (city + coordinates if available)

-   Activity summary:

    -   Listings count (active / removed)

    -   Offers made / received

    -   Ratings average + count

    -   Reports count (against them / by them)

**Admin Actions**

-   Edit user fields (name, user type, contact method)

-   Reset password (send reset email link)

-   Suspend user (temporary)

-   Ban user (permanent)

-   Add admin note (internal)

-   View audit history related to user

**2.4 Listing Moderation (Items + Services)**

**Listing Review Queue**

-   Status tabs:

    -   Pending Review

    -   Approved

    -   Rejected

    -   Removed

**Listing Details View**

-   Listing type: Item / Service

-   Title, description, category

-   Photos gallery

-   Location (map preview)

-   Condition (items)

-   Availability + skill level (services)

-   Barter request text

-   Created date

-   Owner details (link to user)

**Moderation Actions**

-   Approve listing

-   Reject listing (must choose a reason)

-   Remove listing (for violations)

-   Request changes (optional) → marks as "Needs Update"

-   Flag as "Spam suspected"

**Rejection Reasons (examples)**

-   Inappropriate content

-   Spam / duplicate

-   Illegal item/service

-   Scam risk

-   Wrong category

-   Missing required photo (items)

**2.5 Categories & Tags Management**

**Features**

-   Create/edit/delete categories for:

    -   Items (electronics, tools, appliances)

    -   Services (moving, tutoring, cleaning)

-   Manage skill levels (Unskilled / Skilled)

-   Manage item condition options (New / Good / Used / Fair / Broken)

-   Manage "barter interest tags" (optional)

**Why it matters**

-   Clean categories improve search and reduce messy listings.

**2.6 Barter Offers & Transactions**

**Offer List**

-   Filter:

    -   Pending / Accepted / Declined / Countered / Cancelled /
        Completed

-   View offer details:

    -   Listing offered on

    -   Sender's offered item/service (linked)

    -   Message text

    -   Timeline of actions (created → accepted → completed)

**Admin Actions**

-   Mark as "Disputed" (if complaints)

-   Force-cancel offer (rare, for safety)

-   Add internal notes

**2.7 Messaging (Admin View -- Limited & Privacy-Safe)**

**Recommended approach (MVP)**

-   Admin **does not read chats by default**.

-   Admin can access a thread **only if**:

    -   A report is filed on that conversation, or

    -   A safety flag triggers review.

**Features**

-   View reported conversation thread

-   Show message timestamps + sender IDs

-   Mask personal info (optional filter)

**Admin Actions**

-   Warn user

-   Suspend user

-   Close thread (locks messaging for that barter)

**2.8 Ratings & Reviews Moderation**

**Features**

-   Search ratings by:

    -   Rated user

    -   Rater user

    -   Barter ID

-   Flags:

    -   Offensive language

    -   Harassment

    -   Spam

**Admin Actions**

-   Remove rating comment (optional: keep star rating)

-   Remove entire rating (Super Admin only)

-   Add moderation note

**2.9 Reports & Abuse Handling**

**Report Types**

-   Listing report (spam/scam/inappropriate)

-   User report (harassment/fraud)

-   Message report (abuse)

-   Rating report (offensive)

**Report Workflow**

-   Status: Open → In Review → Resolved → Closed

-   Required fields:

    -   Reporter user ID

    -   Reported entity ID (listing/user/message)

    -   Reason

    -   Optional notes

    -   Created date

**Admin Actions**

-   Resolve report with outcome:

    -   No action

    -   Listing removed

    -   User warned

    -   User suspended/banned

**2.10 Geolocation & Marketplace Controls**

**Settings Admin Can Change**

-   Default discovery radius (example: 10 km)

-   Max radius allowed (example: 50 km)

-   "No cross-city" rule toggle (MVP constraint)

-   City allowlist (optional)

**Map Monitoring (optional)**

-   Heatmap of listing density (nice-to-have)

**2.11 Notifications & Announcements (Optional MVP+)**

**Features**

-   Send announcement to:

    -   All users

    -   Users in a city

    -   Users by type (service providers only, etc.)

-   Templates:

    -   Safety reminders

    -   Feature updates

**2.12 System Settings**

-   App status banner ("Maintenance mode")

-   Content rules text (internal)

-   Rate limits (messages per minute, listing per day)

**3) Admin UI Pages (Suggested Navigation)**

**Left Menu**

-   Dashboard

-   Users

-   Listings

-   Offers/Transactions

-   Reports

-   Ratings

-   Categories/Tags

-   Settings (Super Admin)

-   Audit Logs

**Global Tools**

-   Search bar (User ID / Listing ID / Offer ID)

-   Admin profile dropdown (role, logout)

**4) Data & API Requirements (Backend Support)**

**Recommended Admin-Side Endpoints (examples)**

-   POST /admin/auth/login

-   GET /admin/dashboard/summary

-   GET /admin/users?search=&status=&type=

-   PATCH /admin/users/:id (edit, suspend, ban)

-   GET /admin/listings?status=&type=&category=

-   PATCH /admin/listings/:id/approve

-   PATCH /admin/listings/:id/reject

-   PATCH /admin/listings/:id/remove

-   GET /admin/reports?status=&type=

-   PATCH /admin/reports/:id/resolve

-   GET /admin/ratings?user_id=

-   DELETE /admin/ratings/:id (restricted)

-   GET /admin/audit-logs?actor_id=&date_range=

**Admin Audit Log Table (recommended)**

-   id, admin_id, action_type, entity_type, entity_id, metadata,
    created_at

**5) Non-Functional Requirements**

**Performance**

-   Search results return fast (goal: under 2 seconds for common
    queries)

-   Pagination everywhere (users, listings, reports)

**Usability**

-   Clear status labels (Pending/Approved/Removed)

-   "Reason required" for rejection/removal

-   Confirm dialogs for destructive actions

**Security**

-   Role-based access control (RBAC)

-   All admin actions logged

-   Prevent admins from seeing sensitive user data unless needed
    (masking)

**6) Suggested Tech Stack for Admin Web App**

-   Frontend: **React** (web) + simple component library (for fast UI)

-   Auth: Admin JWT + refresh token

-   Hosting: Any basic web hosting (works with your Node API)

**7) MVP vs Next Version**

**MVP Must-Haves**

-   Admin login + RBAC

-   Dashboard summary

-   Users management (view, suspend)

-   Listings moderation (approve/reject/remove)

-   Reports workflow

-   Categories management

-   Audit logs

**MVP+ Nice-to-Haves**

-   Announcement notifications

-   Heatmap analytics

-   Advanced fraud detection flags

-   Export tools (CSV)

If you want, I can also generate:

-   A **database schema** for admin tables (admins, roles, permissions,
    reports, audit_logs)

-   A **React admin dashboard starter project structure**

-   The **Node.js + Express admin API** (with JWT + RBAC)
