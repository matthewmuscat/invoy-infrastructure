import bcrypt from "bcryptjs"

const user = (sequelize, DataTypes) => {
  const User = sequelize.define("user", {
    first_name: {
      type: DataTypes.STRING,
      unique: false,
      allowNull: false,
      validate: { notEmpty: true },
    },
    last_name: {
      type: DataTypes.STRING,
      unique: false,
      allowNull: false,
      validate: { notEmpty: true },
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        notEmpty: true,
        isEmail: true,
      },
    },
    phone_number: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: { notEmpty: true },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [7, 42],
      },
    },
    account: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: { notEmpty: false },
    },
    role: { type: DataTypes.STRING },
  })

  User.associate = (models) => {
    User.hasMany(models.Invoice, { onDelete: "CASCADE" })
    User.hasMany(models.Verification, { onDelete: "CASCADE" })
  }

  User.findByLogin = async (login) => {
    const user = await User.findOne({ where: { email: login } })

    return user
  }

  User.beforeCreate(async (user) => {
    user.password = await user.generatePasswordHash()
  })

  User.prototype.generatePasswordHash = async function() {
    const saltRounds = 10
    return await bcrypt.hash(this.password, saltRounds)
  }

  User.prototype.validatePassword = async function(password) {
    return await bcrypt.compare(password, this.password)
  }

  return User
}

export default user
