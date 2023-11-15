create table stocktb(
	id varchar(20) primary key unique,
	name varchar(30),
	lastsale varchar(30),
	netchange varchar(20),
	pctchange varchar(20),
	volume varchar(20),
	marketcap varchar(20),
	country varchar(20),
	ipoyear varchar(20),
	industry varchar(20),
	sector varchar(20),
	url varchar(30)
)

create table tekbday (
	id varchar(20) primary key unique,
	shopid varchar(20),
	b_year varchar(20),
	b_month varchar(20),
	b_day varchar(20)
)

create table tekemployee (
	id bigint primary key unique,
	type varchar(20),
	firstname varchar(20),
	lastname varchar(20),
	email varchar(50),
	address1 varchar(50),
	address2 varchar(50),
	city varchar(50),
	state varchar(20),
	zip varchar(20),
	fulladdress varchar(50),
	streetaddress varchar(50),
	shpid int
)

-- Accuzip processed customers.
create table accuzipcustomer (
	id varchar(150) primary key unique,
	wsid varchar(20),
	wcaid varchar(20),
	software varchar(20),
	shopname varchar(50),
	authdate varchar(20),
	mbdayyr varchar(20),
	mbdaymo varchar(20),
	firstname varchar(20),
	lastname varchar(20),
	address varchar(50),
	address2 varchar(50),
	city varchar(50),
	state varchar(50),
	zip varchar(30),
	latitude_ numeric,
	logitude_ numeric
)

