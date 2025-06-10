class RestaurantApiFeatures {
    constructor(query, queryString) {
        this.query = query
        this.queryString = queryString
    }

    search() {
        const keyword = this.queryString.search ? {
            name: {
                $regex: this.queryString.search,
                $options: 'i'
            }
        } : {}

        this.query = this.query.find({ ...keyword })
        return this
    }

    filter() {
        const queryCopy = { ...this.queryString };
        const removeFields = ['search', 'page', 'limit']
        removeFields.forEach(field => delete queryCopy[field])

        // Category filter
        if (queryCopy.category) {
            const categories = queryCopy.category.split(',').map(cat => cat.trim())
            queryCopy.category = { $in: categories }
        }

        // Rating filter
        let ratingFilter = {}
        if (queryCopy.rating) {
            const ratings = queryCopy.rating.split(',').map(Number)
            const ratingQueries = ratings.map(rating => ({
                average_rating: { $gte: rating - 1, $lte: rating }
            }))
            ratingFilter = { $or: ratingQueries }
            delete queryCopy.rating; // Remove rating to avoid conflict
        }

        // Convert gt/gte/lt/lte for price or any numeric filter
        let queryStr = JSON.stringify(queryCopy)
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, match => `$${match}`)
        const parsedFilters = JSON.parse(queryStr)

        this.query = this.query.find({ ...parsedFilters, ...ratingFilter })
        return this
    }

    paginate() {
        const currentPage = Number(this.queryString.page) || 1
        const itemsPerPage = Number(this.queryString.limit) || 10
        const skip = (currentPage - 1) * itemsPerPage;

        this.query = this.query.limit(itemsPerPage).skip(skip)
        return this
    }

    
}

export default RestaurantApiFeatures
