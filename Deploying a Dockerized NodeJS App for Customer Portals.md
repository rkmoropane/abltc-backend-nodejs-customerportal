# Deploying a Dockerized Node.js App for Customer Portals

![Cognitive Class AI Logo](https://cf-courses-data.s3.us.cloud-object-storage.appdomain.cloud/IBM-CC0100EN-SkillsNetwork/images/IDSN-logo.png)

## Lab Information

- **Estimated time:** 30 minutes
- **Technology:** Node.js, MongoDB, Docker, Docker Compose
- **Project:** Customer Portal Application
- **License:** Apache 2.0

---

## Overview

In this lab, you will set up and deploy a Node.js customer portal application connected to MongoDB using Docker.

You will clone a starter Node.js application, configure a Dockerfile and Docker Compose file, build a Docker image, and run the application together with a MongoDB container.

---

## Learning Objectives

After completing this lab, you will be able to:

- Clone a Node.js customer portal application from GitHub.
- Install the application dependencies.
- Create and configure a Dockerfile.
- Create and configure a docker-compose.yml file.
- Build a Docker image.
- Run a Node.js application and MongoDB using Docker Compose.
- Access the deployed customer portal application.

---

## Skills Network Cloud IDE

Skills Network Cloud IDE is based on Theia and Docker. It provides an online development environment for completing hands-on labs and course projects.

Theia is an open-source Integrated Development Environment that provides tools for editing files, using terminals, and running applications.

---

## Important Lab Environment Notice

Lab sessions are not persistent. Each time you connect to the lab, a new environment is created.

Any files or changes saved during a previous session may be lost. Complete the lab during a single session or save your work outside the temporary lab environment.

---

# Task 1: Clone the Customer Portal Application

## Step 1: Open a Terminal

Open a terminal window from the Cloud IDE menu:

"Terminal > New Terminal"

![Open New Terminal](https://cf-courses-data.s3.us.cloud-object-storage.appdomain.cloud/IBM-CC0100EN-SkillsNetwork/images/new_terminal.jpg)

---

## Step 2: Change to the Project Directory

Change to the project directory if you are not already there.

~~~bash
"cd /home/project"
~~~

---

## Step 3: Clone the Starter Repository

Clone the customer portal starter repository from GitHub.

~~~bash
"git clone https://github.com/ibm-developer-skills-network/abltc-backend-nodejs-customerportal.git"
~~~

---

## Step 4: Enter the Project Directory

Change into the directory that was created by the clone command.

~~~bash
"cd abltc-backend-nodejs-customerportal"
~~~

---

## Step 5: Install Node.js Dependencies

Install the Node.js packages required by the application.

~~~bash
"npm install"
~~~

---

# Task 2: Configure Dockerfile and Docker Compose

## Step 1: Create the Dockerfile

Create a file named Dockerfile in the project directory.

~~~bash
"touch Dockerfile"
~~~

---

## Step 2: Add the Dockerfile Configuration

Add the following configuration to Dockerfile.

~~~dockerfile
"FROM node:18.12.1-bullseye-slim"

"# Set the working directory in the container"

"WORKDIR /app"

"# Copy package.json and package-lock.json to the working directory"

"COPY package*.json ./"

"# Install app dependencies"

"RUN npm install"

"# Copy necessary files"

"COPY . ."

"# Expose port 3000"

"EXPOSE 3000"

"# Start the application"

"CMD [ "node", "customer_app.js" ]"
~~~

### Dockerfile Explanation

- FROM selects the Node.js base image.
- WORKDIR sets the working directory inside the container.
- COPY transfers project files into the container.
- RUN npm install installs the application dependencies.
- EXPOSE documents the port used by the application.
- CMD starts the customer portal application.

---

## Step 3: Create docker-compose.yml

Create a Docker Compose configuration file.

~~~bash
"touch docker-compose.yml"
~~~

---

## Step 4: Add the Docker Compose Configuration

Add the following configuration to docker-compose.yml.

~~~yaml
"version: '3'"

"services:"

"  mongodb:"

"    image: mongo"

"    ports:"

"      - "27017:27017""

"    networks:"

"      - app-network"

""

"  app:"

"    image: customerapp"

"    ports:"

"      - "3000:3000""

"    depends_on:"

"      - mongodb"

"    networks:"

"      - app-network"

""

"networks:"

"  app-network:"

"    driver: bridge"
~~~

### Docker Compose Explanation

The docker-compose.yml file defines two services:

1. MongoDB database service.
2. Node.js customer portal application service.

The MongoDB service:

- Uses the official mongo image.
- Maps port 27017 on the host to port 27017 in the container.
- Connects to the app-network network.

The Node.js application service:

- Uses the customerapp Docker image.
- Maps port 3000 on the host to port 3000 in the container.
- Starts after the MongoDB service.
- Connects to the same app-network network.

The bridge network allows the application and MongoDB containers to communicate with each other.

---

# Task 3: Build and Deploy the Node.js Application

## Step 1: Build the Docker Image

Build a Docker image for the customer portal application and name it customerapp.

~~~bash
"docker build . -t customerapp"
~~~

The command:

- Uses the current directory as the Docker build context.
- Reads the instructions from Dockerfile.
- Creates an image named customerapp.

![Docker Build](https://cf-courses-data.s3.us.cloud-object-storage.appdomain.cloud/IBMSkillsNetwork-JS0211EN-SkillsNetwork/labs/v1/m5/social2.png)

---

## Step 2: Start the Application and MongoDB Containers

Use Docker Compose to start both services.

~~~bash
"docker-compose up"
~~~

This command starts:

- The MongoDB container.
- The Node.js customer portal container.
- The Docker bridge network connecting both services.

![Docker Compose](https://cf-courses-data.s3.us.cloud-object-storage.appdomain.cloud/IBMSkillsNetwork-JS0211EN-SkillsNetwork/labs/v1/m4/dockercompose.png)

To run the containers in the background, use:

~~~bash
"docker-compose up -d"
~~~

To stop the containers, use:

~~~bash
"docker-compose down"
~~~

---

## Step 3: Launch the Customer Portal

After the containers start successfully, launch the application using the Customer Portal button provided by the Skills Network Cloud IDE.

![Launch Application](https://cf-courses-data.s3.us.cloud-object-storage.appdomain.cloud/IBMSkillsNetwork-JS0211EN-SkillsNetwork/labs/v1/m4/launchapp.png)

The application should be available on port 3000.

Application address:

~~~text
"http://localhost:3000"
~~~

When using the Skills Network Cloud IDE, use the provided application launch button instead of relying only on localhost.

---

## Expected Result

After completing the lab:

- The customer portal Node.js application is packaged in a Docker image.
- A MongoDB container is running.
- The Node.js application container is running.
- Both containers communicate through the app-network network.
- The customer portal can be accessed through port 3000.

---

## Useful Docker Commands

List running containers:

~~~bash
"docker ps"
~~~

List all containers:

~~~bash
"docker ps -a"
~~~

List available Docker images:

~~~bash
"docker images"
~~~

View application logs:

~~~bash
"docker-compose logs app"
~~~

View MongoDB logs:

~~~bash
"docker-compose logs mongodb"
~~~

Stop the Docker Compose services:

~~~bash
"docker-compose down"
~~~

Start the services again:

~~~bash
"docker-compose up"
~~~

---

## Troubleshooting

### Docker Image Does Not Build

Check that:

- Dockerfile exists in the project directory.
- The Dockerfile name is exactly Dockerfile.
- package.json exists.
- package-lock.json exists.
- The Node.js application file is named customer_app.js.
- Docker is running.
- The Dockerfile syntax is correct.

---

### Port 3000 Is Already in Use

Another application may already be using port 3000.

You can stop the process using the port or change the host port in docker-compose.yml.

Example:

"ports:"

"  - "3001:3000""

In this example:

- Port 3001 is used on the host.
- Port 3000 remains the application port inside the container.

---

### MongoDB Container Does Not Start

Check the MongoDB container logs.

~~~bash
"docker-compose logs mongodb"
~~~

Also verify that:

- Docker has enough available resources.
- Port 27017 is not already in use.
- The docker-compose.yml file is correctly formatted.

---

### Application Cannot Connect to MongoDB

The Node.js application and MongoDB container must be connected to the same Docker network.

Confirm that both services use:

"app-network"

Inside Docker Compose, the MongoDB service can normally be reached using its service name:

"mongodb"

Do not use localhost to connect from the Node.js container to MongoDB. Inside a container, localhost refers to the current container.

---

## Completion Checklist

- [ ] Opened a terminal in the Cloud IDE.
- [ ] Changed to /home/project.
- [ ] Cloned the customer portal repository.
- [ ] Entered the project directory.
- [ ] Installed Node.js dependencies.
- [ ] Created the Dockerfile.
- [ ] Added the Node.js Docker configuration.
- [ ] Created docker-compose.yml.
- [ ] Added MongoDB and application services.
- [ ] Built the customerapp Docker image.
- [ ] Started the services with Docker Compose.
- [ ] Confirmed that the Node.js application is running.
- [ ] Launched the Customer Portal application.

---

## Summary

This lab demonstrates how to deploy a Node.js application and MongoDB using Docker.

The application is first cloned from GitHub and its dependencies are installed. A Dockerfile is then used to package the Node.js application into a Docker image. Docker Compose is used to run the application and MongoDB in separate containers connected through a shared bridge network.

The final application is accessible through port 3000.

---

## Authors

Pallavi Rai

---

## License

The content of this lab is licensed under the [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0).

© IBM Corporation. All rights reserved.
