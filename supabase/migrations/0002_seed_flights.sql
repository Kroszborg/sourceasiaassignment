insert into public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) values
('SA 204', 'Delhi', 'Mumbai', now() + interval '1 day 8 hours', now() + interval '1 day 10 hours 10 minutes', 'Airbus A320neo', 'scheduled', 8200),
('SA 418', 'Delhi', 'Mumbai', now() + interval '1 day 17 hours', now() + interval '1 day 19 hours 15 minutes', 'Boeing 737 MAX', 'scheduled', 9100),
('SA 512', 'Mumbai', 'Bengaluru', now() + interval '1 day 9 hours', now() + interval '1 day 10 hours 50 minutes', 'Airbus A321', 'boarding', 7600),
('SA 734', 'Mumbai', 'Bengaluru', now() + interval '2 days 15 hours', now() + interval '2 days 16 hours 50 minutes', 'Airbus A320neo', 'scheduled', 7000),
('SA 860', 'Bengaluru', 'Kolkata', now() + interval '1 day 6 hours', now() + interval '1 day 8 hours 35 minutes', 'Boeing 737-800', 'scheduled', 9800),
('SA 944', 'Bengaluru', 'Kolkata', now() + interval '3 days 20 hours', now() + interval '3 days 22 hours 30 minutes', 'Airbus A320neo', 'delayed', 8900),
('SA 118', 'Hyderabad', 'Delhi', now() + interval '2 days 7 hours', now() + interval '2 days 9 hours 25 minutes', 'Airbus A321', 'scheduled', 8700),
('SA 326', 'Hyderabad', 'Delhi', now() + interval '4 days 13 hours', now() + interval '4 days 15 hours 30 minutes', 'Boeing 737 MAX', 'scheduled', 8300)
on conflict (flight_no) do nothing;

insert into public.seats (flight_id, seat_number, class, is_available, extra_fee)
select
  flights.id,
  rows.row_no::text || letters.letter,
  case
    when rows.row_no <= 2 then 'first'::public.seat_class
    when rows.row_no <= 6 then 'business'::public.seat_class
    else 'economy'::public.seat_class
  end,
  not (rows.row_no::text || letters.letter in ('1A', '3C', '7D', '12F', '15B')),
  case
    when rows.row_no <= 2 then 6200
    when rows.row_no <= 6 then 2800
    when rows.row_no <= 9 then 450
    else 0
  end
from public.flights
cross join generate_series(1, 18) as rows(row_no)
cross join (values ('A'), ('B'), ('C'), ('D'), ('E'), ('F')) as letters(letter)
on conflict (flight_id, seat_number) do nothing;
