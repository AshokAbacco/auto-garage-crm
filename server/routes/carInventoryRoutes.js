import express from "express";
import {
createInventory,
getInventory,
getInventoryById,
updateInventory,
deleteInventory,
createSupplier,
getSuppliers,deductInventory
} from "../controllers/carInventoryController.js";


import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/",protect,createInventory);

router.get("/",protect,getInventory);

router.get("/suppliers", protect, getSuppliers);
router.post("/suppliers",protect,createSupplier);

router.get("/suppliers",protect,getSuppliers);
router.post("/deduct",protect,deductInventory);

router.get("/:id",protect,getInventoryById);

router.put("/:id",protect,updateInventory);

router.delete("/:id",protect,deleteInventory);

export default router;