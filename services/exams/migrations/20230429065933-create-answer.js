'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Answers', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      QuestionNumber: {
        type: Sequelize.INTEGER
      },
      answer: {
        type: Sequelize.STRING
      },
      isCorrect: {
        type: Sequelize.BOOLEAN
      },
      QuestionId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'Questions',
          key: 'id'
        },
        onDelete: 'cascade',
        onUpdate: 'cascade'
      },
      ExamId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'Exams',
          key: 'id'
        },
        onDelete: 'cascade',
        onUpdate: 'cascade'
      },
      UserId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'Users',
          key: 'id'
        },
        onDelete: 'cascade',
        onUpdate: 'cascade'
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
    await queryInterface.dropTable('Answers');
  }
};