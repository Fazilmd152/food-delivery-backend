'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return  queryInterface.addColumn("users", "image_url", {
      type: Sequelize.STRING(250),
      allowNull: true,
    })
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.removeColumn('users', 'image_url')
  }
};
