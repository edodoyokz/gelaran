```mermaid
erDiagram
    %% ══════════════════════════════════════════════════════════════════
    %% BSC - EVENT TICKETING PLATFORM ERD v2.0
    %% Aligned with: Eventmie FullyLoaded, Eventbrite, Loket.com
    %% ══════════════════════════════════════════════════════════════════

    %% ══════════════════════════════════════════════════════════════════
    %% MODULE 1: USER MANAGEMENT
    %% ══════════════════════════════════════════════════════════════════
    
    USERS ||--o| ORGANIZER_PROFILES : "has profile"
    USERS ||--o| CUSTOMER_PROFILES : "has profile"
    USERS ||--o{ USER_SESSIONS : "has sessions"
    USERS ||--o{ NOTIFICATIONS : "receives"
    USERS ||--o{ WISHLISTS : "saves"
    USERS ||--o{ AUDIT_LOGS : "generates"
    
    ORGANIZER_PROFILES ||--o{ ORGANIZER_BANK_ACCOUNTS : "has accounts"
    ORGANIZER_PROFILES ||--o{ ORGANIZER_TEAM_MEMBERS : "has team"

    %% ══════════════════════════════════════════════════════════════════
    %% MODULE 2: EVENT MANAGEMENT
    %% ══════════════════════════════════════════════════════════════════
    
    USERS ||--o{ EVENTS : "organizes"
    EVENTS }o--|| CATEGORIES : "belongs to"
    EVENTS }o--o| VENUES : "held at"
    EVENTS ||--o{ EVENT_TAGS : "tagged with"
    EVENTS ||--o{ EVENT_SCHEDULES : "has schedules"
    EVENTS ||--o{ EVENT_MEDIA : "has media"
    EVENTS ||--o{ EVENT_FAQS : "has FAQs"
    EVENTS ||--o{ EVENT_PERFORMERS : "features"
    EVENTS ||--o{ EVENT_SPONSORS : "sponsored by"
    
    TAGS ||--o{ EVENT_TAGS : "applied to"
    PERFORMERS ||--o{ EVENT_PERFORMERS : "performs at"
    SPONSORS ||--o{ EVENT_SPONSORS : "sponsors"

    %% ══════════════════════════════════════════════════════════════════
    %% MODULE 3: TICKETING
    %% ══════════════════════════════════════════════════════════════════
    
    EVENTS ||--o{ TICKET_TYPES : "offers"
    TICKET_TYPES ||--o{ TICKET_PRICE_TIERS : "has pricing"
    TICKET_TYPES ||--o{ BOOKED_TICKETS : "sold as"
    
    %% Seating Chart
    EVENTS ||--o{ SEATING_SECTIONS : "has sections"
    SEATING_SECTIONS ||--o{ SEAT_ROWS : "contains rows"
    SEAT_ROWS ||--o{ SEATS : "has seats"
    SEATS }o--|| TICKET_TYPES : "priced as"
    SEATS |o--o| BOOKED_TICKETS : "assigned to"
    
    %% Waitlist
    TICKET_TYPES ||--o{ WAITLIST_ENTRIES : "has waitlist"
    
    %% Promo Codes
    EVENTS ||--o{ PROMO_CODES : "has promos"
    PROMO_CODES ||--o{ PROMO_CODE_USAGES : "tracked by"

    %% ══════════════════════════════════════════════════════════════════
    %% MODULE 4: BOOKING & TRANSACTIONS
    %% ══════════════════════════════════════════════════════════════════
    
    USERS ||--o{ BOOKINGS : "makes"
    EVENTS ||--o{ BOOKINGS : "generates"
    BOOKINGS ||--o{ BOOKED_TICKETS : "contains"
    BOOKINGS ||--|| TRANSACTIONS : "paid via"
    BOOKINGS |o--o| PROMO_CODE_USAGES : "uses promo"
    
    %% Attendee Management
    BOOKED_TICKETS ||--o{ ATTENDEE_ANSWERS : "has custom data"
    EVENTS ||--o{ ATTENDEE_QUESTIONS : "asks"
    ATTENDEE_QUESTIONS ||--o{ ATTENDEE_ANSWERS : "answered by"
    
    %% Ticket Transfer
    BOOKED_TICKETS ||--o{ TICKET_TRANSFERS : "transferred via"

    %% ══════════════════════════════════════════════════════════════════
    %% MODULE 5: CHECK-IN SYSTEM
    %% ══════════════════════════════════════════════════════════════════
    
    EVENTS ||--o{ CHECK_IN_POINTS : "has entry points"
    USERS ||--o{ SCANNER_SESSIONS : "operates scanner"
    CHECK_IN_POINTS ||--o{ SCANNER_SESSIONS : "scanned at"
    BOOKED_TICKETS ||--o{ CHECK_IN_LOGS : "checked in via"
    SCANNER_SESSIONS ||--o{ CHECK_IN_LOGS : "logs"

    %% ══════════════════════════════════════════════════════════════════
    %% MODULE 6: FINANCIAL
    %% ══════════════════════════════════════════════════════════════════
    
    TRANSACTIONS ||--o{ REFUNDS : "refunded via"
    ORGANIZER_PROFILES ||--o{ PAYOUTS : "withdraws"
    PAYOUTS }o--|| ORGANIZER_BANK_ACCOUNTS : "sent to"
    
    %% Commissions & Taxes
    BOOKINGS }o--o| TAX_RATES : "taxed by"

    %% ══════════════════════════════════════════════════════════════════
    %% MODULE 7: REVIEWS & ENGAGEMENT
    %% ══════════════════════════════════════════════════════════════════
    
    USERS ||--o{ REVIEWS : "writes"
    EVENTS ||--o{ REVIEWS : "receives"
    REVIEWS ||--o{ REVIEW_REPLIES : "has replies"

    %% ══════════════════════════════════════════════════════════════════
    %% MODULE 8: MARKETING & AFFILIATES
    %% ══════════════════════════════════════════════════════════════════
    
    USERS ||--o{ AFFILIATES : "becomes affiliate"
    AFFILIATES ||--o{ AFFILIATE_REFERRALS : "generates"
    BOOKINGS |o--o| AFFILIATE_REFERRALS : "attributed to"
    
    %% Email Marketing
    EVENTS ||--o{ EMAIL_CAMPAIGNS : "sends"
    EMAIL_CAMPAIGNS ||--o{ EMAIL_LOGS : "tracks"

    %% ══════════════════════════════════════════════════════════════════
    %% MODULE 9: CMS & CONTENT
    %% ══════════════════════════════════════════════════════════════════
    
    PAGES ||--o{ PAGE_TRANSLATIONS : "translated"
    BLOG_POSTS ||--o{ BLOG_POST_TRANSLATIONS : "translated"
    BLOG_POSTS }o--|| BLOG_CATEGORIES : "categorized"

    %% ══════════════════════════════════════════════════════════════════
    %% ENTITY DEFINITIONS - MODULE 1: USER MANAGEMENT
    %% ══════════════════════════════════════════════════════════════════

    USERS {
        uuid id PK
        string name
        string email UK
        string phone UK "Nullable"
        string password_hash
        enum role "super_admin, admin, organizer, customer, scanner"
        boolean is_verified "Email verified"
        boolean is_active
        string avatar_url
        string locale "id, en"
        string timezone
        timestamp email_verified_at
        timestamp last_login_at
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at "Soft delete"
    }

    ORGANIZER_PROFILES {
        uuid id PK
        uuid user_id FK UK
        string organization_name
        string organization_slug UK "URL slug"
        string organization_logo
        string organization_banner
        text organization_description
        string website_url
        string social_facebook
        string social_instagram
        string social_twitter
        string social_tiktok
        decimal wallet_balance "Current balance"
        decimal total_earned "Lifetime earnings"
        decimal total_withdrawn "Lifetime withdrawals"
        boolean is_verified "KYC verified"
        enum verification_status "pending, approved, rejected"
        timestamp verified_at
        timestamp created_at
        timestamp updated_at
    }

    ORGANIZER_BANK_ACCOUNTS {
        uuid id PK
        uuid organizer_profile_id FK
        string bank_name
        string bank_code "Bank swift/code"
        string account_number
        string account_holder_name
        boolean is_primary
        boolean is_verified
        timestamp created_at
    }

    ORGANIZER_TEAM_MEMBERS {
        uuid id PK
        uuid organizer_profile_id FK
        uuid user_id FK
        enum role "manager, scanner, finance"
        json permissions "Granular permissions"
        boolean is_active
        timestamp invited_at
        timestamp accepted_at
        timestamp created_at
    }

    CUSTOMER_PROFILES {
        uuid id PK
        uuid user_id FK UK
        date birth_date
        enum gender "male, female, other, prefer_not_to_say"
        string address
        string city
        string province
        string postal_code
        string id_number "KTP/Passport for KYC"
        timestamp created_at
        timestamp updated_at
    }

    USER_SESSIONS {
        uuid id PK
        uuid user_id FK
        string token_hash
        string device_info
        string ip_address
        timestamp expires_at
        timestamp created_at
    }

    %% ══════════════════════════════════════════════════════════════════
    %% ENTITY DEFINITIONS - MODULE 2: EVENT MANAGEMENT
    %% ══════════════════════════════════════════════════════════════════

    CATEGORIES {
        uuid id PK
        string name
        string slug UK
        string icon
        string color_hex
        int sort_order
        boolean is_active
        uuid parent_id FK "Self-referencing for subcategories"
        timestamp created_at
    }

    VENUES {
        uuid id PK
        uuid organizer_id FK "Nullable - can be global"
        string name
        string slug UK
        string address
        string city
        string province
        string postal_code
        string country
        decimal latitude
        decimal longitude
        string google_place_id
        int capacity
        text description
        json amenities "Parking, WiFi, etc."
        string image_url
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    EVENTS {
        uuid id PK
        uuid organizer_id FK
        uuid category_id FK
        uuid venue_id FK "Nullable for online events"
        string title
        string slug UK
        text short_description "Max 200 chars for cards"
        text description "Rich text/HTML"
        string poster_image
        string banner_image
        string trailer_video_url "YouTube/Vimeo"
        
        enum event_type "offline, online, hybrid"
        enum status "draft, pending_review, published, cancelled, ended"
        enum visibility "public, private, password_protected"
        string access_password "For password protected"
        
        boolean is_featured
        boolean is_recurring
        uuid recurring_pattern_id FK "Nullable"
        boolean has_seating_chart
        boolean requires_approval "Manual booking approval"
        
        int min_tickets_per_order "Default 1"
        int max_tickets_per_order "Default 10"
        
        string online_meeting_url "Zoom/Meet link"
        string online_meeting_password
        
        text terms_and_conditions
        text refund_policy
        
        string meta_title "SEO"
        string meta_description "SEO"
        string meta_keywords "SEO"
        
        int view_count
        timestamp publish_at "Scheduled publish"
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at "Soft delete"
    }

    RECURRING_PATTERNS {
        uuid id PK
        enum frequency "daily, weekly, monthly"
        int interval_value "Every X days/weeks/months"
        json days_of_week "For weekly: [1,3,5] = Mon,Wed,Fri"
        int day_of_month "For monthly"
        date start_date
        date end_date "Nullable = infinite"
        int max_occurrences "Nullable"
        json skip_dates "Dates to exclude"
        timestamp created_at
    }

    EVENT_SCHEDULES {
        uuid id PK
        uuid event_id FK
        string title "e.g. Day 1, Morning Session"
        date schedule_date
        time start_time
        time end_time
        text description
        string location_override "Different venue/room"
        int sort_order
        boolean is_active
        timestamp created_at
    }

    EVENT_MEDIA {
        uuid id PK
        uuid event_id FK
        enum media_type "image, video, document"
        string file_url
        string thumbnail_url
        string title
        string alt_text
        int sort_order
        timestamp created_at
    }

    EVENT_FAQS {
        uuid id PK
        uuid event_id FK
        string question
        text answer
        int sort_order
        boolean is_active
        timestamp created_at
    }

    TAGS {
        uuid id PK
        string name UK
        string slug UK
        timestamp created_at
    }

    EVENT_TAGS {
        uuid id PK
        uuid event_id FK
        uuid tag_id FK
    }

    PERFORMERS {
        uuid id PK
        uuid organizer_id FK "Owner of this performer profile"
        string name
        string slug UK
        string title "e.g. DJ, Speaker, Artist"
        text bio
        string photo_url
        string website_url
        string social_instagram
        string social_twitter
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    EVENT_PERFORMERS {
        uuid id PK
        uuid event_id FK
        uuid performer_id FK
        enum role "headliner, supporting, guest, speaker, host"
        time performance_time
        int sort_order
    }

    SPONSORS {
        uuid id PK
        uuid organizer_id FK
        string name
        string logo_url
        string website_url
        text description
        boolean is_active
        timestamp created_at
    }

    EVENT_SPONSORS {
        uuid id PK
        uuid event_id FK
        uuid sponsor_id FK
        enum tier "platinum, gold, silver, bronze, media_partner"
        int sort_order
    }

    %% ══════════════════════════════════════════════════════════════════
    %% ENTITY DEFINITIONS - MODULE 3: TICKETING
    %% ══════════════════════════════════════════════════════════════════

    TICKET_TYPES {
        uuid id PK
        uuid event_id FK
        string name "e.g. VIP, Regular, Early Bird"
        text description
        decimal base_price "Base price before tiers"
        string currency "IDR, USD"
        
        int total_quantity "Total stock"
        int sold_quantity "Counter"
        int reserved_quantity "Temporarily held"
        
        int min_per_order "Min tickets per transaction"
        int max_per_order "Max tickets per transaction"
        
        boolean is_free
        boolean is_hidden "Unlisted ticket"
        boolean requires_attendee_info "Collect per-ticket info"
        boolean is_transferable "Can be transferred"
        
        timestamp sale_start_at
        timestamp sale_end_at
        
        int sort_order
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    TICKET_PRICE_TIERS {
        uuid id PK
        uuid ticket_type_id FK
        string name "Early Bird, Regular, Late"
        decimal price
        int quantity_limit "Max at this tier"
        int sold_quantity
        timestamp start_at
        timestamp end_at
        int sort_order
        boolean is_active
        timestamp created_at
    }

    SEATING_SECTIONS {
        uuid id PK
        uuid event_id FK
        string name "e.g. Orchestra, Balcony, VIP Zone"
        string color_hex "For visual mapping"
        int sort_order
        timestamp created_at
    }

    SEAT_ROWS {
        uuid id PK
        uuid section_id FK
        string row_label "e.g. A, B, C"
        int row_number
        int sort_order
        timestamp created_at
    }

    SEATS {
        uuid id PK
        uuid row_id FK
        uuid ticket_type_id FK "Price tier linkage"
        string seat_number "e.g. 1, 2, 3"
        string seat_label "e.g. A-1, VIP-12"
        enum status "available, locked, booked, blocked, wheelchair"
        uuid locked_by_user_id FK "Temporary lock"
        timestamp locked_until "TTL for lock"
        json position "x,y for visual map"
        json attributes "Aisle, restricted view, etc."
        timestamp created_at
        timestamp updated_at
    }

    WAITLIST_ENTRIES {
        uuid id PK
        uuid ticket_type_id FK
        uuid user_id FK "Nullable for guests"
        string email
        string name
        int quantity_requested
        enum status "waiting, notified, converted, expired"
        timestamp notified_at
        timestamp expires_at
        timestamp created_at
    }

    PROMO_CODES {
        uuid id PK
        uuid event_id FK "Nullable for global codes"
        uuid organizer_id FK
        string code UK
        text description
        
        enum discount_type "percentage, fixed_amount"
        decimal discount_value
        decimal max_discount_amount "Cap for percentage"
        decimal min_order_amount "Minimum order to apply"
        
        int usage_limit_total "Max total uses"
        int usage_limit_per_user "Max per user"
        int used_count
        
        json applicable_ticket_types "Specific ticket UUIDs"
        
        timestamp valid_from
        timestamp valid_until
        boolean is_active
        timestamp created_at
    }

    PROMO_CODE_USAGES {
        uuid id PK
        uuid promo_code_id FK
        uuid booking_id FK
        uuid user_id FK
        decimal discount_amount
        timestamp used_at
    }

    %% ══════════════════════════════════════════════════════════════════
    %% ENTITY DEFINITIONS - MODULE 4: BOOKING & TRANSACTIONS
    %% ══════════════════════════════════════════════════════════════════

    BOOKINGS {
        uuid id PK
        string booking_code UK "Human readable: BSC-XXXXXX"
        uuid user_id FK "Nullable for guest checkout"
        uuid event_id FK
        uuid event_schedule_id FK "Nullable"
        
        string guest_email "For guest checkout"
        string guest_name
        string guest_phone
        
        int total_tickets
        decimal subtotal "Before discounts & fees"
        decimal discount_amount
        decimal tax_amount
        decimal platform_fee "Admin commission"
        decimal payment_gateway_fee
        decimal total_amount "Final amount charged"
        
        decimal organizer_revenue "Net to organizer"
        decimal platform_revenue "Net to platform"
        
        enum status "pending, awaiting_payment, paid, confirmed, cancelled, refunded, expired"
        enum payment_status "unpaid, paid, partial_refund, full_refund"
        
        text cancellation_reason
        uuid cancelled_by FK
        timestamp cancelled_at
        
        string ip_address
        string user_agent
        json utm_params "Marketing attribution"
        
        timestamp expires_at "Payment deadline"
        timestamp paid_at
        timestamp confirmed_at
        timestamp created_at
        timestamp updated_at
    }

    BOOKED_TICKETS {
        uuid id PK
        uuid booking_id FK
        uuid ticket_type_id FK
        uuid ticket_price_tier_id FK "Nullable"
        uuid seat_id FK "Nullable if GA"
        
        string unique_code UK "UUID for QR"
        string qr_code_url "Generated QR image"
        
        decimal unit_price "Snapshot at purchase"
        decimal tax_amount
        decimal final_price
        
        boolean is_checked_in
        timestamp checked_in_at
        uuid checked_in_by FK "Scanner user"
        uuid check_in_point_id FK
        
        enum status "active, transferred, cancelled, refunded"
        
        timestamp created_at
        timestamp updated_at
    }

    ATTENDEE_QUESTIONS {
        uuid id PK
        uuid event_id FK
        uuid ticket_type_id FK "Nullable = all tickets"
        string question
        enum input_type "text, textarea, select, radio, checkbox, date, email, phone"
        json options "For select/radio/checkbox"
        boolean is_required
        int sort_order
        boolean is_active
        timestamp created_at
    }

    ATTENDEE_ANSWERS {
        uuid id PK
        uuid booked_ticket_id FK
        uuid question_id FK
        text answer
        timestamp created_at
    }

    TICKET_TRANSFERS {
        uuid id PK
        uuid booked_ticket_id FK
        uuid from_user_id FK
        uuid to_user_id FK "Nullable until accepted"
        string recipient_email
        string recipient_name
        
        enum status "pending, accepted, cancelled, expired"
        string old_unique_code "Invalidated code"
        string new_unique_code "New code after transfer"
        
        timestamp initiated_at
        timestamp accepted_at
        timestamp expires_at
    }

    TRANSACTIONS {
        uuid id PK
        uuid booking_id FK UK
        
        string transaction_code UK "Gateway reference"
        string payment_gateway "midtrans, xendit, stripe"
        string payment_method "credit_card, bank_transfer, ewallet"
        string payment_channel "bca_va, gopay, ovo"
        
        decimal amount
        string currency
        
        enum status "pending, processing, success, failed, expired, refunded"
        
        json gateway_response "Raw response"
        string gateway_transaction_id
        string failure_reason
        
        timestamp paid_at
        timestamp expires_at
        timestamp created_at
        timestamp updated_at
    }

    %% ══════════════════════════════════════════════════════════════════
    %% ENTITY DEFINITIONS - MODULE 5: CHECK-IN SYSTEM
    %% ══════════════════════════════════════════════════════════════════

    CHECK_IN_POINTS {
        uuid id PK
        uuid event_id FK
        string name "e.g. Main Gate, VIP Entrance"
        string location_description
        boolean is_active
        timestamp created_at
    }

    SCANNER_SESSIONS {
        uuid id PK
        uuid user_id FK "Scanner user"
        uuid event_id FK
        uuid check_in_point_id FK
        string device_info
        timestamp started_at
        timestamp ended_at
        int total_scans
        int successful_scans
        int failed_scans
    }

    CHECK_IN_LOGS {
        uuid id PK
        uuid booked_ticket_id FK
        uuid scanner_session_id FK
        uuid scanned_by FK
        uuid check_in_point_id FK
        
        enum result "success, already_checked_in, invalid, expired, wrong_event"
        string scanned_code
        string device_info
        string ip_address
        
        timestamp scanned_at
    }

    %% ══════════════════════════════════════════════════════════════════
    %% ENTITY DEFINITIONS - MODULE 6: FINANCIAL
    %% ══════════════════════════════════════════════════════════════════

    TAX_RATES {
        uuid id PK
        string name "PPN, PB1"
        string code UK
        enum tax_type "percentage, fixed"
        decimal rate
        boolean is_inclusive "Price includes tax"
        boolean is_default
        boolean is_active
        timestamp created_at
    }

    REFUNDS {
        uuid id PK
        uuid transaction_id FK
        uuid booking_id FK
        uuid requested_by FK
        uuid processed_by FK
        
        enum refund_type "full, partial"
        decimal refund_amount
        string reason
        
        enum status "requested, approved, rejected, processing, completed, failed"
        
        string gateway_refund_id
        json gateway_response
        
        text admin_notes
        timestamp requested_at
        timestamp processed_at
        timestamp completed_at
        timestamp created_at
    }

    PAYOUTS {
        uuid id PK
        uuid organizer_id FK
        uuid bank_account_id FK
        
        string payout_code UK "PO-XXXXXX"
        decimal amount
        decimal fee "Transfer fee if any"
        decimal net_amount
        
        enum status "requested, approved, processing, completed, rejected, failed"
        
        text notes
        text rejection_reason
        string proof_document_url "Transfer receipt"
        
        uuid requested_by FK
        uuid processed_by FK
        
        timestamp requested_at
        timestamp approved_at
        timestamp completed_at
        timestamp created_at
    }

    COMMISSION_SETTINGS {
        uuid id PK
        uuid organizer_id FK "Nullable for global"
        uuid event_id FK "Nullable for org-level"
        
        enum commission_type "percentage, fixed"
        decimal commission_value
        decimal min_commission "Min per ticket"
        decimal max_commission "Max per ticket"
        
        boolean is_active
        timestamp valid_from
        timestamp valid_until
        timestamp created_at
    }

    %% ══════════════════════════════════════════════════════════════════
    %% ENTITY DEFINITIONS - MODULE 7: REVIEWS & ENGAGEMENT
    %% ══════════════════════════════════════════════════════════════════

    REVIEWS {
        uuid id PK
        uuid user_id FK
        uuid event_id FK
        uuid booking_id FK "Proof of attendance"
        
        int rating "1-5"
        text review_text
        
        enum status "pending, approved, rejected"
        boolean is_verified_purchase
        
        int helpful_count
        int report_count
        
        timestamp created_at
        timestamp updated_at
    }

    REVIEW_REPLIES {
        uuid id PK
        uuid review_id FK
        uuid user_id FK "Organizer replying"
        text reply_text
        timestamp created_at
    }

    WISHLISTS {
        uuid id PK
        uuid user_id FK
        uuid event_id FK
        timestamp created_at
    }

    %% ══════════════════════════════════════════════════════════════════
    %% ENTITY DEFINITIONS - MODULE 8: MARKETING & AFFILIATES
    %% ══════════════════════════════════════════════════════════════════

    AFFILIATES {
        uuid id PK
        uuid user_id FK UK
        string affiliate_code UK "Referral code"
        
        decimal commission_rate "Percentage of sale"
        decimal total_earned
        decimal total_paid
        decimal current_balance
        
        enum status "pending, active, suspended"
        
        timestamp approved_at
        timestamp created_at
    }

    AFFILIATE_REFERRALS {
        uuid id PK
        uuid affiliate_id FK
        uuid booking_id FK UK
        
        decimal booking_amount
        decimal commission_amount
        
        enum status "pending, approved, paid"
        
        timestamp created_at
        timestamp paid_at
    }

    EMAIL_TEMPLATES {
        uuid id PK
        string name UK
        string slug UK
        string subject
        text body_html
        text body_text
        json variables "Available merge tags"
        boolean is_system "Cannot be deleted"
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    EMAIL_CAMPAIGNS {
        uuid id PK
        uuid event_id FK
        uuid organizer_id FK
        
        string name
        string subject
        text body_html
        json recipient_filter "Conditions for recipients"
        
        enum status "draft, scheduled, sending, sent, cancelled"
        
        int total_recipients
        int sent_count
        int open_count
        int click_count
        
        timestamp scheduled_at
        timestamp sent_at
        timestamp created_at
    }

    EMAIL_LOGS {
        uuid id PK
        uuid campaign_id FK
        uuid user_id FK
        string email
        
        enum status "queued, sent, delivered, opened, clicked, bounced, complained"
        
        timestamp sent_at
        timestamp opened_at
        timestamp clicked_at
    }

    %% ══════════════════════════════════════════════════════════════════
    %% ENTITY DEFINITIONS - MODULE 9: CMS & CONTENT
    %% ══════════════════════════════════════════════════════════════════

    PAGES {
        uuid id PK
        string slug UK
        string title
        text content
        boolean is_published
        int sort_order "For menu"
        enum page_type "regular, terms, privacy, about, contact"
        string meta_title
        string meta_description
        timestamp published_at
        timestamp created_at
        timestamp updated_at
    }

    PAGE_TRANSLATIONS {
        uuid id PK
        uuid page_id FK
        string locale "id, en"
        string title
        text content
        string meta_title
        string meta_description
        timestamp created_at
    }

    BLOG_CATEGORIES {
        uuid id PK
        string name
        string slug UK
        int sort_order
        boolean is_active
        timestamp created_at
    }

    BLOG_POSTS {
        uuid id PK
        uuid category_id FK
        uuid author_id FK
        
        string title
        string slug UK
        text excerpt
        text content
        string featured_image
        
        boolean is_published
        boolean is_featured
        
        int view_count
        
        string meta_title
        string meta_description
        
        timestamp published_at
        timestamp created_at
        timestamp updated_at
    }

    BLOG_POST_TRANSLATIONS {
        uuid id PK
        uuid post_id FK
        string locale
        string title
        text excerpt
        text content
        string meta_title
        string meta_description
        timestamp created_at
    }

    %% ══════════════════════════════════════════════════════════════════
    %% ENTITY DEFINITIONS - MODULE 10: SYSTEM & ADMIN
    %% ══════════════════════════════════════════════════════════════════

    SETTINGS {
        uuid id PK
        string key UK
        string value
        string group "general, payment, email, seo"
        enum value_type "string, number, boolean, json"
        text description
        boolean is_public "Exposed to frontend"
        timestamp created_at
        timestamp updated_at
    }

    PAYMENT_GATEWAYS {
        uuid id PK
        string name UK "midtrans, xendit, stripe"
        string display_name
        string logo_url
        json credentials "Encrypted API keys"
        json supported_methods "credit_card, ewallet, bank_transfer"
        boolean is_active
        boolean is_sandbox
        int sort_order
        timestamp created_at
        timestamp updated_at
    }

    AUDIT_LOGS {
        uuid id PK
        uuid user_id FK
        string action "create, update, delete, login, logout"
        string entity_type "Event, Booking, User"
        uuid entity_id
        json old_values
        json new_values
        string ip_address
        string user_agent
        timestamp created_at
    }

    NOTIFICATIONS {
        uuid id PK
        uuid user_id FK
        string title
        text message
        string action_url
        enum channel "in_app, email, push, whatsapp"
        boolean is_read
        timestamp read_at
        timestamp created_at
    }

    SYSTEM_LOGS {
        uuid id PK
        enum level "debug, info, warning, error, critical"
        string category
        string message
        json context
        string source
        timestamp created_at
    }
```
