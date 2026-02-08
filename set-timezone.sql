-- Script untuk Set Timezone MySQL Server ke WIB
-- Jalankan script ini di MySQL jika timezone masih bermasalah

-- Option 1: Set timezone untuk session saat ini
SET time_zone = '+07:00';

-- Option 2: Set timezone global untuk MySQL server (perlu privilege SUPER)
-- SET GLOBAL time_zone = '+07:00';

-- Cek timezone MySQL saat ini
SELECT @@session.time_zone AS session_timezone, 
       @@global.time_zone AS global_timezone,
       NOW() AS current_time;

-- Test: Lihat waktu saat ini dengan timezone WIB
SELECT CONVERT_TZ(NOW(), @@session.time_zone, '+07:00') AS waktu_wib;
