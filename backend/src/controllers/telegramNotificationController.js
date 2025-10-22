const TelegramNotificationSetting = require('../models/TelegramNotificationSetting');
const ComplaintCategory = require('../models/ComplaintCategory');

// Get all notification settings with category details
exports.getAllSettings = async (req, res) => {
    try {
        // Get all categories
        const categories = await ComplaintCategory.findAll({
            order: [['name', 'ASC']]
        });

        // Get all existing settings
        const settings = await TelegramNotificationSetting.findAll();

        // Create a map for quick lookup
        const settingsMap = {};
        settings.forEach(setting => {
            settingsMap[setting.categoryId] = setting;
        });

        // Merge categories with their settings (or defaults)
        const result = categories.map(category => ({
            categoryId: category.id,
            categoryName: category.name,
            enabled: settingsMap[category.id]?.enabled ?? true, // Default enabled
            notificationTiming: settingsMap[category.id]?.notificationTiming ?? 'both', // Default both
            autoClose: settingsMap[category.id]?.autoClose ?? false, // Default not auto-close
            autoCloseReason: settingsMap[category.id]?.autoCloseReason ?? null,
            id: settingsMap[category.id]?.id ?? null
        }));

        res.json(result);
    } catch (error) {
        console.error('Error fetching notification settings:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get setting by category ID
exports.getSettingByCategoryId = async (req, res) => {
    try {
        const { categoryId } = req.params;

        const setting = await TelegramNotificationSetting.findOne({
            where: { categoryId },
            include: [{ model: ComplaintCategory }]
        });

        if (setting) {
            res.json(setting);
        } else {
            // Return default values if no setting exists
            const category = await ComplaintCategory.findByPk(categoryId);
            if (category) {
                res.json({
                    categoryId: parseInt(categoryId),
                    categoryName: category.name,
                    enabled: true,
                    notificationTiming: 'both',
                    autoClose: false,
                    autoCloseReason: null
                });
            } else {
                res.status(404).json({ message: 'Category not found' });
            }
        }
    } catch (error) {
        console.error('Error fetching setting:', error);
        res.status(500).json({ message: error.message });
    }
};

// Update or create setting for a category
exports.updateSetting = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const { enabled, autoClose, autoCloseReason } = req.body;

        // Validate category exists
        const category = await ComplaintCategory.findByPk(categoryId);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        // Find or create setting
        const [setting, created] = await TelegramNotificationSetting.findOrCreate({
            where: { categoryId },
            defaults: {
                enabled: enabled ?? true,
                autoClose: autoClose ?? false,
                autoCloseReason: autoCloseReason ?? null
            }
        });

        // Update if it already existed
        if (!created) {
            await setting.update({
                enabled: enabled !== undefined ? enabled : setting.enabled,
                notificationTiming: req.body.notificationTiming !== undefined ? req.body.notificationTiming : setting.notificationTiming,
                autoClose: autoClose !== undefined ? autoClose : setting.autoClose,
                autoCloseReason: autoCloseReason !== undefined ? autoCloseReason : setting.autoCloseReason
            });
        }

        res.json({
            message: created ? 'Setting created successfully' : 'Setting updated successfully',
            setting
        });
    } catch (error) {
        console.error('Error updating setting:', error);
        res.status(400).json({ message: error.message });
    }
};

// Bulk update settings
exports.bulkUpdateSettings = async (req, res) => {
    try {
        const { settings } = req.body; // Array of { categoryId, enabled, autoClose, autoCloseReason }

        if (!Array.isArray(settings)) {
            return res.status(400).json({ message: 'Settings must be an array' });
        }

        const results = [];

        for (const settingData of settings) {
            const { categoryId, enabled, notificationTiming, autoClose, autoCloseReason } = settingData;

            const [setting, created] = await TelegramNotificationSetting.findOrCreate({
                where: { categoryId },
                defaults: {
                    enabled: enabled ?? true,
                    notificationTiming: notificationTiming ?? 'both',
                    autoClose: autoClose ?? false,
                    autoCloseReason: autoCloseReason ?? null
                }
            });

            if (!created) {
                await setting.update({
                    enabled: enabled !== undefined ? enabled : setting.enabled,
                    notificationTiming: notificationTiming !== undefined ? notificationTiming : setting.notificationTiming,
                    autoClose: autoClose !== undefined ? autoClose : setting.autoClose,
                    autoCloseReason: autoCloseReason !== undefined ? autoCloseReason : setting.autoCloseReason
                });
            }

            results.push(setting);
        }

        res.json({
            message: 'Settings updated successfully',
            count: results.length,
            settings: results
        });
    } catch (error) {
        console.error('Error bulk updating settings:', error);
        res.status(400).json({ message: error.message });
    }
};

// Delete setting (reset to defaults)
exports.deleteSetting = async (req, res) => {
    try {
        const { categoryId } = req.params;

        const setting = await TelegramNotificationSetting.findOne({
            where: { categoryId }
        });

        if (setting) {
            await setting.destroy();
            res.json({ message: 'Setting deleted successfully (reset to defaults)' });
        } else {
            res.status(404).json({ message: 'Setting not found' });
        }
    } catch (error) {
        console.error('Error deleting setting:', error);
        res.status(500).json({ message: error.message });
    }
};

// Initialize default settings for specific categories
exports.initializeDefaults = async (req, res) => {
    try {
        const defaultSettings = [
            {
                categoryId: 17, // Balance Inquery
                enabled: true,
                autoClose: true,
                autoCloseReason: 'Auto-closed: Balance Inquiry complaint - Information provided'
            },
            {
                categoryId: 19, // Apps Problem
                enabled: true,
                autoClose: true,
                autoCloseReason: 'Auto-closed: Apps Problem - Technical support provided'
            },
            {
                categoryId: 20, // Information
                enabled: true,
                autoClose: true,
                autoCloseReason: 'Auto-closed: Information request - Details provided'
            },
            {
                categoryId: 13, // Bill Stop
                enabled: true,
                autoClose: true,
                autoCloseReason: 'Auto-closed: Bill Stop complaint with current month bill date'
            }
        ];

        const results = [];

        for (const settingData of defaultSettings) {
            const [setting, created] = await TelegramNotificationSetting.findOrCreate({
                where: { categoryId: settingData.categoryId },
                defaults: settingData
            });

            results.push({
                categoryId: settingData.categoryId,
                created,
                setting
            });
        }

        res.json({
            message: 'Default settings initialized',
            results
        });
    } catch (error) {
        console.error('Error initializing defaults:', error);
        res.status(500).json({ message: error.message });
    }
};
