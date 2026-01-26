-- ====================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- Security fix for Supabase Database Linter warnings
-- ====================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizer_bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_code_usages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_price_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.check_in_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booked_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tax_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commission_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venue_rows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_performers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendee_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendee_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.check_in_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scanner_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venue_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizer_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waitlist_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizer_followers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_device_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_accesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venue_layouts ENABLE ROW LEVEL SECURITY;

-- ====================================
-- VENUE LAYOUT POLICIES
-- ====================================

CREATE POLICY "Public can view venue layouts" ON public.venue_layouts FOR SELECT USING (true);
CREATE POLICY "Organizers can manage their venue layouts" ON public.venue_layouts FOR ALL USING (
  event_id IN (SELECT id FROM public.events WHERE organizer_id::uuid = auth.uid())
);
CREATE POLICY "Admins have full access to venue layouts" ON public.venue_layouts FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid()::text AND role = 'SUPER_ADMIN')
);

-- ====================================
-- PUBLIC READ POLICIES
-- Data that anyone can read (even unauthenticated users)
-- ====================================

CREATE POLICY "Public can view categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Public can view venues" ON public.venues FOR SELECT USING (true);
CREATE POLICY "Public can view published events" ON public.events FOR SELECT USING (status = 'PUBLISHED' AND visibility = 'PUBLIC');
CREATE POLICY "Public can view event schedules" ON public.event_schedules FOR SELECT USING (true);
CREATE POLICY "Public can view event faqs" ON public.event_faqs FOR SELECT USING (true);
CREATE POLICY "Public can view ticket types" ON public.ticket_types FOR SELECT USING (true);
CREATE POLICY "Public can view ticket price tiers" ON public.ticket_price_tiers FOR SELECT USING (true);
CREATE POLICY "Public can view event media" ON public.event_media FOR SELECT USING (true);
CREATE POLICY "Public can view performers" ON public.performers FOR SELECT USING (true);
CREATE POLICY "Public can view event performers" ON public.event_performers FOR SELECT USING (true);
CREATE POLICY "Public can view sponsors" ON public.sponsors FOR SELECT USING (true);
CREATE POLICY "Public can view event sponsors" ON public.event_sponsors FOR SELECT USING (true);
CREATE POLICY "Public can view tags" ON public.tags FOR SELECT USING (true);
CREATE POLICY "Public can view event tags" ON public.event_tags FOR SELECT USING (true);
CREATE POLICY "Public can view venue sections" ON public.venue_sections FOR SELECT USING (true);
CREATE POLICY "Public can view venue rows" ON public.venue_rows FOR SELECT USING (true);
CREATE POLICY "Public can view seats" ON public.seats FOR SELECT USING (true);
CREATE POLICY "Public can view reviews" ON public.reviews FOR SELECT USING (is_verified = true);
CREATE POLICY "Public can view organizer profiles" ON public.organizer_profiles FOR SELECT USING (is_verified = true);
CREATE POLICY "Public can view tax rates" ON public.tax_rates FOR SELECT USING (is_active = true);

-- ====================================
-- USER POLICIES
-- Users can view and update their own data
-- ====================================

CREATE POLICY "Users can view their own profile" ON public.users FOR SELECT USING (auth.uid() = id::uuid);
CREATE POLICY "Users can update their own profile" ON public.users FOR UPDATE USING (auth.uid() = id::uuid);

CREATE POLICY "Users can view their own customer profile" ON public.customer_profiles FOR SELECT USING (auth.uid() = user_id::uuid);
CREATE POLICY "Users can update their own customer profile" ON public.customer_profiles FOR UPDATE USING (auth.uid() = user_id::uuid);

CREATE POLICY "Users can view their own bookings" ON public.bookings FOR SELECT USING (auth.uid() = user_id::uuid);
CREATE POLICY "Users can create bookings" ON public.bookings FOR INSERT WITH CHECK (auth.uid() = user_id::uuid);

CREATE POLICY "Users can view their own booked tickets" ON public.booked_tickets FOR SELECT USING (
  booking_id IN (SELECT id FROM public.bookings WHERE user_id::uuid = auth.uid())
);

CREATE POLICY "Users can view their own transactions" ON public.transactions FOR SELECT USING (
  booking_id IN (SELECT id FROM public.bookings WHERE user_id::uuid = auth.uid())
);

CREATE POLICY "Users can view their own refunds" ON public.refunds FOR SELECT USING (
  booking_id IN (SELECT id FROM public.bookings WHERE user_id::uuid = auth.uid())
);

CREATE POLICY "Users can manage their own wishlists" ON public.wishlists FOR ALL USING (auth.uid() = user_id::uuid);

CREATE POLICY "Users can create reviews for their bookings" ON public.reviews FOR INSERT WITH CHECK (
  auth.uid() = user_id::uuid AND
  booking_id IN (SELECT id FROM public.bookings WHERE user_id::uuid = auth.uid())
);
CREATE POLICY "Users can view all verified reviews" ON public.reviews FOR SELECT USING (is_verified = true);
CREATE POLICY "Users can view their own reviews" ON public.reviews FOR SELECT USING (auth.uid() = user_id::uuid);
CREATE POLICY "Users can update their own reviews" ON public.reviews FOR UPDATE USING (auth.uid() = user_id::uuid);

CREATE POLICY "Users can view their own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id::uuid);
CREATE POLICY "Users can update their own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id::uuid);

CREATE POLICY "Users can view their own ticket transfers" ON public.ticket_transfers FOR SELECT USING (
  auth.uid() = from_user_id::uuid OR auth.uid() = to_user_id::uuid
);

CREATE POLICY "Users can manage their own waitlist entries" ON public.waitlist_entries FOR ALL USING (auth.uid() = user_id::uuid);

CREATE POLICY "Users can follow organizers" ON public.organizer_followers FOR INSERT WITH CHECK (auth.uid() = user_id::uuid);
CREATE POLICY "Users can unfollow organizers" ON public.organizer_followers FOR DELETE USING (auth.uid() = user_id::uuid);
CREATE POLICY "Users can view their own follows" ON public.organizer_followers FOR SELECT USING (auth.uid() = user_id::uuid);

-- ====================================
-- ORGANIZER POLICIES
-- Organizers can manage their own events and data
-- ====================================

CREATE POLICY "Organizers can view their own organizer profile" ON public.organizer_profiles FOR SELECT USING (
  auth.uid() = user_id::uuid
);
CREATE POLICY "Organizers can update their own organizer profile" ON public.organizer_profiles FOR UPDATE USING (
  auth.uid() = user_id::uuid
);

CREATE POLICY "Organizers can view their own bank accounts" ON public.organizer_bank_accounts FOR SELECT USING (
  organizer_profile_id IN (SELECT id FROM public.organizer_profiles WHERE user_id::uuid = auth.uid())
);
CREATE POLICY "Organizers can manage their own bank accounts" ON public.organizer_bank_accounts FOR ALL USING (
  organizer_profile_id IN (SELECT id FROM public.organizer_profiles WHERE user_id::uuid = auth.uid())
);

CREATE POLICY "Organizers can view all events" ON public.events FOR SELECT USING (true);
CREATE POLICY "Organizers can manage their own events" ON public.events FOR ALL USING (
  auth.uid() = organizer_id::uuid
);

CREATE POLICY "Organizers can manage their event schedules" ON public.event_schedules FOR ALL USING (
  event_id IN (SELECT id FROM public.events WHERE organizer_id::uuid = auth.uid())
);

CREATE POLICY "Organizers can manage their event faqs" ON public.event_faqs FOR ALL USING (
  event_id IN (SELECT id FROM public.events WHERE organizer_id::uuid = auth.uid())
);

CREATE POLICY "Organizers can manage their promo codes" ON public.promo_codes FOR ALL USING (
  event_id IN (SELECT id FROM public.events WHERE organizer_id::uuid = auth.uid())
);

CREATE POLICY "Organizers can view promo code usages" ON public.promo_code_usages FOR SELECT USING (
  promo_code_id IN (
    SELECT id FROM public.promo_codes WHERE event_id IN (
      SELECT id FROM public.events WHERE organizer_id::uuid = auth.uid()
    )
  )
);

CREATE POLICY "Organizers can manage their ticket types" ON public.ticket_types FOR ALL USING (
  event_id IN (SELECT id FROM public.events WHERE organizer_id::uuid = auth.uid())
);

CREATE POLICY "Organizers can manage their ticket price tiers" ON public.ticket_price_tiers FOR ALL USING (
  ticket_type_id IN (
    SELECT id FROM public.ticket_types WHERE event_id IN (
      SELECT id FROM public.events WHERE organizer_id::uuid = auth.uid()
    )
  )
);

CREATE POLICY "Organizers can view bookings for their events" ON public.bookings FOR SELECT USING (
  event_id IN (SELECT id FROM public.events WHERE organizer_id::uuid = auth.uid())
);

CREATE POLICY "Organizers can view booked tickets for their events" ON public.booked_tickets FOR SELECT USING (
  booking_id IN (
    SELECT id FROM public.bookings WHERE event_id IN (
      SELECT id FROM public.events WHERE organizer_id::uuid = auth.uid()
    )
  )
);

CREATE POLICY "Organizers can view check-in logs" ON public.check_in_logs FOR SELECT USING (
  booked_ticket_id IN (
    SELECT bt.id FROM public.booked_tickets bt
    JOIN public.bookings b ON bt.booking_id = b.id
    WHERE b.event_id IN (SELECT id FROM public.events WHERE organizer_id::uuid = auth.uid())
  )
);

CREATE POLICY "Organizers can create check-in logs" ON public.check_in_logs FOR INSERT WITH CHECK (
  booked_ticket_id IN (
    SELECT bt.id FROM public.booked_tickets bt
    JOIN public.bookings b ON bt.booking_id = b.id
    WHERE b.event_id IN (SELECT id FROM public.events WHERE organizer_id::uuid = auth.uid())
  )
);

CREATE POLICY "Organizers can view their payouts" ON public.payouts FOR SELECT USING (
  organizer_profile_id IN (SELECT id FROM public.organizer_profiles WHERE user_id::uuid = auth.uid())
);

CREATE POLICY "Organizers can view transactions for their events" ON public.transactions FOR SELECT USING (
  booking_id IN (
    SELECT id FROM public.bookings WHERE event_id IN (
      SELECT id FROM public.events WHERE organizer_id::uuid = auth.uid()
    )
  )
);

CREATE POLICY "Organizers can manage their event media" ON public.event_media FOR ALL USING (
  event_id IN (SELECT id FROM public.events WHERE organizer_id::uuid = auth.uid())
);

CREATE POLICY "Organizers can manage their event performers" ON public.event_performers FOR ALL USING (
  event_id IN (SELECT id FROM public.events WHERE organizer_id::uuid = auth.uid())
);

CREATE POLICY "Organizers can manage their event sponsors" ON public.event_sponsors FOR ALL USING (
  event_id IN (SELECT id FROM public.events WHERE organizer_id::uuid = auth.uid())
);

CREATE POLICY "Organizers can manage their attendee questions" ON public.attendee_questions FOR ALL USING (
  event_id IN (SELECT id FROM public.events WHERE organizer_id::uuid = auth.uid())
);

CREATE POLICY "Organizers can view attendee answers" ON public.attendee_answers FOR SELECT USING (
  booking_id IN (
    SELECT id FROM public.bookings WHERE event_id IN (
      SELECT id FROM public.events WHERE organizer_id::uuid = auth.uid()
    )
  )
);

CREATE POLICY "Organizers can manage check-in points" ON public.check_in_points FOR ALL USING (
  event_id IN (SELECT id FROM public.events WHERE organizer_id::uuid = auth.uid())
);

CREATE POLICY "Organizers can manage scanner sessions" ON public.scanner_sessions FOR ALL USING (
  event_id IN (SELECT id FROM public.events WHERE organizer_id::uuid = auth.uid())
);

CREATE POLICY "Organizers can manage their team members" ON public.organizer_team_members FOR ALL USING (
  organizer_profile_id IN (SELECT id FROM public.organizer_profiles WHERE user_id::uuid = auth.uid())
);
  organizer_profile_id IN (SELECT id FROM public.organizer_profiles WHERE user_id::uuid = auth.uid())
);

CREATE POLICY "Organizers can view their followers" ON public.organizer_followers FOR SELECT USING (
  organizer_profile_id IN (SELECT id FROM public.organizer_profiles WHERE user_id::uuid = auth.uid())
);

CREATE POLICY "Organizers can manage device sessions" ON public.event_device_sessions FOR ALL USING (
  event_id IN (SELECT id FROM public.events WHERE organizer_id::uuid = auth.uid())
);

CREATE POLICY "Organizers can view device accesses" ON public.device_accesses FOR SELECT USING (
  session_id IN (SELECT id FROM public.event_device_sessions WHERE event_id IN (
    SELECT id FROM public.events WHERE organizer_id::uuid = auth.uid()
  ))
);

-- ====================================
-- ADMIN POLICIES
-- Super admins can do everything
-- ====================================

CREATE POLICY "Admins have full access to users" ON public.users FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid()::text AND role = 'SUPER_ADMIN')
);

CREATE POLICY "Admins have full access to organizer profiles" ON public.organizer_profiles FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid()::text AND role = 'SUPER_ADMIN')
);

CREATE POLICY "Admins have full access to customer profiles" ON public.customer_profiles FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid()::text AND role = 'SUPER_ADMIN')
);

CREATE POLICY "Admins can manage categories" ON public.categories FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid()::text AND role = 'SUPER_ADMIN')
);

CREATE POLICY "Admins have full access to events" ON public.events FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid()::text AND role = 'SUPER_ADMIN')
);

CREATE POLICY "Admins can manage site contents" ON public.site_contents FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid()::text AND role = 'SUPER_ADMIN')
);

CREATE POLICY "Admins can manage tax rates" ON public.tax_rates FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid()::text AND role = 'SUPER_ADMIN')
);

CREATE POLICY "Admins can manage commission settings" ON public.commission_settings FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid()::text AND role = 'SUPER_ADMIN')
);

CREATE POLICY "Admins can view all bookings" ON public.bookings FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid()::text AND role = 'SUPER_ADMIN')
);

CREATE POLICY "Admins can view all transactions" ON public.transactions FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid()::text AND role = 'SUPER_ADMIN')
);

CREATE POLICY "Admins can manage refunds" ON public.refunds FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid()::text AND role = 'SUPER_ADMIN')
);

CREATE POLICY "Admins can manage payouts" ON public.payouts FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid()::text AND role = 'SUPER_ADMIN')
);

CREATE POLICY "Admins can view all audit logs" ON public.audit_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid()::text AND role = 'SUPER_ADMIN')
);

CREATE POLICY "Admins can manage performers" ON public.performers FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid()::text AND role = 'SUPER_ADMIN')
);

CREATE POLICY "Admins can manage sponsors" ON public.sponsors FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid()::text AND role = 'SUPER_ADMIN')
);

CREATE POLICY "Admins can manage tags" ON public.tags FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid()::text AND role = 'SUPER_ADMIN')
);

CREATE POLICY "Admins can manage venues" ON public.venues FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid()::text AND role = 'SUPER_ADMIN')
);

CREATE POLICY "Admins can moderate reviews" ON public.reviews FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid()::text AND role = 'SUPER_ADMIN')
);

-- ====================================
-- SPECIAL POLICIES
-- Complex access patterns
-- ====================================

CREATE POLICY "Customers can answer attendee questions" ON public.attendee_answers FOR INSERT WITH CHECK (
  booking_id IN (SELECT id FROM public.bookings WHERE user_id::uuid = auth.uid())
);

CREATE POLICY "Users can create ticket transfers from their own tickets" ON public.ticket_transfers FOR INSERT WITH CHECK (
  auth.uid() = from_user_id::uuid
);

CREATE POLICY "Users can accept ticket transfers to them" ON public.ticket_transfers FOR UPDATE USING (
  auth.uid() = to_user_id::uuid
);

CREATE POLICY "Service role can manage recurring patterns" ON public.recurring_patterns FOR ALL USING (
  auth.jwt()->>'role' = 'service_role'
);

CREATE POLICY "Public can view site contents" ON public.site_contents FOR SELECT USING (is_active = true);

CREATE POLICY "Authenticated users can view commission settings" ON public.commission_settings FOR SELECT USING (
  auth.uid() IS NOT NULL
);

-- ====================================
-- AUDIT LOG POLICY
-- System can always write audit logs
-- ====================================

CREATE POLICY "System can create audit logs" ON public.audit_logs FOR INSERT WITH CHECK (true);
