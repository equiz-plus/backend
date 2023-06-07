# API Documentations

## List of available endpoints:

---

### Users

- `POST /api/user/register`
- `POST /api/user/login`
- `POST /api/user/login-by-google`
- `POST /api/user/login-by-facebook`
- `POST /api/user/login-by-twitter`
- `GET /api/user/:id/detail`
- `PUT /api/user/:id/setting`
- `PATCH /api/user/:id/change-status`
- `DELETE /api/user/:id`

### Exams

- `POST /api/exams`
- `GET /api/exams`
- `GET /api/exams/:id`
- `PUT /api/exams/:id`
- `DELETE /api/exams/:id`

### Questions

- `POST /api/questions`
- `GET /api/questions`
- `GET /api/questions/:id`
- `PUT /api/questions/:id`
- `DELETE /api/questions/:id`

### Answers

- `POST /api/answers`
- `GET /api/answers`
- `GET /api/answers/:id`
- `PUT /api/answers/:id`
- `DELETE /api/answers/:id`

### Grades

- `GET /api/grades`
- `GET /api/grades/:id`

---

## Users

### `POST /api/user/register`

#### _Description_

> Register new user

#### _Request_

- Body

```json
{
    - email : string, required
    - password : string, required
    - name : string,
}
```

### _Response (201 - Created)_

```json
{
    - id : integer,
    - username : string,
    - email : string,
    - password : string,
    - phone : string,
    - name : string,
    - gender : string,
    - avatar : string,
}

```

### _Response (400 - Bad Request)_

```json
{
    "message" : "Username is required"
}
OR
{
    "message" : "Email is required"
}
OR
{
    "message" : "Invalid email format"
}
OR
{
    "message" : "Email has been taken"
}
OR
{
    "message" : "Password is required"
}
OR
{
    "message" : "Password at least 8 characters"
}
```

### `POST /api/user/login`

#### _Description_

> login to user account

#### _Request_

- Body

```json
{
    - email : string
    - password : string
}
```

### _Response (200 - OK)_

```json
{
    "access_token": string
}
```

### _Response (400 - Bad Request)_

```json
{
  "message": "Email is required"
}
OR
{
  "message": "Password is required"
}
```

### _Response (401 - Unauthorized)_

```json
{
  "message": "Invalid email / password"
}
```

### `POST /api/user/login-by-google`

#### _Description_

#### _Request_

- Headers

```json

```

- Params

```json
{}
```

- Body

```json
{}
```

### _Response_

### `POST /api/user/login-by-facebook`

#### _Description_

#### _Request_

- Headers

```json
{}
```

- Params

```json
{}
```

- Body

```json
{}
```

### _Response_

### `POST /api/user/login-by-twitter`

#### _Description_

#### _Request_

- Headers

```json
{}
```

- Params

```json
{}
```

- Body

```json
{}
```

### _Response_

### `GET /api/user/:id/detail`

#### _Description_

> get user

#### _Request_

- Headers

```json
{
    "access_token" : string
}
```

- Params

```json
{
    "id" : integer
}
```

- Body

```json
{
    null
}
```

### _Response (200 - OK)_

```json
{
    - id : integer,
    - username : string,
    - email : string,
    - password : string,
    - phone : string,
    - name : string,
    - gender : string,
    - avatar : string,
    - role: string,
    - status: string,
    - createdAt : date,
    - updatedAt : date
}
```

### _Response (403 - Forbidden)_

```json
{
  "message": "Access denied"
}
```

### _Response (404 - Not Found)_

```json
{
  "message": "Not Found"
}
```

### `PUT /api/user/:id/setting`

#### _Description_

> Setting user detail

#### _Request_

- Headers

```json
{
    "access_token" : string
}
```

- Params

```json
{
    "id" : integer
}
```

- Body

```json
{
    - username : string,
    - email : string,
    - password : string,
    - phone : string,
    - name : string,
    - gender : string,
    - avatar : string,
    - role: string,
}
```

### _Response (200 - OK)_

```json
{
    - id : integer,
    - username : string,
    - email : string,
    - password : string,
    - phone : string,
    - name : string,
    - gender : string,
    - avatar : string,
    - role: string,
    - status: string,
    - createdAt : date,
    - updatedAt : date
}
```

### _Response (400 - Bad Request)_

```json

{
    "message" : "Username has been taken"
}
OR
{
    "message" : "Invalid email format"
}
OR
{
    "message" : "Email has been taken"
}
OR
{
    "message" : "Password at least 8 characters"
}
OR
{
    "message" : "Password too weak"
}
```

### _Response (403 - Forbidden)_

```json
{
  "message": "Access denied"
}
```

### _Response (404 - Not Found)_

```json
{
  "message": "Not Found"
}
```

### `PATCH /api/user/:id/change-status`

#### _Description_

#### _Request_

- Headers

```json
{
    "access_token" : string
}
```

- Params

```json
{
    "id" : integer
}
```

- Body

```json
{
    "status" : string,
    "role" : string
}
```

### _Response (200 - OK)_

```json
{
  "message": "User has been updated"
}
```

### _Response (403 - Forbidden)_

```json
{
  "message": "Access denied"
}
```

### _Response (404 - Not Found)_

```json
{
  "message": "Not Found"
}
```

### `DELETE /api/user/:id`

#### _Description_

> Delete user

#### _Request_

- Headers

```json
{
    "access_token" : string
}
```

- Params

```json
{
    "id" : integer
}
```

### _Response (200 - OK)_

```json
{
  "message": "User has been deleted"
}
```

### _Response (403 - Forbidden)_

```json
{
  "message": "Access denied"
}
```

### _Response (404 - Not Found)_

```json
{
  "message": "Not Found"
}
```

## Exams

### `POST /api/exams`

#### _Description_

> add new exam

#### _Request_

- Headers

```json
{
    "access_token" : string
}
```

- Body

```json
{
    "title" : string,
    "description" : text,
    "totalQuestions" : integer,
    "duration" : integer,
    "status" : string,
}
```

### _Response (201 - Created)_

```json
{
    "id" : integer,
    "title" : string,
    "description" : text,
    "totalQuestions" : integer,
    "duration" : integer,
    "status" : string,
    "pin" : string,
    "ceratedAt" : date,
    "updatedAt" : date,
}
```

### _Response (400 - Bad Request)_

```json
{
"message" : "Title is required"
}
OR
{
"message" : "TotalQuestions is required"
}
OR
{
"message" : "TotalQuestions must be greater than 0"
}
OR
{
"message" : "Duration is required"
}
OR
{
"message" : "Duration must be greater than 0"
}
OR
{
"message" : "Status is required"
}
```

### _Response (403-Forbidden)_

```json
{
  "message": "Access denied"
}
```

### `GET /api/exams`

#### _Description_

#### _Request_

- Headers

```json
{
    "access_token" : string
}
```

### _Response (200 - OK)_

```json
[
    {
        "id" : integer,
        "title" : string,
        "description" : text,
        "totalQuestions" : integer,
        "duration" : integer,
        "status" : string,
        "pin" : string,
        "ceratedAt" : date,
        "updatedAt" : date,
    },
    {
        "id" : integer,
        "title" : string,
        "description" : text,
        "totalQuestions" : integer,
        "duration" : integer,
        "status" : string,
        "pin" : string,
        "ceratedAt" : date,
        "updatedAt" : date,
    },
]
```

### _Response (403-Forbidden)_

```json
{
  "message": "Access denied"
}
```

### `GET /api/exams/:id`

#### _Description_

> Get detail exam

#### _Request_

- Headers

```json
{
    "access_token" : string
}
```

- Params

```json
{
    "id" : string
}
```

### _Response (200 - OK)_

```json
{
    "id" : integer,
    "title" : string,
    "description" : text,
    "totalQuestions" : integer,
    "duration" : integer,
    "status" : string,
    "pin" : string,
    "ceratedAt" : date,
    "updatedAt" : date,
}
```

### _Response (403-Forbidden)_

```json
{
  "message": "Access denied"
}
```

### _Response (404 - Not Found)_

```json
{
  "message": "Not Found"
}
```

### `PUT /api/exams/:id`

#### _Description_

#### _Request_

- Headers

```json
{
    "access_token" : string
}
```

- Params

```json
{
    "id" : integer
}
```

- Body

```json
{
    "title" : string,
    "description" : text,
    "totalQuestions" : integer,
    "duration" : integer,
    "status" : string,
    "pin" : string
}
```

### _Response (200 - OK)_

```json
{
  "message": "Exam has been updated"
}
```

### _Response (403-Forbidden)_

```json
{
  "message": "Access denied"
}
```

### _Response (404 - Not Found)_

```json
{
  "message": "Not Found"
}
```

### `DELETE /api/exams/:id`

#### _Description_

> Delete exam data

#### _Request_

- Headers

```json
{
    "access_token" : string
}
```

- Params

```json
{
    "id" : integer
}
```

### _Response (200 - OK)_

```json
{
  "message": "Exam has been deleted"
}
```

### _Response (403-Forbidden)_

```json
{
  "message": "Access denied"
}
```

### _Response (404 - Not Found)_

```json
{
  "message": "Not Found"
}
```

## Questions

### `POST /api/questions`

#### _Description_

#### _Request_

- Headers

```json
{
    "access_token" : string
}
```

- Body

```json
{}
```

### _Response_

### _Response (403-Forbidden)_

```json
{
  "message": "Access denied"
}
```

### _Response (404 - Not Found)_

```json
{
  "message": "Not Found"
}
```

### `GET /api/questions`

#### _Description_

#### _Request_

- Headers

```json
{
    "access_token" : string
}
```

- Params

```json
{}
```

- Body

```json
{}
```

### _Response_

### _Response (403-Forbidden)_

```json
{
  "message": "Access denied"
}
```

### `GET /api/questions/:id`

#### _Description_

#### _Request_

- Headers

```json
{
    "access_token" : string
}
```

- Params

```json
{
    "id" : integer
}
```

- Body

```json
{}
```

### _Response_

### _Response (403-Forbidden)_

```json
{
  "message": "Access denied"
}
```

### _Response (404 - Not Found)_

```json
{
  "message": "Not Found"
}
```

### `PUT /api/questions/:id`

#### _Description_

#### _Request_

- Headers

```json
{
    "access_token" : string
}
```

- Params

```json
{
    "id" : integer
}
```

- Body

```json
{}
```

### _Response_

### _Response (403-Forbidden)_

```json
{
  "message": "Access denied"
}
```

### _Response (404 - Not Found)_

```json
{
  "message": "Not Found"
}
```

### `DELETE /api/questions/:id`

#### _Description_

#### _Request_

- Headers

```json
{
    "access_token" : string
}
```

- Params

```json
{
    "id" : integer
}
```

- Body

```json
{}
```

### _Response_

### _Response (403-Forbidden)_

```json
{
  "message": "Access denied"
}
```

### _Response (404 - Not Found)_

```json
{
  "message": "Not Found"
}
```

## Answers

### `POST /api/answers`

#### _Description_

#### _Request_

- Headers

```json
{
    "access_token" : string
}
```

- Params

```json
{}
```

- Body

```json
{}
```

### _Response_

### _Response (403-Forbidden)_

```json
{
  "message": "Access denied"
}
```

### `GET /api/answers`

#### _Description_

#### _Request_

- Headers

```json
{
    "access_token" : string
}
```

- Params

```json
{}
```

- Body

```json
{}
```

### _Response_

### _Response (403-Forbidden)_

```json
{
  "message": "Access denied"
}
```

### `GET /api/answers/:id`

#### _Description_

#### _Request_

- Headers

```json
{
    "access_token" : string
}
```

- Params

```json
{
    "id" : integer
}
```

- Body

```json
{}
```

### _Response_

### `PUT /api/answers/:id`

#### _Description_

#### _Request_

- Headers

```json
{
    "access_token" : string
}
```

- Params

```json
{}
```

- Body

```json
{}
```

### _Response_

### _Response (403-Forbidden)_

```json
{
  "message": "Access denied"
}
```

### _Response (404 - Not Found)_

```json
{
  "message": "Not Found"
}
```

### `DELETE /api/answers/:id`

#### _Description_

#### _Request_

- Headers

```json
{
    "access_token" : string
}
```

- Params

```json
{
    "id" : integer
}
```

- Body

```json
{}
```

### _Response_

### _Response (403-Forbidden)_

```json
{
  "message": "Access denied"
}
```

### _Response (404 - Not Found)_

```json
{
  "message": "Not Found"
}
```

## Grades

### `GET /api/grades`

#### _Description_

#### _Request_

- Headers

```json
{
    "access_token" : string
}
```

- Params

```json
{}
```

- Body

```json
{}
```

### _Response_

### _Response (403-Forbidden)_

```json
{
  "message": "Access denied"
}
```

### `GET /api/grades/:id`

#### _Description_

#### _Request_

- Headers

```json
{
    "access_token" : string
}
```

- Params

```json
{
    "id" : integer
}
```

- Body

```json
{}
```

### _Response_

### _Response (403-Forbidden)_

```json
{
  "message": "Access denied"
}
```

### _Response (404 - Not Found)_

```json
{
  "message": "Not Found"
}
```

## Global Errors

### _Response (500-Internal Server Error)_

```json
{
  "message": "Internal Server Error"
}
```
