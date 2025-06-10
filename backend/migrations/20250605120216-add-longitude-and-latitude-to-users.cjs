'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'latitude', {
      type: Sequelize.DOUBLE,
      allowNull: true,
    });
    await queryInterface.addColumn('users', 'longitude', {
      type: Sequelize.DOUBLE,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'latitude');
    await queryInterface.removeColumn('users', 'longitude');
  }
};
