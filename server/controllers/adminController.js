import User from '../models/userModel.js';
import Resume from '../models/resumeModel.js';

// @desc    Get system-wide analytics stats
// @route   GET /api/v1/admin/stats
// @access  Private/Admin
export const getAdminStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const verifiedUsers = await User.countDocuments({ isVerified: true });
    const premiumUsers = await User.countDocuments({ isPremium: true });
    const totalResumes = await Resume.countDocuments();

    // Aggregates template popularity
    const templateUsage = await Resume.aggregate([
      { $group: { _id: '$templateId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    res.status(200).json({
      success: true,
      data: {
        metrics: {
          totalUsers,
          verifiedUsers,
          premiumUsers,
          totalResumes,
          conversionRate: totalUsers > 0 ? Math.round((premiumUsers / totalUsers) * 100) : 0,
        },
        templateUsage,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users list
// @route   GET /api/v1/admin/users
// @access  Private/Admin
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user premium status or role
// @route   PUT /api/v1/admin/users/:id
// @access  Private/Admin
export const updateUserByAdmin = async (req, res, next) => {
  const { isPremium, role } = req.body;
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      res.status(404);
      return next(new Error('User not found'));
    }

    if (isPremium !== undefined) user.isPremium = isPremium;
    if (role !== undefined) user.role = role;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};
