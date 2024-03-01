import mysql, { MysqlError, OkPacket, FieldInfo } from "mysql";
import { Product, Products, UnitProduct } from "./product.interface";
import { v4 as uuidv4 } from "uuid";

interface RowDataPacket {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface FieldPacket extends FieldInfo {}

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

export const findAll = async (): Promise<UnitProduct[]> => {
  return new Promise((resolve, reject) => {
    connection.query("SELECT * FROM product", (error: MysqlError | null, results: RowDataPacket[], _fields) => {
      if (error) {
        console.error("Error querying products: ", error);
        reject(error);
      } else {
        const products: UnitProduct[] = results.map((row: RowDataPacket) => {
          return {
            id: row.id,
            name: row.name,
            price: row.price,
            quantity: row.quantity,
            image: row.image
          };
        });
        resolve(products);
      }
    });
  });
};

export const findOne = async (id: string): Promise<UnitProduct | null> => {
  return new Promise((resolve, reject) => {
    connection.query("SELECT * FROM product WHERE id = ?", [id], (error: MysqlError | null, results: RowDataPacket[], _fields) => {
      if (error) {
        console.error("Error querying product: ", error);
        reject(error);
      } else {
        if (results.length === 0) {
          resolve(null);
        } else {
          const row = results[0];
          const product: UnitProduct = {
            id: row.id,
            name: row.name,
            price: row.price,
            quantity: row.quantity,
            image: row.image
          };
          resolve(product);
        }
      }
    });
  });
};

export const create = async (productInfo: Product): Promise<UnitProduct | null> => {
  const id = uuidv4();
  const { name, price, quantity, image } = productInfo;

  return new Promise((resolve, reject) => {
    connection.query("INSERT INTO product (id, name, price, quantity, image) VALUES (?, ?, ?, ?, ?)", 
    [id, name, price, quantity, image], (error: MysqlError | null, result: OkPacket) => {
      if (error) {
        console.error("Error creating product: ", error);
        reject(error);
      } else {
        const createdProduct: UnitProduct = { id, name, price, quantity, image };
        resolve(createdProduct);
      }
    });
  });
};

export const update = async (id: string, updateValues: Product): Promise<UnitProduct | null> => {
  const { name, price, quantity, image } = updateValues;

  return new Promise((resolve, reject) => {
    connection.query("UPDATE product SET name = ?, price = ?, quantity = ?, image = ? WHERE id = ?", 
    [name, price, quantity, image, id], (error: MysqlError | null, _result: OkPacket) => {
      if (error) {
        console.error("Error updating product: ", error);
        reject(error);
      } else {
        const updatedProduct: UnitProduct = { id, name, price, quantity, image };
        resolve(updatedProduct);
      }
    });
  });
};

export const remove = async (id: string): Promise<string | null> => {
    return new Promise((resolve, reject) => {
      connection.query("DELETE FROM product WHERE id = ?", [id], (error: MysqlError | null, _result: OkPacket) => {
        if (error) {
          console.error("Error deleting product: ", error);
          reject(error);
        } else {
          resolve("Product deleted successfully");
        }
      });
    });
  };
  