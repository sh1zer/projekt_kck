# System API Documentation

## Setup

1.  **Install dependencies:** `pip install -r requirements.txt`
2.  **Run migrations:** `python manage.py migrate`
3.  **Create test problems:** Use the admin panel (`/admin/`) to create `Problem` objects.
4.  **Run server:** `python manage.py runserver`

## Authentication

All protected endpoints require an `Authorization` header.

1.  **Get Token:** `POST /api/login/` with `username` and `password`.
2.  **Use Token:** Include the header `Authorization: Token <your_token>` in subsequent requests.

## Duel flow

1.  **Poll for Queue:** `POST /api/matchmaking/` repeatedly until a `201 Created` response is received.
2.  **Long Poll for State:** Once a duel is active, `GET /api/duels/{id}/` to listen for real-time updates (e.g., opponent submissions). !!! Re-poll immediately after receiving a response.
3.  **Submit Code:** `POST /api/duels/{id}/submit/` to send code for grading. returns the test results.

---

## Endpoints

### `POST /api/login/`

Authenticates a user and returns an API token.

-   **Request Body:**
    ```json
    {
      "username": "player1",
      "password": "password123"
    }
    ```
-   **Response (`200 OK`):**
    ```json
    {
      "token": "your_auth_token_string"
    }
    ```

### `POST /api/matchmaking/`

Adds the authenticated user to the queue and checks for a match. This endpoint should be polled.

-   **Response (Waiting) (`202 Accepted`):**
    ```json
    {
      "status": "waiting_for_opponent"
    }
    ```
-   **Response (Match Found) (`201 Created`):**
    *Returns the full Duel object.*
-   **Response (Error) (`500 Internal Server Error`):**
    *Returned if no `Problem` objects exist in the database.*

### `GET /api/duels/{id}/`

Retrieves the state of a duel. Uses long polling, holding the connection for up to 30 seconds waiting for a state change (`updated_at` timestamp).

-   **Response (`200 OK`):**
    *Returns the full Duel object, either with updated or current data.*

### `POST /api/duels/{id}/submit/`

Submits code for grading against the duel's problem. This is a synchronous, blocking request.

-   **Request Body:**
    ```json
    {
      "code": "int main() { return 0; }"
    }
    ```
-   **Response (`200 OK`):**
    *Returns the test execution result object.*
    ```json
    {
      "status": "success",
      "tests": {
        "1": { "status": "PASS", "message": "" }
      }
    }
    ```
-   **Response (Error) (`400 Bad Request`):**
    *Returned if the duel is not active or the request body is invalid.*

### `GET /api/problems/`

Retrieves a list of all available problems.

-   **Response (`200 OK`):**
    *Returns an array of Problem objects.*

---

## Data Models

#### Duel Object

```json
{
  "id": 1,
  "problem": {
    /* Problem Object */
  },
  "player1": {
    "id": 1,
    "username": "player1"
  },
  "player2": {
    "id": 2,
    "username": "player2"
  },
  "status": "active", // "active" | "completed"
  "winner": null, // null | User Object
  "start_time": "2025-06-13T12:00:00Z",
  "updated_at": "2025-06-13T12:05:00Z",
  "submissions": [
    /* Array of DuelSubmission Objects */
  ]
}
```

#### Problem Object

```json
{
  "id": 1,
  "title": "Two Sum",
  "description": "Given an array of integers...",
  "difficulty": "easy",
  "time_limit": 2,
  "solution_template": "int* twoSum(...){...}"
}
```