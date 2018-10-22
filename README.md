# Backend Engineering Challenge

Thank you for your interest in joining the backend team at Jolt! We are a hard working bunch that is eager to learn and implement new technologies while also being willing to maintain legacy code.

***** **STOP** *****

If you're not familiar with Docker, please spend some time before actually starting the challenge. It will not count against your time. It makes our job *so* much easier if we can simply run `docker-compose up` to run your project. Get familiar with Docker and then start the assessment. Once you're comfortable with working with a `docker-compose.yml` file and a `Dockerfile` file, please procede:

You have five hours to make as much progress on the challenge as you can. We have designed the challenge so that it can't be completed in five hours, so please don't feel any stress to get it finished.

## Guidelines
* The purpose of this challenge is to help us evaluate your software engineering skills. We are looking for things like:
  * How well you architect your project structure
  * How well your solution might scale under heavy load and/or very large datasets
  * Do you understand basic programming and database principles
  * Do you understand best practices
  * Can you write readable and maintainable code
  * Can you research and implement new or unfamiliar concepts
  * Can you clearly explain your thoughts, and document your code
* You are allowed to use any non-human resource. Ex:
  * **Allowed:**
    * StackOverflow
    * Google
    * Reference code on Github, etc.
  * **Not Allowed:**
    * Chatting or calling your old boss
    * Using the code of your friend who already took this assessment
    * Using the code of someone who posted their solution on the internet

## Deliverables
Once you have completed the challenge (or used the allotted five hours), please fill out this Google form: http://bit.ly/sasquatch-sitings-submissions
For the code file, please submit a compressed directory with:
* Code
* Completed Docker Compose file
* Readme explaining your database schema, choice of technologies, any challenges, and the API URLs

## The Challenge
The "Society to Uncover and Spread the Truth" has hired you to build a backend to track Sasquatch sitings with an API to access this data. They need a system to track sitings, including some metadata about each siting, and to provide some analytics to help them discover patterns.
These are their requirements:

* The database used to store the data should be a MySQL database
* The API should follow REST or GraphQL best practices
* The backend should be implemented in one of the following languages: NodeJS, PHP, Java
* Frameworks: You are free to use any frameworks you feel are appropriate for the task. Also, keep in mind that this is your opportunity to show off your software engineering skill and experience.
* The API should provide the following endpoints (please build these in this order)
    1. Manage sitings
        * Create new sitings, including:
            * The exact location (latitude and logitude) of the siting
            * The time of the siting
            * The eye-witness's discription of the siting
            * A list of some short tags that are pertinent to the siting, to the eye-witness, or to the geography (for example: "hill", "dark-brown", "cabbage-patch")
        * Read
            * All recorded sitings
            * The details of a single siting
        * Update a recorded siting by:
            * Changing the location or description
            * Adding or removing some tabs
        * Delete a siting
    2. Distance
        * Get the distance between two recorded sitings: API receives two siting ids, then returns the distance between them
    3. Related sitings (you can do these two in either order)
        * Get all the recorded sitings within a given distance of a certain siting: API recieves a siting id and a distance, then returns a list of sitings that were within that distance
        * Get the closest X number of sitings to a given siting: API receives a siting id and a number (10 for example), and returns the closest X sitings (closest 10 sitings)
    4. Improve the "related sitings" endpoint from step 3. Add the ability for the client application and user to specify the following details (make these improvements in any order):
        * The client can optionally include a list of tags, and the API should only return sitings that have those tags
        * The client can specify that it only wants sitings that share all tags with the specified siting
        * The client can specify that it only wants sitings that share at least one tag with the specified siting
        * The client can optionally pass a date range (a start and end date), and the API should only return sitings in that range
        * The client can optionally pass a date range forward/backward from the specified siting, and the API should only include sitings in that date range
    5. If you finish the tasks above (😳), feel free to make any further improvements, or just relax and submit the challenge

When you reach the five hour mark, please stop what you are working on, comment out any unfinished code that breaks the application, and write the required documentation (specified in the Deliverables section).

## Docker Instructions

To simplify setup and to show that you understand (or can at least figure out) Docker, we expect a Docker Compose file that will spin up your backend and port forward so that we can hit your endpoints from localhost. We provide you with a docker compose YAML file that will spin up your MySQL database to help get you started.
Instructions for docker compose:
* Make sure docker is installed
    * For Mac: https://www.docker.com/docker-mac
    * For Windows: https://www.docker.com/docker-windows
    * For Ubuntu: https://www.docker.com/docker-ubuntu
* Make sure you're in the same directory as this readme
* run `docker-compose up -d`
    * This will create a container called mysqldb
    * To verify it was created you can run `docker ps` -- it should show up in the list of containers
* To tear down your environment you can run `docker-compose down` so that you can spin it from scratch as you make changes
* In this same directory there is a schemadump.sql file which is where you should put the DDL for creating your schema. The database name is `test` which is consistent with what is specified in the docker-compose.yml file
* The schemadump.sql script should automatically run when the pod spins up
    * If you get an error like `ERROR 2002 (HY000): Can't connect to local MySQL server through socket '/var/run/mysqld/mysqld.sock' (2)` then just wait a minute or two for mysql to fully initialize and then try again
* To bash into your mysql container you can run `docker exec -it mysqldb bash` and you can either login to MySQL with user:root pass:root or user:test pass:test
* Complete the docker-compose.yml file with your api service
* Refer to https://docs.docker.com/compose/gettingstarted/ for the official Docker Compose tutorial

## Sample Data

If you want, you may use this sample data as you develop: http://bit.ly/sasquatch-sitings-data
NOTE: The sample data is in TSV (not CSV format)

## Feedback

After you've completed and submitted the challenge, we'd love it if you would give us some feedback regarding the challenge, by filling out this form anonymously: http://bit.ly/sasquatch-feedback
You can also come back and submit your feedback at a later time.

Thanks!
