const request = require("supertest");
const app = require("../app");
const { deleteUser, updateToken } = require("../lib/userInit");
const { comparePassword, hashPassword } = require("../helpers/bcrypt");
const { deleteExam } = require("../lib/examInit");

// seeding
// beforeAll(async () => {

// });

// cleaning
afterAll(async () => {
  await deleteUser();
  await deleteExam();
});

// route for register
describe("POST /register", () => {
  it("should return REGISTER SUCCESS: User was registered successfully! Please check your email", async () => {
    const res = await request(app)
      .post("/register")
      .send({
        email: "student@test.com",
        password: "12345678",
        name: "student",
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
        email: "student@test.com",
        password: "12345678",
        name: "student",
      })
      .expect(400);

    expect(res.body.message).toBe("Email has been taken");
  });

  it("should return REGISTER FAILED: Invalid email format", async () => {
    const res = await request(app)
      .post("/register")
      .send({ email: "student", password: "12345678" })
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
      .send({ email: "student@test.com", password: "" })
      .expect(400);

    expect(res.body.message).toBe("Password is required");
  });

  it("should return register FAILED: Password is required (password empty space)", async () => {
    const res = await request(app)
      .post("/register")
      .send({ email: "student@test.com", password: " " })
      .expect(400);

    expect(res.body.message).toBe("Password is required");
  });
});

// mock functions to change user status
const mockUserValidator = jest.fn(updateToken);

// route for user login
let token = "";

describe("POST /login", () => {
  it("should return login SUCCESS", async () => {
    mockUserValidator();
    const res = await request(app)
      .post("/login")
      .send({ email: "student@test.com", password: "12345678" })
      .expect(200);

    token = res.body.access_token;

    expect(typeof res.body.access_token).toBe("string");
    expect(res.body.name).toBe("student");
    expect(res.body.role).toBe("admin");
  });

  it("should return login FAILED: Invalid email / password (wrong password)", async () => {
    const res = await request(app)
      .post("/login")
      .send({ email: "student@test.com", password: "87654321" })
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
});

// router for user profile
describe("GET /users/profile", () => {
  it("should return get profile SUCCESS", async () => {
    const res = await request(app)
      .get(`/users/profile`)
      .set("access_token", token)
      .expect(200);

    expect(res.body.id).toBe(1);
    expect(res.body.email).toBe("student@test.com");
    expect(res.body.name).toBe("student");
  });

  it("should return get profile details SUCCESS", async () => {
    const res = await request(app)
      .get(`/users/detail/${1}`)
      .set("access_token", token)
      .expect(200);

    expect(res.body.id).toBe(1);
    expect(res.body.email).toBe("student@test.com");
    expect(res.body.name).toBe("student");
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
        closingDate: new Date("2023-12-17T03:24:00"),
      })
      .set("access_token", token)
      .expect(201);

    expect(res.body.id).toBe(1);
    expect(res.body.title).toBe("New Title");
    expect(res.body.description).toBe("New Description");
    expect(res.body.totalQuestions).toBe(5);
  });
});

// route for changing exam to open
it("should return patch exam SUCCESS: Exam status now open/close", async () => {
  const res = await request(app)
    .patch(`/exams/change-visibility/1`)
    .set("access_token", token)
    .expect(200);

  expect(res.body.message).toBe("Exam status now open");
});

// route for starting an exam
describe("POST /exams/start/:id", () => {
  it("should return start exam SUCCESS", async () => {
    const res = await request(app)
      .post(`/exams/start/1`)
      .set("access_token", token)
      .expect(200);
  }, 30000);
});

// router for answering an exam

// describe("POST /exa/:id", () => {
//   it("should return add Wishlist FAILED - product id does not exist", async () => {
//     const res = await request(app)
//       .post(`/pub/wishlist/${999}`)
//       .set("access_token", token)
//       .expect(404);

//     expect(res.body.message).toBe("No such product exists");
//   });
// });

// describe("POST /wishlist/:id", () => {
//   it("should return add Wishlist FAILED - no access token/not logged in", async () => {
//     const res = await request(app).post(`/pub/wishlist/${1}`).expect(401);

//     expect(res.body.message).toBe("Authentication failed");
//   });
// });

// let wrongToken = "thistokeniscompletelywrong";

// describe("POST /wishlist/:id", () => {
//   it("should return add Wishlist FAILED - invalid token", async () => {
//     const res = await request(app)
//       .post(`/pub/wishlist/${1}`)
//       .set("access_token", wrongToken)
//       .expect(401);

//     expect(res.body.message).toBe("Authentication failed");
//   });
// });

// route for customer products

// describe("GET /products", () => {
//   it("should return products array", async () => {
//     const res = await request(app).get("/pub/products").expect(200);

//     expect(Array.isArray(res.body.data)).toBe(true); //is array of objects
//     expect(res.body.data.length).toBe(12); //as per pagination limit

//     expect(res.body.data[0].id).toBe(1);
//     expect(res.body.data[0].name).toBe("Quamba");
//     expect(res.body.data[0].description).toBe(
//       "luctus tincidunt nulla mollis molestie lorem quisque ut erat curabitur gravida nisi at nibh in hac habitasse"
//     );
//     expect(res.body.data[0].price).toBe(2604035);
//     expect(res.body.data[0].imgUrl).toBe(
//       "http://dummyimage.com/239x100.png/ff4444/ffffff"
//     );
//     expect(res.body.data[0].stock).toBe(309);
//     expect(res.body.data[0].categoryId).toBe(5);
//     expect(res.body.data[0].authorId).toBe(2);
//     expect(res.body.data[0].status).toBe("Active");
//   });

//   it("should return products array per filter", async () => {
//     const res = await request(app)
//       .get("/pub/products")
//       .query({ filter: 1 })
//       .expect(200);

//     expect(Array.isArray(res.body.data)).toBe(true); //is array of objects
//     expect(res.body.data.length).toBe(12); //as per pagination limit

//     expect(res.body.data[0].id).toBe(3);
//     expect(res.body.data[0].name).toBe("Oyoloo");
//     expect(res.body.data[0].description).toBe(
//       "odio elementum eu interdum eu tincidunt in leo maecenas pulvinar lobortis est phasellus sit"
//     );
//     expect(res.body.data[0].price).toBe(215079);
//     expect(res.body.data[0].imgUrl).toBe(
//       "http://dummyimage.com/147x100.png/ff4444/ffffff"
//     );
//     expect(res.body.data[0].stock).toBe(280);
//     expect(res.body.data[0].categoryId).toBe(1);
//     expect(res.body.data[0].authorId).toBe(3);
//     expect(res.body.data[0].status).toBe("Inactive");
//   });

//   it("should return products array per page limited to 10", async () => {
//     const res = await request(app)
//       .get("/pub/products")
//       .query({ page: 3 })
//       .expect(200);

//     expect(Array.isArray(res.body.data)).toBe(true); //is array of objects
//     expect(res.body.data.length).toBe(12); //as per pagination limit
//     expect(res.body.data[0].id).toBe(25);
//   });

//   it("should return an object of specific product as per id", async () => {
//     const res = await request(app).get(`/pub/products/${2}`).expect(200);

//     expect(res.body.data.id).toBe(2);
//   });

//   it("should fail to return an object specific product as per id", async () => {
//     const res = await request(app).get(`/pub/products/${999}`).expect(404);

//     expect(res.body.message).toBe("Error Not Found"); //only return 1 product with specific id
//   });
// });
