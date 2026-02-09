INSERT INTO students (name, phone, email, fee_per_classes, fee_amount, schedule, induction_date, is_active)
VALUES
  -- 1. Aadya: day 6, time 10:30
  ('Aadya', '+919739296622', '', 4, 4000, '{"6": "10:30"}', CURRENT_DATE, true),
  -- 2. Aadyata: day 3, time 10:30
  ('Aadyata', '+919945523286', '', 4, 4000, '{"3": "10:30"}', CURRENT_DATE, true),
  -- 3. Aaradhya: days 2,5, time 16:00
  ('Aaradhya', '+919961887486', '', 8, 6000, '{"2": "16:00", "5": "16:00"}', CURRENT_DATE, true),
  -- 4. Aaravi: US number 1(614)530-7509
  ('Aaravi', '+16145307509', '', 8, 8000, '{"2": "07:00", "5": "07:00"}', CURRENT_DATE, true),
  -- 5. Aarohi: days 1,3, time 16:30
  ('Aarohi', '+917259891891', '', 8, 4000, '{"1": "16:30", "3": "16:30"}', CURRENT_DATE, true),
  -- 6. Aakash: days 3,5, time 17:00
  ('Aakash', '+917338600231', '', 8, 4000, '{"3": "17:00", "5": "17:00"}', CURRENT_DATE, true),
  -- 7. Adarsh: days 2,4, time 17:30
  ('Adarsh', '+919380776671', '', 8, 6000, '{"2": "17:30", "4": "17:30"}', CURRENT_DATE, true),
  -- 8. Advik: days 1,3, time 17:00
  ('Advik', '+919900800344', '', 4, 2000, '{"1": "17:00", "3": "17:00"}', CURRENT_DATE, true),
  -- 9. Advit: days 1,3, time 16:30
  ('Advit', '+919535579681', '', 8, 4000, '{"1": "16:30", "3": "16:30"}', CURRENT_DATE, true),
  -- 10. Akshar: days 2,4, time 17:00
  ('Akshar', '+919483969815', '', 8, 4000, '{"2": "17:00", "4": "17:00"}', CURRENT_DATE, true),
  -- 11. Alekhya: days 1,3,5, time 16:30
  ('Alekhya', '+919022386379', '', 12, 6000, '{"1": "16:30", "3": "16:30", "5": "16:30"}', CURRENT_DATE, true),
  -- 12. Aniruddh (D Block): days 2,4, time 16:30
  ('Aniruddh (D Block)', '+917022819414', '', 8, 6000, '{"2": "16:30", "4": "16:30"}', CURRENT_DATE, true),
  -- 13. Aniruddha Skanda: days 2,6, times 17:30,11:00 (positional)
  ('Aniruddha Skanda', '+919008281229', '', 8, 4000, '{"2": "17:30", "6": "11:00"}', CURRENT_DATE, true),
  -- 14. Anusha: days 6,0, time 10:30
  ('Anusha', '+919380246948', '', 8, 6000, '{"6": "10:30", "0": "10:30"}', CURRENT_DATE, true),
  -- 15. Anvika: days 1,5, time 16:30
  ('Anvika', '+918971040389', '', 8, 4000, '{"1": "16:30", "5": "16:30"}', CURRENT_DATE, true),
  -- 16. Ashraya: days 2,5, time 16:30
  ('Ashraya', '+919819026726', '', 8, 4000, '{"2": "16:30", "5": "16:30"}', CURRENT_DATE, true),
  -- 17. Ashrit: days 5,0, times 17:30,10:30 (positional)
  ('Ashrit', '+919980660337', '', 8, 4000, '{"5": "17:30", "0": "10:30"}', CURRENT_DATE, true),
  -- 18. Chetan: days 2,4, time 17:30
  ('Chetan', '+919742844241', '', 8, 4000, '{"2": "17:30", "4": "17:30"}', CURRENT_DATE, true),
  -- 19. Chinmay: days 5,6, times 20:00,10:30 (positional)
  ('Chinmay', '+919880848271', '', 8, 4000, '{"5": "20:00", "6": "10:30"}', CURRENT_DATE, true),
  -- 20. Deepa: days 1,5, time 18:00
  ('Deepa', '+919901033744', '', 8, 2000, '{"1": "18:00", "5": "18:00"}', CURRENT_DATE, true),
  -- 21. Dhatri: days 1,5, time 16:30
  ('Dhatri', '+918884299952', '', 8, 3000, '{"1": "16:30", "5": "16:30"}', CURRENT_DATE, true),
  -- 22. Dhriti: days 2,4, time 17:00
  ('Dhriti', '+919731496554', '', 8, 4000, '{"2": "17:00", "4": "17:00"}', CURRENT_DATE, true),
  -- 23. Diya: days 2,4, time 17:30
  ('Diya', '+919535287390', '', 8, 4000, '{"2": "17:30", "4": "17:30"}', CURRENT_DATE, true),
  -- 24. Gauri: days 6,0, time 11:30
  ('Gauri', '+918861492072', '', 8, 4000, '{"6": "11:30", "0": "11:30"}', CURRENT_DATE, true),
  -- 25. Gowri: days 1,5, time 16:30
  ('Gowri', '+919886626277', '', 8, 4000, '{"1": "16:30", "5": "16:30"}', CURRENT_DATE, true),
  -- 26. Gunabrita: days 1,5, time 17:00
  ('Gunabrita', '+919740168686', '', 8, 4000, '{"1": "17:00", "5": "17:00"}', CURRENT_DATE, true),
  -- 27. Hriday: days 1,4, time 16:30
  ('Hriday', '+919741611116', '', 8, 6000, '{"1": "16:30", "4": "16:30"}', CURRENT_DATE, true),
  -- 28. Isha: days 2,4,5, time 16:30
  ('Isha', '+919845450122', '', 12, 8000, '{"2": "16:30", "4": "16:30", "5": "16:30"}', CURRENT_DATE, true),
  -- 29. Ishanvi: days 6,0, time 10:30
  ('Ishanvi', '+918792422665', '', 8, 6000, '{"6": "10:30", "0": "10:30"}', CURRENT_DATE, true),
  -- 30. Janani: days 1,4, time 16:15
  ('Janani', '+919902366551', '', 8, 8000, '{"1": "16:15", "4": "16:15"}', CURRENT_DATE, true),
  -- 31. Jeeji: days 1,5, time 09:00
  ('Jeeji', '+919740867220', '', 8, 6000, '{"1": "09:00", "5": "09:00"}', CURRENT_DATE, true),
  -- 32. Krishnanu: days 1,3, time 17:00
  ('Krishnanu', '+917259891891', '', 8, 4000, '{"1": "17:00", "3": "17:00"}', CURRENT_DATE, true),
  -- 33. Kshiti: days 2,4, time 16:30
  ('Kshiti', '+919731151446', '', 8, 5000, '{"2": "16:30", "4": "16:30"}', CURRENT_DATE, true),
  -- 34. Lata: days 2,4, time 12:30
  ('Lata', '+919945589689', '', 8, 4000, '{"2": "12:30", "4": "12:30"}', CURRENT_DATE, true),
  -- 35. Madhumita: days 6,0, time 10:30
  ('Madhumita', '+919845073213', '', 8, 4000, '{"6": "10:30", "0": "10:30"}', CURRENT_DATE, true),
  -- 36. Meheru: days 1,3, time 10:30
  ('Meheru', '+919100943203', '', 8, 6000, '{"1": "10:30", "3": "10:30"}', CURRENT_DATE, true),
  -- 37. Padmapriya: days 2,5, time 19:00
  ('Padmapriya', '+919980972454', '', 8, 2000, '{"2": "19:00", "5": "19:00"}', CURRENT_DATE, true),
  -- 38. Priya: days 1,3, time 12:30
  ('Priya', '+916360589815', '', 8, 6000, '{"1": "12:30", "3": "12:30"}', CURRENT_DATE, true),
  -- 39. Pratyush: days 1,4, time 19:00
  ('Pratyush', '+919880713140', '', 8, 8000, '{"1": "19:00", "4": "19:00"}', CURRENT_DATE, true),
  -- 40. Raghavendra: days 1,5, time 20:30
  ('Raghavendra', '+919945223856', '', 8, 8000, '{"1": "20:30", "5": "20:30"}', CURRENT_DATE, true),
  -- 41. Raksha: days 6,0, time 11:30
  ('Raksha', '+917348977893', '', 8, 10000, '{"6": "11:30", "0": "11:30"}', CURRENT_DATE, true),
  -- 42. Rakshita: days 5,0, times 17:00,10:30 (positional)
  ('Rakshita', '+918861148844', '', 8, 4000, '{"5": "17:00", "0": "10:30"}', CURRENT_DATE, true),
  -- 43. Rohini: days 2,6, times 16:30,10:30 (positional)
  ('Rohini', '+919342527092', '', 8, 6000, '{"2": "16:30", "6": "10:30"}', CURRENT_DATE, true),
  -- 44. Roopa: days 6,0, time 10:30
  ('Roopa', '+919845073213', '', 8, 4000, '{"6": "10:30", "0": "10:30"}', CURRENT_DATE, true),
  -- 45. Rudraksh: days 2,4, time 16:30
  ('Rudraksh', '+918106083089', '', 8, 4000, '{"2": "16:30", "4": "16:30"}', CURRENT_DATE, true),
  -- 46. Saanvi (Deepa): days 1,3, time 16:30
  ('Saanvi (Deepa)', '+919901033744', '', 8, 6000, '{"1": "16:30", "3": "16:30"}', CURRENT_DATE, true),
  -- 47. Saanvi (Sindhu): days 1,3, time 16:00
  ('Saanvi (Sindhu)', '+919900477377', '', 8, 4000, '{"1": "16:00", "3": "16:00"}', CURRENT_DATE, true),
  -- 48. Saanvi (U S): days 2,5, time 05:00
  ('Saanvi (U S)', '+919844666580', '', 8, 8000, '{"2": "05:00", "5": "05:00"}', CURRENT_DATE, true),
  -- 49. Saanvi Suraj: day 5, time 10:30
  ('Saanvi Suraj', '+919606667693', '', 4, 4000, '{"5": "10:30"}', CURRENT_DATE, true),
  -- 50. Sahiti: days 1,5, time 20:00
  ('Sahiti', '+919886165291', '', 8, 8000, '{"1": "20:00", "5": "20:00"}', CURRENT_DATE, true),
  -- 51. Samarth: days 2,4, time 16:30
  ('Samarth', '+919986017857', '', 8, 6000, '{"2": "16:30", "4": "16:30"}', CURRENT_DATE, true),
  -- 52. Sanika Suraj: days 2,6, times 16:30,10:30 (positional)
  ('Sanika Suraj', '+919606667693', '', 8, 6000, '{"2": "16:30", "6": "10:30"}', CURRENT_DATE, true),
  -- 53. Savita (Chai): days 2,5, time 19:00
  ('Savita (Chai)', '+919845691891', '', 8, 2000, '{"2": "19:00", "5": "19:00"}', CURRENT_DATE, true),
  -- 54. Savita Sridhar: day 6, time 09:30
  ('Savita Sridhar', '+918971085381', '', 4, 2000, '{"6": "09:30"}', CURRENT_DATE, true),
  -- 55. Shanvi (U S): US number 1(346)457-8112
  ('Shanvi (U S)', '+13464578112', '', 4, 4000, '{"5": "07:30"}', CURRENT_DATE, true),
  -- 56. Shanvi Roy: days 1,3,5, time 16:00
  ('Shanvi Roy', '+919600849888', '', 12, 5000, '{"1": "16:00", "3": "16:00", "5": "16:00"}', CURRENT_DATE, true),
  -- 57. Shalini (D Block): day 0, time 11:30, induction 2026-02-15
  ('Shalini (D Block)', '+917760509458', '', 4, 4000, '{"0": "11:30"}', '2026-02-15', true),
  -- 58. Shalini (U S): US number 1(703)899-5481, days 2,5, time 06:00
  ('Shalini (U S)', '+17038995481', '', 8, 8000, '{"2": "06:00", "5": "06:00"}', CURRENT_DATE, true),
  -- 59. Sharvi: US number 1(480)435-5206, days 2,6, time 07:30
  ('Sharvi', '+14804355206', '', 8, 8000, '{"2": "07:30", "6": "07:30"}', CURRENT_DATE, true),
  -- 60. Shasini: days 1,4, time 16:30
  ('Shasini', '+918106083089', '', 8, 4000, '{"1": "16:30", "4": "16:30"}', CURRENT_DATE, true),
  -- 61. Shaurya: days 1,3, time 17:30, induction 2026-02-16
  ('Shaurya', '+917829404513', '', 8, 8000, '{"1": "17:30", "3": "17:30"}', '2026-02-16', true),
  -- 62. Shreya Rao: days 1,6, times 18:00,10:30 (positional)
  ('Shreya Rao', '+919845408202', '', 8, 8000, '{"1": "18:00", "6": "10:30"}', CURRENT_DATE, true),
  -- 63. Shivani: days 1,4, time 17:00
  ('Shivani', '+919480641163', '', 8, 4000, '{"1": "17:00", "4": "17:00"}', CURRENT_DATE, true),
  -- 64. Siya: day 6, time 10:30
  ('Siya', '+919845928772', '', 4, 4000, '{"6": "10:30"}', CURRENT_DATE, true),
  -- 65. Smita: day 5, time 09:30
  ('Smita', '+919980165450', '', 4, 2000, '{"5": "09:30"}', CURRENT_DATE, true),
  -- 66. Sreeika: US number 1(365)996-5005, days 1,6, time 06:00
  ('Sreeika', '+13659965005', '', 8, 8000, '{"1": "06:00", "6": "06:00"}', CURRENT_DATE, true),
  -- 67. Sreekanth: days 6,0, time 10:30
  ('Sreekanth', '+919880355318', '', 8, 6000, '{"6": "10:30", "0": "10:30"}', CURRENT_DATE, true),
  -- 68. Sushma: days 1,3, time 10:30
  ('Sushma', '+919880848271', '', 8, 3000, '{"1": "10:30", "3": "10:30"}', CURRENT_DATE, true),
  -- 69. Tanisha: days 2,4, time 17:30
  ('Tanisha', '+918951251295', '', 8, 6000, '{"2": "17:30", "4": "17:30"}', CURRENT_DATE, true),
  -- 70. Tanvita: days 1,5, time 17:00
  ('Tanvita', '+919901505025', '', 8, 6000, '{"1": "17:00", "5": "17:00"}', CURRENT_DATE, true),
  -- 71. Tejaswi: day 5, time 11:30
  ('Tejaswi', '+919535579681', '', 4, 4000, '{"5": "11:30"}', CURRENT_DATE, true),
  -- 72. Vedant: days 2,3, time 17:00
  ('Vedant', '+919731730942', '', 8, 6000, '{"2": "17:00", "3": "17:00"}', CURRENT_DATE, true),
  -- 73. Veena Rao: day 5, time 09:30
  ('Veena Rao', '+919945130864', '', 4, 2000, '{"5": "09:30"}', CURRENT_DATE, true),
  -- 74. Vihaan: US number 1(203)570-1518, day 5, time 05:00
  ('Vihaan', '+12035701518', '', 4, 4000, '{"5": "05:00"}', CURRENT_DATE, true),
  -- 75. Vikram: US number 1(365)996-5005, days 1,5, time 06:00
  ('Vikram', '+13659965005', '', 8, 8000, '{"1": "06:00", "5": "06:00"}', CURRENT_DATE, true);
