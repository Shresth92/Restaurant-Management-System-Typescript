/* Replace with your SQL commands */

CREATE TABLE IF NOT EXISTS images
(
    id          uuid                     DEFAULT uuid_generate_v4(),
    bucket_name         TEXT NOT NULL,
    path        TEXT NOT NULL,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at  TIMESTAMP WITH TIME ZONE,
    archived_at TIMESTAMP WITH TIME ZONE,
    PRIMARY KEY (id)
);

CREATE UNIQUE INDEX unique_bucket_path on images (bucket_name, path) where archived_at is null;

CREATE TABLE IF NOT EXISTS restaurantImages
(
    id          uuid                     DEFAULT uuid_generate_v4(),
    image_id          uuid,
    res_id        uuid,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at  TIMESTAMP WITH TIME ZONE,
    archived_at TIMESTAMP WITH TIME ZONE,
    PRIMARY KEY (id),
    FOREIGN KEY (image_id)
        REFERENCES images (id),
    FOREIGN KEY (res_id)
        REFERENCES restaurant (id)
);

CREATE UNIQUE INDEX unique_res_id_image_id on restaurantImages (image_id, res_id) where archived_at is null;

CREATE TABLE IF NOT EXISTS dishImages
(
    id          uuid                     DEFAULT uuid_generate_v4(),
    image_id          uuid,
    dish_id        uuid,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at  TIMESTAMP WITH TIME ZONE,
    archived_at TIMESTAMP WITH TIME ZONE,
    PRIMARY KEY (id),
    FOREIGN KEY (image_id)
        REFERENCES images (id),
    FOREIGN KEY (dish_id)
        REFERENCES dishes (id)
);

CREATE UNIQUE INDEX unique_dish_id_image_id on dishImages (image_id, dish_id) where archived_at is null;