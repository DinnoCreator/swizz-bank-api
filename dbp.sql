CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE DATABASE Swizz;

CREATE TABLE customers (
   customer_id  uuid primary key DEFAULT uuid_generate_v4(),
   first_name varchar(255) NOT NULL,
   middle_name varchar(255) NOT NULL,
   last_name varchar(255) NOT NULL,
   customer_email varchar(255) NOT NULL UNIQUE,
   customer_gender varchar(255) NOT NULL,
   customer_address varchar(255) NOT NULL,
   customer_phoneno varchar(255) NOT NULL,
   customer_dob DATE NOT NULL,
   customer_password TEXT,
   customer_payment TEXT,
   c_date DATE NOT NULL,
   c_time TIME NOT NULL
);
CREATE TABLE accounts (
   account_no varchar(10) primary key NOT NULL,
   customer_id UUID NOT NULL,
   account_bal NUMERIC(17, 2),
   account_type varchar(9) NOT NULL,
   account_status varchar(7),
   account_name varchar(255) NOT NULL,
   c_date DATE NOT NULL,
   c_time TIME NOT NULL,
   FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
);

alter table transactions add column 
transaction_time TIME;

DELETE FROM transactions WHERE 
transaction_status = 'Successful';

DELETE FROM transactions WHERE 
transaction_status = 'Failed';

DELETE FROM accounts WHERE 
account_bal = 10100.56;

select * from transactions;
select * from accounts;

alter table transactions drop column 
customer_id;

alter table transactions rename column 
transaction_date_time to transaction_date;

alter table transactions rename column 
transaction_ammount to transaction_amount;

alter table transactions add column
customer_id UUID NOT NULL;

alter table transactions ADD FOREIGN KEY (customer_id) 
REFERENCES customers(customer_id);

SELECT * FROM transactions WHERE s_account_no = $1 
OR r_account_no = $2 AND transaction_status = $3 ORDER BY 
transaction_date DESC, transaction_time DESC
-- \c The_Vault
-- \dt