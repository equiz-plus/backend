const { Op } = require("sequelize");
const { Organization } = require("../models");

class organizationController {
  // get all organizations data
  // *admin
  static async organizationList(req, res, next) {
    try {
      const { page, displayLength, sort, order, search } = req.query;

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
      const organizationCount = await Organization.count({
        where: whereCondition,
      });

      console.log(organizationCount, "INI TOTAL ORGANIZATION YANG DITEMUKAN");
      console.log(page, "INI PAGE SEBELUM CORRECTION");

      // page number correction
      const totalPages = Math.ceil(organizationCount / pagination);
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
      const organizationData = await Organization.findAndCountAll({
        where: whereCondition,
        order: [autoSort],
        offset: finalOffset,
        limit: pagination,
      });

      res.status(200).json({
        currentPage: autoPage,
        totalPages: totalPages,
        totalRows: organizationData.count,
        organizations: organizationData.rows,
      });
    } catch (err) {
      next(err);
    }
  }

  // get detail organization
  // *admin
  static async organizationDetail(req, res, next) {
    try {
      const { id } = req.params;
      const organization = await Organization.findOne({
        where: {
          id,
        },
      });
      res.status(200).json(organization);
    } catch (err) {
      next(err);
    }
  }

  // delete organization
  // *admin
  static async organizationDelete(req, res, next) {
    try {
      const id = +req.params.id;
      const organization = await Organization.destroy({
        where: {
          id,
        },
      });

      if (organization <= 0) throw { name: "NotFound" };

      res.status(200).json({
        message: `Organization with id ${id} has been deleted`,
      });
    } catch (err) {
      next(err);
    }
  }

  // method for edit data organization
  // *admin
  static async organizationEdit(req, res, next) {
    try {
      const { id } = req.params;
      const { name, address, logo, pic, sign } = req.body;

      if (!name && !address && !logo && !pic && !sign)
        throw { name: "NothingUpdate" };

      const organization = await Organization.update(
        {
          name,
          address,
          logo,
          pic,
          sign,
        },
        {
          where: {
            id,
          },
        }
      );

      res.status(200).json({
        message: "Organization data has been updated",
      });
    } catch (err) {
      next(err);
    }
  }

  static async createOrganization(req, res, next) {
    try {
      const { name, address, logo, pic, sign } = req.body;

      if (!name || !address || !logo || !pic || !sign)
        throw { name: "InvalidInput" };

      const data = await Organization.create({
        name,
        address,
        logo,
        pic,
        sign,
      });

      res.status(201).json(data);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = organizationController;
