'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
 async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('admin', 'otp', {
      type: Sequelize.STRING(15),
      allowNull: true
    });

    await queryInterface.addColumn('admin', 'otpDetails', {
      type: Sequelize.STRING(100),
      allowNull: true
    });

    await queryInterface.addColumn('admin', 'status', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    });

    await queryInterface.addColumn('admin', 'otpExpiry', {
      type: Sequelize.DATE,
      allowNull: true
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('admin', 'otp');
    await queryInterface.removeColumn('admin', 'otpDetails');
    await queryInterface.removeColumn('admin', 'status');
    await queryInterface.removeColumn('admin', 'otpExpiry');
  }
};
