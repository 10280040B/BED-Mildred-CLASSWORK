const express = require("express");
const sql = require("mssql");

const app = express();

const dbConfig = {
  server: "localhost",
  database: "NPBookstore",
  user: "npbookstore_user1",
  password: "Password123",
  options: { trustServerCertificate: true },
};

// Allows Express to read JSON request bodies
app.use(express.json());

// ======================= Session 1 =======================

app.get("/", (req, res) => {
  res.send("Welcome to the Book Category API");
});

app.get("/categories", (req, res) => {
  res.json([
    { id: 1, name: "Fiction" },
    { id: 2, name: "Non-Fiction" },
    { id: 3, name: "Biography" },
  ]);
});

app.get("/about", (req, res) => {
  res.send(
    "Hello! I am an IT student at Ngee Ann Polytechnic. I am learning how to build APIs using Node.js and Express."
  );
});

// ======================= Tutorial 1: GET authors =======================

// GET /authors
app.get("/authors", async (req, res) => {
  let connection;

  try {
    connection = await sql.connect(dbConfig);

    const request = connection.request();
    const result = await request.query("SELECT * FROM Author");

    res.status(200).json(result.recordset);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error retrieving authors" });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeError) {
        console.error("Error closing connection:", closeError);
      }
    }
  }
});

// GET /authors/:id
app.get("/authors/:id", async (req, res) => {
  const authorId = parseInt(req.params.id);

  if (isNaN(authorId)) {
    return res.status(400).json({ error: "Invalid author ID" });
  }

  let connection;

  try {
    connection = await sql.connect(dbConfig);

    const request = connection.request();
    request.input("id", sql.Int, authorId);

    const result = await request.query(
      "SELECT AuthorID, Name FROM Author WHERE AuthorID = @id"
    );

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: "Author not found" });
    }

    res.status(200).json(result.recordset[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error retrieving author" });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeError) {
        console.error("Error closing connection:", closeError);
      }
    }
  }
});

// ======================= Tutorial 2: echo (DELETE THIS WHEN DONE) =======================

app.post("/echo/:id", (req, res) => {
  console.log("params:", req.params);
  console.log("query:", req.query);
  console.log("body:", req.body);

  res.json({
    params: req.params,
    query: req.query,
    body: req.body,
  });
});

// ======================= Tutorial 3a: POST and PUT authors =======================

// POST /authors
app.post("/authors", async (req, res) => {
  const { authorId, name } = req.body;

  if (!Number.isInteger(authorId) || !name) {
    return res
      .status(400)
      .json({ error: "authorId (integer) and name are required" });
  }

  let connection;

  try {
    connection = await sql.connect(dbConfig);

    const request = connection.request();
    request.input("id", sql.Int, authorId);
    request.input("name", sql.VarChar(100), name);

    const result = await request.query(
      "INSERT INTO Author (AuthorID, Name) OUTPUT INSERTED.* VALUES (@id, @name)"
    );

    res.status(201).json(result.recordset[0]);
  } catch (error) {
    console.error(error);
    if (error.number === 2627) {
      return res.status(409).json({ error: "Author ID already exists" });
    }
    res.status(500).json({ error: "Error creating author" });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeError) {
        console.error("Error closing connection:", closeError);
      }
    }
  }
});

// PUT /authors/:id
app.put("/authors/:id", async (req, res) => {
  const authorId = parseInt(req.params.id);
  const { name } = req.body;

  if (isNaN(authorId)) {
    return res.status(400).json({ error: "Invalid author ID" });
  }
  if (!name) {
    return res.status(400).json({ error: "name is required" });
  }

  let connection;

  try {
    connection = await sql.connect(dbConfig);

    const request = connection.request();
    request.input("id", sql.Int, authorId);
    request.input("name", sql.VarChar(100), name);

    const result = await request.query(
      "UPDATE Author SET Name = @name WHERE AuthorID = @id"
    );

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: "Author not found" });
    }

    res.status(200).json({ AuthorID: authorId, Name: name });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error updating author" });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeError) {
        console.error("Error closing connection:", closeError);
      }
    }
  }
});

// ======================= Tutorial 3b: DELETE author =======================

// DELETE /authors/:id
app.delete("/authors/:id", async (req, res) => {
  const authorId = parseInt(req.params.id);

  if (isNaN(authorId)) {
    return res.status(400).json({ error: "Invalid author ID" });
  }

  let connection;

  try {
    connection = await sql.connect(dbConfig);

    const request = connection.request();
    request.input("id", sql.Int, authorId);

    const result = await request.query(
      "DELETE FROM Author WHERE AuthorID = @id"
    );

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: "Author not found" });
    }

    res.status(204).send(); // 204 = no body, so no .json() here
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error deleting author" });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeError) {
        console.error("Error closing connection:", closeError);
      }
    }
  }
});

// ======================= Practice: Publisher CRUD =======================

// GET /publishers
app.get("/publishers", async (req, res) => {
  let connection;

  try {
    connection = await sql.connect(dbConfig);

    const request = connection.request();
    const result = await request.query("SELECT * FROM Publisher");

    res.status(200).json(result.recordset);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error retrieving publishers" });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeError) {
        console.error("Error closing connection:", closeError);
      }
    }
  }
});

// GET /publishers/:id
app.get("/publishers/:id", async (req, res) => {
  const publisherId = parseInt(req.params.id);

  if (isNaN(publisherId)) {
    return res.status(400).json({ error: "Invalid publisher ID" });
  }

  let connection;

  try {
    connection = await sql.connect(dbConfig);

    const request = connection.request();
    request.input("id", sql.SmallInt, publisherId);

    const result = await request.query(
      "SELECT PublisherID, Name FROM Publisher WHERE PublisherID = @id"
    );

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: "Publisher not found" });
    }

    res.status(200).json(result.recordset[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error retrieving publisher" });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeError) {
        console.error("Error closing connection:", closeError);
      }
    }
  }
});

// POST /publishers
app.post("/publishers", async (req, res) => {
  const { publisherId, name } = req.body;

  if (!Number.isInteger(publisherId) || !name) {
    return res
      .status(400)
      .json({ error: "publisherId (integer) and name are required" });
  }

  let connection;

  try {
    connection = await sql.connect(dbConfig);

    const request = connection.request();
    request.input("publisherId", sql.SmallInt, publisherId);
    request.input("name", sql.VarChar(50), name);

    const result = await request.query(
      "INSERT INTO Publisher (PublisherID, Name) OUTPUT INSERTED.* VALUES (@publisherId, @name)"
    );

    res.status(201).json(result.recordset[0]);
  } catch (error) {
    console.error(error);
    if (error.number === 2627) {
      return res.status(409).json({ error: "Publisher ID already exists" });
    }
    res.status(500).json({ error: "Error creating publisher" });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeError) {
        console.error("Error closing connection:", closeError);
      }
    }
  }
});

// PUT /publishers/:id
app.put("/publishers/:id", async (req, res) => {
  const publisherId = parseInt(req.params.id);
  const { name } = req.body;

  if (isNaN(publisherId)) {
    return res.status(400).json({ error: "Invalid publisher ID" });
  }
  if (!name) {
    return res.status(400).json({ error: "name is required" });
  }

  let connection;

  try {
    connection = await sql.connect(dbConfig);

    const request = connection.request();
    request.input("id", sql.SmallInt, publisherId);
    request.input("name", sql.VarChar(50), name);

    const result = await request.query(
      "UPDATE Publisher SET Name = @name WHERE PublisherID = @id"
    );

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: "Publisher not found" });
    }

    res.status(200).json({ PublisherID: publisherId, Name: name });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error updating publisher" });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeError) {
        console.error("Error closing connection:", closeError);
      }
    }
  }
});

// DELETE /publishers/:id
app.delete("/publishers/:id", async (req, res) => {
  const publisherId = parseInt(req.params.id);

  if (isNaN(publisherId)) {
    return res.status(400).json({ error: "Invalid publisher ID" });
  }

  let connection;

  try {
    connection = await sql.connect(dbConfig);

    const request = connection.request();
    request.input("id", sql.SmallInt, publisherId);

    const result = await request.query(
      "DELETE FROM Publisher WHERE PublisherID = @id"
    );

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: "Publisher not found" });
    }

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error deleting publisher" });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeError) {
        console.error("Error closing connection:", closeError);
      }
    }
  }
});

// ======================= Start server =======================

app.listen(3000, () => {
  console.log("Listening on port 3000");
});