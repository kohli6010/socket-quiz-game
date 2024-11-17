
# Socket based real time quiz game

backend for a real-time quiz game where two players compete against each other. Each player is presented with the same 'N' questions in sequence, and they answer these questions independently. The player who scores the highest out of the 'N' questions wins the game. The game needs to handle user authentication, real-time question delivery, answer validation, scoring, and state management.




## Tech stack

**Server:** Node, Express

**Communication:** Socket.io

**Databases:** MongoDB, Redis

**Authentication:** JWT and Bcrpyt(for hashing)

## How to setup

## Running the Application

   Before running the application, you need to do some initial setup


   ```bash

   # create a .env file in the root directory and 
   # use these as environment variables in .env
   MONGO_URI=mongo-url-string
JWT_SECRET=jwtsecret
DB_NAME=socket-game
REDIS_HOST=redishost
REDIS_PORT=6379
REDIS_PASSWORD=redispassword

   # To run the application, follow these commands:

   # Install dependencies
   npm install

   # Start the application
   npm run dev
   ```
## Testing

URL: https://socket-quiz-game.onrender.com

### Testing in **POSTMAN**

- Register user: User first need to signup using email and password. in return JWT token is returned.

- Login user: User can login using email and password to play in the future.

- Websocket connection: Use the same JWT token to connect with the websocket server. add the Authorization header in request with value being in the format <Bearer JWT>.

Once Websocket connection is established, user can then emit events.

The very first event that user must emit is **game:start**. This event is necessary to ping the server that I am ready to play the game, based on the number of users in the queue you will either have to wait or will be matched immediately.

after this an event **question:send** is emitted from the server with the question and options.

to submit the answers an event from the client side **answer:submit** with the required payload needs to be sent (payload = {gameId: string, answer: string})

Once the game is finished an event will be emitted from the server **game:end** stating game is ended with the result whether user won it or not.