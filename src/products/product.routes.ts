import express, { Request, Response } from "express";
import { Product, UnitProduct } from "./product.interface";
import * as database from "./product.database";
import { StatusCodes } from "http-status-codes";

export const productRouter = express.Router();

productRouter.get('/products', async (req: Request, res: Response) => {
    try {
        const allProducts = await database.findAll();

        return res.status(StatusCodes.OK).json({ total: allProducts.length, allProducts });
    } catch (error) {
        console.error("Error getting products:", error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Internal server error" });
    }
});

productRouter.get("/product/:id", async (req: Request, res: Response) => {
    try {
        const productId = req.params.id;
        const product = await database.findOne(productId);

        if (!product) {
            return res.status(StatusCodes.NOT_FOUND).json({ error: `Product with ID ${productId} not found` });
        }

        return res.status(StatusCodes.OK).json({ product });
    } catch (error) {
        console.error("Error getting product:", error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Internal server error" });
    }
});

productRouter.post("/product", async (req: Request, res: Response) => {
    try {
        const { name, price, quantity, image } = req.body;

        if (!name || !price || !quantity || !image) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: `Please provide all the required parameters` });
        }

        const newProduct: UnitProduct | null = await database.create({ name, price, quantity, image });
        if (!newProduct) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Failed to create product" });
        }

        return res.status(StatusCodes.CREATED).json({ newProduct });
    } catch (error) {
        console.error("Error creating product:", error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Internal server error" });
    }
});

productRouter.put("/product/:id", async (req: Request, res: Response) => {
    try {
        const productId = req.params.id;
        const newProduct: Product = req.body;

        const updatedProduct: UnitProduct | null = await database.update(productId, newProduct);
        if (!updatedProduct) {
            return res.status(StatusCodes.NOT_FOUND).json({ error: `Product with ID ${productId} not found` });
        }

        return res.status(StatusCodes.OK).json({ updatedProduct });
    } catch (error) {
        console.error("Error updating product:", error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Internal server error" });
    }
});

productRouter.delete("/product/:id", async (req: Request, res: Response) => {
    try {
        const productId = req.params.id;

        const deletedProductMessage = await database.remove(productId);
        if (!deletedProductMessage) {
            return res.status(StatusCodes.NOT_FOUND).json({ error: `Product with ID ${productId} not found` });
        }

        return res.status(StatusCodes.OK).json({ message: deletedProductMessage });
    } catch (error) {
        console.error("Error deleting product:", error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Internal server error" });
    }
});
