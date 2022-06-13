const { log, warn, error } = require('./log')
// Require Sequelize
const Sequelize = require('sequelize');
const sequelize = new Sequelize('database', 'user', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    // SQLite only
    storage: 'database.sqlite',
});
const Tags = sequelize.define('tags', {
    name: {
        type: Sequelize.STRING,
        unique: true,
    },
    description: Sequelize.TEXT,
    username: Sequelize.STRING,
    usage_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false,
    },
});
async function add() {
    try {
        const tag = await Tags.create({
            name: 'test',
            description: 'test',
            username: 'thaitq',
        });
        log((`Tag ${tag.name} added.`));
    }
    catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            warn('That tag already exists.');
        }

        error('Something went wrong with adding a tag.');
    }
}

async function select() {
    const tag = await Tags.findOne({ where: { name: 'test' } }).then(value => {
        log(value.name)
    });
}

module.exports = { Tags }
