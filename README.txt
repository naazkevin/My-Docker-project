This is a website where you can type in your profile details and save them to a database. The cool part isn't the website itself—it's that the whole thing runs in Docker. I don't need to install Node.js or MongoDB on my actual laptop to make it work.

🏗 How it's built (The "Stack")
The App: A Node.js server that talks to the database.

The Database: MongoDB (where the data is saved).

The Admin Tool: Mongo-Express (a website to see what's inside the database).

📄 The Dockerfile (How the App is packaged)
This is the "blueprint" I used to create the Node.js container:

Dockerfile
# Use Node version 24 as the base
FROM node:24

# Set the working directory inside the container
WORKDIR /home/app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the source code
COPY . .

# Start the server
CMD ["node", "server.js"]
🚀 How to run it
Go to the folder in PowerShell and run:
docker-compose -f mongo.yaml up --build

View Website: http://localhost:3000

View Database UI: http://localhost:8080

To stop everything:
docker-compose -f mongo.yaml down

🧠 Important Lessons (Memory Jog)
1. The "127.0.0.1" Mistake:

Problem: My code originally tried to connect to 127.0.0.1.

Why it failed: Inside Docker, 127.0.0.1 means "look inside this container." But my database was in a different container.

Fix: I changed the address in server.js to mongodb. Docker uses its own internal DNS to find the container named mongodb.

2. The "Build" Instruction:

Problem: I forgot to tell the mongo.yaml file to actually build my code.

Fix: I added build: . to the YAML file so Docker knows to look at my Dockerfile and take my latest code changes.

3. Port Mapping:

I mapped 8080:8081 for the database UI. This means I type 8080 in my browser (outside Docker), and it travels to port 8081 inside the Docker container.

💡 Final Note on Networking
In Docker, never use 127.0.0.1 to connect two containers. Always use the name you gave them in the YAML file (like mongodb). If you use the IP, the containers will be "deaf" to each other.