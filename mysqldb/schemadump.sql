DROP TABLE IF EXISTS `Car`;

# ************************************************************
# Sequel Pro SQL dump
# Version 4541
#
# http://www.sequelpro.com/
# https://github.com/sequelpro/sequelpro
#
# Host: 127.0.0.1 (MySQL 5.7.24)
# Database: test
# Generation Time: 2018-10-25 07:39:30 +0000
# ************************************************************


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


# Dump of table siting
# ------------------------------------------------------------

DROP TABLE IF EXISTS `siting`;

CREATE TABLE `siting` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `latitude` double(11,8) NOT NULL,
  `longitude` double(11,8) NOT NULL,
  `time` datetime NULL DEFAULT NULL,
  `description` text,
  `tags` text,
  PRIMARY KEY (`id`),
  KEY `lat` (`latitude`,`longitude`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;



# Dump of table siting_tag
# ------------------------------------------------------------

DROP TABLE IF EXISTS `siting_tag`;

CREATE TABLE `siting_tag` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `siting_id` int(11) unsigned NOT NULL,
  `tag_id` int(11) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `siting_tag_tag_id_foreign` (`tag_id`),
  KEY `siting_tag_index` (`siting_id`,`tag_id`),
  CONSTRAINT `siting_tag_siting_id_foreign` FOREIGN KEY (`siting_id`) REFERENCES `siting` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `siting_tag_tag_id_foreign` FOREIGN KEY (`tag_id`) REFERENCES `tag` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;



# Dump of table tag
# ------------------------------------------------------------

DROP TABLE IF EXISTS `tag`;

CREATE TABLE `tag` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(25) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;




/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

#Strategy: Use MySQL to import the TSV file into the sitings table, including the tags. However, it would be best to de-normalize the tags into separate tables for easier lookup later. Doing this with MySQL is extremely difficult, so I'll use Node.js to help.

# LOAD DATA LOCAL INFILE '/usr/src/app/sasquatch-data.tsv' INTO TABLE siting
# FIELDS TERMINATED BY '\t'
# LINES TERMINATED BY '\n'
# (description, latitude, longitude, time, tags);

#Create a siting_temp table to hold our data temporarily so we can format it more easily
# DROP TABLE IF EXISTS `siting_temp`;
# CREATE TEMPORARY TABLE `siting_temp` (
#   `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
#   `latitude` double(11,8) NOT NULL,
#   `longitude` double(11,8) NOT NULL,
#   `time` datetime NULL DEFAULT NULL,
#   `description` text,
#   `tags` text,
#   PRIMARY KEY (`id`),
#   KEY `lat` (`latitude`,`longitude`)
# ) ENGINE=InnoDB DEFAULT CHARSET=utf8;

#Loads data from our TSV file into our siting_temp table
# LOAD DATA LOCAL INFILE '/usr/src/app/sasquatch-data.tsv' INTO TABLE siting
#   FIELDS TERMINATED BY '\t'
#   LINES TERMINATED BY '\n'
#   (description, latitude, longitude, time, tags);
#
# #Will prevent an error when attempting to insert a null string like "0000-00-00 00:00:00" as a DATETIME
# SET SQL_MODE='ALLOW_INVALID_DATES';
#
# #Insert everything but the tags into the permanent siting table
# INSERT INTO `siting` (latitude, longitude, time, description)
# SELECT latitude, longitude, time, description
# FROM siting_temp;
#
# #We'll create another temporary table for the tags, and use a quick and dirty method of converting comma separated list of values into rows
# DROP TEMPORARY TABLE IF EXISTS tag_temp;
# CREATE TEMPORARY TABLE tag_temp (id INT AUTO_INCREMENT PRIMARY KEY, val CHAR(255));
# #results in: INSERT INTO tag_temp (val) VALUES (tag1),(tag2),(tag3), etc.;
# SET @sql = CONCAT("INSERT INTO tag_temp (id, val) VALUES ('",
#   #Replaces all commas in the group concatenated list with surrounding parenthesis (), creating a list of parenthesised values, such as (value1),(value2), etc...
#   REPLACE(
#     #creates a comma separated list of all tags from each row
#     (SELECT GROUP_CONCAT(tags) as data FROM siting_temp),
#     ",",
#     "'),('"
#   ),
# "');");
# PREPARE stmt1 FROM @sql;
# EXECUTE stmt1;
#
# #Will fill the tag table with all tags found in the infile
# INSERT IGNORE INTO tag (name)
# SELECT DISTINCT(val) from tag_temp WHERE val <> '';