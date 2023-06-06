const { Op } = require("sequelize");
const { Certificate, Organization, Exam, User, Grade } = require("../models");

class certificateController {
  // get all certificates data
  // *admin
  static async certificateList(req, res, next) {
    try {
      const { page, displayLength, order } = req.query;

      let whereCondition = {};

      // set query length
      let pagination = +displayLength;
      if (!displayLength || isNaN(displayLength) || displayLength < 1) {
        pagination = 10;
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

      // check if page number could be out of range
      const certificateCount = await Certificate.count({
        where: whereCondition,
      });

      // page number correction
      const totalPages = Math.ceil(certificateCount / pagination);

      let autoPage = 1;
      if (page > totalPages || totalPages === 0) {
        autoPage = totalPages;
      } else if (page < 1 || isNaN(page)) {
        autoPage = 1;
      } else {
        autoPage = +page;
      }

      // offset correction
      let finalOffset = (+autoPage - 1) * pagination;
      if (finalOffset < 0) {
        finalOffset = 0;
      }

      // ini final query
      const certificateData = await Certificate.findAndCountAll({
        where: whereCondition,
        order: [autoSort],
        offset: finalOffset,
        limit: pagination,
      });

      res.status(200).json({
        currentPage: autoPage,
        totalPages: totalPages,
        totalRows: certificateData.count,
        certificates: certificateData.rows,
      });
    } catch (err) {
      next(err);
    }
  }

  // get detail certificate
  // *admin
  static async certificateDetail(req, res, next) {
    try {
      const { slug } = req.params;
      const certificate = await Certificate.findOne({
        where: {
          slug,
        },
        include: [
          {
            model: Exam,
            attributes: ["title"],
            include: {
              model: Organization,
              required: false,
            },
          },
          {
            model: User,
            attributes: ["name"],
          },
          {
            model: Grade,
            attributes: ["grade"],
          },
        ],
      });

      if (!certificate) {
        throw { name: "NotFound" };
      }

      res.status(200).json(certificate);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = certificateController;
