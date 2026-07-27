import prisma from "../models/prismaClient.js";


export const createInventory = async (req, res) => {
    try {

        const {
            itemCode,
            itemName,
            category,
            brand,
            model,
            partNumber,
            supplier,
            supplierPhone,
            purchasePrice,
            sellingPrice,
            quantity,
            minimumStock,
            unit,
            location,
            description,
            status
        } = req.body;

        const inventory = await prisma.inventory.create({
            data:{
                itemCode,
                itemName,
                category,
                brand,
                model,
                partNumber,
                supplier,
                purchasePrice:Number(purchasePrice),
                sellingPrice:Number(sellingPrice),
                quantity:Number(quantity),
                minimumStock:Number(minimumStock),
                unit,
                location,
                description,
                status: status || "Available",
                userId:req.user.id
            }
        });

        res.status(201).json(inventory);

    } catch(err){
        console.log(err);
        res.status(500).json({
            message:"Inventory Save Failed"
        });
    }
};


export const getInventory = async(req,res)=>{

    const inventory = await prisma.inventory.findMany({
        where:{
            userId:req.user.id
        },
        orderBy:{
            createdAt:"desc"
        }
    });

    res.json(inventory);

}

export const getInventoryById = async(req,res)=>{

    const item = await prisma.inventory.findUnique({
        where:{
            id:Number(req.params.id)
        }
    });

    res.json(item);

}

export const updateInventory = async(req,res)=>{

    const id = Number(req.params.id);

    const inventory = await prisma.inventory.update({

        where:{id},

        data:{
            ...req.body,
            purchasePrice:Number(req.body.purchasePrice),
            sellingPrice:Number(req.body.sellingPrice),
            quantity:Number(req.body.quantity),
            minimumStock:Number(req.body.minimumStock)
        }

    });

    res.json(inventory);

}


export const deleteInventory = async(req,res)=>{

    await prisma.inventory.delete({
        where:{
            id:Number(req.params.id)
        }
    });

    res.json({
        message:"Deleted Successfully"
    });

}

export const getSuppliers = async (req, res) => {
    try {
        const suppliers = await prisma.supplier.findMany({
            where: {
                userId: req.user.id,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        res.json(suppliers);
    } catch (err) {
        console.error("Failed to fetch suppliers", err);
        res.status(500).json({
            message: "Failed to fetch suppliers",
        });
    }
};

// Add Supplier 
export const createSupplier = async (req,res)=>{

    try{

        const supplier = await prisma.supplier.create({

            data:{

                supplierName:req.body.supplierName,

                supplierContact:req.body.supplierContact,

                userId:req.user.id

            }

        });

        res.status(201).json(supplier);

    }

    catch(err){

        res.status(500).json({
            message:"Supplier creation failed"
        });

    }

};

// Deduct Inventory
// export const deductInventory = async (req, res) => {
//     try {
//         const { itemCode, itemId, quantity } = req.body;
//         const deductQty = Number(quantity);

//         if (!Number.isFinite(deductQty) || deductQty <= 0) {
//             return res.status(400).json({
//                 message: "Enter a valid quantity",
//             });
//         }

//         let item;

//         if (itemId) {
//             item = await prisma.inventory.findUnique({
//                 where: { id: Number(itemId) },
//             });
//         } else if (itemCode) {
//             item = await prisma.inventory.findUnique({
//                 where: { itemCode: String(itemCode) },
//             });
//         }

//         if (!item) {
//             return res.status(404).json({
//                 message: "Item not found",
//             });
//         }

//         if (item.quantity < deductQty) {
//             return res.status(400).json({
//                 message: `Only ${item.quantity} items available`,
//             });
//         }

//         const updatedItem = await prisma.inventory.update({
//             where: { id: item.id },
//             data: {
//                 quantity: item.quantity - deductQty,
//             },
//         });

//         res.json(updatedItem);
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({
//             message: err.message,
//         });
//     }
// };
export const deductInventory = async (req, res) => {
    try {
        // Support sending an array of items OR a single item
        const items = Array.isArray(req.body)
            ? req.body
            : req.body.items && Array.isArray(req.body.items)
            ? req.body.items
            : [req.body];

        if (!items.length) {
            return res.status(400).json({
                message: "No items provided for deduction",
            });
        }

        // Validate basic payload structure first
        for (let i = 0; i < items.length; i++) {
            const { itemCode, itemId, quantity } = items[i];
            const deductQty = Number(quantity);

            if (!itemCode && !itemId) {
                return res.status(400).json({
                    message: `Item code or ID is required for row #${i + 1}`,
                });
            }

            if (!Number.isFinite(deductQty) || deductQty <= 0) {
                return res.status(400).json({
                    message: `Enter a valid quantity for row #${i + 1}`,
                });
            }
        }

        // Execute as an atomic Prisma transaction so all deductions succeed or fail together
        const updatedItems = await prisma.$transaction(async (tx) => {
            const updatedList = [];

            for (const itemData of items) {
                const { itemCode, itemId, quantity } = itemData;
                const deductQty = Number(quantity);

                let item;

                if (itemId) {
                    item = await tx.inventory.findUnique({
                        where: { id: Number(itemId) },
                    });
                } else if (itemCode) {
                    item = await tx.inventory.findUnique({
                        where: { itemCode: String(itemCode) },
                    });
                }

                if (!item) {
                    throw new Error(`Item ${itemCode || itemId} not found`);
                }

                if (item.quantity < deductQty) {
                    throw new Error(
                        `Insufficient stock for ${item.itemCode || item.id}. Available: ${item.quantity}, Requested: ${deductQty}`
                    );
                }

                const updated = await tx.inventory.update({
                    where: { id: item.id },
                    data: {
                        quantity: item.quantity - deductQty,
                    },
                });

                updatedList.push(updated);
            }

            return updatedList;
        });

        res.json({
            message: "Stock deducted successfully",
            data: updatedItems,
        });

    } catch (err) {
        console.error("Deduct Inventory Error:", err);
        res.status(400).json({
            message: err.message || "Failed to deduct stock",
        });
    }
};