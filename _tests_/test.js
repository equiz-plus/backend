const request = require("supertest");
const app = require("../app");
const { Exam, User } = require("../models/index");
const {
  deleteUser,
  updateToken,
  findToken,
  setScore,
  mockUser,
} = require("../lib/userInit");
const { comparePassword, hashPassword } = require("../helpers/bcrypt");
const {
  deleteGrade,
  deleteCategory,
  deleteExam,
  deleteUserAnswer,
  deleteCertificate,
  deleteOrganizations,
} = require("../lib/destroyTables");

// cleaning
afterAll(async () => {
  await deleteUser();
  await deleteExam();
  await deleteCategory();
  await deleteGrade();
  await deleteUserAnswer();
  await deleteCertificate();
  await deleteOrganizations();
});

// route for register
describe("POST /register", () => {
  it("should return REGISTER SUCCESS: User was registered successfully! Please check your email", async () => {
    const res = await request(app)
      .post("/register")
      .send({
        email: "admin@test.com",
        password: "12345678",
        name: "admin",
      })
      .expect(201);

    expect(res.body.message).toBe(
      "User was registered successfully! Please check your email"
    );
  });

  it("should return REGISTER FAILED: Email has been taken (unique error)", async () => {
    const res = await request(app)
      .post("/register")
      .send({
        email: "admin@test.com",
        password: "12345678",
        name: "admin",
      })
      .expect(400);

    expect(res.body.message).toBe("Email has been taken");
  });

  it("should return REGISTER FAILED: Invalid email format", async () => {
    const res = await request(app)
      .post("/register")
      .send({ email: "admin", password: "12345678" })
      .expect(400);

    expect(res.body.message).toBe("Invalid email format");
  });

  it("should return register FAILED: Email is required (email empty string)", async () => {
    const res = await request(app)
      .post("/register")
      .send({ email: "", password: "12345678" })
      .expect(400);

    expect(res.body.message).toBe("Email is required");
  });

  it("should return register FAILED: Email is required (email empty space)", async () => {
    const res = await request(app)
      .post("/register")
      .send({ email: " ", password: "12345678" })
      .expect(400);

    expect(res.body.message).toBe("Email is required");
  });

  it("should return register FAILED: Password is required (password empty string)", async () => {
    const res = await request(app)
      .post("/register")
      .send({ email: "admin@test.com", password: "" })
      .expect(400);

    expect(res.body.message).toBe("Password is required");
  });

  it("should return register FAILED: Password is required (password empty space)", async () => {
    const res = await request(app)
      .post("/register")
      .send({ email: "admin@test.com", password: " " })
      .expect(400);

    expect(res.body.message).toBe("Password is required");
  });
});

// router for login, failed
describe("POST /login", () => {
  it("should return login FAILED: user not verified yet)", async () => {
    const res = await request(app)
      .post("/login")
      .send({ email: "admin@test.com", password: "12345678" })
      .expect(401);

    expect(res.body.message).toBe("Pending Account. Please Verify Your Email!");
  });
});

// route for confirmation
const confirmationToken = jest.fn(findToken);

describe("POST /confirmation", () => {
  it("should return confirmation FAILED - no token", async () => {
    const res = await request(app)
      .post("/confirmation")
      .send({ email: "admin@test.com", token: "" })
      .expect(400);

    expect(res.body.message).toBe("Input token confirmation first");
  });

  it("should return confirmation FAILED - wrong token", async () => {
    const res = await request(app)
      .post("/confirmation")
      .send({ email: "admin@test.com", token: "ZAZA" })
      .expect(401);

    expect(res.body.message).toBe("Invalid email / token");
  });

  it("should return confirmation SUCCESS", async () => {
    const result = await confirmationToken();

    const res = await request(app)
      .post("/confirmation")
      .send({ email: "admin@test.com", token: result.tokenKey })
      .expect(200);

    expect(res.body.email).toBe("admin@test.com");
    expect(res.body.message).toBe("Your account has been activated");
  });
});

// mock functions to change user status
const mockUserValidator = jest.fn(updateToken);

let token = "";

// route for user login
describe("POST /login", () => {
  it("should return login SUCCESS - not premium", async () => {
    await mockUserValidator();
    const res = await request(app)
      .post("/login")
      .send({ email: "admin@test.com", password: "12345678" })
      .expect(200);

    token = res.body.access_token;

    expect(typeof res.body.access_token).toBe("string");
    expect(res.body.name).toBe("admin");
    expect(res.body.role).toBe("admin");
  });

  it("should return login SUCCESS - premium still there", async () => {
    await User.update(
      {
        premiumExpiry: new Date("2023-12-31"),
      },
      {
        where: { id: 1 },
      }
    );

    const res = await request(app)
      .post("/login")
      .send({ email: "admin@test.com", password: "12345678" })
      .expect(200);

    token = res.body.access_token;

    expect(typeof res.body.access_token).toBe("string");
    expect(res.body.name).toBe("admin");
    expect(res.body.role).toBe("admin");
  });

  it("should return login FAILED: Invalid email / password (wrong password)", async () => {
    const res = await request(app)
      .post("/login")
      .send({ email: "admin@test.com", password: "87654321" })
      .expect(401);

    expect(res.body.message).toBe("Invalid email / password");
  });

  it("should return login FAILED: Invalid email / password (email does not exist)", async () => {
    const res = await request(app)
      .post("/login")
      .send({ email: "bapak@test.com", password: "12345" })
      .expect(401);

    expect(res.body.message).toBe("Invalid email / password");
  });

  it("should return login FAILED: no email)", async () => {
    const res = await request(app)
      .post("/login")
      .send({ password: "12345" })
      .expect(400);

    expect(res.body.message).toBe("Email is required");
  });

  it("should return login FAILED: no password)", async () => {
    const res = await request(app)
      .post("/login")
      .send({ email: "bapak@test.com" })
      .expect(400);

    expect(res.body.message).toBe("Password is required");
  });
});

// router to get user list
describe("GET /users", () => {
  it("should return get profile SUCCESS", async () => {
    const res = await request(app)
      .get(`/users`)
      .set("access_token", token)
      .expect(200);

    expect(res.body.users[0].id).toBe(1);
    expect(res.body.users[0].email).toBe("admin@test.com");
    expect(res.body.users[0].name).toBe("admin");
  });
});

// router for user profile
describe("GET /users/profile", () => {
  it("should return get profile SUCCESS", async () => {
    const res = await request(app)
      .get(`/users/profile`)
      .set("access_token", token)
      .expect(200);

    expect(res.body.id).toBe(1);
    expect(res.body.email).toBe("admin@test.com");
    expect(res.body.name).toBe("admin");
  });
});

// router to get user profile by id
describe("GET /users/profile/:id", () => {
  it("should return get profile details SUCCESS", async () => {
    const res = await request(app)
      .get(`/users/detail/${1}`)
      .set("access_token", token)
      .expect(200);

    expect(res.body.id).toBe(1);
    expect(res.body.email).toBe("admin@test.com");
    expect(res.body.name).toBe("admin");
  });

  it("should return get profile details FAILED -  no such user", async () => {
    const res = await request(app)
      .get(`/users/detail/${99}`)
      .set("access_token", token)
      .expect(404);

    expect(res.body.message).toBe("Not Found");
  });
});

// route for create category
describe("POST /categories", () => {
  it("should return create category SUCCESS", async () => {
    const res = await request(app)
      .post(`/categories`)
      .send({
        name: "New Category",
      })
      .set("access_token", token)
      .expect(201);

    expect(res.body.id).toBe(1);
    expect(res.body.name).toBe("New Category");
  });

  it("should return create category FAILED - category name empty", async () => {
    const res = await request(app)
      .post(`/categories`)
      .send({
        name: "",
      })
      .set("access_token", token)
      .expect(400);

    expect(res.body.message).toBe("Please check your input");
  });
});

// router for get category 1
describe("GET /categories", () => {
  it("should return get category SUCCESS - Query 1", async () => {
    const res = await request(app)
      .get(`/categories?displayLength=1&page=1&order=ASC&search=new`)
      .set("access_token", token)
      .expect(200);

    expect(res.body.categories[0].id).toBe(1);
    expect(res.body.categories[0].name).toBe("New Category");
  });

  it("should return get category SUCCESS - Query 2", async () => {
    const res = await request(app)
      .get(`/categories?displayLength=10&page=100&order=DESC`)
      .set("access_token", token)
      .expect(200);

    expect(res.body.categories[0].id).toBe(1);
    expect(res.body.categories[0].name).toBe("New Category");
  });

  it("should return get category SUCCESS - Query 2", async () => {
    const res = await request(app)
      .get(`/categories?displayLength=10&page=-100`)
      .set("access_token", token)
      .expect(200);

    expect(res.body.categories[0].id).toBe(1);
    expect(res.body.categories[0].name).toBe("New Category");
  });

  it("should return get category SUCCESS - Query 3", async () => {
    const res = await request(app)
      .get(`/categories?displayLength=ZZ&page=XX&sort=&order=`)
      .set("access_token", token)
      .expect(200);

    expect(res.body.categories[0].id).toBe(1);
    expect(res.body.categories[0].name).toBe("New Category");
  });

  it("should return get category FAILED - No token", async () => {
    const res = await request(app)
      .get(`/categories?displayLength=ZZ&page=XX&sort=&order=`)
      .expect(403);

    expect(res.body.message).toBe("Access denied");
  });

  it("should return get category FAILED - Invalid token", async () => {
    const invalidToken = "ABCDEFGH";

    const res = await request(app)
      .get(`/categories?displayLength=ZZ&page=XX&sort=&order=`)
      .set("access_token", invalidToken)
      .expect(403);

    expect(res.body.message).toBe("Access denied");
  });
});

// router for get category by ID
describe("GET /categories/:id", () => {
  it("should return get category SUCCESS", async () => {
    const res = await request(app)
      .get(`/categories/1`)
      .set("access_token", token)
      .expect(200);

    expect(res.body.id).toBe(1);
    expect(res.body.name).toBe("New Category");
  });

  it("should return get category FAILED - no such category", async () => {
    const res = await request(app)
      .get(`/categories/99`)
      .set("access_token", token)
      .expect(404);

    expect(res.body.message).toBe("Not Found");
  });
});

// router for edit category by ID
describe("PUT /categories", () => {
  it("should return edit category SUCCESS", async () => {
    const res = await request(app)
      .put(`/categories/1`)
      .send({
        name: "New Category Edit",
      })
      .set("access_token", token)
      .expect(200);

    expect(res.body.message).toBe("Category with id 1 has been updated");
  });

  it("should return edit category FAILED - No such category", async () => {
    const res = await request(app)
      .put(`/categories/99`)
      .send({
        name: "New Category Edit",
      })
      .set("access_token", token)
      .expect(404);

    expect(res.body.message).toBe("Not Found");
  });

  it("should return edit category FAILED - category name is empty", async () => {
    const res = await request(app)
      .put(`/categories/99`)
      .send({
        name: "",
      })
      .set("access_token", token)
      .expect(400);

    expect(res.body.message).toBe("Didn't change anything");
  });
});

// route for creating an exam
describe("POST /exams", () => {
  it("should return create exam SUCCESS", async () => {
    const res = await request(app)
      .post(`/exams`)
      .send({
        title: "New Title",
        description: "New Description",
        totalQuestions: 5,
        duration: 120,
        CategoryId: 1,
      })
      .set("access_token", token)
      .expect(201);

    expect(res.body.id).toBe(1);
    expect(res.body.title).toBe("New Title");
    expect(res.body.description).toBe("New Description");
    expect(res.body.totalQuestions).toBe(5);
    expect(res.body.duration).toBe(120);
    expect(res.body.CategoryId).toBe(1);
  });

  it("should return create exam FAILED - too many questions", async () => {
    const res = await request(app)
      .post(`/exams`)
      .send({
        title: "New Title",
        description: "New Description",
        totalQuestions: 500,
        duration: 120,
        CategoryId: 1,
      })
      .set("access_token", token)
      .expect(400);

    expect(res.body.message).toBe("Questions minimum 5 and maximum 100");
  });

  it("should return create exam FAILED - too few questions", async () => {
    const res = await request(app)
      .post(`/exams`)
      .send({
        title: "New Title",
        description: "New Description",
        totalQuestions: 1,
        duration: 120,
        CategoryId: 1,
      })
      .set("access_token", token)
      .expect(400);

    expect(res.body.message).toBe("Questions minimum 5 and maximum 100");
  });

  it("should return create exam FAILED - missing title", async () => {
    const res = await request(app)
      .post(`/exams`)
      .send({
        description: "New Description",
        totalQuestions: 5,
        duration: 120,
        CategoryId: 1,
      })
      .set("access_token", token)
      .expect(400);

    expect(res.body.message).toBe("Title is required");
  });

  it("should return create exam FAILED - missing description", async () => {
    const res = await request(app)
      .post(`/exams`)
      .send({
        title: "New Title",
        totalQuestions: 5,
        duration: 120,
        CategoryId: 1,
      })
      .set("access_token", token)
      .expect(400);

    expect(res.body.message).toBe("Description is required");
  });

  it("should return create exam FAILED - missing total questions", async () => {
    const res = await request(app)
      .post(`/exams`)
      .send({
        title: "New Title",
        description: "New Description",
        duration: 120,
        CategoryId: 1,
      })
      .set("access_token", token)
      .expect(400);

    expect(res.body.message).toBe("Total questions is required");
  });

  it("should return create exam FAILED - missing duration", async () => {
    const res = await request(app)
      .post(`/exams`)
      .send({
        title: "New Title",
        description: "New Description",
        totalQuestions: 5,
        CategoryId: 1,
      })
      .set("access_token", token)
      .expect(400);

    expect(res.body.message).toBe("Duration is required");
  });

  it("should return create exam FAILED - missing category", async () => {
    const res = await request(app)
      .post(`/exams`)
      .send({
        title: "New Title",
        description: "New Description",
        totalQuestions: 5,
        duration: 120,
      })
      .set("access_token", token)
      .expect(400);

    expect(res.body.message).toBe("Category ID is required");
  });

  it("should return create exam FAILED - invalid category ID", async () => {
    const res = await request(app)
      .post(`/exams`)
      .send({
        title: "New Title",
        description: "New Description",
        totalQuestions: 5,
        duration: 120,
        CategoryId: 999,
      })
      .set("access_token", token)
      .expect(400);

    expect(res.body.message).toBe("Invalid Category ID");
  });
});

// router for get exam list
describe("GET /exams", () => {
  it("should return get exam SUCCESS - Query 1", async () => {
    const res = await request(app)
      .get(
        `/exams?page=1&CategoryId=1&displayLength=1&sort=title&order=ASC&search=new`
      )
      .set("access_token", token)
      .expect(200);

    expect(res.body.exams[0].id).toBe(1);
    expect(res.body.exams[0].title).toBe("New Title");
    expect(res.body.exams[0].description).toBe("New Description");
    expect(res.body.exams[0].totalQuestions).toBe(5);
    expect(res.body.exams[0].duration).toBe(120);
    expect(res.body.exams[0].CategoryId).toBe(1);
  });

  it("should return get exam SUCCESS - Query 2", async () => {
    const res = await request(app)
      .get(
        `/exams?page=0.8&CategoryId=CAK&displayLength=0&sort=id&order=DESC&search=new`
      )
      .set("access_token", token)
      .expect(200);

    expect(res.body.exams[0].id).toBe(1);
    expect(res.body.exams[0].title).toBe("New Title");
    expect(res.body.exams[0].description).toBe("New Description");
    expect(res.body.exams[0].totalQuestions).toBe(5);
    expect(res.body.exams[0].duration).toBe(120);
    expect(res.body.exams[0].CategoryId).toBe(1);
  });

  it("should return get exam FAILED - No token", async () => {
    const res = await request(app)
      .get(
        `/exams?page=0.8&CategoryId=CAK&displayLength=0&sort=id&order=DESC&search=new`
      )
      .expect(403);

    expect(res.body.message).toBe("Access denied");
  });
});

//route for get exam by ID
describe("GET /exams", () => {
  it("should return get exam SUCCESS", async () => {
    const res = await request(app)
      .get(`/exams/1`)
      .set("access_token", token)
      .expect(200);

    expect(res.body.id).toBe(1);
    expect(res.body.title).toBe("New Title");
    expect(res.body.description).toBe("New Description");
    expect(res.body.totalQuestions).toBe(5);
    expect(res.body.duration).toBe(120);
    expect(res.body.CategoryId).toBe(1);
  });

  it("should return get exam FAILED - invalid exam id", async () => {
    const res = await request(app)
      .get(`/exams/99`)
      .set("access_token", token)
      .expect(404);

    expect(res.body.message).toBe("Not Found");
  });
});

// route for edit an exam
describe("PUT /exams", () => {
  it("should return edit exam SUCCESS", async () => {
    const res = await request(app)
      .put(`/exams/1`)
      .send({
        title: "New Title Edit",
        description: "New Description Edit",
        totalQuestions: 10,
        duration: 150,
        CategoryId: 1,
      })
      .set("access_token", token)
      .expect(200);

    expect(res.body.message).toBe("Exam has been updated");
  });

  it("should return edit exam FAILED - invalid category", async () => {
    const res = await request(app)
      .put(`/exams/1`)
      .send({
        title: "New Title Edit",
        description: "New Description Edit",
        totalQuestions: 10,
        duration: 150,
        CategoryId: 99,
      })
      .set("access_token", token)
      .expect(400);

    expect(res.body.message).toBe("Invalid Category ID");
  });

  it("should return edit exam FAILED - invalid category", async () => {
    const res = await request(app)
      .put(`/exams/1`)
      .send({
        title: "New Title Edit",
        description: "New Description Edit",
        totalQuestions: 10,
        duration: 150,
        CategoryId: 99,
      })
      .set("access_token", token)
      .expect(400);

    expect(res.body.message).toBe("Invalid Category ID");
  });

  it("should return edit exam FAILED - no update", async () => {
    const res = await request(app)
      .put(`/exams/1`)
      .send({})
      .set("access_token", token)
      .expect(400);

    expect(res.body.message).toBe("Didn't change anything");
  });

  it("should return edit exam FAILED - maximum exam 420 minutes", async () => {
    const res = await request(app)
      .put(`/exams/1`)
      .send({
        title: "New Title Edit",
        description: "New Description Edit",
        totalQuestions: 10,
        duration: 999,
        CategoryId: 1,
      })
      .set("access_token", token)
      .expect(400);

    expect(res.body.message).toBe("Duration minimum 5 and maximum 420 minutes");
  });

  it("should return edit exam FAILED - maximum exam 420 minutes", async () => {
    const res = await request(app)
      .put(`/exams/1`)
      .send({
        title: "New Title Edit",
        description: "New Description Edit",
        totalQuestions: 10,
        duration: 1,
        CategoryId: 1,
      })
      .set("access_token", token)
      .expect(400);

    expect(res.body.message).toBe("Duration minimum 5 and maximum 420 minutes");
  });

  it("should return edit exam FAILED - maximum exam 420 minutes", async () => {
    const res = await request(app)
      .put(`/exams/1`)
      .send({
        title: "New Title Edit",
        description: "New Description Edit",
        totalQuestions: 900,
        duration: 100,
        CategoryId: 1,
      })
      .set("access_token", token)
      .expect(400);

    expect(res.body.message).toBe("Questions minimum 5 and maximum 100");
  });

  it("should return edit exam FAILED - maximum exam 420 minutes", async () => {
    const res = await request(app)
      .put(`/exams/1`)
      .send({
        title: "New Title Edit",
        description: "New Description Edit",
        totalQuestions: 1,
        duration: 100,
        CategoryId: 1,
      })
      .set("access_token", token)
      .expect(400);

    expect(res.body.message).toBe("Questions minimum 5 and maximum 100");
  });
});

// route for user trying to take exam, but exam not open
describe("POST /exams/start/:ExamId", () => {
  it("should return start exam FAILED - exam not open", async () => {
    const res = await request(app)
      .post(`/exams/start/1`)
      .set("access_token", token)
      .expect(403);

    expect(res.body.message).toBe("Exam has been closed");
  });
});

// route for changing exam to open
describe("PATCH /exams/change-visibility/:id", () => {
  it("should return patch exam SUCCESS: Exam status now open/close", async () => {
    const res = await request(app)
      .patch(`/exams/change-visibility/1`)
      .set("access_token", token)
      .expect(200);

    expect(res.body.message).toBe("Exam status now open");
  });

  it("should return patch exam Failed: no such exam", async () => {
    const res = await request(app)
      .patch(`/exams/change-visibility/99`)
      .set("access_token", token)
      .expect(404);

    expect(res.body.message).toBe("Not Found");
  });
});

// route for user trying to take exam, but exam does not have any questions
describe("POST /exams/start/:ExamId", () => {
  it("should return start exam FAILED - exam without questions", async () => {
    const res = await request(app)
      .post(`/exams/start/1`)
      .set("access_token", token)
      .expect(400);

    expect(res.body.message).toBe("This exam doesn't have any questions");
  });
});

// route for adding questions
describe("POST /questions", () => {
  it("should return create question SUCCESS", async () => {
    const res = await request(app)
      .post(`/questions`)
      .send({
        questionInput: {
          question: "Spongebob lives in...",
          CategoryId: 1,
        },
        answersInput: [
          {
            answer: "Bikini Bottom",
            isCorrect: "true",
          },
          {
            answer: "The Cloverfield",
            isCorrect: "false",
          },
        ],
      })
      .set("access_token", token)
      .expect(201);

    expect(res.body.id).toBe(1);
    expect(res.body.question).toBe("Spongebob lives in...");
    expect(res.body.CategoryId).toBe(1);
  });

  it("should return create question FAILED - missing question", async () => {
    const res = await request(app)
      .post(`/questions`)
      .send({
        questionInput: {
          question: "",
          CategoryId: 1,
        },
        answersInput: [
          {
            answer: "Bikini Bottom",
            isCorrect: "true",
          },
          {
            answer: "The Cloverfield",
            isCorrect: "false",
          },
        ],
      })
      .set("access_token", token)
      .expect(400);

    expect(res.body.message).toBe("Question is required");
  });

  it("should return create question FAILED - invalid category", async () => {
    const res = await request(app)
      .post(`/questions`)
      .send({
        questionInput: {
          question: "Spongebob lives in...",
          CategoryId: 99,
        },
        answersInput: [
          {
            answer: "Bikini Bottom",
            isCorrect: "true",
          },
          {
            answer: "The Cloverfield",
            isCorrect: "false",
          },
        ],
      })
      .set("access_token", token)
      .expect(400);

    expect(res.body.message).toBe("Invalid Category ID");
  });

  it("should return create question FAILED - answers missing", async () => {
    const res = await request(app)
      .post(`/questions`)
      .send({
        questionInput: {
          question: "Spongebob lives in...",
          CategoryId: 99,
        },
        answersInput: [],
      })
      .set("access_token", token)
      .expect(400);

    expect(res.body.message).toBe("Please check your input");
  });

  it("should return create question FAILED - answers answer are missing", async () => {
    const res = await request(app)
      .post(`/questions`)
      .send({
        questionInput: {
          question: "Spongebob lives in...",
          CategoryId: 1,
        },
        answersInput: [
          {
            answer: "",
            isCorrect: "true",
          },
          {
            answer: "",
            isCorrect: "false",
          },
        ],
      })
      .set("access_token", token)
      .expect(400);

    expect(res.body.message).toBe("Please check your input");
  });
});

// route for get questions list
describe("GET /questions", () => {
  it("should return get questions SUCCESS - Query 1", async () => {
    const res = await request(app)
      .get(`/questions?page=ASC&CategoryId=1&search=new&page=1000`)
      .set("access_token", token)
      .expect(200);

    expect(res.body.questions).toBeDefined;
  });
});

// route for get question ID
describe("GET /questions/1", () => {
  it("should return get question by ID SUCCESS", async () => {
    const res = await request(app)
      .get(`/questions/1`)
      .set("access_token", token)
      .expect(200);

    expect(res.body.id).toBe(1);
    expect(res.body.question).toBe("Spongebob lives in...");
    expect(res.body.CategoryId).toBe(1);
  });

  it("should return get question by ID FAILED - invalid question ID", async () => {
    const res = await request(app)
      .get(`/questions/999`)
      .set("access_token", token)
      .expect(404);

    expect(res.body.message).toBe("Not Found");
  });
});

// route for create organization
describe("POST /organizations", () => {
  it("should return create organization SUCCESS", async () => {
    const res = await request(app)
      .post(`/organizations`)
      .send({
        name: "Company A",
        address: "company address",
        logo: "company logo",
        pic: "john",
        sign: "john sign",
        prefix: "COMP",
      })
      .set("access_token", token)
      .expect(201);

    expect(res.body.id).toBe(1);
    expect(res.body.name).toBe("Company A");
    expect(res.body.address).toBe("company address");
    expect(res.body.logo).toBe("company logo");
    expect(res.body.pic).toBe("john");
    expect(res.body.sign).toBe("john sign");
    expect(res.body.prefix).toBe("COMP");
  });

  it("should return create organization FAILED - name is empty", async () => {
    const res = await request(app)
      .post(`/organizations`)
      .send({
        name: "",
        address: "company address",
        logo: "company logo",
        pic: "john",
        sign: "john sign",
        prefix: "COMP",
      })
      .set("access_token", token)
      .expect(400);

    expect(res.body.message).toBe("Please check your input");
  });

  it("should return create organization FAILED - address is empty", async () => {
    const res = await request(app)
      .post(`/organizations`)
      .send({
        name: "Company A",
        address: "",
        logo: "company logo",
        pic: "john",
        sign: "john sign",
        prefix: "COMP",
      })
      .set("access_token", token)
      .expect(400);

    expect(res.body.message).toBe("Please check your input");
  });

  it("should return create organization FAILED - logo is empty", async () => {
    const res = await request(app)
      .post(`/organizations`)
      .send({
        name: "Company A",
        address: "company address",
        logo: "",
        pic: "john",
        sign: "john sign",
        prefix: "COMP",
      })
      .set("access_token", token)
      .expect(400);

    expect(res.body.message).toBe("Please check your input");
  });

  it("should return create organization FAILED - pic is empty", async () => {
    const res = await request(app)
      .post(`/organizations`)
      .send({
        name: "Company A",
        address: "company address",
        logo: "company logo",
        pic: "",
        sign: "john sign",
        prefix: "COMP",
      })
      .set("access_token", token)
      .expect(400);

    expect(res.body.message).toBe("Please check your input");
  });

  it("should return create organization FAILED - sign is empty", async () => {
    const res = await request(app)
      .post(`/organizations`)
      .send({
        name: "Company A",
        address: "company address",
        logo: "company logo",
        pic: "john",
        sign: "",
        prefix: "COMP",
      })
      .set("access_token", token)
      .expect(400);

    expect(res.body.message).toBe("Please check your input");
  });
});

// route get organization list
describe("GET /organizations", () => {
  it("should return get organization SUCCESS", async () => {
    const res = await request(app)
      .get(`/organizations`)
      .set("access_token", token)
      .expect(200);

    expect(res.body.organizations[0].id).toBe(1);
    expect(res.body.organizations[0].name).toBe("Company A");
    expect(res.body.organizations[0].address).toBe("company address");
    expect(res.body.organizations[0].logo).toBe("company logo");
    expect(res.body.organizations[0].pic).toBe("john");
    expect(res.body.organizations[0].sign).toBe("john sign");
    expect(res.body.organizations[0].prefix).toBe("COMP");
  });
});

// route get organization list
describe("GET /organizations", () => {
  it("should return get organization SUCCESS", async () => {
    const res = await request(app)
      .get(`/organizations`)
      .set("access_token", token)
      .expect(200);

    expect(res.body.organizations[0].id).toBe(1);
    expect(res.body.organizations[0].name).toBe("Company A");
    expect(res.body.organizations[0].address).toBe("company address");
    expect(res.body.organizations[0].logo).toBe("company logo");
    expect(res.body.organizations[0].pic).toBe("john");
    expect(res.body.organizations[0].sign).toBe("john sign");
    expect(res.body.organizations[0].prefix).toBe("COMP");
  });
});

// route get organization by ID
describe("GET /organizations/:id", () => {
  it("should return get organization SUCCESS", async () => {
    const res = await request(app)
      .get(`/organizations/1`)
      .set("access_token", token)
      .expect(200);

    expect(res.body.id).toBe(1);
    expect(res.body.name).toBe("Company A");
    expect(res.body.address).toBe("company address");
    expect(res.body.logo).toBe("company logo");
    expect(res.body.pic).toBe("john");
    expect(res.body.sign).toBe("john sign");
    expect(res.body.prefix).toBe("COMP");
  });

  it("should return get organization FAILED - invalid organization id", async () => {
    const res = await request(app)
      .get(`/organizations/99`)
      .set("access_token", token)
      .expect(404);

    expect(res.body.message).toBe("Not Found");
  });
});

// route edit organization
describe("PUT /organizations", () => {
  it("should return edit organization SUCCESS", async () => {
    const res = await request(app)
      .put(`/organizations/1`)
      .send({
        name: "Company A New",
        address: "company address new",
        logo: "company logo new",
        pic: "patrick",
        sign: "patrick sign",
        prefix: "COMP",
      })
      .set("access_token", token)
      .expect(200);

    expect(res.body.message).toBe("Organization data has been updated");
  });

  it("should return edit organization FAILED - nothing updated", async () => {
    const res = await request(app)
      .put(`/organizations/1`)
      .send({})
      .set("access_token", token)
      .expect(400);

    expect(res.body.message).toBe("Didn't change anything");
  });
});

// route for exam disclaimer
describe("GET /exams/detail/:id", () => {
  it("should return get exam detail by ID SUCCESS", async () => {
    const res = await request(app)
      .get(`/exams/detail/1`)
      .set("access_token", token)
      .expect(200);

    expect(res.body.id).toBe(1);
    expect(res.body.title).toBe("New Title Edit");
    expect(res.body.description).toBe("New Description Edit");
    expect(res.body.totalQuestions).toBe(10);
    expect(res.body.duration).toBe(150);
    expect(res.body.CategoryId).toBe(1);
  });

  it("should return get exam detail by ID FAILED - invalid exam id", async () => {
    const res = await request(app)
      .get(`/exams/detail/99`)
      .set("access_token", token)
      .expect(404);

    expect(res.body.message).toBe("Not Found");
  });
});

// route for starting an exam
describe("POST /exams/start/:ExamId", () => {
  it("should return start exam SUCCESS", async () => {
    const res = await request(app)
      .post(`/exams/start/1`)
      .set("access_token", token)
      .expect(200);

    expect(res.body.message).toBe("Exam started for user 1");
  });

  it("should return start exam FAILED - user already in a session", async () => {
    const res = await request(app)
      .post(`/exams/start/1`)
      .set("access_token", token)
      .expect(400);

    expect(res.body.message).toBe("Already in an exam session");
  });
});

// route for editing exam failed, there's a session
describe("PUT /exams", () => {
  it("should return edit exam FAILED - session exists", async () => {
    const res = await request(app)
      .put(`/exams/1`)
      .send({
        title: "New Title Edit",
        description: "New Description Edit",
        totalQuestions: 10,
        duration: 150,
        CategoryId: 1,
      })
      .set("access_token", token)
      .expect(400);

    expect(res.body.message).toBe("An active session is using this resource");
  });
});

// router delete exam failed, there's a session
describe("DELETE /exams/:id", () => {
  it("should return delete exam FAILED - session exists)", async () => {
    const res = await request(app)
      .delete("/exams/1")
      .set("access_token", token)
      .expect(400);

    expect(res.body.message).toBe("An active session is using this resource");
  });
});

// route for answering an exam
describe("POST /exams/answer/:questionNumber", () => {
  it("should return answer SUCCESS - new answer entry", async () => {
    const res = await request(app)
      .post(`/exams/answer/1`)
      .send({
        AnswerId: 2,
        QuestionId: 1,
      })
      .set("access_token", token)
      .expect(201);

    expect(res.body.id).toBe(1);
    expect(res.body.questionNumber).toBe(1);
    expect(res.body.AnswerId).toBe(2);
    expect(res.body.ExamId).toBe(1);
    expect(res.body.UserId).toBe(1);
  });

  it("should return answer SUCCESS - updated answer entry", async () => {
    const res = await request(app)
      .post(`/exams/answer/1`)
      .send({
        AnswerId: 1,
        QuestionId: 1,
      })
      .set("access_token", token)
      .expect(200);

    expect(res.body.message).toBe("Answer changed to 1");
  });

  it("should return answer FAILED - mismatch question number", async () => {
    const res = await request(app)
      .post(`/exams/answer/90`)
      .send({
        AnswerId: 1,
        QuestionId: 1,
      })
      .set("access_token", token)
      .expect(404);

    expect(res.body.message).toBe("Not Found");
  });

  it("should return answer FAILED - no such answer", async () => {
    const res = await request(app)
      .post(`/exams/answer/1`)
      .send({
        AnswerId: 99,
        QuestionId: 1,
      })
      .set("access_token", token)
      .expect(404);

    expect(res.body.message).toBe("Not Found");
  });

  it("should return answer FAILED - no such question", async () => {
    const res = await request(app)
      .post(`/exams/answer/1`)
      .send({
        AnswerId: 1,
        QuestionId: 99,
      })
      .set("access_token", token)
      .expect(404);

    expect(res.body.message).toBe("Not Found");
  });
});

// route for ending an exam
describe("POST /exams/end", () => {
  it("should return end session SUCCESS - with certificate", async () => {
    const res = await request(app)
      .post(`/exams/end`)
      .set("access_token", token)
      .expect(200);

    expect(res.body.message).toBe("User 1 current exam has ended");
    expect(res.body.status).toBe("Passed");
  });
});

// route for user trying to retake exam, but failed
describe("POST /exams/start/:ExamId", () => {
  it("should return start exam SUCCESS", async () => {
    const res = await request(app)
      .post(`/exams/start/1`)
      .set("access_token", token)
      .expect(400);

    expect(res.body.message).toBe("You have done this test");
  });
});

// route for answering an exam, but exam ended
describe("POST /exams/answer/:questionNumber - Exam Ended", () => {
  it("should return answer FAILED - exam ended", async () => {
    const res = await request(app)
      .post(`/exams/answer/1`)
      .send({
        AnswerId: 2,
        QuestionId: 1,
      })
      .set("access_token", token)
      .expect(404);

    expect(res.body.message).toBe("Not Found");
  });
});

// route for starting an exam
describe("POST /exams/start/:ExamId - first restart", () => {
  it("should return start exam SUCCESS", async () => {
    await deleteGrade();
    const res = await request(app)
      .post(`/exams/start/1`)
      .set("access_token", token)
      .expect(200);

    expect(res.body.message).toBe("Exam started for user 1");
  });
});

// route for getting existing session
describe("GET /exams/session", () => {
  it("should return get exam session SUCCESS - resume session", async () => {
    const res = await request(app)
      .get(`/exams/session`)
      .set("access_token", token)
      .expect(200);

    expect(res.body.id).toBe(2);
  });

  it("should return get exam session SUCCESS - session time out, passed", async () => {
    await setScore();

    const res = await request(app)
      .get(`/exams/session`)
      .set("access_token", token)
      .expect(200);

    expect(res.body.message).toBe("Exam has ended");
    expect(res.body.status).toBe("Passed");
  });

  it("should return get exam session FAILED - session missing", async () => {
    const res = await request(app)
      .get(`/exams/session`)
      .set("access_token", token)
      .expect(404);

    expect(res.body.message).toBe("Not Found");
  });
});

// router for checking certificate list
describe("GET /certificates", () => {
  it("should return get certificate SUCCESS - Query 1", async () => {
    const res = await request(app)
      .get(`/certificates?page=1&displayLength=1&order=ASC`)
      .set("access_token", token)
      .expect(200);

    expect(res.body.certificates[0].id).toBe(1);
    expect(res.body.certificates[0].UserId).toBe(1);
    expect(res.body.certificates[0].ExamId).toBe(1);
    expect(res.body.certificates[0].GradeId).toBe(1);
    expect(res.body.certificates[0].certificateNo).toBe(
      "CERT/0001/EQZ/06/2023"
    );
    expect(res.body.certificates[0].slug).toBe("CERT-0001-EQZ-06-2023");
  });

  it("should return get certificate SUCCESS - Query 2", async () => {
    const res = await request(app)
      .get(`/certificates?page=10&displayLength=&order=DESC`)
      .set("access_token", token)
      .expect(200);

    expect(res.body.certificates[0].id).toBe(2);
    expect(res.body.certificates[0].UserId).toBe(1);
    expect(res.body.certificates[0].ExamId).toBe(1);
    expect(res.body.certificates[0].GradeId).toBe(1);
    expect(res.body.certificates[0].certificateNo).toBe(
      "CERT/0002/EQZ/06/2023"
    );
    expect(res.body.certificates[0].slug).toBe("CERT-0002-EQZ-06-2023");
  });

  it("should return get certificate SUCCESS - Query 3", async () => {
    const res = await request(app)
      .get(`/certificates?page=0&displayLength=&order=DESC`)
      .set("access_token", token)
      .expect(200);

    expect(res.body.certificates[0].id).toBe(2);
    expect(res.body.certificates[0].UserId).toBe(1);
    expect(res.body.certificates[0].ExamId).toBe(1);
    expect(res.body.certificates[0].GradeId).toBe(1);
    expect(res.body.certificates[0].certificateNo).toBe(
      "CERT/0002/EQZ/06/2023"
    );
    expect(res.body.certificates[0].slug).toBe("CERT-0002-EQZ-06-2023");
  });

  it("should return get certificate FAILED - invalid token", async () => {
    const res = await request(app)
      .get(`/certificates?page=10&displayLength=&order=DESC`)
      .set("token", token)
      .expect(403);

    expect(res.body.message).toBe("Access denied");
  });
});

// router for checking certificate by ID
describe("GET /certificates/:slug", () => {
  it("should return get certificate by ID SUCCESS", async () => {
    const res = await request(app)
      .get(`/certificates/CERT-0002-EQZ-06-2023`)
      .set("access_token", token)
      .expect(200);

    expect(res.body.id).toBe(2);
    expect(res.body.UserId).toBe(1);
    expect(res.body.ExamId).toBe(1);
    expect(res.body.GradeId).toBe(1);
    expect(res.body.certificateNo).toBe("CERT/0002/EQZ/06/2023");
    expect(res.body.slug).toBe("CERT-0002-EQZ-06-2023");
  });

  it("should return get certificate by ID Failed - invalid certificate no", async () => {
    const res = await request(app)
      .get(`/certificates/CERT-0099-EQZ-06-2023`)
      .set("access_token", token)
      .expect(404);

    expect(res.body.message).toBe("Not Found");
  });
});

// router for checking all user grades
describe("GET /grades/score", () => {
  it("should return student grades list SUCCESS", async () => {
    const res = await request(app)
      .get(`/grades/score`)
      .set("access_token", token)
      .expect(200);

    expect(res.body[0].id).toBe(1);
    expect(res.body[0].questionsCount).toBe(1);
    expect(res.body[0].totalCorrect).toBe(1);
    expect(res.body[0].grade).toBe(100);
    expect(res.body[0].ExamId).toBe(1);
    expect(res.body[0].UserId).toBe(1);
    expect(res.body[0].Exam.id).toBe(1);
  });
});

// router for checking user grades
describe("GET /grades/score/detail/:GradeId", () => {
  it("should return student specific grade with detail SUCCESS", async () => {
    const res = await request(app)
      .get(`/grades/score/detail/1`)
      .set("access_token", token)
      .expect(200);

    expect(res.body.userScore).toBe(100);
    expect(res.body.exam.id).toBe(1);
    expect(res.body.exam.title).toBe("New Title Edit");
    expect(res.body.exam.description).toBe("New Description Edit");
    expect(res.body.exam.totalQuestions).toBe(10);
    expect(res.body.exam.duration).toBe(150);
    expect(res.body.exam.CategoryId).toBe(1);
  });

  it("should return student specific grade with detail FAILED - invalid grade id", async () => {
    const res = await request(app)
      .get(`/grades/score/detail/100`)
      .set("access_token", token)
      .expect(404);

    expect(res.body.message).toBe("Not Found");
  });
});

// route for checking user grade by admin
describe("GET /grades/score/:id", () => {
  it("should return student specific grade with detail SUCCESS", async () => {
    const res = await request(app)
      .get(`/grades/score/1`)
      .set("access_token", token)
      .expect(200);

    expect(res.body[0].id).toBe(1);
    expect(res.body[0].questionsCount).toBe(1);
    expect(res.body[0].totalCorrect).toBe(1);
    expect(res.body[0].grade).toBe(100);
    expect(res.body[0].ExamId).toBe(1);
    expect(res.body[0].UserId).toBe(1);
  });

  it("should return student specific grade with detail FAILED - invalid grade id", async () => {
    const res = await request(app)
      .get(`/grades/score/100`)
      .set("access_token", token)
      .expect(404);

    expect(res.body.message).toBe("Not Found");
  });
});

// router buy subscription
describe("POST /payment/pay", () => {
  it("should return begin payment FAILED", async () => {
    const res = await request(app)
      .post(`/payment/pay`)
      .set("access_token", token)
      .expect(400);

    expect(res.body.message).toBe("Invalid payment amount");
  });

  it("should return begin payment SUCCESS", async () => {
    const res = await request(app)
      .post(`/payment/pay`)
      .send({ length: "180" })
      .set("access_token", token)
      .expect(201);

    expect(res.body.token).toBeDefined();
    expect(res.body.paymentUrl).toBeDefined();
  });
});

// router notification subscription
describe("POST /payment/checking", () => {
  it("should return payment checking SUCCESS", async () => {
    const res = await request(app)
      .post(`/payment/checking`)
      .send({
        va_numbers: [{ va_number: "34241085681", bank: "bca" }],
        transaction_time: "2023-06-06 13:01:52",
        transaction_status: "settlement",
        transaction_id: "299d306f-5a3f-4835-8f65-3cdf1f41acec",
        status_message: "midtrans payment notification",
        status_code: "200",
        signature_key:
          "22221f7f6c7b44e0dc66bcc39ce3419d0fc7e54badb3f5be938521dfe7515c8db6c396aaea8145bc97f8adb869d028f6756db571459daec2a2cb2ab1a07e8eae",
        settlement_time: "2023-06-06 13:01:59",
        payment_type: "bank_transfer",
        payment_amounts: [],
        order_id: "1686030925217-D01-180",
        merchant_id: "G993834241",
        gross_amount: "1200000.00",
        fraud_status: "accept",
        expiry_time: "2023-06-07 13:01:51",
        currency: "IDR",
      })
      .set("access_token", token)
      .expect(200);

    expect(res.body.message).toBe("180 days added to User ID 1 subscription");
  });

  it("should return payment checking FAILED - transaction cancelled", async () => {
    const res = await request(app)
      .post(`/payment/checking`)
      .send({
        va_numbers: [{ va_number: "34241085681", bank: "bca" }],
        transaction_time: "2023-06-06 13:01:52",
        transaction_status: "deny",
        transaction_id: "299d306f-5a3f-4835-8f65-3cdf1f41acec",
        status_message: "midtrans payment notification",
        status_code: "200",
        signature_key:
          "22221f7f6c7b44e0dc66bcc39ce3419d0fc7e54badb3f5be938521dfe7515c8db6c396aaea8145bc97f8adb869d028f6756db571459daec2a2cb2ab1a07e8eae",
        settlement_time: "2023-06-06 13:01:59",
        payment_type: "bank_transfer",
        payment_amounts: [],
        order_id: "1686030925217-D01-180",
        merchant_id: "G993834241",
        gross_amount: "1200000.00",
        fraud_status: "accept",
        expiry_time: "2023-06-07 13:01:51",
        currency: "IDR",
      })
      .set("access_token", token)
      .expect(200);

    expect(res.body.message).toBe("Transaction has been cancelled");
  });
});

// router delete organization
describe("DELETE /organization/:id", () => {
  it("should return delete organization SUCCESS)", async () => {
    const res = await request(app)
      .delete("/organizations/1")
      .set("access_token", token)
      .expect(200);

    expect(res.body.message).toBe("Organization with id 1 has been deleted");
  });

  it("should return delete organization FAILED - invalid organization)", async () => {
    const res = await request(app)
      .delete("/organizations/1")
      .set("access_token", token)
      .expect(404);

    expect(res.body.message).toBe("Not Found");
  });
});

// router delete exam
describe("DELETE /exams/:id", () => {
  it("should return delete exam SUCCESS)", async () => {
    await deleteGrade();
    const exam = await Exam.findByPk(1);

    const res = await request(app)
      .delete("/exams/1")
      .set("access_token", token)
      .expect(200);

    expect(res.body.message).toBe("Exam with id 1 has been deleted");
  });

  it("should return delete exam FAILED - invalid organization)", async () => {
    const res = await request(app)
      .delete("/exams/1")
      .set("access_token", token)
      .expect(404);

    expect(res.body.message).toBe("Not Found");
  });
});

// router for delete questions
describe("DELETE /questions/:id", () => {
  it("should return delete question SUCCESS)", async () => {
    const res = await request(app)
      .delete("/questions/1")
      .set("access_token", token)
      .expect(200);

    expect(res.body.message).toBe("Question with id 1 has been deleted");
  });

  it("should return delete question FAILED - invalid question)", async () => {
    const res = await request(app)
      .delete("/questions/1")
      .set("access_token", token)
      .expect(404);

    expect(res.body.message).toBe("Not Found");
  });
});

// route for delete category
describe("DELETE /categories/:id", () => {
  it("should return delete category SUCCESS)", async () => {
    const res = await request(app)
      .delete("/categories/1")
      .set("access_token", token)
      .expect(200);

    expect(res.body.message).toBe("Category with id 1 has been deleted");
  });

  it("should return delete category FAILED - invalid category)", async () => {
    const res = await request(app)
      .delete("/categories/1")
      .set("access_token", token)
      .expect(404);

    expect(res.body.message).toBe("Not Found");
  });
});

// route for edit profile
describe("PUT /users/edit", () => {
  it("should return edit profile FAILED - wrong old password", async () => {
    const res = await request(app)
      .put(`/users/edit`)
      .send({
        username: "admin_new",
        email: "admin_new@email.com",
        password: "87654321",
        oldPassword: "123456789",
        phone: "080989999",
        name: "satrio",
        gender: "male",
      })
      .set("access_token", token)
      .expect(400);

    expect(res.body.message).toBe("Invalid old password");
  });

  it("should return edit profile FAILED - old password is empty", async () => {
    const res = await request(app)
      .put(`/users/edit`)
      .send({
        username: "admin_new",
        email: "admin_new@email.com",
        password: "87654321",
        oldPassword: "",
        phone: "080989999",
        name: "satrio",
        gender: "male",
      })
      .set("access_token", token)
      .expect(400);

    expect(res.body.message).toBe("Old password is required");
  });

  it("should return edit profile SUCCESS", async () => {
    const res = await request(app)
      .put(`/users/edit`)
      .send({
        username: "admin_new",
        email: "admin_new@email.com",
        password: "87654321",
        oldPassword: "12345678",
        phone: "080989999",
        name: "satrio",
        gender: "male",
      })
      .set("access_token", token)
      .expect(200);

    expect(res.body.message).toBe("User data has been updated");
  });
});

// route for delete user
describe("DELETE /users/:id", () => {
  it("should return delete user SUCCESS", async () => {
    await mockUser();

    const res = await request(app)
      .delete("/users/3")
      .set("access_token", token)
      .expect(200);

    expect(res.body.message).toBe("User with id 3 has been deleted");
  });

  it("should return delete user SUCCESS", async () => {
    await mockUser();

    const res = await request(app)
      .delete("/users/99")
      .set("access_token", token)
      .expect(404);

    expect(res.body.message).toBe("Not Found");
  });
});
