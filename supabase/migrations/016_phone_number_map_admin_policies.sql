-- Migration: 016_phone_number_map_admin_policies
-- Project:   bizelevate-concierge
-- Purpose:   Grant admin users full CRUD access to phone_number_map across all
--            clients. Regular users are restricted to their own client by the
--            existing "phone_number_map: select own client" policy (008).
-- Depends:   005_add_user_profiles, 008_add_phone_number_map

-- Admin: select all rows (cross-client)
CREATE POLICY "phone_number_map: admin select all"
  ON phone_number_map FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

-- Admin: insert
CREATE POLICY "phone_number_map: admin insert"
  ON phone_number_map FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

-- Admin: update
CREATE POLICY "phone_number_map: admin update"
  ON phone_number_map FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

-- Admin: delete
CREATE POLICY "phone_number_map: admin delete"
  ON phone_number_map FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );
