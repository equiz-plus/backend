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

      // check if page number could be out of range
      const organizationCount = await Organization.count({
        where: whereCondition,
      });

      // page number correction
      const totalPages = Math.ceil(organizationCount / pagination);

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

      if (!organization) {
        throw { name: "NotFound" };
      }

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
      const { name, address, logo, pic, sign, prefix } = req.body;

      if (!name && !address && !logo && !pic && !sign && !prefix)
        throw { name: "NothingUpdate" };

      const organization = await Organization.update(
        {
          name,
          address,
          logo,
          pic,
          sign,
          prefix,
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
      const { name, address, logo, pic, sign, prefix } = req.body;

      if (!name || !address || !logo || !pic || !sign)
        throw { name: "InvalidInput" };

      const data = await Organization.create({
        name,
        address,
        logo,
        pic,
        sign,
        prefix: prefix?.toUpperCase() || "EQZ",
      });

      res.status(201).json(data);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = organizationController;
