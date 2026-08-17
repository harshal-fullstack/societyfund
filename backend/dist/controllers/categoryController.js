"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategory = exports.createCategory = exports.getCategories = void 0;
const dataStore_1 = require("../services/dataStore");
const getCategories = async (req, res) => {
    try {
        const categories = dataStore_1.dataStore.getCategories();
        res.json(categories);
    }
    catch (error) {
        res.status(500).json({ message: 'Error retrieving categories' });
    }
};
exports.getCategories = getCategories;
const createCategory = async (req, res) => {
    try {
        const { name, type, monthlyBudget, description, color } = req.body;
        if (!name || !type) {
            return res.status(400).json({ message: 'Category name and type are required' });
        }
        const created = dataStore_1.dataStore.addCategory({
            name,
            type,
            monthlyBudget: Number(monthlyBudget) || 0,
            description: description || '',
            color: color || '#4f46e5'
        });
        await dataStore_1.dataStore.createAuditLog({
            action: 'UPDATE_ALLOCATION',
            entityType: 'CategoryBudget',
            details: `Added ${type} category '${name}' with monthly budget ₹${Number(monthlyBudget || 0).toLocaleString()}`,
            performedBy: req.user?.name || 'Managing Committee',
            userRole: 'admin',
            timestamp: new Date().toISOString()
        });
        res.status(201).json(created);
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to create category' });
    }
};
exports.createCategory = createCategory;
const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = dataStore_1.dataStore.deleteCategory(id);
        if (!deleted) {
            return res.status(404).json({ message: 'Category not found' });
        }
        await dataStore_1.dataStore.createAuditLog({
            action: 'UPDATE_ALLOCATION',
            entityType: 'CategoryBudget',
            details: `Deleted financial category '${id}'`,
            performedBy: req.user?.name || 'Managing Committee',
            userRole: 'admin',
            timestamp: new Date().toISOString()
        });
        res.json({ message: 'Category deleted' });
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to delete category' });
    }
};
exports.deleteCategory = deleteCategory;
