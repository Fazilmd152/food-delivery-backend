class MenuAndFoodApiFeatures {
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
        const queryCopy = { ...this.queryString }
        const removeFields = ["search", "page", "limit"]
        removeFields.forEach(field => delete queryCopy[field])

        //categories
        if (queryCopy.categories) {
            const categories = queryCopy.categories.split(",").map(cat => cat.trim())
            queryCopy.categories = { $in: categories }
        }

        //types
        if (queryCopy.type) {
            const types = queryCopy.type.split(",").map(type => type.trim())
            queryCopy.type = { $in: types }
        }

        //tags
        if (queryCopy.tags) {   
            const tags = queryCopy.tags.split(",").map(tag => tag.trim())
            queryCopy.tags = { $in: tags }
        }

        // Rating filter
        let ratingFilter = {}
        if (queryCopy.rating) {
            const ratings = queryCopy.rating.split(',').map(Number)
            const ratingQueries = ratings.map(rating => ({
                averageRating: { $gte: rating - 1, $lte: rating }
            }))
            ratingFilter = { $or: ratingQueries }
            delete queryCopy.rating // Remove rating to avoid conflict
        }

        if (queryCopy.price && typeof queryCopy.price === 'string') {
            const priceRange = queryCopy.price.split(',').map(Number)
            if (priceRange.length === 2 && !isNaN(priceRange[0]) && !isNaN(priceRange[1])) {
                queryCopy.price = {
                    gte: priceRange[0],
                    lte: priceRange[1]
                }
            } else if (priceRange.length === 1 && !isNaN(priceRange[0])) {
                queryCopy.price = {
                    lte: priceRange[0]
                }
            } else {
                throw new Error("Invalid price format. Use 'max' or 'min,max'");
            }
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

export default MenuAndFoodApiFeatures