# 🍱 Viva Summary: Online Food Ordering System

This document provides a highly structured technical overview of the project, designed for quick reference during an oral examination (Viva).

---

## 🚀 Project Overview at a Glance

| Category | Technology Stack |
| :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS, GSAP, Framer Motion, Three.js |
| **Backend** | Node.js, Express 5, Socket.io (Real-time), JWT (Security) |
| **Database** | MongoDB (NoSQL), Mongoose (ODM) |
| **Integrations** | Stripe (Payments), Brevo (OTP/Email), Cloudinary (Images) |
| **Architecture** | MVC (Model-View-Controller), Persona-based Dashboards |

---

## 🎨 1. Frontend Developer Role
> **Focus:** High-performance UI, animations, and real-time synchronization.

*   **Modern Architecture:** Built with **React 19** and **Vite** for optimized rendering and fast HMR (Hot Module Replacement).
*   **Premium UI/UX:** 
    *   Implemented **Glassmorphism** and custom design tokens for a premium aesthetic.
    *   Used **GSAP** for scroll-driven sequences and **Framer Motion** for state-based transitions.
    *   Integrated **Three.js** for immersive 3D elements in the hero section.
*   **Interactive Features:** 
    *   **React-Leaflet** for geospatial delivery location picking.
    *   **Socket.io-client** for live order tracking without manual refresh.
    *   **Recharts** for visualizing sales data in the restaurant dashboard.

---

## ⚙️ 2. Backend Developer Role
> **Focus:** Secure API design, real-time events, and professional integrations.

*   **Robust API Architecture:** Developed using **Express 5** follow the **MVC pattern**, ensuring clean separation of routes, controllers, and models.
*   **Security & Auth:** 
    *   **JWT & Bcrypt:** Secure token-based authentication and industry-standard password hashing.
    *   **RBAC:** Role-Based Access Control middleware for `Customer`, `Owner`, and `Admin`.
*   **Event-Driven Logic:** Configured **Socket.io** namespaces/rooms to handle live order notifications.
*   **Cloud Integrations:**
    *   **Stripe:** End-to-end payment orchestration with server-side verification.
    *   **Brevo:** REST API integration for reliable transactional emails and OTP flows.
    *   **Cloudinary:** Automated media management for restaurant logos and menu items.

---

## 📊 3. Database Developer Role
> **Focus:** Schema engineering, data integrity, and query optimization.

*   **Schema Design:** Designed a NoSQL structure that supports complex relations:
    *   **Relational Population:** Used Mongoose `populate()` to link Users, Restaurants, and Orders.
    *   **Data Integrity:** Implemented strictly typed schemas with validation and pre-save hooks.
*   **Optimization Strategies:** 
    *   **Indexing:** Created indices on `email` and `status` to speed up high-traffic queries.
    *   **TTL Indexes:** Implemented "Time To Live" expiration for OTP documents.

---

## 🧪 4. Testing & QA Role
> **Focus:** API validation, E2E workflow reliability, and edge case handling.

*   **API Validation:** 100% endpoint coverage tested via **Postman** (Status codes, payload integrity).
*   **Workflow Verification:** Validated the "Order Lifecycle": Cart ➔ Payment ➔ Acceptance ➔ Delivery Tracking.
*   **Edge Case Audits:** Tested for expired OTPs, failed payments, unauthorized access, and mobile responsiveness.
*   **Sandbox Testing:** Extensive use of **Stripe Test Environment** to handle various transaction scenarios.

---

## 🌟 Key Talking Points for Examiners
1.  **Full-Stack Synergy:** Seamless data flow between React 19 and Express 5.
2.  **Scalability:** MVC structure allows for easy feature updates and service expansion.
3.  **Real-world Readiness:** Integration of professional APIs (Stripe, Brevo, Cloudinary).
4.  **Premium Experience:** High-end animations and real-time feedback (Socket.io).
