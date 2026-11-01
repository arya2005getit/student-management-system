# Student Management System

A class-project-level student directory built with Node.js, Express, and MongoDB. It includes a small responsive web interface and a REST API for creating, viewing, updating, and deleting students.

## Requirements

- Node.js 18.11 or newer
- MongoDB running locally, or a MongoDB Atlas connection string

## Run locally 

1. Open a terminal in this project directory and install packages:

   ```sh
   npm install
   ```

2. Copy `.env.example` to `.env`. Set `MONGODB_URI` to your MongoDB connection string. The example connects to a local MongoDB database named `student_management`.
3. Start the application:

   ```sh
   npm start
   ```

   For development with automatic restarts, use `npm run dev` (Node's built-in watch mode).
4. Open [http://localhost:3000](http://localhost:3000). The API health check is at `/api/health`.

The server only starts after it has connected to MongoDB. The `.env` file is ignored by Git; never publish database credentials.

## Student API

All request and response bodies use JSON. A student has `name`, `email`, `course`, and `year` fields. Name, email, and course are required; email must be unique and valid; year is a whole number from 1 to 8. MongoDB adds `_id`, `createdAt`, and `updatedAt`.

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/students` | List all students |
| `GET` | `/api/students/:id` | Get one student |
| `POST` | `/api/students` | Create a student |
| `PUT` | `/api/students/:id` | Update student fields |
| `PATCH` | `/api/students/:id` | Partially update student fields |
| `DELETE` | `/api/students/:id` | Delete a student |

Example create/update request body:

```json
{
  "name": "Maya Patel",
  "email": "maya.patel@example.com",
  "course": "Computer Science",
  "year": 2
}
```

The API returns `400` for invalid input or IDs, `404` when a student does not exist, and `409` when an email address is already registered.

## Test with Postman

1. Start the app and confirm `GET http://localhost:3000/api/health` reports `"status": "ok"` and `"database": "connected"`.
2. In Postman, choose **Import** and select `student-management.postman_collection.json`.
3. Run **Create Student** first. Its test script stores the created record's ID in the collection variable `studentId`.
4. Run **Get All Students**, **Get Student by ID**, **Update Student (PUT)**, **Partially Update Student (PATCH)**, and **Delete Student**. Each request includes a basic status-code test. Run requests in this order so the saved ID is available.
5. Create uses a fixed sample email. If you run it again after a previous record still exists, change the email in the request body to a new value.

The requests can also be sent individually using `http://localhost:3000` as the base URL. Set `Content-Type: application/json` and use the example JSON body for `POST`, `PUT`, and `PATCH`.

## Deployment

**Deployed application URL:** `https://student-management-api-2kau.onrender.com/`

Deploy to a Node.js host such as Render, Railway, or a similar platform. Set `MONGODB_URI` to your hosted MongoDB Atlas connection string and set `NODE_ENV=production` if supported. Configure the build/install step as `npm install` and the start command as `npm start`. The app uses the host-provided `PORT` and serves both the browser interface and API from the same service. In Atlas, allow network access from the deployment host and keep credentials in the host's environment settings.

