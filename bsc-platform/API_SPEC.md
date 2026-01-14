# BSC Event Ticketing Platform - API Specification v2.0

> **Version**: 2.0  
> **Base URL**: `https://api.bsc.id/v1`  
> **Authentication**: Bearer JWT Token  
> **Content-Type**: `application/json`

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [Users](#2-users)
3. [Organizer](#3-organizer)
4. [Events](#4-events)
5. [Tickets](#5-tickets)
6. [Bookings](#6-bookings)
7. [Payments](#7-payments)
8. [Check-in](#8-check-in)
9. [Promo Codes](#9-promo-codes)
10. [Reviews](#10-reviews)
11. [Notifications](#11-notifications)
12. [Admin](#12-admin)
13. [Public](#13-public)

---

## Common Response Format

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": 1001,
    "message": "Invalid credentials",
    "details": { ... }
  },
  "requestId": "req_abc123"
}
```

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 204 | No Content |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 422 | Validation Error |
| 429 | Too Many Requests |
| 500 | Internal Server Error |

---

## 1. Authentication

### POST /auth/register

Register a new user account.

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "phone": "+628123456789"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "customer",
      "isVerified": false
    },
    "message": "Verification email sent"
  }
}
```

---

### POST /auth/login

Authenticate user and get tokens.

**Request:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "customer",
      "avatar": "https://..."
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "dGhpcyBpcyBhIHJlZnJlc2g...",
      "expiresIn": 900
    }
  }
}
```

---

### POST /auth/refresh

Refresh access token.

**Request:**
```json
{
  "refreshToken": "dGhpcyBpcyBhIHJlZnJlc2g..."
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 900
  }
}
```

---

### POST /auth/logout

Invalidate refresh token.

**Headers:** `Authorization: Bearer <access_token>`

**Response (204):** No content

---

### POST /auth/verify-email

Verify email with token.

**Request:**
```json
{
  "token": "verification-token-uuid"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Email verified successfully"
  }
}
```

---

### POST /auth/forgot-password

Request password reset.

**Request:**
```json
{
  "email": "john@example.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Reset link sent if email exists"
  }
}
```

---

### POST /auth/reset-password

Reset password with token.

**Request:**
```json
{
  "token": "reset-token-uuid",
  "password": "NewSecurePass123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Password reset successfully"
  }
}
```

---

### POST /auth/social/{provider}

Social login (Google, Facebook, Apple).

**Request:**
```json
{
  "accessToken": "social-provider-access-token"
}
```

**Response (200):** Same as /auth/login

---

## 2. Users

### GET /users/me

Get current user profile.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+628123456789",
    "avatar": "https://...",
    "role": "customer",
    "isVerified": true,
    "locale": "id",
    "timezone": "Asia/Jakarta",
    "createdAt": "2026-01-01T00:00:00Z"
  }
}
```

---

### PATCH /users/me

Update current user profile.

**Request:**
```json
{
  "name": "John Updated",
  "phone": "+628123456789",
  "locale": "en",
  "timezone": "Asia/Jakarta"
}
```

**Response (200):** Updated user object

---

### PATCH /users/me/password

Change password.

**Request:**
```json
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewPass456!"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Password changed successfully"
  }
}
```

---

### POST /users/me/avatar

Upload avatar image.

**Request:** `multipart/form-data`
- `avatar`: Image file (max 2MB, jpg/png)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "avatar": "https://cdn.bsc.id/avatars/uuid.jpg"
  }
}
```

---

### GET /users/me/bookings

Get user's booking history.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `status`: Filter by status (pending, paid, cancelled)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "bookingCode": "BSC-2026-A3X7K9",
      "event": {
        "id": "uuid",
        "title": "Music Festival 2026",
        "posterUrl": "https://...",
        "startDatetime": "2026-02-01T19:00:00Z"
      },
      "totalTickets": 2,
      "totalAmount": 500000,
      "status": "paid",
      "createdAt": "2026-01-15T10:00:00Z"
    }
  ],
  "meta": { ... }
}
```

---

### GET /users/me/tickets

Get user's active tickets.

**Query Parameters:**
- `page`, `limit`
- `upcoming`: true/false (filter by event date)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "ticketCode": "7A3F9C2B1E4D8A0F5C6B3E9D2A1F7C4B",
      "qrCodeUrl": "https://...",
      "ticketType": "VIP",
      "seat": "A-12",
      "event": {
        "id": "uuid",
        "title": "Music Festival 2026",
        "venue": "Gelora Bung Karno",
        "startDatetime": "2026-02-01T19:00:00Z"
      },
      "isCheckedIn": false,
      "booking": {
        "id": "uuid",
        "bookingCode": "BSC-2026-A3X7K9"
      }
    }
  ]
}
```

---

### GET /users/me/wishlist

Get user's saved events.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "event": {
        "id": "uuid",
        "title": "Music Festival 2026",
        "posterUrl": "https://...",
        "startDatetime": "2026-02-01T19:00:00Z",
        "venue": "Gelora Bung Karno",
        "lowestPrice": 250000
      },
      "addedAt": "2026-01-10T08:00:00Z"
    }
  ]
}
```

---

### POST /users/me/wishlist

Add event to wishlist.

**Request:**
```json
{
  "eventId": "uuid"
}
```

**Response (201):** Wishlist item object

---

### DELETE /users/me/wishlist/{eventId}

Remove from wishlist.

**Response (204):** No content

---

### GET /users/me/following

Get followed organizers.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "organizer": {
        "id": "uuid",
        "name": "ABC Entertainment",
        "slug": "abc-entertainment",
        "logo": "https://...",
        "isVerified": true
      },
      "notifyNewEvents": true,
      "followedAt": "2026-01-10T08:00:00Z"
    }
  ]
}
```

---

### POST /users/me/following

Follow organizer.

**Request:**
```json
{
  "organizerId": "uuid",
  "notifyNewEvents": true
}
```

**Response (201):** Following object

---

### DELETE /users/me/following/{organizerId}

Unfollow organizer.

**Response (204):** No content

---

## 3. Organizer

### POST /organizer/apply

Apply to become organizer.

**Request:**
```json
{
  "organizationName": "ABC Entertainment",
  "bio": "Event organizer since 2020...",
  "website": "https://abc-ent.com",
  "phone": "+628123456789"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "organizationName": "ABC Entertainment",
    "slug": "abc-entertainment",
    "verificationStatus": "pending"
  }
}
```

---

### GET /organizer/profile

Get organizer profile.

**Headers:** `Authorization: Bearer <token>` (organizer role)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "organizationName": "ABC Entertainment",
    "slug": "abc-entertainment",
    "logo": "https://...",
    "banner": "https://...",
    "bio": "...",
    "website": "https://...",
    "socialFacebook": "...",
    "socialInstagram": "...",
    "walletBalance": 5000000,
    "totalEarned": 50000000,
    "totalWithdrawn": 45000000,
    "isVerified": true,
    "verificationStatus": "approved"
  }
}
```

---

### PATCH /organizer/profile

Update organizer profile.

**Request:**
```json
{
  "organizationName": "ABC Entertainment Updated",
  "bio": "Updated bio...",
  "website": "https://new-site.com",
  "socialFacebook": "https://fb.com/abc",
  "socialInstagram": "https://instagram.com/abc"
}
```

**Response (200):** Updated profile object

---

### GET /organizer/bank-accounts

List bank accounts.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "bankName": "BCA",
      "bankCode": "014",
      "accountNumber": "1234567890",
      "accountHolderName": "PT ABC Entertainment",
      "isPrimary": true,
      "isVerified": true
    }
  ]
}
```

---

### POST /organizer/bank-accounts

Add bank account.

**Request:**
```json
{
  "bankName": "BCA",
  "bankCode": "014",
  "accountNumber": "1234567890",
  "accountHolderName": "PT ABC Entertainment"
}
```

**Response (201):** Bank account object

---

### DELETE /organizer/bank-accounts/{id}

Remove bank account.

**Response (204):** No content

---

### GET /organizer/wallet/transactions

Get wallet transaction history.

**Query Parameters:**
- `page`, `limit`
- `type`: credit, debit
- `from`, `to`: Date range

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "type": "credit",
      "amount": 475000,
      "description": "Booking BSC-2026-A3X7K9",
      "reference": {
        "type": "booking",
        "id": "uuid"
      },
      "balanceAfter": 5475000,
      "createdAt": "2026-01-15T10:00:00Z"
    }
  ],
  "meta": { ... }
}
```

---

### POST /organizer/payouts

Request payout.

**Request:**
```json
{
  "amount": 5000000,
  "bankAccountId": "uuid",
  "notes": "January payout"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "payoutCode": "PO-2026-X7K9A3",
    "amount": 5000000,
    "fee": 6500,
    "netAmount": 4993500,
    "status": "requested",
    "bankAccount": { ... },
    "requestedAt": "2026-01-20T10:00:00Z"
  }
}
```

---

### GET /organizer/payouts

List payout history.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "payoutCode": "PO-2026-X7K9A3",
      "amount": 5000000,
      "fee": 6500,
      "netAmount": 4993500,
      "status": "completed",
      "bankAccount": { ... },
      "requestedAt": "2026-01-20T10:00:00Z",
      "completedAt": "2026-01-21T14:00:00Z"
    }
  ]
}
```

---

### GET /organizer/team

List team members.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "user": {
        "id": "uuid",
        "name": "Staff Member",
        "email": "staff@example.com"
      },
      "role": "scanner",
      "permissions": ["check_in"],
      "isActive": true,
      "invitedAt": "2026-01-01T00:00:00Z",
      "acceptedAt": "2026-01-02T10:00:00Z"
    }
  ]
}
```

---

### POST /organizer/team/invite

Invite team member.

**Request:**
```json
{
  "email": "newstaff@example.com",
  "role": "scanner",
  "permissions": ["check_in", "view_attendees"]
}
```

**Response (201):** Team member invite object

---

### DELETE /organizer/team/{memberId}

Remove team member.

**Response (204):** No content

---

### GET /organizer/dashboard

Get organizer dashboard stats.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "today": {
      "revenue": 2500000,
      "ticketsSold": 50,
      "bookings": 25
    },
    "thisMonth": {
      "revenue": 50000000,
      "ticketsSold": 1000,
      "bookings": 500
    },
    "activeEvents": 5,
    "totalAttendees": 2500,
    "walletBalance": 5000000,
    "pendingPayouts": 0,
    "recentBookings": [ ... ],
    "topEvents": [ ... ],
    "revenueChart": {
      "labels": ["Jan 1", "Jan 2", ...],
      "data": [100000, 150000, ...]
    }
  }
}
```

---

## 4. Events

### GET /events

List public events.

**Query Parameters:**
- `page`, `limit`
- `q`: Search query
- `category`: Category slug
- `city`: City name
- `dateFrom`, `dateTo`: Date range
- `type`: offline, online, hybrid
- `priceMin`, `priceMax`: Price range
- `sort`: date, popularity, price_asc, price_desc
- `featured`: true/false

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Music Festival 2026",
      "slug": "music-festival-2026",
      "shortDescription": "The biggest music event...",
      "posterUrl": "https://...",
      "thumbnailUrl": "https://...",
      "startDatetime": "2026-02-01T19:00:00Z",
      "endDatetime": "2026-02-01T23:00:00Z",
      "eventType": "offline",
      "venue": {
        "name": "Gelora Bung Karno",
        "city": "Jakarta"
      },
      "category": {
        "id": "uuid",
        "name": "Music",
        "slug": "music"
      },
      "organizer": {
        "id": "uuid",
        "name": "ABC Entertainment",
        "slug": "abc-entertainment",
        "isVerified": true
      },
      "lowestPrice": 250000,
      "isFeatured": true,
      "isSoldOut": false
    }
  ],
  "meta": { ... }
}
```

---

### GET /events/{slug}

Get event detail.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Music Festival 2026",
    "slug": "music-festival-2026",
    "shortDescription": "...",
    "description": "<p>Full HTML description...</p>",
    "posterUrl": "https://...",
    "bannerUrl": "https://...",
    "trailerVideoUrl": "https://youtube.com/...",
    "startDatetime": "2026-02-01T19:00:00Z",
    "endDatetime": "2026-02-01T23:00:00Z",
    "timezone": "Asia/Jakarta",
    "eventType": "offline",
    "visibility": "public",
    "hasSeatingChart": true,
    "minTicketsPerOrder": 1,
    "maxTicketsPerOrder": 10,
    "termsAndConditions": "...",
    "refundPolicy": "...",
    "venue": {
      "id": "uuid",
      "name": "Gelora Bung Karno",
      "address": "Jl. Pintu Satu Senayan",
      "city": "Jakarta",
      "latitude": -6.2186,
      "longitude": 106.8022
    },
    "category": { ... },
    "organizer": {
      "id": "uuid",
      "name": "ABC Entertainment",
      "slug": "abc-entertainment",
      "logo": "https://...",
      "isVerified": true,
      "followerCount": 1500
    },
    "media": [
      {
        "id": "uuid",
        "type": "image",
        "url": "https://...",
        "caption": "Stage setup"
      }
    ],
    "schedules": [
      {
        "id": "uuid",
        "title": "Day 1",
        "date": "2026-02-01",
        "startTime": "19:00",
        "endTime": "23:00"
      }
    ],
    "performers": [
      {
        "id": "uuid",
        "name": "Artist Name",
        "title": "Headliner",
        "photo": "https://..."
      }
    ],
    "faqs": [
      {
        "question": "Is there parking?",
        "answer": "Yes, paid parking available..."
      }
    ],
    "ticketTypes": [
      {
        "id": "uuid",
        "name": "VIP",
        "description": "VIP access with...",
        "price": 500000,
        "originalPrice": 600000,
        "available": 50,
        "totalQuantity": 100,
        "isSoldOut": false,
        "saleStartAt": "2026-01-01T00:00:00Z",
        "saleEndAt": "2026-02-01T12:00:00Z"
      },
      {
        "id": "uuid",
        "name": "Regular",
        "price": 250000,
        "available": 200,
        "totalQuantity": 500,
        "isSoldOut": false
      }
    ],
    "stats": {
      "viewCount": 15000,
      "averageRating": 4.5,
      "reviewCount": 120
    }
  }
}
```

---

### POST /events

Create new event. (Organizer only)

**Request:**
```json
{
  "title": "New Event",
  "categoryId": "uuid",
  "shortDescription": "...",
  "description": "<p>HTML content</p>",
  "startDatetime": "2026-03-01T19:00:00Z",
  "endDatetime": "2026-03-01T23:00:00Z",
  "timezone": "Asia/Jakarta",
  "eventType": "offline",
  "venueId": "uuid",
  "visibility": "public",
  "hasSeatingChart": false,
  "minTicketsPerOrder": 1,
  "maxTicketsPerOrder": 10,
  "termsAndConditions": "...",
  "refundPolicy": "...",
  "status": "draft"
}
```

**Response (201):** Event object

---

### PATCH /events/{id}

Update event. (Owner only)

**Response (200):** Updated event object

---

### DELETE /events/{id}

Delete event (soft delete). (Owner only)

**Response (204):** No content

---

### POST /events/{id}/publish

Submit event for review.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "pending_review"
  }
}
```

---

### POST /events/{id}/cancel

Cancel published event.

**Request:**
```json
{
  "reason": "Venue unavailable"
}
```

**Response (200):** Event object with cancelled status

---

### POST /events/{id}/duplicate

Clone event.

**Response (201):** New event object (draft status)

---

### GET /events/{id}/attendees

Get event attendees. (Organizer only)

**Query Parameters:**
- `page`, `limit`
- `ticketType`: Filter by ticket type
- `checkedIn`: true/false
- `q`: Search by name/email

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "ticket": {
        "id": "uuid",
        "ticketCode": "...",
        "ticketType": "VIP",
        "seat": "A-12"
      },
      "attendee": {
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+628123456789"
      },
      "booking": {
        "id": "uuid",
        "bookingCode": "BSC-2026-A3X7K9"
      },
      "isCheckedIn": false,
      "checkedInAt": null
    }
  ],
  "meta": {
    "totalAttendees": 500,
    "checkedIn": 120,
    "notCheckedIn": 380
  }
}
```

---

### GET /events/{id}/attendees/export

Export attendees to CSV.

**Response (200):** CSV file download

---

### GET /events/{id}/analytics

Get event analytics. (Organizer only)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalRevenue": 50000000,
      "ticketsSold": 500,
      "bookings": 250,
      "averageOrderValue": 200000,
      "conversionRate": 3.5
    },
    "ticketBreakdown": [
      {
        "ticketType": "VIP",
        "sold": 100,
        "total": 100,
        "revenue": 50000000
      }
    ],
    "salesOverTime": {
      "labels": ["Jan 1", "Jan 2", ...],
      "data": [10, 15, 20, ...]
    },
    "checkInStats": {
      "total": 500,
      "checkedIn": 0,
      "percentage": 0
    }
  }
}
```

---

## 5. Tickets

### GET /events/{eventId}/ticket-types

Get available ticket types for an event.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "VIP",
      "description": "VIP access...",
      "price": 500000,
      "originalPrice": 600000,
      "currency": "IDR",
      "available": 50,
      "totalQuantity": 100,
      "minPerOrder": 1,
      "maxPerOrder": 4,
      "isFree": false,
      "isHidden": false,
      "requiresAttendeeInfo": true,
      "saleStartAt": "2026-01-01T00:00:00Z",
      "saleEndAt": "2026-02-01T12:00:00Z",
      "isOnSale": true,
      "isSoldOut": false
    }
  ]
}
```

---

### GET /events/{eventId}/seating

Get seating chart data.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "sections": [
      {
        "id": "uuid",
        "name": "VIP Zone",
        "color": "#FFD700",
        "rows": [
          {
            "id": "uuid",
            "label": "A",
            "seats": [
              {
                "id": "uuid",
                "number": 1,
                "label": "A-1",
                "status": "available",
                "ticketType": {
                  "id": "uuid",
                  "name": "VIP",
                  "price": 500000
                },
                "position": { "x": 100, "y": 50 },
                "attributes": {
                  "accessible": false,
                  "restrictedView": false
                }
              },
              {
                "id": "uuid",
                "number": 2,
                "label": "A-2",
                "status": "locked",
                "lockedUntil": "2026-01-15T10:15:00Z"
              },
              {
                "id": "uuid",
                "number": 3,
                "label": "A-3",
                "status": "booked"
              }
            ]
          }
        ]
      }
    ]
  }
}
```

---

### POST /events/{eventId}/seats/lock

Lock seats for checkout.

**Request:**
```json
{
  "seatIds": ["uuid1", "uuid2"],
  "sessionId": "checkout-session-uuid"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "locked": ["uuid1", "uuid2"],
    "expiresAt": "2026-01-15T10:15:00Z"
  }
}
```

**Error (409):**
```json
{
  "success": false,
  "error": {
    "code": 3004,
    "message": "Some seats are unavailable",
    "details": {
      "unavailable": ["uuid2"]
    }
  }
}
```

---

### POST /events/{eventId}/seats/release

Release locked seats.

**Request:**
```json
{
  "seatIds": ["uuid1", "uuid2"],
  "sessionId": "checkout-session-uuid"
}
```

**Response (204):** No content

---

## 6. Bookings

### POST /bookings

Create a new booking.

**Request:**
```json
{
  "eventId": "uuid",
  "scheduleId": "uuid",
  "tickets": [
    {
      "ticketTypeId": "uuid",
      "quantity": 2,
      "seatIds": ["uuid1", "uuid2"]
    }
  ],
  "attendees": [
    {
      "ticketIndex": 0,
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "phone": "+628123456789",
      "customAnswers": {
        "question-uuid-1": "Answer 1"
      }
    }
  ],
  "promoCode": "SAVE20",
  "sessionId": "checkout-session-uuid"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "bookingCode": "BSC-2026-A3X7K9",
    "event": { ... },
    "tickets": [
      {
        "id": "uuid",
        "ticketType": "VIP",
        "seat": "A-1",
        "price": 500000
      }
    ],
    "subtotal": 1000000,
    "discount": 200000,
    "tax": 88000,
    "platformFee": 40000,
    "total": 928000,
    "status": "pending",
    "expiresAt": "2026-01-15T10:15:00Z"
  }
}
```

---

### GET /bookings/{id}

Get booking details.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "bookingCode": "BSC-2026-A3X7K9",
    "event": {
      "id": "uuid",
      "title": "Music Festival 2026",
      "posterUrl": "https://...",
      "startDatetime": "2026-02-01T19:00:00Z",
      "venue": { ... }
    },
    "tickets": [
      {
        "id": "uuid",
        "ticketCode": "7A3F9C2B...",
        "qrCodeUrl": "https://...",
        "ticketType": "VIP",
        "seat": "A-1",
        "price": 500000,
        "attendee": {
          "name": "John Doe",
          "email": "john@example.com"
        },
        "isCheckedIn": false
      }
    ],
    "subtotal": 1000000,
    "discount": 200000,
    "tax": 88000,
    "platformFee": 40000,
    "total": 928000,
    "status": "paid",
    "paymentStatus": "paid",
    "paidAt": "2026-01-15T10:05:00Z",
    "transaction": {
      "id": "uuid",
      "paymentMethod": "credit_card",
      "paymentChannel": "visa"
    },
    "createdAt": "2026-01-15T10:00:00Z"
  }
}
```

---

### GET /bookings/{id}/tickets/download

Download tickets as PDF.

**Response (200):** PDF file

---

### POST /bookings/{id}/tickets/{ticketId}/resend

Resend ticket email.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Ticket email sent"
  }
}
```

---

### POST /bookings/{id}/cancel

Cancel booking (if allowed by policy).

**Request:**
```json
{
  "reason": "Cannot attend"
}
```

**Response (200):** Updated booking object

---

### POST /bookings/{id}/refund

Request refund.

**Request:**
```json
{
  "reason": "Event cancelled",
  "ticketIds": ["uuid1"]
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "refundId": "uuid",
    "status": "requested",
    "amount": 500000
  }
}
```

---

## 7. Payments

### POST /bookings/{id}/pay

Initiate payment.

**Request:**
```json
{
  "paymentMethod": "credit_card",
  "paymentChannel": "visa",
  "returnUrl": "https://bsc.id/checkout/complete"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "transactionId": "uuid",
    "paymentUrl": "https://payment.midtrans.com/snap/...",
    "paymentMethod": "credit_card",
    "expiresAt": "2026-01-15T10:15:00Z",
    "instructions": null
  }
}
```

**Response for VA:**
```json
{
  "success": true,
  "data": {
    "transactionId": "uuid",
    "paymentMethod": "bank_transfer",
    "paymentChannel": "bca_va",
    "virtualAccountNumber": "1234567890123456",
    "amount": 928000,
    "expiresAt": "2026-01-16T10:00:00Z",
    "instructions": [
      "Login to BCA mobile/internet banking",
      "Select Transfer > Virtual Account",
      "Enter VA number: 1234567890123456",
      "Confirm amount: Rp 928,000"
    ]
  }
}
```

---

### GET /payments/{transactionId}/status

Check payment status.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "transactionId": "uuid",
    "bookingId": "uuid",
    "status": "pending",
    "amount": 928000,
    "expiresAt": "2026-01-16T10:00:00Z"
  }
}
```

---

### POST /payments/webhook/{gateway}

Payment gateway webhook (internal).

---

## 8. Check-in

### POST /check-in/validate

Validate a ticket code.

**Request:**
```json
{
  "code": "7A3F9C2B1E4D8A0F5C6B3E9D2A1F7C4B",
  "eventId": "uuid",
  "checkInPointId": "uuid"
}
```

**Response (200) - Valid:**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "ticket": {
      "id": "uuid",
      "ticketCode": "7A3F9C2B...",
      "ticketType": "VIP",
      "seat": "A-12",
      "attendee": {
        "name": "John Doe"
      }
    },
    "booking": {
      "id": "uuid",
      "bookingCode": "BSC-2026-A3X7K9"
    }
  }
}
```

**Response (200) - Invalid:**
```json
{
  "success": true,
  "data": {
    "valid": false,
    "reason": "ALREADY_CHECKED_IN",
    "message": "Ticket already used",
    "details": {
      "checkedInAt": "2026-02-01T18:30:00Z",
      "checkInPoint": "Main Gate"
    }
  }
}
```

---

### POST /check-in/scan

Perform check-in.

**Request:**
```json
{
  "ticketId": "uuid",
  "checkInPointId": "uuid"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "checkedIn": true,
    "checkedInAt": "2026-02-01T19:00:00Z",
    "ticket": {
      "ticketType": "VIP",
      "seat": "A-12",
      "attendee": "John Doe"
    }
  }
}
```

---

### POST /check-in/undo

Undo check-in.

**Request:**
```json
{
  "ticketId": "uuid",
  "reason": "Accidental scan"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "undone": true
  }
}
```

---

### GET /check-in/events/{eventId}/stats

Get check-in statistics.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "total": 500,
    "checkedIn": 250,
    "remaining": 250,
    "percentage": 50,
    "byTicketType": [
      {
        "type": "VIP",
        "total": 100,
        "checkedIn": 75
      }
    ],
    "byCheckInPoint": [
      {
        "name": "Main Gate",
        "count": 200
      }
    ],
    "recentScans": [
      {
        "ticketCode": "...",
        "attendee": "John Doe",
        "scannedAt": "2026-02-01T19:00:00Z"
      }
    ]
  }
}
```

---

## 9. Promo Codes

### POST /promo-codes/validate

Validate a promo code.

**Request:**
```json
{
  "code": "SAVE20",
  "eventId": "uuid",
  "ticketTypeIds": ["uuid1", "uuid2"],
  "subtotal": 1000000
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "code": "SAVE20",
    "discountType": "percentage",
    "discountValue": 20,
    "discountAmount": 200000,
    "description": "20% off all tickets"
  }
}
```

---

### GET /organizer/promo-codes

List organizer's promo codes. (Organizer only)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "code": "SAVE20",
      "description": "20% off",
      "discountType": "percentage",
      "discountValue": 20,
      "maxDiscountAmount": 100000,
      "usageLimitTotal": 100,
      "usedCount": 45,
      "validFrom": "2026-01-01T00:00:00Z",
      "validUntil": "2026-01-31T23:59:59Z",
      "isActive": true,
      "event": {
        "id": "uuid",
        "title": "Music Festival 2026"
      }
    }
  ]
}
```

---

### POST /organizer/promo-codes

Create promo code. (Organizer only)

**Request:**
```json
{
  "code": "NEWYEAR50",
  "eventId": "uuid",
  "discountType": "percentage",
  "discountValue": 50,
  "maxDiscountAmount": 250000,
  "minOrderAmount": 100000,
  "usageLimitTotal": 100,
  "usageLimitPerUser": 1,
  "applicableTicketTypes": ["uuid1"],
  "validFrom": "2026-01-01T00:00:00Z",
  "validUntil": "2026-01-07T23:59:59Z"
}
```

**Response (201):** Promo code object

---

### PATCH /organizer/promo-codes/{id}

Update promo code.

---

### DELETE /organizer/promo-codes/{id}

Deactivate promo code.

---

## 10. Reviews

### GET /events/{eventId}/reviews

Get event reviews.

**Query Parameters:**
- `page`, `limit`
- `rating`: Filter by rating (1-5)
- `sort`: recent, helpful, rating_high, rating_low

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "rating": 5,
      "text": "Amazing event!",
      "user": {
        "name": "John D.",
        "avatar": "https://..."
      },
      "isVerifiedPurchase": true,
      "helpfulCount": 12,
      "reply": {
        "text": "Thank you for attending!",
        "repliedAt": "2026-02-03T10:00:00Z"
      },
      "createdAt": "2026-02-02T15:00:00Z"
    }
  ],
  "meta": {
    "averageRating": 4.5,
    "totalReviews": 120,
    "ratingDistribution": {
      "5": 80,
      "4": 25,
      "3": 10,
      "2": 3,
      "1": 2
    }
  }
}
```

---

### POST /events/{eventId}/reviews

Create review.

**Request:**
```json
{
  "rating": 5,
  "text": "Amazing event!",
  "bookingId": "uuid"
}
```

**Response (201):** Review object

---

### POST /reviews/{id}/helpful

Mark review as helpful.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "helpfulCount": 13
  }
}
```

---

### POST /organizer/reviews/{id}/reply

Reply to review. (Organizer only)

**Request:**
```json
{
  "text": "Thank you for your feedback!"
}
```

**Response (200):** Updated review object

---

## 11. Notifications

### GET /notifications

Get user notifications.

**Query Parameters:**
- `page`, `limit`
- `unreadOnly`: true/false

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Booking Confirmed",
      "message": "Your booking for Music Festival 2026 has been confirmed",
      "actionUrl": "/bookings/uuid",
      "isRead": false,
      "createdAt": "2026-01-15T10:05:00Z"
    }
  ],
  "meta": {
    "unreadCount": 5
  }
}
```

---

### PATCH /notifications/{id}/read

Mark notification as read.

**Response (204):** No content

---

### POST /notifications/read-all

Mark all as read.

**Response (204):** No content

---

## 12. Admin

### GET /admin/dashboard

Admin dashboard stats.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalRevenue": 500000000,
      "totalBookings": 5000,
      "totalEvents": 200,
      "totalUsers": 10000,
      "platformEarnings": 25000000
    },
    "today": { ... },
    "pendingActions": {
      "eventsToReview": 5,
      "payoutsToProcess": 12,
      "refundsToProcess": 3
    },
    "recentBookings": [ ... ],
    "topOrganizers": [ ... ],
    "revenueChart": { ... }
  }
}
```

---

### GET /admin/users

List all users.

**Query Parameters:**
- `page`, `limit`
- `role`: Filter by role
- `status`: active, inactive, banned
- `q`: Search by name/email

---

### GET /admin/users/{id}

Get user details.

---

### PATCH /admin/users/{id}

Update user.

**Request:**
```json
{
  "role": "organizer",
  "isActive": true
}
```

---

### POST /admin/users/{id}/ban

Ban user.

**Request:**
```json
{
  "reason": "Violation of terms"
}
```

---

### POST /admin/users/{id}/unban

Unban user.

---

### GET /admin/events

List all events.

**Query Parameters:**
- `page`, `limit`
- `status`: draft, pending_review, published, cancelled, ended
- `organizerId`: Filter by organizer
- `q`: Search

---

### POST /admin/events/{id}/approve

Approve event.

---

### POST /admin/events/{id}/reject

Reject event.

**Request:**
```json
{
  "reason": "Missing required information"
}
```

---

### POST /admin/events/{id}/feature

Feature/unfeature event.

**Request:**
```json
{
  "featured": true
}
```

---

### GET /admin/bookings

List all bookings.

---

### POST /admin/bookings/{id}/refund

Process refund.

**Request:**
```json
{
  "amount": 500000,
  "reason": "Customer request"
}
```

---

### GET /admin/payouts

List payout requests.

**Query Parameters:**
- `status`: requested, approved, processing, completed, rejected

---

### POST /admin/payouts/{id}/approve

Approve payout.

---

### POST /admin/payouts/{id}/reject

Reject payout.

**Request:**
```json
{
  "reason": "Insufficient documentation"
}
```

---

### POST /admin/payouts/{id}/complete

Mark payout as completed.

**Request:**
```json
{
  "proofUrl": "https://..."
}
```

---

### GET /admin/settings

Get all settings.

---

### PATCH /admin/settings

Update settings.

**Request:**
```json
{
  "settings": [
    { "key": "commission_rate", "value": "5" },
    { "key": "site_name", "value": "BSC" }
  ]
}
```

---

## 13. Public

### GET /categories

List event categories.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Music",
      "slug": "music",
      "icon": "music-note",
      "eventCount": 150,
      "subcategories": [
        {
          "id": "uuid",
          "name": "Concert",
          "slug": "concert",
          "eventCount": 80
        }
      ]
    }
  ]
}
```

---

### GET /cities

List cities with events.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "name": "Jakarta",
      "eventCount": 500
    },
    {
      "name": "Surabaya",
      "eventCount": 150
    }
  ]
}
```

---

### GET /organizers/{slug}

Get organizer public profile.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "ABC Entertainment",
    "slug": "abc-entertainment",
    "logo": "https://...",
    "banner": "https://...",
    "bio": "...",
    "website": "https://...",
    "isVerified": true,
    "followerCount": 1500,
    "eventCount": 50,
    "upcomingEvents": [ ... ],
    "pastEvents": [ ... ]
  }
}
```

---

### GET /pages/{slug}

Get static page.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "title": "About Us",
    "content": "<p>HTML content...</p>",
    "metaTitle": "About BSC",
    "metaDescription": "..."
  }
}
```

---

### GET /banners

Get active banners.

**Query Parameters:**
- `position`: home_hero, home_secondary, sidebar

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Featured Event",
      "imageUrl": "https://...",
      "linkUrl": "/events/music-festival-2026",
      "position": "home_hero"
    }
  ]
}
```

---

### GET /search

Global search.

**Query Parameters:**
- `q`: Search query
- `type`: events, organizers, all

**Response (200):**
```json
{
  "success": true,
  "data": {
    "events": [
      {
        "id": "uuid",
        "title": "Music Festival 2026",
        "slug": "music-festival-2026",
        "posterUrl": "https://...",
        "startDatetime": "2026-02-01T19:00:00Z"
      }
    ],
    "organizers": [
      {
        "id": "uuid",
        "name": "ABC Entertainment",
        "slug": "abc-entertainment",
        "logo": "https://..."
      }
    ]
  }
}
```

---

## Appendix: Error Codes Reference

| Code | Message |
|------|---------|
| 1001 | Invalid credentials |
| 1002 | Email not verified |
| 1003 | Account suspended |
| 1004 | Token expired |
| 1005 | Invalid refresh token |
| 2001 | Event not found |
| 2002 | Event not published |
| 2003 | Event has ended |
| 2004 | Event cancelled |
| 3001 | Ticket not available |
| 3002 | Ticket sold out |
| 3003 | Seat not available |
| 3004 | Seat locked by another user |
| 3005 | Max tickets exceeded |
| 3006 | Min tickets not met |
| 4001 | Booking not found |
| 4002 | Booking expired |
| 4003 | Booking already paid |
| 4004 | Invalid promo code |
| 4005 | Promo code expired |
| 4006 | Promo code usage limit reached |
| 5001 | Payment failed |
| 5002 | Payment expired |
| 5003 | Refund not allowed |
| 5004 | Insufficient balance |
| 6001 | Invalid ticket code |
| 6002 | Ticket already used |
| 6003 | Wrong event |
| 6004 | Ticket cancelled |

---

*Document Version: 2.0*  
*Last Updated: January 2026*  
*Auto-generated from OpenAPI specification*
