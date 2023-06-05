const { Op } = require("sequelize");
const { Certificate, Organization } = require("../models");

class certificateController {
  // get all certificates data
  // *admin
  static async certificateList(req, res, next) {
    try {
      const { page, displayLength, sort, order, search } = req.query;

      let whereCondition = {};

      // set query length
      let pagination = +displayLength;
      if (!displayLength || isNaN(displayLength) || displayLength < 1) {
        pagination = 10;
      }

      // set sort
      let sortBy = sort;
      let sortOrder = order;

      if (!sortBy || sortBy !== "name") {
        sortBy = "id";
      } else {
        sortBy = "name";
      }

      if (!sortOrder || sortOrder !== "ASC") {
        sortOrder = "DESC";
      } else {
        sortOrder = "ASC";
      }

      let autoSort = [`${sortBy}`, `${sortOrder}`];

      console.log(autoSort, "INI SORTINGAN");

      // check if page number could be out of range
      const certificateCount = await Certificate.count({
        where: whereCondition,
      });

      console.log(certificateCount, "INI TOTAL CERTIFICATE YANG DITEMUKAN");
      console.log(page, "INI PAGE SEBELUM CORRECTION");

      // page number correction
      const totalPages = Math.ceil(certificateCount / pagination);
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
      const { id } = req.params;
      const certificate = await Certificate.findOne({
        where: {
          id,
        },
      });
      res.status(200).json(certificate);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = certificateController;
