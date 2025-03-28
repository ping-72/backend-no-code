# Form Management System Backend

A Node.js backend application for managing forms and form submissions with MongoDB integration.

## Features

- User authentication (register, login, logout)
- Form schema management
- Form submission handling
- Data retrieval with pagination
- Form version control
- Public/private form visibility

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/forms_db
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRE=30d
   NODE_ENV=development
   ```
4. Start the server:
   ```bash
   npm start
   ```

## API Documentation

### Authentication Endpoints

#### Register User

- **POST** `/api/auth/register`
- Body:
  ```json
  {
    "username": "string",
    "email": "string",
    "password": "string"
  }
  ```

#### Login User

- **POST** `/api/auth/login`
- Body:
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```

#### Get Current User

- **GET** `/api/auth/me`
- Headers: `Authorization: Bearer <token>`

### Form Management Endpoints

#### Create Form

- **POST** `/api/forms`
- Headers: `Authorization: Bearer <token>`
- Body:
  ```json
  {
    "formTitle": "string",
    "description": "string",
    "sections": [
      {
        "sectionId": "string",
        "sectionTitle": "string",
        "description": "string",
        "questions": [
          {
            "questionId": "string",
            "questionText": "string",
            "type": "text|number|email|select|multiselect|date",
            "isRequired": boolean,
            "options": ["string"]
          }
        ]
      }
    ]
  }
  ```

#### Get All Forms

- **GET** `/api/forms`
- Headers: `Authorization: Bearer <token>`

#### Get Form by ID

- **GET** `/api/forms/:formId`
- Headers: `Authorization: Bearer <token>`

#### Update Form

- **PUT** `/api/forms/:formId`
- Headers: `Authorization: Bearer <token>`
- Body: Same as create form

#### Delete Form

- **DELETE** `/api/forms/:formId`
- Headers: `Authorization: Bearer <token>`

### Form Submission Endpoints

#### Submit Form Data

- **POST** `/api/data/:formId`
- Headers: `Authorization: Bearer <token>`
- Body: JSON object with form responses

#### Get Form Submissions

- **GET** `/api/data/:formId`
- Headers: `Authorization: Bearer <token>`
- Query Parameters:
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 10)

#### Get Submission by ID

- **GET** `/api/data/:formId/:submissionId`
- Headers: `Authorization: Bearer <token>`

#### Delete Submission

- **DELETE** `/api/data/:formId/:submissionId`
- Headers: `Authorization: Bearer <token>`

## Error Handling

The API returns appropriate HTTP status codes and error messages:

- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

## Security

- JWT token-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- Protected routes
- CORS enabled

## Development

To run the server in development mode with auto-reload:

```bash
npm run dev
```

## Testing

To run tests:

```bash
npm test
```

## License

MIT
#   b a c k e n d - n o - c o d e  
 