import { Request, Response } from 'express';
import { dataStore } from '../services/dataStore';
import { AuthRequest } from '../middleware/auth';

export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = dataStore.getCategories();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving categories' });
  }
};

export const createCategory = async (req: AuthRequest, res: Response) => {
  try {
    const { name, type, monthlyBudget, description, color } = req.body;
    if (!name || !type) {
      return res.status(400).json({ message: 'Category name and type are required' });
    }

    const created = dataStore.addCategory({
      name,
      type,
      monthlyBudget: Number(monthlyBudget) || 0,
      description: description || '',
      color: color || '#4f46e5'
    });

    await dataStore.createAuditLog({
      action: 'UPDATE_ALLOCATION',
      entityType: 'CategoryBudget',
      details: `Added ${type} category '${name}' with monthly budget ₹${Number(monthlyBudget || 0).toLocaleString()}`,
      performedBy: req.user?.name || 'Managing Committee',
      userRole: 'admin',
      timestamp: new Date().toISOString()
    });

    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create category' });
  }
};

export const deleteCategory = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = dataStore.deleteCategory(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Category not found' });
    }

    await dataStore.createAuditLog({
      action: 'UPDATE_ALLOCATION',
      entityType: 'CategoryBudget',
      details: `Deleted financial category '${id}'`,
      performedBy: req.user?.name || 'Managing Committee',
      userRole: 'admin',
      timestamp: new Date().toISOString()
    });

    res.json({ message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete category' });
  }
};
