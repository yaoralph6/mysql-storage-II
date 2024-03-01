import { UnitUser, Users } from "./user.interface";
import bcrypt from "bcryptjs";
import { v4 as random } from "uuid";
import mysql, { MysqlError, OkPacket } from "mysql"

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "bsssql"
});

connection.connect((err: MysqlError | null) => {

  if (err) {
    console.error("Error connecting to MySQL database: ", err);
    return;
  }
  console.log("Connected to MySQL database...");
});

export const findAll = async (): Promise<UnitUser[]> => {
  return new Promise((resolve, reject) => {
    connection.query("SELECT * FROM users", (error, results) => {
      if (error) {
        console.error("Error querying users: ", error);
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
};

export const findOne = async (id: string): Promise<UnitUser | null> => {
  return new Promise((resolve, reject) => {
    connection.query("SELECT * FROM users WHERE id = ?", [id], (error, results) => {
      if (error) {
        console.error("Error querying user: ", error);
        reject(error);
      } else {
        if (results.length === 0) {
          resolve(null);
        } else {
          resolve(results[0]);
        }
      }
    });
  });
};

export const searchUsers = async (name: string, email: string): Promise<UnitUser[]> => {
  return new Promise((resolve, reject) => {
    connection.query("SELECT * FROM users WHERE username LIKE ? AND email LIKE ?", [`%${name}%`, `%${email}%`], (error, results) => {
      if (error) {
        console.error("Error searching users: ", error);
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
};

export const create = async (userData: UnitUser): Promise<UnitUser | null> => {
  const id = random();
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(userData.password, salt);
  const newUser: UnitUser = {
    id: id,
    username: userData.username,
    email: userData.email,
    password: hashedPassword
  };
  return new Promise((resolve, reject) => {
    connection.query("INSERT INTO users SET ?", newUser, (error, result) => {
      if (error) {
        console.error("Error creating user: ", error);
        reject(error);
      } else {
        resolve(newUser);
      }
    });
  });
};

export const findByEmail = async (user_email: string): Promise<UnitUser | null> => {
  return new Promise((resolve, reject) => {
    connection.query("SELECT * FROM users WHERE email = ?", [user_email], (error, results) => {
      if (error) {
        console.error("Error querying user by email: ", error);
        reject(error);
      } else {
        if (results.length === 0) {
          resolve(null);
        } else {
          resolve(results[0]);
        }
      }
    });
  });
};

export const comparePassword = async (email: string, supplied_password: string): Promise<UnitUser | null> => {
  const user = await findByEmail(email);
  if (!user) return null;
  const decryptPassword = await bcrypt.compare(supplied_password, user.password);
  if (!decryptPassword) return null;
  return user;
};

export const update = async (id: string, updateValues: UnitUser): Promise<UnitUser | null> => {
    const userExists = await findOne(id);
    if (!userExists) return null;
  
    const { username, email, password } = updateValues;
    let query = "UPDATE users SET ";
    let values: any[] = [];
  
    if (username) {
      query += "username = ?, ";
      values.push(username);
    }
    if (email) {
      query += "email = ?, ";
      values.push(email);
    }
    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      query += "password = ?, ";
      values.push(hashedPassword);
    }
  

    query = query.slice(0, -2);
    query += " WHERE id = ?";
    values.push(id);
  


  return new Promise((resolve, reject) => {
    connection.query(query, values, (error, result) => {
      if (error) {
        console.error("Error updating user: ", error);
        reject(error);
      } else {
        resolve({ ...userExists, ...updateValues });
      }
    });
  });
};

export const remove = async (id: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    connection.query("DELETE FROM users WHERE id = ?", [id], (error, result) => {
      if (error) {
        console.error("Error deleting user: ", error);
        reject(error);
      } else {
        resolve();
      }
    });
  });
};
