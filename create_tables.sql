create table messages(
	id integer primary key AUTOINCREMENT,
	private int(1) not null,
	toNumber int not null,
	fromNumber int,	
	likes int not null default 0,
	contentType varchar(30) not null,
	content text not null
);