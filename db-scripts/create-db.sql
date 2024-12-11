CREATE TABLE if not exists Products (
	id SERIAL primary key,
    name VARCHAR(100) NOT NULL,          
    description VARCHAR(1000) NULL,  
    price DECIMAL(10, 2) NOT NULL      
 );

CREATE TABLE orders (
	id SERIAL primary key,
    order_number VARCHAR(50) NOT NULL,  
    total_price DECIMAL(10, 2) NOT NULL 
);

CREATE table order_items (
    order_id INT NOT NULL,            
    product_id INT NOT NULL,          
    quantity INT NOT NULL,            
    price DECIMAL(10, 2) NOT NULL,   
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);