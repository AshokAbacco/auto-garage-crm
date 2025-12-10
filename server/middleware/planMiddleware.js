//server/middleware/planMiddleware.js

export function requirePlan(allowedPlans) {
    return (req, res, next) => {
        const userPlan = req.user.plan;

        if (!allowedPlans.includes(userPlan)) {
            return res.status(403).json({
                success: false,
                message: "This feature is not available for your plan.",
            });
        }

        next();
    };
}
