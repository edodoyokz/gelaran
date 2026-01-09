erDiagram
    USERS ||--|| ORGANIZER_PROFILES : "has details"
    USERS ||--o{ EVENTS : "organizes"
    USERS ||--o{ BOOKINGS : "makes"
    USERS ||--o{ REVIEWS : "writes"
    
    EVENTS ||--o{ TICKET_TYPES : "has"
    EVENTS ||--o{ SEAT_ROWS : "defines layout"
    EVENTS ||--o{ BOOKINGS : "generates"
    EVENTS ||--o{ REVIEWS : "receives"
    
    TICKET_TYPES ||--o{ BOOKED_TICKETS : "is instance of"
    
    SEAT_ROWS ||--o{ SEATS : "contains"
    SEATS |o--o| BOOKED_TICKETS : "is assigned to"
    
    BOOKINGS ||--o{ BOOKED_TICKETS : "contains items"
    BOOKINGS ||--|| TRANSACTIONS : "has payment"
    
    USERS ||--o{ PAYOUTS : "requests"

    %% ENTITY DEFINITIONS %%
    USERS {
        uuid id PK
        string name
        string email
        string password_hash
        enum role "admin, organizer, customer, scanner"
        timestamp created_at
    }

    ORGANIZER_PROFILES {
        uuid id PK
        uuid user_id FK
        string organization_name
        string bank_name
        string bank_account_number
        decimal wallet_balance
    }

    EVENTS {
        uuid id PK
        uuid organizer_id FK
        string title
        text description
        string poster_image
        timestamp start_datetime
        timestamp end_datetime
        string location_address
        boolean is_online
        boolean has_seating_chart
        enum status "draft, published, ended"
    }

    TICKET_TYPES {
        uuid id PK
        uuid event_id FK
        string name "e.g. VIP, Regular"
        decimal price
        int quantity "Total Stock"
        int sold_quantity
    }

    SEAT_ROWS {
        uuid id PK
        uuid event_id FK
        string row_label "e.g. Row A"
        int order_index
    }

    SEATS {
        uuid id PK
        uuid row_id FK
        uuid ticket_type_id FK "Linked to price tier"
        string seat_number "e.g. A-12"
        enum status "available, booked, locked"
    }

    BOOKINGS {
        uuid id PK
        uuid user_id FK "Customer"
        uuid event_id FK
        string booking_code "Unique Invoice"
        decimal total_amount
        decimal tax_amount
        decimal admin_commission
        decimal organizer_net_income
        enum status "pending, paid, cancelled"
        timestamp created_at
    }

    BOOKED_TICKETS {
        uuid id PK
        uuid booking_id FK
        uuid ticket_type_id FK
        uuid seat_id FK "Nullable if no seating"
        string unique_code "QR Content"
        boolean is_checked_in
        timestamp checked_in_at
    }

    PAYOUTS {
        uuid id PK
        uuid organizer_id FK
        decimal amount
        enum status "pending, processed"
        timestamp processed_at
    }
