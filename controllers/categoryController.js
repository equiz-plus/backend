const { Op } = require("sequelize");
const { Category } = require("../models");

class categoryController {
  static async categoryList(req, res, next) {
    try {
      const { page, displayLength, order, search } = req.query;

      let whereCondition = {};

      // set query length
      let pagination = +displayLength;
      if (!displayLength || isNaN(displayLength) || displayLength < 1) {
        pagination = 10;
      }

      // set search
      if (search) {
        whereCondition.name = {
          [Op.iLike]: `%${search}%`,
        };
      }

      // set sort
      let sortBy = "id";
      let sortOrder = order;

      if (!sortOrder || sortOrder !== "ASC") {
        sortOrder = "DESC";
      } else {
        sortOrder = "ASC";
      }

      let autoSort = [`${sortBy}`, `${sortOrder}`];

      console.log(autoSort, "INI SORTINGAN");

      // check if page number could be out of range
      const categoriesCount = await Category.count({
        where: whereCondition,
      });

      console.log(categoriesCount, "INI TOTAL QUESTIONS YANG DITEMUKAN");
      console.log(page, "INI PAGE SEBELUM CORRECTION");

      // page number correction
      const totalPages = Math.ceil(categoriesCount / pagination);
      console.log(totalPages, "INI TOTAL PAGES");

      let autoPage = 1;
      if (page > totalPages || totalPages === 0) {
        autoPage = totalPages;
      } else if (page < 1 || isNaN(page)) {
        autoPage = 1;
      } else {
        autoPage = +page;
      }

      console.log(autoPage, "INI FINAL AUTOPAGE");

      // offset correction
      let finalOffset = (+autoPage - 1) * pagination;
      if (finalOffset < 0) {
        finalOffset = 0;
      }

      // ini final query
      const categoriesData = await Category.findAndCountAll({
        where: whereCondition,
        order: [autoSort],
        offset: finalOffset,
        limit: pagination,
      });

      res.status(200).json({
        currentPage: autoPage,
        totalPages: totalPages,
        totalCategories: categoriesData.count,
        categories: categoriesData.rows,
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
