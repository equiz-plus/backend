'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Questions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      question: {
        allowNull: false,
        type: Sequelize.TEXT
      },
      option1: {
        allowNull: false,
        type: Sequelize.TEXT
      },
      option2: {
        allowNull: false,
        type: Sequelize.TEXT
      },
      option3: {
        allowNull: false,
        type: Sequelize.TEXT
      },
      option4: {
        allowNull: false,
        type: Sequelize.TEXT
      },
      answer: {
        allowNull: false,
        type: Sequelize.STRING
      },
      isPremium: {
        allowNull: false,
        type: Sequelize.BOOLEAN
      },
      explanation: {
        allowNull: false,
        type: Sequelize.TEXT
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
    await queryInterface.dropTable('Questions');
  }
};