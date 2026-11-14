-- V2 TEST: publish localized labels for one shared mass timetable.
insert into public.i18n_keys(key,scope,source_hu,is_published) values
('mass.schedule.title','mass','Tömegsportos edzések',true),
('mass.schedule.intro','mass','A weboldal és a Player azonos TEST menetrendet olvas. A foglalás itt még nincs bekötve.',true),
('mass.schedule.date','mass','Dátum',true),
('mass.schedule.time','mass','Időpont',true),
('mass.schedule.level','mass','Szint',true),
('mass.schedule.court','mass','Pálya',true),
('mass.schedule.free','mass','Szabad hely',true),
('mass.schedule.waiting','mass','Várólista',true),
('mass.schedule.open','mass','Jelentkezés elérhető',true),
('mass.schedule.closed','mass','Jelentkezés nem elérhető',true),
('mass.schedule.queue','mass','Várólista elérhető',true),
('mass.schedule.empty','mass','Nincs meghirdetett edzés ebben az időszakban.',true),
('mass.schedule.error','mass','A TEST menetrend most nem tölthető be.',true),
('mass.schedule.reload','mass','Frissítés',true),
('mass.schedule.test','mass','Külön TEST előnézet',true)
on conflict(key) do update set source_hu=excluded.source_hu,is_published=true,updated_at=now();
insert into public.i18n_translations(key,locale,value,status) values
('mass.schedule.title','en','Recreational training','published'),
('mass.schedule.intro','en','The website and Player use the same TEST timetable. Booking is not connected yet.','published'),
('mass.schedule.date','en','Date','published'),
('mass.schedule.time','en','Time','published'),
('mass.schedule.level','en','Level','published'),
('mass.schedule.court','en','Court','published'),
('mass.schedule.free','en','Places available','published'),
('mass.schedule.waiting','en','Waiting list','published'),
('mass.schedule.open','en','Booking available','published'),
('mass.schedule.closed','en','Booking unavailable','published'),
('mass.schedule.queue','en','Waiting list available','published'),
('mass.schedule.empty','en','No sessions published for this period.','published'),
('mass.schedule.error','en','The TEST timetable is temporarily unavailable.','published'),
('mass.schedule.reload','en','Refresh','published'),
('mass.schedule.test','en','Isolated TEST preview','published')
on conflict(key,locale) do update set value=excluded.value,status='published',updated_at=now();
update public.i18n_versions set revision=revision+1,published_at=now()
where locale in ('hu','en');
