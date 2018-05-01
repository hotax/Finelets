# Finelets Application Document

## Getting Started with Finelets Application
Finelets is a framework of scalable distributed hypermedia node.js application in micro-service
architecture.

### Your first application: Hello world

1. use `git clone https://github.com/hotax/Finelets.git helloworld` download Finelets
application scaffold from github. 

2. Install and run a mongodb. by now Finelets only support mongodb.

3. Create and edit a .env file to define environment parameters the application need
    ```
    PORT=80
    MONGODB=mongodb://localhost/test
    ```
    PORT is the port number that the application listen to, while MONGODB is the connection 
    string that the application use to connect to database.

4. Download and install Node.js including npm.

5. Install dependent libraries using npm:
    ```
    cd helloworld
    npm install
    ```
6. Run application
    ```
    node server.js
    ```
