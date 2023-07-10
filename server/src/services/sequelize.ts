import path from "path";
import { Sequelize } from "sequelize";

export const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '../data/db.sqlite'),
    logging: false,
});