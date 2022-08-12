/* Replace with your SQL commands */

CREATE extension "uuid-ossp";

CREATE TABLE IF NOT EXISTS users
(
    id          uuid                     DEFAULT uuid_generate_v4(),
    name        TEXT NOT NULL,
    email       TEXT NOT NULL,
    password    TEXT NOT NULL,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at  TIMESTAMP WITH TIME ZONE,
    archived_at TIMESTAMP WITH TIME ZONE,
    PRIMARY KEY (id)
);

CREATE UNIQUE INDEX unique_email on users(email) where archived_at is null;

CREATE TYPE role_name AS ENUM ('user', 'admin', 'sub-admin');

CREATE TABLE IF NOT EXISTS roles
(
    id          uuid                     DEFAULT uuid_generate_v4(),
    user_id     uuid,
    role_name   role_name,
    created_by  uuid,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at  TIMESTAMP WITH TIME ZONE,
    archived_at TIMESTAMP WITH TIME ZONE,
    PRIMARY KEY (id),
    FOREIGN KEY (user_id)
        REFERENCES users (id),
    FOREIGN KEY (created_by)
        REFERENCES users (id)
);

CREATE UNIQUE INDEX unique_user_role on roles(user_id, role_name) where archived_at is null;

CREATE TABLE IF NOT EXISTS address
(
    id          uuid                     DEFAULT uuid_generate_v4(),
    user_id     uuid,
    address     TEXT NOT NULL,
    lat_long    point not null ,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at  TIMESTAMP WITH TIME ZONE,
    archived_at TIMESTAMP WITH TIME ZONE,
    PRIMARY KEY (id),
    FOREIGN KEY (user_id)
        REFERENCES users (id)
);

CREATE UNIQUE INDEX unique_user_address on address(user_id, address) where archived_at is null;

CREATE TABLE IF NOT EXISTS restaurant
(
    id          uuid                     DEFAULT uuid_generate_v4(),
    user_id     uuid,
    name        TEXT NOT NULL,
    address     TEXT NOT NULL,
    lat_long    point NOT NULL ,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at  TIMESTAMP WITH TIME ZONE,
    archived_at TIMESTAMP WITH TIME ZONE,
    PRIMARY KEY (id),
    FOREIGN KEY (user_id)
        REFERENCES users (id)
);

CREATE TABLE IF NOT EXISTS dishes
(
    id          uuid                     DEFAULT uuid_generate_v4(),
    rest_id     uuid,
    name        TEXT NOT NULL,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at  TIMESTAMP WITH TIME ZONE,
    archived_at TIMESTAMP WITH TIME ZONE,
    PRIMARY KEY (id),
    FOREIGN KEY (rest_id)
        REFERENCES restaurant (id)
);

CREATE UNIQUE INDEX unique_rest_dish on dishes(rest_id, name) where archived_at is null;

CREATE TABLE IF NOT EXISTS session
(
    id          uuid                     DEFAULT uuid_generate_v4(),
    user_id     uuid,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_at  TIMESTAMP WITH TIME ZONE,
    archived_at TIMESTAMP WITH TIME ZONE,
    PRIMARY KEY (id),
    FOREIGN KEY (user_id)
        REFERENCES users (id)
);