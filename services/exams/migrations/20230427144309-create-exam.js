'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Exams', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      title: {
        allowNull: false,
        type: Sequelize.STRING
      },
      description: {
        type: Sequelize.TEXT
      },
      totalQuestions: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      duration: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      isPremium: {
        allowNull: false,
        type: Sequelize.BOOLEAN
      },
      isOpen: {
        allowNull: false,
        type: Sequelize.BOOLEAN
      },
      pin: {
        allowNull: false,
        type: Sequelize.STRING
      },
      closingDate: {
        type: Sequelize.DATE
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Exams');
  }
};