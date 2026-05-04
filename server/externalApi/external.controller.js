// external.controller.js

// import { fetchExternalUsers } from "./external.service.js";

// export const getExternalUsers = async (req, res) => {
//   try {
//     let { page = 1, limit = 20, search = "", crm } = req.query;

//     // -------------------------------
//     // Normalize Inputs
//     // -------------------------------
//     page = Number(page) || 1;
//     limit = Number(limit) || 20;

//     // Safety cap
//     if (limit > 1000) limit = 1000;

//     // -------------------------------
//     // Fetch Data
//     // -------------------------------
//     const { users, total } = await fetchExternalUsers({
//       page,
//       limit,
//       search,
//       crm,
//     });

//     // -------------------------------
//     // Response
//     // -------------------------------
//     return res.json({
//       success: true,
//       meta: {
//         total,
//         page,
//         limit,
//         totalPages: Math.ceil(total / limit),
//       },
//       data: users, // ✅ includes: user + avgRating + services (external DB)
//     });
//   } catch (error) {
//     console.error("External Users Error:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Failed to fetch users",
//     });
//   }
// };

import { fetchExternalUsers } from "./external.service.js";

export const getExternalUsers = async (req, res) => {
  try {
    let { page = 1, limit, search = "", crm } = req.query;

    // -------------------------------
    // Normalize Inputs
    // -------------------------------
    page = Number(page) || 1;

    // ✅ IMPORTANT CHANGE
    if (limit !== undefined) {
      limit = Number(limit);

      // Safety cap
      if (limit > 1000) limit = 1000;
    } else {
      limit = undefined; // 🔥 NO LIMIT
    }

    // -------------------------------
    // Fetch Data
    // -------------------------------
    const { users, total } = await fetchExternalUsers({
      page,
      limit,
      search,
      crm,
    });

    // -------------------------------
    // Response
    // -------------------------------
    return res.json({
      success: true,
      meta: {
        total,
        page,
        limit: limit || total, // show actual count if unlimited
        totalPages: limit ? Math.ceil(total / limit) : 1,
      },
      data: users,
    });
  } catch (error) {
    console.error("External Users Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
};