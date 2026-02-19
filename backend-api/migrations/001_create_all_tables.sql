-- Script Maestro de Inicialización de Base de Datos (MySQL)
-- Proyecto: Cortinas Express Medidor

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Tabla de Usuarios (Auth)
CREATE TABLE IF NOT EXISTS `users` (
    `id` CHAR(36) NOT NULL,
    `email` VARCHAR(255) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Tabla de Perfiles de Usuario
CREATE TABLE IF NOT EXISTS `user_profiles` (
    `id` CHAR(36) NOT NULL,
    `full_name` VARCHAR(255),
    `role` ENUM('admin', 'user') DEFAULT 'user',
    `is_active` TINYINT(1) DEFAULT 1,
    `avatar_url` TEXT,
    `phone` VARCHAR(50),
    `company` VARCHAR(100),
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_profile_user` FOREIGN KEY (`id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Tabla de Proyectos
CREATE TABLE IF NOT EXISTS `projects` (
    `id` CHAR(36) NOT NULL,
    `user_id` CHAR(36),
    `first_name` VARCHAR(100),
    `last_name` VARCHAR(100),
    `email` VARCHAR(255),
    `phone` VARCHAR(50),
    `location` VARCHAR(255),
    `job_type` VARCHAR(100),
    `date` DATE,
    `rail_type` VARCHAR(100),
    `observations` TEXT,
    `status` ENUM('draft', 'in_progress', 'completed') DEFAULT 'draft',
    `last_report_url` TEXT,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_project_user` (`user_id`),
    CONSTRAINT `fk_project_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Tabla de Mediciones
CREATE TABLE IF NOT EXISTS `measurements` (
    `id` CHAR(36) NOT NULL,
    `project_id` CHAR(36) NOT NULL,
    `floor` VARCHAR(50),
    `room_number` VARCHAR(50),
    `room` VARCHAR(100),
    `product_type` VARCHAR(100),
    `product_label` VARCHAR(100),
    `width` DECIMAL(10,2) DEFAULT 0,
    `height` DECIMAL(10,2) DEFAULT 0,
    `depth` DECIMAL(10,2),
    `quantity` INT DEFAULT 1,
    `observations` TEXT,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_measurement_project` (`project_id`),
    CONSTRAINT `fk_measurement_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Tabla de Imágenes (NUEVA)
CREATE TABLE IF NOT EXISTS `images` (
    `id` CHAR(36) NOT NULL,
    `project_id` CHAR(36) NOT NULL,
    `measurement_id` CHAR(36),
    `storage_path` VARCHAR(512) NOT NULL,
    `public_url` TEXT NOT NULL,
    `original_name` VARCHAR(255),
    `mime_type` VARCHAR(100),
    `size_bytes` BIGINT,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_image_project` (`project_id`),
    KEY `idx_image_measurement` (`measurement_id`),
    CONSTRAINT `fk_image_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_image_measurement` FOREIGN KEY (`measurement_id`) REFERENCES `measurements` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
