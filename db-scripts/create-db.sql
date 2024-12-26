CREATE TABLE if not exists public.products (
    id SERIAL PRIMARY KEY,
    name character varying(100) NOT NULL,
    description character varying(1000),
    price numeric(10,2) NOT NULL
);

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;

CREATE TABLE if not exists public.orders (
    id SERIAL PRIMARY KEY,
    order_number character varying(50) NOT NULL,
    total_price numeric(10,2) NOT NULL
);

CREATE TABLE if not exists public.order_items (
    order_id integer NOT NULL,
    product_id integer NOT NULL,
    quantity integer NOT NULL,
    price numeric(10,2) NOT NULL
);

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;



