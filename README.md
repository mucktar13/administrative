
# API Documentation

## Link(s) to the hosted API

*   [administrative api](http://localhost:3000)

## Instructions for running a local instance of the API server

1.  **Prerequisites:**
    *   Node.js (version 23 or higher)
    *   npm or yarn
    *   Docker and Docker Compose

2.  **Clone the repository:**

    ```bash
    git clone git@github.com:mucktar13/administrative.git
    cd administrative    
    ```

3.  **Configure environment variables:**

    Create a `.env` file in the project root and set the necessary environment variables. You can use the `.env.template` file as a guide.

4.  **Run the API server:**

    You can use the provided `docker-compose.yml` file to run the API and database:

    ```bash
    docker-compose up -d
    ```

    This will start the API server in production mode. The server should be accessible at `http://localhost:3000`.

5.  **Run tests:**

    ```bash
    npm run test
    # or
    yarn test
    ```

    This will run the unit and integration tests.