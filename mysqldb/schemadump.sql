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
  `time` datetime NOT NULL,
  `description` text,
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
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;




/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

LOAD DATA LOCAL INFILE '/usr/src/app/sasquatch-data.tsv' INTO TABLE siting
  FIELDS TERMINATED BY '\t'
  LINES TERMINATED BY '\n'
  (description, latitude, longitude, time);