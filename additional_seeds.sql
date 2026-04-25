-- ================================================
-- SHOP APP — ADDITIONAL SEED DATA
-- Run this in Supabase SQL Editor
-- ================================================

-- 1. Get some Zone IDs
DO $$
DECLARE
    westlands_id uuid;
    cbd_id uuid;
    kilimani_id uuid;
    lavington_id uuid;
BEGIN
    SELECT id INTO westlands_id FROM zones WHERE name = 'Westlands';
    SELECT id INTO cbd_id FROM zones WHERE name = 'CBD';
    SELECT id INTO kilimani_id FROM zones WHERE name = 'Kilimani';
    SELECT id INTO lavington_id FROM zones WHERE name = 'Lavington';

    -- 2. Add some Vendors (Restaurants)
    INSERT INTO vendors (name, description, category, phone, address, lat, lng, zone_id, status, rating, rating_count, min_order, is_open)
    VALUES 
    ('Java House', 'Gourmet coffee and fresh meals', 'restaurant', '0711000111', 'ABC Place, Westlands', -1.2655, 36.8045, westlands_id, 'active', 4.5, 120, 500, true),
    ('Artcaffe', 'European style bakery and coffee', 'restaurant', '0711000222', 'Westgate Mall', -1.2647, 36.8048, westlands_id, 'active', 4.7, 85, 400, true),
    ('Burger King', 'Flame-grilled burgers', 'restaurant', '0711000333', 'The Hub, Karen', -1.3194, 36.7061, lavington_id, 'active', 4.2, 210, 300, true),
    ('Pizza Inn', 'Terific Tuesday deals', 'restaurant', '0711000444', 'CBD Mama Ngina St', -1.2841, 36.8249, cbd_id, 'active', 4.0, 340, 600, true);

    -- 3. Add some Vendors (Shops & Groceries)
    INSERT INTO vendors (name, description, category, phone, address, lat, lng, zone_id, status, rating, rating_count, min_order, is_open)
    VALUES 
    ('Naivas Supermarket', 'Kila Siku Fresh', 'grocery', '0711000555', 'Westlands Square', -1.2635, 36.8035, westlands_id, 'active', 4.3, 1500, 200, true),
    ('Carrefour', 'Low prices every day', 'grocery', '0711000666', 'Sarit Centre', -1.2645, 36.8025, westlands_id, 'active', 4.6, 900, 500, true),
    ('Goodlife Pharmacy', 'Your health, our priority', 'pharmacy', '0711000777', 'MP Shah Plaza', -1.2625, 36.8015, westlands_id, 'active', 4.8, 50, 100, true),
    ('Miniso', 'Japanese lifestyle brand', 'shop', '0711000888', 'Village Market', -1.2294, 36.8043, westlands_id, 'active', 4.4, 300, 500, true);

    -- 4. Add Menu Items for Java House
    INSERT INTO menu_items (vendor_id, name, description, price, category, is_available)
    SELECT id, 'Caffè Latte', 'Rich espresso with steamed milk', 350, 'Coffee', true FROM vendors WHERE name = 'Java House';
    INSERT INTO menu_items (vendor_id, name, description, price, category, is_available)
    SELECT id, 'Beef Burger', 'Prime beef patty with cheese and fries', 850, 'Main Course', true FROM vendors WHERE name = 'Java House';
    INSERT INTO menu_items (vendor_id, name, description, price, category, is_available)
    SELECT id, 'Java House Salad', 'Garden fresh greens with vinaigrette', 650, 'Salads', true FROM vendors WHERE name = 'Java House';

    -- 5. Add Menu Items for Artcaffe
    INSERT INTO menu_items (vendor_id, name, description, price, category, is_available)
    SELECT id, 'Croissant', 'Buttery flaky French pastry', 250, 'Bakery', true FROM vendors WHERE name = 'Artcaffe';
    INSERT INTO menu_items (vendor_id, name, description, price, category, is_available)
    SELECT id, 'Cappuccino', 'Equal parts espresso, milk, and foam', 320, 'Coffee', true FROM vendors WHERE name = 'Artcaffe';
    INSERT INTO menu_items (vendor_id, name, description, price, category, is_available)
    SELECT id, 'Lasagna', 'Layers of pasta, meat sauce, and cheese', 1200, 'Main Course', true FROM vendors WHERE name = 'Artcaffe';

    -- 6. Add Menu Items for Goodlife Pharmacy
    INSERT INTO menu_items (vendor_id, name, description, price, category, is_available)
    SELECT id, 'Panadol Advance', 'Fast acting pain relief (20 tablets)', 150, 'Pain Relief', true FROM vendors WHERE name = 'Goodlife Pharmacy';
    INSERT INTO menu_items (vendor_id, name, description, price, category, is_available)
    SELECT id, 'Vitamin C', 'Effervescent tablets 1000mg', 850, 'Vitamins', true FROM vendors WHERE name = 'Goodlife Pharmacy';
    INSERT INTO menu_items (vendor_id, name, description, price, category, is_available)
    SELECT id, 'Face Mask (Pack of 50)', '3-ply surgical masks', 500, 'Essentials', true FROM vendors WHERE name = 'Goodlife Pharmacy';

    -- 7. Add Menu Items for Naivas
    INSERT INTO menu_items (vendor_id, name, description, price, category, is_available)
    SELECT id, 'Milk (500ml)', 'Fresh whole milk', 65, 'Dairy', true FROM vendors WHERE name = 'Naivas Supermarket';
    INSERT INTO menu_items (vendor_id, name, description, price, category, is_available)
    SELECT id, 'Bread (400g)', 'White sliced bread', 60, 'Bakery', true FROM vendors WHERE name = 'Naivas Supermarket';
    INSERT INTO menu_items (vendor_id, name, description, price, category, is_available)
    SELECT id, 'Eggs (Dozen)', 'Grade A large eggs', 240, 'Dairy', true FROM vendors WHERE name = 'Naivas Supermarket';

END $$;
