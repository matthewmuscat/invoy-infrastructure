const invoice = (sequelize, DataTypes) => {
  const Invoice = sequelize.define('invoice', {
    text: {
      type: DataTypes.STRING,
      validate: { notEmpty: true },
    },
  });

  Invoice.associate = models => {
    Invoice.belongsTo(models.User);
  };

  return Invoice;
};

export default invoice;
