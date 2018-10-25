#The Dockerfile is used to build a container image with the specified environment, in this case for the api service. Everytime `docker-compose up` is run, if anything is new, the new parts are built, otherwise, the cache is used, and the CMD is used to run the image. It works such that several steps in the build process are cached, and don't need to be re-run every time, making it quicker to spin up the container subsequent times.

#Start from a base docker image that already has node.js installed, in this case version 10
FROM node:10.10
#Sets the working directory (where stuff will be copied)
WORKDIR /usr/src/app
#Copy the package.json package-lock.json from the host to the working directory of the docker image
COPY package*.json ./
#Install all of the NPM packages. This creates a new cached LAYER in the built image.
RUN ["npm", "install"]
#Copy everything else over to the working directory
COPY . .
#Expose port 80 for HTTP
EXPOSE 80
#CMD runs every time the container is run. Starts our api service app - "start" maps to the script by that key within the package.json file
CMD ["npm", "start"]