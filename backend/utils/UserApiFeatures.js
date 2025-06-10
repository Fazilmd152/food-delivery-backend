import { Op } from 'sequelize'

class UserApiFeatures {
    constructor(model, queryStr) {
        this.model = model           // Sequelize model (e.g., User)
        this.queryStr = queryStr     // Query string from req.query
        this.options = {}            // Sequelize query options
    }

    search() {
        if (this.queryStr.keyword) {
            this.options.where = {
                ...this.options.where,
                name: {
                    [Op.like]: `%${this.queryStr.keyword}%`  // Case-insensitive search
                }
            }
        }
        return this
    }

    paginate(resPerPage = 10) {
        const currentPage = Number(this.queryStr.page) || 1
        const offset = (currentPage - 1) * resPerPage

        this.options.limit = resPerPage
        this.options.offset = offset

        return this
    }

    async query() {
        return await this.model.findAll(this.options)
    }
}

export default UserApiFeatures
