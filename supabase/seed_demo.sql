-- MenuBoard — demo restaurant seed data
-- Run AFTER schema.sql in Supabase SQL Editor

insert into public.restaurants (id, slug, name, tagline, phone, logo_url, branding, plan, is_demo)
values
  (
    'demo-burger',
    'demo-burger',
    'Demo Burger Co.',
    'Flame-grilled favorites — scan, browse, review',
    '(555) 123-4567',
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=200&h=200&q=80',
    '{"primaryColor":"#ea580c","displayLayout":"combo-board"}'::jsonb,
    'pro',
    true
  ),
  (
    'demo-taco',
    'demo-taco',
    'Quick Taco Stand',
    'Street tacos — scan to browse our menu',
    '(555) 987-6543',
    'https://images.unsplash.com/photo-1565299585323-38174c8daaef?auto=format&fit=crop&w=200&h=200&q=80',
    '{"primaryColor":"#16a34a","displayLayout":"grid"}'::jsonb,
    'starter',
    true
  )
on conflict (id) do nothing;

insert into public.menu_categories (id, restaurant_id, name, sort_order, image_url, active) values
  ('cat-burgers', 'demo-burger', 'Burgers', 0, 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&h=300&fit=crop', true),
  ('cat-chicken', 'demo-burger', 'Chicken', 1, 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=400&h=300&fit=crop', true),
  ('cat-sides', 'demo-burger', 'Sides', 2, 'https://images.unsplash.com/photo-1573080496216-bf89696d472f?w=400&h=300&fit=crop', true),
  ('cat-drinks', 'demo-burger', 'Drinks', 3, 'https://images.unsplash.com/photo-1622480860908-2042e4951a23?w=400&h=300&fit=crop', true),
  ('cat-tacos', 'demo-taco', 'Tacos', 0, null, true),
  ('cat-taco-sides', 'demo-taco', 'Sides', 1, null, true)
on conflict (id) do nothing;

-- Menu items (abbreviated nutrition JSON where present in db.json)
insert into public.menu_items (id, restaurant_id, category_id, name, description, price_cents, image_url, available, featured, sort_order, nutrition) values
  ('item-classic', 'demo-burger', 'cat-burgers', 'Classic Cheeseburger', 'Angus beef patty, American cheese, lettuce, tomato, pickles, and our house sauce on a toasted brioche bun.', 899, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=600&fit=crop', true, true, 0, '{"servingSize":"1 burger (245g)","calories":680,"proteinG":34,"carbsG":42,"fatG":38,"sodiumMg":980,"allergens":["gluten","dairy","eggs"]}'::jsonb),
  ('item-bacon', 'demo-burger', 'cat-burgers', 'Bacon BBQ Burger', 'Double patty, crispy bacon, cheddar, onion rings, and smoky BBQ sauce.', 1199, 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&h=600&fit=crop', true, true, 1, '{"servingSize":"1 burger (310g)","calories":920,"proteinG":48,"carbsG":52,"fatG":54,"sodiumMg":1420,"allergens":["gluten","dairy"]}'::jsonb),
  ('item-veggie', 'demo-burger', 'cat-burgers', 'Garden Veggie Burger', 'House-made black bean patty, avocado, sprouts, and herb aioli.', 999, 'https://images.unsplash.com/photo-1572802415324-df79170c8e90?auto=format&fit=crop&w=800&h=600&q=80', true, false, 2, '{"servingSize":"1 burger (220g)","calories":520,"proteinG":18,"carbsG":58,"fatG":22,"sodiumMg":780,"allergens":["gluten"]}'::jsonb),
  ('item-crispy', 'demo-burger', 'cat-chicken', 'Crispy Chicken Sandwich', 'Buttermilk fried chicken breast, coleslaw, pickles, and spicy mayo.', 949, 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=800&h=600&fit=crop', true, true, 0, '{"servingSize":"1 sandwich (260g)","calories":640,"proteinG":32,"carbsG":48,"fatG":34,"sodiumMg":1100,"allergens":["gluten","eggs"]}'::jsonb),
  ('item-tenders', 'demo-burger', 'cat-chicken', 'Chicken Tenders (5 pc)', 'Hand-breaded tenders with your choice of ranch, honey mustard, or BBQ.', 799, 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7448?auto=format&fit=crop&w=800&h=600&q=80', true, false, 1, '{"servingSize":"5 pieces (180g)","calories":480,"proteinG":28,"carbsG":32,"fatG":26,"sodiumMg":890,"allergens":["gluten","eggs"]}'::jsonb),
  ('item-nuggets', 'demo-burger', 'cat-chicken', 'Popcorn Nuggets', 'Bite-size crispy chicken — perfect for sharing.', 549, 'https://images.unsplash.com/photo-1562967910-60882a65945d?auto=format&fit=crop&w=800&h=600&q=80', false, false, 2, '{"servingSize":"10 pieces (120g)","calories":320,"proteinG":16,"carbsG":22,"fatG":18,"sodiumMg":620,"allergens":["gluten"]}'::jsonb),
  ('item-fries', 'demo-burger', 'cat-sides', 'Crispy Fries', 'Golden shoestring fries seasoned with sea salt.', 349, 'https://images.unsplash.com/photo-1573080496216-bf89696d472f?w=800&h=600&fit=crop', true, false, 0, '{"servingSize":"Medium (140g)","calories":380,"proteinG":4,"carbsG":48,"fatG":18,"sodiumMg":420,"allergens":[]}'::jsonb),
  ('item-rings', 'demo-burger', 'cat-sides', 'Onion Rings', 'Thick-cut beer-battered onion rings with chipotle ranch.', 449, 'https://images.unsplash.com/photo-1630384086601-768efa027a2a?w=800&h=600&fit=crop', true, false, 1, '{"servingSize":"8 rings (150g)","calories":410,"proteinG":5,"carbsG":44,"fatG":22,"sodiumMg":560,"allergens":["gluten","dairy"]}'::jsonb),
  ('item-shake', 'demo-burger', 'cat-drinks', 'Vanilla Milkshake', 'Thick and creamy — made with real ice cream.', 499, 'https://images.unsplash.com/photo-1572490122748-596534b17284?w=800&h=600&fit=crop', true, true, 0, '{"servingSize":"16 oz","calories":520,"proteinG":10,"carbsG":68,"fatG":22,"sodiumMg":280,"allergens":["dairy"]}'::jsonb),
  ('item-soda', 'demo-burger', 'cat-drinks', 'Fountain Soda', 'Coke, Diet Coke, Sprite, or Dr Pepper — free refills.', 249, 'https://images.unsplash.com/photo-1581636629482-a5cf44884a80?auto=format&fit=crop&w=800&h=600&q=80', true, false, 1, '{"servingSize":"Medium (22 oz)","calories":220,"proteinG":0,"carbsG":58,"fatG":0,"sodiumMg":45,"allergens":[]}'::jsonb),
  ('item-lemonade', 'demo-burger', 'cat-drinks', 'Fresh Lemonade', 'House-squeezed lemons with a touch of mint.', 299, 'https://images.unsplash.com/photo-1523673565545-6d7858262549?auto=format&fit=crop&w=800&h=600&q=80', true, false, 2, '{"servingSize":"16 oz","calories":140,"proteinG":0,"carbsG":36,"fatG":0,"sodiumMg":15,"allergens":[]}'::jsonb),
  ('item-combo', 'demo-burger', 'cat-burgers', 'Classic Combo Meal', 'Classic Cheeseburger, medium fries, and a medium drink.', 1299, 'https://images.unsplash.com/photo-1594212699903-ec524a9e12ab?w=800&h=600&fit=crop', true, true, 3, '{"servingSize":"1 combo","calories":1180,"proteinG":42,"carbsG":128,"fatG":52,"sodiumMg":1520,"allergens":["gluten","dairy"]}'::jsonb),
  ('taco-carne', 'demo-taco', 'cat-tacos', 'Carne Asada Taco', 'Grilled steak, cilantro, onion, lime on a corn tortilla.', 399, 'https://images.unsplash.com/photo-1565299585323-38174c8daaef?auto=format&fit=crop&w=800&h=600&q=80', true, true, 0, '{"calories":210}'::jsonb),
  ('taco-al-pastor', 'demo-taco', 'cat-tacos', 'Al Pastor Taco', 'Marinated pork, pineapple, cilantro, and onion.', 399, 'https://images.unsplash.com/photo-1599974579688-8dbddb0aaff4?auto=format&fit=crop&w=800&h=600&q=80', true, false, 1, '{"calories":195}'::jsonb),
  ('taco-chicken', 'demo-taco', 'cat-tacos', 'Chicken Taco', 'Seasoned grilled chicken with pico de gallo.', 349, 'https://images.unsplash.com/photo-1624305820584-762254366e79?auto=format&fit=crop&w=800&h=600&q=80', true, false, 2, '{"calories":180}'::jsonb),
  ('taco-veggie', 'demo-taco', 'cat-tacos', 'Veggie Taco', 'Black beans, roasted peppers, avocado, and queso fresco.', 349, 'https://images.unsplash.com/photo-1551506327-0c011dc11351?auto=format&fit=crop&w=800&h=600&q=80', true, false, 3, '{"calories":165}'::jsonb),
  ('taco-chips', 'demo-taco', 'cat-taco-sides', 'Chips & Salsa', 'Fresh fried chips with house salsa verde.', 299, 'https://images.unsplash.com/photo-1513456852971-3ac41d588a55?auto=format&fit=crop&w=800&h=600&q=80', true, false, 0, '{"calories":320}'::jsonb),
  ('taco-rice', 'demo-taco', 'cat-taco-sides', 'Mexican Rice', 'Tomato-seasoned rice with mild spices.', 249, 'https://images.unsplash.com/photo-1512058564366-18510ef2d12c?auto=format&fit=crop&w=800&h=600&q=80', true, false, 1, '{"calories":180}'::jsonb)
on conflict (id) do nothing;

insert into public.item_reviews (id, restaurant_id, item_id, customer_name, rating, comment, status, created_at) values
  ('rev-1', 'demo-burger', 'item-classic', 'Jordan M.', 5, 'Best cheeseburger in town — bun stays soft and the sauce is perfect.', 'approved', '2026-06-20T18:30:00.000Z'),
  ('rev-2', 'demo-burger', 'item-classic', 'Sam T.', 4, 'Solid classic. Fries were hot too.', 'approved', '2026-06-21T12:15:00.000Z'),
  ('rev-3', 'demo-burger', 'item-bacon', 'Alex R.', 5, 'The BBQ sauce and onion rings combo is insane. Worth every penny.', 'approved', '2026-06-19T20:00:00.000Z'),
  ('rev-4', 'demo-burger', 'item-crispy', 'Taylor K.', 4, 'Crunchy and juicy. Spicy mayo has a nice kick.', 'approved', '2026-06-18T19:45:00.000Z'),
  ('rev-5', 'demo-burger', 'item-shake', 'Chris P.', 5, 'Thick shake — you need a spoon at first!', 'approved', '2026-06-17T14:20:00.000Z'),
  ('rev-6', 'demo-burger', 'item-fries', 'Pending User', 3, 'Good but could use more salt.', 'pending', '2026-06-22T10:00:00.000Z')
on conflict (id) do nothing;
