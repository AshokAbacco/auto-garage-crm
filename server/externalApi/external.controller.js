import { fetchExternalUsers } from "./external.service.js";

export const getExternalUsers = async (req, res) => {
  try {
    let { page = 1, limit = 20, search = "", crm } = req.query;

    page = Number(page);
    limit = Number(limit);

    // safety limits
    if (limit > 100) limit = 100;

    const { users, total } = await fetchExternalUsers({
      page,
      limit,
      search,
      crm,
    });

    return res.json({
      success: true,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
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
