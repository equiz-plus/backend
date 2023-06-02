const { Exam, Question, Category } = require("../models");

class categoryController {
  static async categoryList(req, res, next) {
    try {
      const { search } = req.query;

      let whereCondition = {};

      if (search) {
        whereCondition = {
          title: {
            [Op.iLike]: `%${search}%`,
          },
        };
      }

      const { count, rows } = await Exam.findAndCountAll({
        where: whereCondition,
        include: [
          {
            model: Exam,
          },
          {
            model: Question,
          },
        ],
      });

      if (search && count <= 0) throw { name: "NotFound" };

      res.status(200).json({
        count,
        data: rows,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getCategoryById(req, res, next) {
    try {
      const { id } = req.params;

      const data = await Category.findByPk(id);

      if (!data) throw { name: "NotFound" };

      res.status(200).json(data);
    } catch (err) {
      next(err);
    }
  }

  static async createCategory(req, res, next) {
    try {
      const { name } = req.body;

      const data = await Category.create({
        name,
      });

      res.status(201).json(data);
    } catch (err) {
      next(err);
    }
  }

  static async editCategory(req, res, next) {
    try {
      const { name } = req.body;
      const { id } = req.params;

      const editCount = await Category.update(
        {
          name,
        },
        {
          where: { id },
        }
      );

      if (editCount <= 0) throw { name: "NotFound" };

      res.status(200).json({
        message: `Category with id ${id} has been updated`,
      });
    } catch (err) {
      next(err);
    }
  }

  static async deleteCategory(req, res, next) {
    try {
      const { id } = req.params;

      const deleteCount = await Category.destroy({
        where: {
          id,
        },
      });

      if (deleteCount <= 0) throw { name: "NotFound" };

      res.status(200).json({
        message: `Category with id ${id} has been deleted`,
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = categoryController;
